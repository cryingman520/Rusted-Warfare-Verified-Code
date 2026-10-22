const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');
const root = path.resolve(process.argv[2] || '../native-artifacts');
const entries = [
  { filename: 'Noaushio-RWModTools-1.1.0-x64.exe', platform: 'WINDOWS', name: 'Windows', descriptionZh: '电脑上的独立创作工作台，编辑器和教程随应用提供', descriptionEn: 'A desktop workspace with bundled editors and courses', requirements: 'Windows 10/11 x64 · Edge WebView2 Runtime', extension: '.exe' },
  { filename: 'Noaushio-RWModTools-1.1.0.apk', platform: 'ANDROID', name: 'Android', descriptionZh: '在手机和平板上编辑模组、绘制素材，文件保存到自己选择的位置', descriptionEn: 'Edit mods and draw assets on phones and tablets, save files where you choose', requirements: 'Android 8+', extension: '.apk' }
].map(({filename, ...entry}) => {
  const bytes = fs.readFileSync(path.join(root, filename));
  const id = crypto.createHash('sha256').update(filename).digest('hex');
  return {...entry, version: '1.1.0', size: bytes.length, url: 'https://download.noaushio.uk/file/' + id, sha256: crypto.createHash('sha256').update(bytes).digest('hex')};
});
fs.writeFileSync(path.resolve(__dirname, '../dist/releases.js'), 'window.RW_RELEASES=' + JSON.stringify(entries, null, 2) + ';\n');
console.log(JSON.stringify(entries.map(x => ({platform: x.platform, size: x.size, sha256: x.sha256}))));
