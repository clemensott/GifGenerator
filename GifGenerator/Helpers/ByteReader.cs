using System;
using System.IO;
using System.Threading.Tasks;

namespace GifGenerator.Helpers
{
    public class ByteReader : IDisposable
    {
        private readonly Stream stream;
        private int index, length;
        private byte[] buffer;

        public ByteReader(Stream stream, int bufferSize)
        {
            this.stream = stream;
            buffer = new byte[bufferSize];
            index = length = 1;
        }

        public async Task<byte?> ReadAsync()
        {
            if (length == 0) return null;
            if (index >= length)
            {
                length = await stream.ReadAsync(buffer, 0, buffer.Length);
                if (length == 0) return null;
                index = 0;
            }

            return buffer[index++];
        }

        public void Dispose()
        {
            stream.Dispose();
            buffer = null;
        }
    }
}
