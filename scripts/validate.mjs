import { readdir, readFile } from 'node:fs/promises';
import { resolve, relative } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = resolve(import.meta.dirname, '..');
const files = [];
async function walk(dir) {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    if (['node_modules', '.git', '.shopify'].includes(entry.name)) continue;
    const path = resolve(dir, entry.name);
    if (entry.isDirectory()) await walk(path); else files.push(path);
  }
}
await walk(root);
const schemas = new Map();
let jsonCount = 0;
for (const path of files) {
  const text = await readFile(path, 'utf8');
  if (path.endsWith('.json')) { JSON.parse(text); jsonCount++; }
  if (path.endsWith('.liquid')) {
    const schema = text.match(/{%\s*schema\s*%}([\s\S]*?){%\s*endschema\s*%}/);
    if (schema) schemas.set(relative(resolve(root, 'sections'), path).replace(/\.liquid$/, ''), JSON.parse(schema[1]));
    for (const match of text.matchAll(/{%[-\s]*(?:render|section)\s+'([^']+)'/g)) {
      const directory = match[0].includes('render') ? 'snippets' : 'sections';
      if (!files.includes(resolve(root, directory, `${match[1]}.liquid`))) throw new Error(`Missing ${directory}/${match[1]}`);
    }
  }
  if (/\.(m?js)$/.test(path)) {
    const check = spawnSync(process.execPath, ['--check', path], { encoding: 'utf8' });
    if (check.status) throw new Error(check.stderr);
  }
}
for (const path of files.filter((p) => p.endsWith('.json') && /(?:templates|sections)[\\/]/.test(p))) {
  const doc = JSON.parse(await readFile(path, 'utf8'));
  for (const id of doc.order || []) if (!doc.sections[id]) throw new Error(`Missing section ${id}`);
  for (const section of Object.values(doc.sections || {})) {
    const schema = schemas.get(section.type);
    if (!schema) throw new Error(`Missing schema ${section.type}`);
    for (const block of Object.values(section.blocks || {})) if (!schema.blocks?.some((b) => b.type === block.type)) throw new Error(`Missing block ${block.type}`);
  }
}
console.log(`Validated ${jsonCount} JSON files, ${schemas.size} section schemas, template references, and JavaScript syntax.`);
