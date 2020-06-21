using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Globalization;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using GifGenerator.Helpers;
using GifGenerator.Models;
using GifGenerator.Models.Gifs;
using SixLabors.ImageSharp;

namespace GifGenerator.Generator.FramesProvider
{
    public class VideoFramesProvider : BaseFramesProvider
    {
        private static readonly string ffmpegPath = @"ffmpeg.exe";

        public override async Task<Image> GetFrames(Stream stream, GifCreateSource props)
        {
            int frameDelay = 0;
            string framerateArg = "", beginArg = "", durationArg = "";
            GifCreateSourceVideoFrameSelection selection = props.VideoFrameSelection;

            if (selection?.FrameRate != null)
            {
                framerateArg = $"-r {selection.FrameRate}";
                frameDelay = (int)(100 / selection.FrameRate);
            }

            if (selection?.BeginSeconds > 0)
            {
                beginArg = $"-ss {selection.BeginSeconds.ToString(CultureInfo.InvariantCulture)}";
            }

            if (selection?.DurationSeconds != null)
            {
                durationArg = $"-t {selection.DurationSeconds.Value.ToString(CultureInfo.InvariantCulture)}";
            }

            Process process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    Arguments = $"-i pipe:0 {framerateArg} {beginArg} {durationArg} -q:v 1 -f image2pipe pipe:1",
                    FileName = ffmpegPath,
                },
                EnableRaisingEvents = true
            };

            Exception errorDataException = null;
            process.ErrorDataReceived += (sender, eventArgs) =>
            {
                if (eventArgs.Data?.StartsWith("pipe:: Invalid data found when processing input") == true ||
                    eventArgs.Data?.StartsWith("Cannot determine format of input stream") == true)
                {
                    // Does not mean that the file has actually a problem and it is possible that it would work as file input. 
                    errorDataException = new BadRequestException("Video decoding failed. File could be to big");
                }
            };

            try
            {
                process.Start();
            }
            catch (FileNotFoundException)
            {
                // Fortunately this API is only used by developers, because otherwise this error message would be stupid
                const string message =
                    @"FFMPEG not found. Please added it to webserviceGifGenerator\GifGenerator\ffmpeg.exe";
                throw new BadRequestException(message);
            }

            process.BeginErrorReadLine();
            Task inputTask = WriteData(stream, process.StandardInput.BaseStream);
            Image img = await Create(process.StandardOutput.BaseStream);
            await inputTask;

            if (errorDataException != null) throw errorDataException;

            if (img == null)
            {
                throw selection == null
                    ? new BadRequestException("Could not extract any frames from video")
                    : new BadRequestException(
                        "Could not extract frames from video. Selected range might be within video duration");
            }

            foreach (ImageFrame frame in img.Frames)
            {
                frame.Metadata.GetGifMetadata().FrameDelay = frameDelay;
            }

            return img;
        }

        private static async Task WriteData(Stream src, Stream dest)
        {
            try
            {
                await src.CopyToAsync(dest);
            }
            catch
            {
                // Throws often an exception but it still works 
            }

            dest.Close();
            src.Close();
        }

        private static async Task<Image> Create(Stream stream)
        {
            byte[] bof = new byte[8];
            int bofLength = 0;

            while (bofLength < bof.Length)
            {
                int read = await stream.ReadAsync(bof, bofLength, bof.Length - bofLength);
                if (read == 0) return null;
                bofLength += read;
            }

            Image img = null;
            ByteReader reader = new ByteReader(stream, 10000);

            while (true)
            {
                Queue<byte> queue = new Queue<byte>(bof.Length);
                for (int i = 0; i < bof.Length; i++)
                {
                    byte? b = await reader.ReadAsync();
                    if (!b.HasValue) return img;

                    queue.Enqueue(b.Value);
                }

                List<byte> data = new List<byte>(bof);
                while (!bof.SequenceEqual(queue))
                {
                    data.Add(queue.Dequeue());

                    byte? b = await reader.ReadAsync();
                    if (!b.HasValue) return img;

                    queue.Enqueue(b.Value);
                }

                try
                {
                    Image frame = Image.Load(data.ToArray());

                    if (img == null) img = frame;
                    else img.Frames.AddFrame(frame.Frames.RootFrame);
                }
                catch (Exception e)
                {
                    string message = $"Could not parse extracted image: {img?.Frames.Count}";
                    throw new BadRequestException(message, e);
                }
            }
        }
    }
}
