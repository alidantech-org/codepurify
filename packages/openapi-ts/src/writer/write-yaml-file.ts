import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

export function writeYamlFile(filePath: string, data: unknown): void {
  ensureFolder(path.dirname(filePath));

  fs.writeFileSync(filePath, yaml.dump(data, { indent: 2, lineWidth: -1 }), 'utf-8');
}

function ensureFolder(folder: string): void {
  if (!fs.existsSync(folder)) {
    fs.mkdirSync(folder, { recursive: true });
  }
}
