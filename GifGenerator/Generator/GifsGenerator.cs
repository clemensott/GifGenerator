using GifGenerator.Generator.FramesProvider;
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
using SixLabors.Fonts;
using SixLabors.ImageSharp.Drawing.Processing;

namespace GifGenerator.Generator
{
    public static class GifsGenerator
    {
        public static async Task<Image> Create(GifCreateBody args)
        {
            HttpClient client = new HttpClient();
            try
            {
                Image gif = new Image<Rgba32>(args.Size.Width, args.Size.Height);

                foreach (GifCreateSource src in args.Sources)
                {
                    Image img;
                    string tmpFilePath = null;
                    try
                    {
                        tmpFilePath = await SaveTmpFile(src, client);
                        img = await BaseFramesProvider.GetFramesProvider(src.Type).GetFrames(tmpFilePath, src);
                    }
                    finally
                    {
                        try
                        {
                            if (tmpFilePath != null) File.Delete(tmpFilePath);
                        }
                        catch { }
                    }

                    if (src.CropRect.HasValue)
                    {
                        img.Mutate(i =>
                        {
                            (int x, int y, int width, int height) = src.CropRect.Value;
                            (int imgWidth, int imgHeight) = i.GetCurrentSize();
                            i.Resize(new ResizeOptions()
                            {
                                Mode = ResizeMode.Manual,
                                Size = new Size(width, height),
                                TargetRectangle = new Rectangle(-x, -y, imgWidth, imgHeight),
                            });
                            i.Resize(args.Size);
                            if (src.Tag != null) DrawTag(i, src.Tag);
                        });
                    }
                    else
                        img.Mutate(i =>
                        {
                            i.Resize(args.Size);
                            if (src.Tag != null) DrawTag(i, src.Tag);
                        });

                    foreach (ImageFrame frame in img.Frames)
                    {
                        GifFrameMetadata frameMeta = frame.Metadata.GetGifMetadata();
                        if (src.FrameDelay.HasValue) frameMeta.FrameDelay = src.FrameDelay.Value;

                        gif.Frames.InsertFrame(gif.Frames.Count - 1, frame);
                    }

                    img.Dispose();
                }

                gif.Frames.RemoveFrame(gif.Frames.Count - 1);
                gif.Metadata.GetGifMetadata().RepeatCount = args.RepeatCount;

                return gif;
            }
            finally
            {
                client?.Dispose();
            }
        }

        private static async Task<string> SaveTmpFile(GifCreateSource src, HttpClient client)
        {
            const string tmpFilePath = "tmp";
            if (!Directory.Exists(tmpFilePath)) Directory.CreateDirectory(tmpFilePath);

            string path = Path.Combine(tmpFilePath, Guid.NewGuid().ToString());

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

                File.WriteAllBytes(path, data);
            }
            else
            {
                Stream readStream = await RunRequest(client, src);
                using (FileStream writeStream = File.OpenWrite(path))
                {
                    await readStream.CopyToAsync(writeStream);
                }
            }
            return path;
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

        private static void DrawTag(IImageProcessingContext context, GifCreateTag tag)
        {
            const float marginFactor = 0.05f;
            (int imgWidth, int imgHeight) = context.GetCurrentSize();
            float marginWidth = imgWidth * marginFactor;
            float textWidth = imgWidth - 2 * marginWidth;
            float marginHeight = imgHeight * marginFactor;
            Font font = FitTextOnImage(tag.Text, textWidth,
                (imgHeight - 2 * marginHeight) * tag.MaxHeight);
            Pen p = Pens.Solid(Color.Black, font.Size / 20);
            PointF location = new PointF(imgWidth / 2, 0);

            switch (tag.Position)
            {
                case VerticalAlignment.Top:
                    location.Y = marginHeight;
                    break;
                case VerticalAlignment.Center:
                    location.Y = imgHeight / 2.0f;
                    break;
                case VerticalAlignment.Bottom:
                    location.Y = imgHeight - marginHeight;
                    break;
                default:
                    throw new BadRequestException("Tag position type is unknown");
            }

            context.DrawText(new TextOptions(font)
            {
                VerticalAlignment = tag.Position,
                HorizontalAlignment = HorizontalAlignment.Center,
                WrappingLength = textWidth,
                Origin = location,
                TextAlignment = TextAlignment.Center,
            }, tag.Text, Brushes.Solid(Color.White), p);
        }

        private static Font FitTextOnImage(string text, float imgWidth, float maxHeight)
        {
            FontFamily ff = SystemFonts.Get("Arial");
            float factor = 1;

            while (true)
            {
                Font f = new Font(ff, maxHeight * factor, FontStyle.Bold);
                FontRectangle rect = TextMeasurer.Measure(text, new TextOptions(f)
                {
                    WrappingLength = imgWidth,
                    TextAlignment = TextAlignment.Center,
                });

                if (rect.Height < maxHeight || rect.Height <= 1) return f;

                factor *= 0.95f;
            }
        }
    }
}
