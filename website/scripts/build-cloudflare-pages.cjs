const fs = require('node:fs');
const path = require('node:path');
const { zip } = require('../dist/editor-core.js');
const root = path.resolve(__dirname, '..');
const publicRoot = path.join(root, 'dist');
const output = path.join(root, '.sites-runtime', 'cloudflare-pages');
const files = [];
function collect(directory) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name === '_appgen_meta') continue;
    const absolute = path.join(directory, entry.name);
    if (entry.isSymbolicLink()) throw Error('Public assets cannot be symbolic links');
    if (entry.isDirectory()) { collect(absolute); continue; }
    const name = path.relative(publicRoot, absolute).replaceAll('\\', '/');
    if (/\.(exe|apk|aab|keystore|jks)$/i.test(name)) throw Error('Unexpected binary or signing file in website assets: ' + name);
    files.push({ name, data: fs.readFileSync(absolute) });
  }
}
collect(publicRoot);
for (const name of ['_worker.js', '_routes.json']) files.push({ name, data: fs.readFileSync(path.join(root, 'cloudflare', name)) });
const sha = require('node:child_process').execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true }).trim();
files.push({ name: 'build-info.json', data: Buffer.from(JSON.stringify({ sourceCommit: sha, canonicalOrigin: 'https://rwmod.noaushio.uk', builtAt: new Date().toISOString() }, null, 2)) });
for (const file of files) {
  const absolute = path.join(output, file.name);
  fs.mkdirSync(path.dirname(absolute), { recursive: true });
  fs.writeFileSync(absolute, file.data);
}
(async () => {
  const archive = path.resolve(root, '..', 'rwmod-cloudflare-pages.zip');
  fs.writeFileSync(archive, Buffer.from(await zip(files).arrayBuffer()));
  console.log(JSON.stringify({ archive, directory: output, fileCount: files.length, sourceCommit: sha, size: fs.statSync(archive).size }));
})().catch(error => { console.error(error.message); process.exitCode = 1; });
