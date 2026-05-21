import fs from 'fs';
import path from 'path';

export function writeJsonFile(filePath: string, data: unknown): void {
  ensureFolder(path.dirname(filePath));

  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
}

function ensureFolder(folder: string): void {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}
