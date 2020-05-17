using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.IO;
using System.Linq;
using SixLabors.ImageSharp;

namespace GifGenerator.Generator.FramesProvider
{
    public class VideoFramesProvider : BaseFramesProvider
    {
        public override IEnumerable<Image> GetFrames(Stream stream, uint begin, uint count, uint step)
        {
            using (var fileStream = File.Create(@"C:\Users\ozwold\Desktop\FH\4_Semester\WebServices\GifGeneratorAbgabe\input.mp4"))
            {
                stream.CopyTo(fileStream);
            }
            var process = new Process();
            process.StartInfo.FileName = @"C:\Users\ozwold\Desktop\FH\4_Semester\WebServices\GifGeneratorAbgabe\ffmpeg.exe";
            string workingDirectory = @"C:\Users\ozwold\Desktop\FH\4_Semester\WebServices\GifGeneratorAbgabe\";
            process.StartInfo.WorkingDirectory = workingDirectory;
            var inputArgs = "-i input.mp4";
            var outputPath = Path.Combine(workingDirectory, "out_%04d.jpg");
            var outputArgs = $"-vf fps=30 {outputPath}";
            process.StartInfo.Arguments = $"{inputArgs} {outputArgs}";
            process.StartInfo.CreateNoWindow = true;
            process.StartInfo.UseShellExecute = false;
            process.Start();
            process.WaitForExit();

            var process2 = new Process();
            process2.StartInfo.FileName = @"C:\Users\ozwold\Desktop\FH\4_Semester\WebServices\GifGeneratorAbgabe\ffmpeg.exe";
            process2.StartInfo.WorkingDirectory = workingDirectory;
            var outputGifPath = Path.Combine(workingDirectory, "out.gif");
            process2.StartInfo.Arguments = $"-f image2 -i {outputPath} {outputGifPath}";
            process2.StartInfo.CreateNoWindow = true;
            process2.StartInfo.UseShellExecute = false;
            process2.Start();
            process2.WaitForExit();
            
            Image src = Image.Load(outputGifPath);

            var dir = new DirectoryInfo(workingDirectory);

            foreach (var file in dir.EnumerateFiles("out_*.jpg"))
            {
                file.Delete();
            }
            File.Delete(outputGifPath);

            if (src.Frames.Count == 1) return new Image[] { src };

            try
            {
                IEnumerable<Image> frames = src.Frames.Select((f, i) => src.Frames.CloneFrame(i));
                return FilterFrames(frames, begin, count, step).ToArray();
            }
            finally
            {
                src.Dispose();
            }

        }
    }
}
