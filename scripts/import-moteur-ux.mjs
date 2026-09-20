import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

const [sourceArgument, outputArgument = 'public/moteur-ux.html'] = process.argv.slice(2);

if (!sourceArgument) {
  throw new Error('Usage: node scripts/import-moteur-ux.mjs <source.html> [public/moteur-ux.html]');
}

const source = resolve(sourceArgument);
const output = resolve(outputArgument);
const original = readFileSync(source, 'utf8');
const sourceHash = createHash('sha256').update(original).digest('hex');

let sanitized = original
  .replace(/"(path|source)"\s*:\s*"\/Users\/JOB[^"]*"/g, '"$1": "[référence locale retirée]"')
  .replace(/"(fileUrl|sourceUrl)"\s*:\s*"file:\/\/\/Users\/JOB[^"]*"/g, '"$1": ""')
  .replaceAll('/Users/JOB', '[chemin local retiré]')
  .replaceAll('file:///Users/JOB', '[URL locale retirée]')
  .replace(
    '<a href="NoteMistress/ui-framework/Moteur-UX.html">Générateur NoteMistress ↗</a>',
    '<span class="embedded-source">Source auditée · chemins privés retirés</span>',
  );

const provenance = `<!-- Source auditée Moteur-UX.html · SHA-256 ${sourceHash} · copie publique sans chemins locaux -->`;
sanitized = sanitized.replace('<!doctype html>', `<!doctype html>${provenance}`);

if (/\/Users\/JOB|file:\/\/\/Users\/JOB/.test(sanitized)) {
  throw new Error('Le fichier généré contient encore un chemin utilisateur.');
}

mkdirSync(dirname(output), { recursive: true });
writeFileSync(output, sanitized);
console.log(`${output} généré depuis ${sourceHash}`);
