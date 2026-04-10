import { cp, rm } from 'node:fs/promises';

const sourceDir = new URL('../generated', import.meta.url);
const targetDir = new URL('../dist/generated', import.meta.url);

await rm(targetDir, { recursive: true, force: true });
await cp(sourceDir, targetDir, { recursive: true });