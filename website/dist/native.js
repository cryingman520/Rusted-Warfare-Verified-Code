(function(){
'use strict';
const platform=location.hostname==='app.rwtools.invalid'?'windows':location.hostname==='appassets.androidplatform.net'?'android':null;if(!platform)return;
const L=(z,e)=>document.documentElement.lang==='en'?e:z;let online=false;try{online=localStorage.getItem('rwtools-online')==='true'}catch{}
const fetchOriginal=window.fetch.bind(window);
window.fetch=(input,options)=>{const uri=new URL(typeof input==='string'?input:input.url,location.href);if(!online&&uri.origin!==location.origin&&!['blob:','data:'].includes(uri.protocol))return Promise.reject(Error(L('当前为离线模式，切换到「联网 AI」后再使用在线功能','Offline mode is enabled, switch to Online AI to use cloud services')));return fetchOriginal(input,options)};
function notify(){if(window.chrome?.webview)chrome.webview.postMessage({type:'network-mode',online});if(window.RWNative?.setOnline)RWNative.setOnline(online)}
function paint(){const b=document.querySelector('#native-mode');if(b){b.textContent=online?L('● 联网 AI','● Online AI'):L('○ 离线创作','○ Offline');b.title=L('点击切换工作模式，创作文件始终保存在此设备','Switch work mode, project files stay on this device')}}
function toggle(){online=!online;try{localStorage.setItem('rwtools-online',String(online))}catch{}notify();paint();window.toast?.(online?L('已启用联网 AI，免费服务仍需要可用网络和相应密钥','Online AI enabled, free services still need connectivity and API keys'):L('已切换为离线创作','Switched to offline creation'))}
document.addEventListener('DOMContentLoaded',()=>{const b=document.createElement('button');b.id='native-mode';b.className='btn btn-small btn-plain';b.addEventListener('click',toggle);document.querySelector('.header-actions')?.prepend(b);notify();paint()});
window.RWNativeInfo={platform,get online(){return online},toggle};
if(platform==='android'){
 const blobs=new Map(),create=URL.createObjectURL.bind(URL),revoke=URL.revokeObjectURL.bind(URL),click=HTMLAnchorElement.prototype.click;
 URL.createObjectURL=blob=>{const url=create(blob);blobs.set(url,blob);return url};URL.revokeObjectURL=url=>{blobs.delete(url);revoke(url)};
 async function save(a){let blob=blobs.get(a.href);if(!blob){const r=await fetchOriginal(a.href);if(!r.ok)throw Error('Download HTTP '+r.status);blob=await r.blob()}if(blob.size>20*1024*1024)throw Error(L('项目超过 20 MB，请减少素材后导出','Projects must be under 20 MB, reduce assets before exporting'));const data=await new Promise((resolve,reject)=>{const f=new FileReader();f.onload=()=>resolve(f.result.split(',')[1]);f.onerror=reject;f.readAsDataURL(blob)});RWNative.saveFile(a.download||a.href.split('/').pop()||'rw-project',data,blob.type||'application/octet-stream')}
 HTMLAnchorElement.prototype.click=function(){if(this.download||this.href.startsWith('blob:')){save(this).catch(e=>window.toast?.(e.message));return}return click.call(this)};
 document.addEventListener('click',e=>{const a=e.target.closest('a[download]');if(a){e.preventDefault();e.stopImmediatePropagation();save(a).catch(err=>window.toast?.(err.message))}},true);
}
})();
