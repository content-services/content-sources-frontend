import { createHash } from 'crypto';
import { getFileChecksumSHA256, MAX_CHUNK_SIZE } from './helpers';

describe('UploadContent helpers', () => {
  it('computes SHA-256 for an empty file', async () => {
    const file = new File([], 'empty.dat');

    const checksum = await getFileChecksumSHA256(file);

    expect(checksum).toBe(createHash('sha256').update(Buffer.from([])).digest('hex'));
  });

  it('computes SHA-256 for a small file in one slice', async () => {
    const content = Buffer.from('hello checksum');
    const file = new File([content], 'small.txt');

    const checksum = await getFileChecksumSHA256(file);

    expect(checksum).toBe(createHash('sha256').update(Buffer.from(content)).digest('hex'));
  });

  it('computes SHA-256 for a file larger than MAX_CHUNK_SIZE', async () => {
    const size = MAX_CHUNK_SIZE + 1024;
    const buffer = new Uint8Array(size);
    buffer[0] = 7;
    buffer[size - 1] = 9;
    const file = new File([buffer], 'large.bin');

    const checksum = await getFileChecksumSHA256(file);

    expect(checksum).toBe(createHash('sha256').update(Buffer.from(buffer)).digest('hex'));
  });
});
