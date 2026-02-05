import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const fixturesDir = join(process.cwd(), 'tests', 'postman', 'fixtures');
mkdirSync(fixturesDir, { recursive: true });

const batPayload = `@echo off\r\necho This is not an image\r\npause\r\n`;
writeFileSync(join(fixturesDir, 'fake-receipt.bat'), batPayload, 'utf8');

const rarHeader = Buffer.from([0x52, 0x61, 0x72, 0x21, 0x1a, 0x07, 0x00]);
const fakeRar = Buffer.concat([rarHeader, Buffer.alloc(256, 0x41)]);
writeFileSync(join(fixturesDir, 'fake-receipt.rar'), fakeRar);

// 10MB + 1 byte to trigger size limit
const oversizedPayload = Buffer.alloc((10 * 1024 * 1024) + 1, 0x42);
writeFileSync(join(fixturesDir, 'oversized-receipt.jpg'), oversizedPayload);

console.log('Postman attack fixtures generated at tests/postman/fixtures');
