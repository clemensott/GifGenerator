﻿using GifGenerator.Generator.FramesProvider;
using GifGenerator.Helpers;
using GifGenerator.Models.Gifs;
using SixLabors.ImageSharp;
using SixLabors.ImageSharp.Formats.Gif;
using SixLabors.ImageSharp.PixelFormats;
using SixLabors.ImageSharp.Processing;
using System;
using System.Collections.Generic;
using System.IO;
using System.Net.Http;
using System.Threading.Tasks;
using GifGenerator.Models;

namespace GifGenerator.Generator
{
    public static class GifsGenerator
    {
        public static async Task<Image> Create(GifCreateBody args)
        {
            HttpClient client = null;
            Image gif = new Image<Rgba32>(args.Size.Width, args.Size.Height);

            foreach (GifCreateSource src in args.Sources)
            {
                Image img;
                using (Stream stream = await GetStream(src, ref client))
                {
                    img = await BaseFramesProvider.GetFramesProvider(src.Type).GetFrames(stream, src);
                }

                if (src.CropRect.HasValue)
                {
                    int imgWidth = img.Width, imgHeight = img.Height;
                    img.Mutate(i =>
                    {
                        (int x, int y, int width, int height) = src.CropRect.Value;
                        i.Resize(new ResizeOptions()
                        {
                            Mode = ResizeMode.Manual,
                            Size = new Size(width, height),
                            TargetRectangle = new Rectangle(-x, -y, imgWidth, imgHeight),
                        });
                        i.Resize(args.Size);
                    });
                }
                else img.Mutate(i => i.Resize(args.Size));

                foreach (ImageFrame frame in img.Frames)
                {
                    GifFrameMetadata frameMeta = frame.Metadata.GetGifMetadata();
                    frameMeta.FrameDelay = src.FrameDelay ?? 0;

                    gif.Frames.InsertFrame(gif.Frames.Count - 1, frame);
                }

                img.Dispose();
            }

            gif.Frames.RemoveFrame(gif.Frames.Count - 1);
            client?.Dispose();
            gif.Metadata.GetGifMetadata().RepeatCount = args.RepeatCount;

            return gif;
        }

        private static Task<Stream> GetStream(GifCreateSource src, ref HttpClient client)
        {
            if (!string.IsNullOrWhiteSpace(src.Data))
            {
                byte[] data;
                try
                {
                    data = Convert.FromBase64String(src.Data);
                }
                catch (Exception e)
                {
                    throw new BadRequestException("Data is not in base64 format", e);
                }

                Stream stream = new MemoryStream(data);
                return Task.FromResult(stream);
            }

            if (client == null) client = new HttpClient();

            return RunRequest(client, src);
        }

        private static async Task<Stream> RunRequest(HttpClient client, GifCreateSource src)
        {
            if (!string.IsNullOrWhiteSpace(src.Url)) return await client.GetStreamAsync(src.Url);
            if (src.CustomRequest == null) throw new BadRequestException("No data source provided");

            HttpResponseMessage response = await client.SendAsync(GetHttpRequest(src.CustomRequest));
            if (!response.IsSuccessStatusCode) throw new BadRequestException("Requesting data was not successful");

            return await response.Content.ReadAsStreamAsync();
        }

        private static HttpRequestMessage GetHttpRequest(CustomSourceRequest request)
        {
            byte[] content = !string.IsNullOrWhiteSpace(request.Content)
                ? Convert.FromBase64String(request.Content)
                : null;
            HttpRequestMessage http = new HttpRequestMessage()
            {
                RequestUri = new Uri(request.Url),
                Method = new HttpMethod(request.Method),
                Content = content != null ? new ByteArrayContent(content) : null,
            };

            foreach (KeyValuePair<string, string> pair in request.Headers.ToNotNull())
            {
                http.Headers.Add(pair.Key, pair.Value);
            }

            return http;
        }
    }
}
