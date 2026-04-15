import { cp, rm, symlink } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';

const sourceDir = new URL('../generated', import.meta.url);
const targetDir = new URL('../dist/generated', import.meta.url);

await rm(targetDir, { recursive: true, force: true });

try {
	await symlink(
		fileURLToPath(sourceDir),
		fileURLToPath(targetDir),
		process.platform === 'win32' ? 'junction' : 'dir',
	);
} catch {
	// Fallback for environments that disallow symlink/junction creation.
	await cp(sourceDir, targetDir, { recursive: true });
}