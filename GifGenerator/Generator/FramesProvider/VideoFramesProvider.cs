using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using GifGenerator.Models;
using SixLabors.ImageSharp;

namespace GifGenerator.Generator.FramesProvider
{
    public class VideoFramesProvider : BaseFramesProvider
    {
        private static readonly string ffmpegPath = @"ffmpeg.exe";

        public override async Task<IEnumerable<Image>> GetFrames(Stream stream, uint begin, uint count, uint step)
        {
            // TODO: Make it more efficient
            uint maxCount = count * step;
            Process process = new Process
            {
                StartInfo = new ProcessStartInfo
                {
                    RedirectStandardInput = true,
                    RedirectStandardOutput = true,
                    // RedirectStandardError = true,
                    UseShellExecute = false,
                    CreateNoWindow = true,
                    Arguments = $"-i pipe:0 -frames:v {maxCount} -q:v 1 -f image2pipe pipe:1",
                    FileName = ffmpegPath,
                },
                EnableRaisingEvents = true
            };

            // process.ErrorDataReceived += (sender, eventArgs) => { Console.WriteLine(eventArgs.Data); };

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

            // process.BeginErrorReadLine();
            Task inputTask = WriteData(stream, process.StandardInput.BaseStream);
            byte[] resultData = await ReadBytes(process.StandardOutput.BaseStream);
            await inputTask;

            IEnumerable<Image> frames = GetThumbnails(resultData);
            return FilterFrames(frames, begin, count, step).ToArray();
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

        private static async Task<byte[]> ReadBytes(Stream stream)
        {
            using (MemoryStream ms = new MemoryStream())
            {
                await stream.CopyToAsync(ms);
                return ms.ToArray();
            }
        }

        private static IEnumerable<Image> GetThumbnails(byte[] allImages)
        {
            byte[] bof = allImages.Take(8).ToArray(); //??
            int prevOffset = -1;
            foreach (var offset in GetBytePatternPositions(allImages, bof))
            {
                if (prevOffset > -1)
                {
                    yield return GetImageAt(allImages, prevOffset, offset);
                }

                prevOffset = offset;
            }

            if (prevOffset > -1)
            {
                yield return GetImageAt(allImages, prevOffset, allImages.Length);
            }
        }

        private static Image GetImageAt(byte[] data, int start, int end)
        {
            using (MemoryStream ms = new MemoryStream(end - start))
            {
                ms.Write(data, start, end - start);
                ms.Seek(0, SeekOrigin.Begin);
                return Image.Load(ms);
            }
        }

        private static IEnumerable<int> GetBytePatternPositions(byte[] data, byte[] pattern)
        {
            var dataLen = data.Length;
            var patternLen = pattern.Length - 1;
            int scanData = 0;
            int scanPattern = 0;
            while (scanData < dataLen)
            {
                if (pattern[0] == data[scanData])
                {
                    scanPattern = 1;
                    scanData++;
                    while (pattern[scanPattern] == data[scanData])
                    {
                        if (scanPattern == patternLen)
                        {
                            yield return scanData - patternLen;
                            break;
                        }

                        scanPattern++;
                        scanData++;
                    }
                }

                scanData++;
            }
        }
    }
}
