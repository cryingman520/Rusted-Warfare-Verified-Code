/* Rusted Warfare workbench. Browser-only, no evaluation of imported code. */
(function(root){
'use strict';
let schema, fields=[];
const tr=x=>root.RWI18n?.t(x)||x;
const clone=x=>JSON.parse(JSON.stringify(x));
const uid=()=> 'm'+Math.random().toString(36).slice(2,10);
const cleanName=s=>String(s||'unit').replace(/[^a-zA-Z0-9_\-]/g,'_').slice(0,70)||'unit';
function configure(s,f){schema=s;fields=f;}
function definition(type){return schema.modules.find(x=>x.id===type);}
function section(m){const d=definition(m.type);return d?d.pattern.replace('{name}',m.name).replace('{number}',m.name):m.name;}
function identify(name){let exact=schema.modules.find(x=>x.singleton&&x.pattern===name);if(exact)return {type:exact.id,name:''};for(const d of schema.modules.filter(x=>!x.singleton).sort((a,b)=>b.id.length-a.id.length)){if(name.startsWith(d.id+'_'))return {type:d.id,name:name.slice(d.id.length+1)};}return {type:'custom',name};}
function lookup(m,key){const d=definition(m.type);return fields.find(x=>x.key===key&&(x.section===d?.referenceSection||x.section==='通用预处理'));}
function moduleFields(m){const d=definition(m.type);return fields.filter(x=>x.section===d?.referenceSection||x.section==='通用预处理');}
function field(key,value,comment=''){return {key,value:String(value),comment};}
function makeModule(type,name='',values={}){const m={id:uid(),type,name,fields:[]};m.fields=Object.entries(values).map(([k,v])=>field(k,v,lookup(m,k)?.description_zh||''));return m;}
function get(m,key){return m?.fields.find(x=>x.key===key)?.value||'';}
function set(m,key,value,comment){let f=m.fields.find(x=>x.key===key);if(!f){f=field(key,value,comment||lookup(m,key)?.description_zh||'');m.fields.push(f);}else f.value=String(value);return f;}
function starter(){return {format:'rw-workshop-project',version:1,title:tr('我的侦察车'),modules:[
 makeModule('core','',{name:'workshopScout',class:'CustomUnitMetadata',strictLevel:'1',displayText:tr('工坊侦察车'),price:'300',maxHp:'220',mass:'2000',radius:'11',buildSpeed:'8s',showInEditor:'true'}),
 makeModule('graphics','',{image:'SHARED:debug_marker.png',image_wreak:'NONE',image_shadow:'NONE'}),
 makeModule('attack','',{canAttack:'false',canAttackFlyingUnits:'false',canAttackLandUnits:'false',canAttackUnderwaterUnits:'false'}),
 makeModule('movement','',{movementType:'LAND',moveSpeed:'1'}),
 makeModule('mod','',{title:tr('我的铁锈模组'),description:tr('使用铁锈工坊创建的单位模组'),minVersion:'1.15'})],assets:[],workflows:{}};}
function serialize(project,file='unit.ini'){
 const mods=project.modules.filter(m=>(definition(m.type)?.file||'unit.ini')===file);
 const lines=['# Rusted Workshop / Rusted Warfare 1.15'];
 for(const m of mods){lines.push('',...(m.comment?m.comment.split(/\r?\n/).map(c=>'# '+c):[`# ${definition(m.type)?.label||'自定义代码模块'}${m.name?' · '+m.name:''}`]),`[${section(m)}]`);for(const f of m.fields){if(f.comment)for(const c of f.comment.split(/\r?\n/))lines.push('# '+tr(c));lines.push(`${f.key}: ${f.value}`);}if(m.raw)lines.push(...m.raw);if(m.trailingComment)lines.push(...m.trailingComment.split(/\r?\n/).map(c=>'# '+c));}
 return lines.join('\n')+'\n';
}
function parseINI(text){const modules=[];let m=null,comments=[],triple=null;for(const line of String(text).replace(/^\uFEFF/,'').split(/\r?\n/)){
 if(triple){triple.value+='\n'+line;if(line.includes('"""'))triple=null;continue;}
 const h=line.match(/^\s*\[([^\]]+)\]\s*(?:[#;].*)?$/);if(h){const info=identify(h[1].trim());m={id:uid(),...info,fields:[],comment:comments.join('\n')};modules.push(m);comments=[];continue;}
 if(/^\s*[#;]/.test(line)){comments.push(line.replace(/^\s*[#;]\s?/,''));continue;}
 if(!line.trim()){continue;}
 if(!m)throw Error('发现节外代码。请从 [core] 等节开始，保留完整 INI。');
 const kv=line.match(/^\s*([^:=]+?)\s*[:=]\s*(.*)$/);if(kv){const f=field(kv[1].trim(),kv[2],comments.join('\n'));m.fields.push(f);if((kv[2].match(/"""/g)||[]).length%2)triple=f;comments=[];}else{(m.raw||=[]).push(line);comments=[];}
 }if(m&&comments.length)m.trailingComment=comments.join('\n');if(triple)throw Error('多行文本的三引号没有闭合。');if(!modules.length)throw Error('没有找到 INI 节。');return modules;
}
function importProject(value){const p=typeof value==='string'?JSON.parse(value):clone(value);if(p.format!=='rw-workshop-project'||p.version!==1||!Array.isArray(p.modules)||!p.modules.length||p.modules.length>1500)throw Error('不是受支持的工坊项目。');for(const m of p.modules){if(typeof m.type!=='string'||typeof m.name!=='string'||!Array.isArray(m.fields))throw Error('模块结构不完整');m.id=typeof m.id==='string'?m.id:uid();for(const f of m.fields){if(typeof f.key!=='string'||typeof f.value!=='string')throw Error('字段结构不完整');f.comment=String(f.comment||'');}}p.assets=p.assets||[];for(const a of p.assets){if(!/^[\w.\-]+$/.test(a.name)||typeof a.data!=='string')throw Error('素材文件名不安全');}p.workflows=p.workflows||{};return p;}
function declaredMemory(project){const core=project.modules.find(m=>m.type==='core');const list=get(core,'defineUnitMemory').split(',').map(x=>x.trim()).filter(Boolean);for(const f of core?.fields||[])if(f.key.startsWith('@memory '))list.push(f.value+' '+f.key.slice(8));return list.map(s=>{const parts=s.split(/\s+/);return {type:parts[0],name:parts[1]};}).filter(x=>x.name);}
function validate(p){const out=[],add=(level,message,m)=>out.push({level,message,moduleId:m?.id});const names=new Set();for(const d of schema.modules.filter(x=>x.base))if(!p.modules.some(m=>m.type===d.id))add('error','缺少基础模块：'+d.label);
 const memory=declaredMemory(p);for(const x of memory)if(!schema.memoryTypes.includes(x.type))add('error',`内存 ${x.name} 的类型 ${x.type} 不受本包支持。`);
 const declared=new Set(memory.map(x=>x.name));
 for(const m of p.modules){const sn=section(m);if(names.has(sn))add('error','重复模块：['+sn+']',m);names.add(sn);if(/[\[\]\r\n]/.test(sn)||!sn) add('error','模块名称包含非法字符。',m);const d=definition(m.type);if(d?.numericName&&!/^\d+$/.test(m.name))add('error','步足和机械臂的名称必须为数字。',m);
 const keys=new Set();for(const f of m.fields){if(keys.has(f.key))add('error',sn+' 重复字段：'+f.key,m);keys.add(f.key);if(/[\r\n:=\[\]]/.test(f.key))add('error','字段名含非法字符：'+f.key,m);const def=lookup(m,f.key);if(!def&&!/^(@|body_|leg\d+_|arm\d+_|turret\d+_|effect_|mutator|builtFrom_|canBuild_\d+_|action_\d+_|animation_)/.test(f.key))add('info','自定义或未收录字段：'+sn+'.'+f.key,m);
 if(!f.value.trim())add('warning','空值：'+f.key,m);
 if(def?.type==='bool'&&!/^(true|false)$/i.test(f.value)&&f.value.trim())add('error',f.key+' 需要 true 或 false。',m);
 if(['float','double','int','short'].includes(def?.type)&&f.value.trim()&&!/^[-+]?\d*\.?\d+(e[-+]?\d+)?$/i.test(f.value)&&!f.value.includes('${'))add('warning',f.key+' 是静态数字字段，请核对输入。',m);
 if(def?.allowed_values?.length&&def.type==='枚举/限定值'&&f.value.trim()&&!def.allowed_values.includes(f.value)&&!f.value.includes('${'))add('warning',f.key+' 不在参考包列出的选项中。',m);
 if(['setUnitMemory','sendMessageWithData'].includes(f.key)&&/[+\-*/]=/.test(f.value))add('error',f.key+' 只支持 =；累加请写 shots=memory.shots+1。',m);
 for(const match of f.value.matchAll(/\bmemory\.([A-Za-z_]\w*)/g))if(!declared.has(match[1]))add('warning','内存尚未声明：'+match[1],m);
 if(/self\.numberOfConnections\b/.test(f.value))add('warning','self.numberOfConnections 属于内部或保留函数。',m);
 if(/\b(?:if\s*\(|function\s*\(|while\s*\(|for\s*\()/.test(f.value))add('error','这不是游戏的表达式语法；使用条件字段、select 或动作积木。',m);
 if(['alsoTriggerAction','alsoQueueAction','onShoot_triggerActions'].includes(f.key)){for(const name of f.value.split(',').map(s=>s.trim()).filter(Boolean)){if(!p.modules.some(x=>['action','hiddenAction'].includes(x.type)&&x.name===name))add('warning','未找到动作：'+name+'（引用只填写名称后缀）',m);}}
 if(['projectile','altProjectile'].includes(f.key)&&m.type==='turret'&&!p.modules.some(x=>x.type==='projectile'&&x.name===f.value))add('warning','未找到射弹：'+f.value,m);
 if(['setUnitStats'].includes(f.key))for(const item of splitTop(f.value,',')){const key=item.match(/^\s*(\w+)\s*(?:\+=|-=|=)/)?.[1];if(key&&!root.RWEditorStats?.includes(key)&&root.RWEditorStats)add('warning','未收录的可写属性：'+key,m);}
 }
 if(m.type==='core'){for(const k of ['name','maxHp','mass','radius'])if(!get(m,k))add('error','单位核心缺少 '+k,m);if(/^self(?:\.|$)/i.test(get(m,'name')))add('error','单位名不能使用保留名称 self。',m);}
 if(m.type==='graphics'&&!get(m,'image'))add('error','图像模块缺少 image。',m);
 if(m.type==='movement'&&!get(m,'movementType'))add('error','移动模块缺少 movementType。',m);
 if(m.type==='turret')for(const k of ['x','y'])if(!get(m,k))add('error','炮塔缺少 '+k,m);
 if(m.type==='projectile'&&!get(m,'life'))add('error','射弹缺少 life。',m);
 }
 if(p.modules.some(m=>m.type==='turret')&&get(p.modules.find(m=>m.type==='attack'),'canAttack')!=='true')add('warning','已有炮塔，但总体攻击 canAttack 尚未开启。');
 if(p.modules.filter(m=>m.generated).length>30)add('warning','动作流程较长，请拆成多个入口，并在游戏内检查递归深度。');
 const assets=new Set((p.assets||[]).map(a=>a.name));for(const m of p.modules)for(const f of m.fields){const def=lookup(m,f.key);if(def?.type.startsWith('图片路径')&&/image|icon|texture/i.test(f.key)&&f.value&&!/^(NONE|AUTO|SHARED:|ROOT:|CORE:|SHADOW:)/i.test(f.value)&&!f.value.includes('${')&&!assets.has(f.value))add('warning','未打包图片：'+f.value+'；可在素材区上传。',m);}
 return out;
}
function splitTop(text,separator=','){let depth=0,quote='',out=[],start=0;for(let i=0;i<text.length;i++){const c=text[i];if(quote){if(c===quote&&text[i-1]!=='\\')quote='';}else if(c==='"'||c==="'")quote=c;else if('({['.includes(c))depth++;else if(')}]'.includes(c))depth--;else if(c===separator&&depth===0){out.push(text.slice(start,i));start=i+1;}}out.push(text.slice(start));return out;}
function compileWorkflow(project,parent,nodes,workspace){
 const p=clone(project),target=p.modules.find(x=>x.id===parent.id);if(!target||!['action','hiddenAction'].includes(target.type))throw Error('动作流程只适用于玩家动作或隐藏动作。');
 const prefix='wf_'+cleanName(parent.id)+'_';p.modules=p.modules.filter(x=>x.generated!==parent.id);let count=0;const generated=[],mem=[];
 const action=(values,label)=>{const name=prefix+(++count),m=makeModule('hiddenAction',name,values);m.generated=parent.id;m.fields.forEach(f=>{f.comment=(label?label+' · ':'')+f.comment;});generated.push(m);return name;};
 function chain(items,next='',depth=0){if(depth>8)throw Error('条件嵌套最多 8 层，请拆分动作。');if(items.length>50)throw Error('单段流程最多 50 个积木。');let entry=next;for(const n of [...items].reverse()){
 if(n.kind==='if'){if(!n.condition)throw Error('如果积木缺少条件。');const flag=prefix+'flag'+(++count);mem.push(flag);const yes=chain(n.then||[],entry,depth+1),no=chain(n.else||[],entry,depth+1);const gates=[];if(yes)gates.push(action({alsoTriggerOrQueueActionConditional:'memory.'+flag,alsoTriggerAction:yes},'条件为真'));if(no)gates.push(action({alsoTriggerOrQueueActionConditional:'not memory.'+flag,alsoTriggerAction:no},'条件为假'));entry=action({setUnitMemory:flag+'='+n.condition,...(gates.length?{alsoTriggerAction:gates.join(', ')}:{})},'只计算一次条件');
 }else if(n.kind==='call'){if(!/^[A-Za-z0-9_\-]+$/.test(n.name||''))throw Error('请选择或输入动作名称后缀。');entry=action({alsoTriggerAction:[n.name,entry].filter(Boolean).join(', ')},'调用动作');
 }else if(n.kind==='command'){if(!n.key||!String(n.value||'').trim())throw Error('命令积木缺少字段或值。');if(['alsoTriggerAction','alsoQueueAction','alsoTriggerOrQueueActionConditional','autoTrigger','autoTriggerOnEvent'].includes(n.key))throw Error('流程中请使用专门的条件和调用积木。');entry=action({[n.key]:n.value,...(entry?{alsoTriggerAction:entry}:{})},'执行命令');}
 else throw Error('不支持的动作积木。');}return entry;}
 const entry=chain(nodes);const old=get(target,'alsoTriggerAction').split(',').map(x=>x.trim()).filter(x=>x&&!x.startsWith(prefix));if(entry)old.push(entry);if(old.length)set(target,'alsoTriggerAction',old.join(', '));else target.fields=target.fields.filter(f=>f.key!=='alsoTriggerAction');
 const core=p.modules.find(m=>m.type==='core');const declarations=get(core,'defineUnitMemory').split(',').map(x=>x.trim()).filter(x=>x&&!new RegExp('\\b'+prefix).test(x));declarations.push(...mem.map(x=>'boolean '+x));if(declarations.length)set(core,'defineUnitMemory',declarations.join(', '));else core.fields=core.fields.filter(f=>f.key!=='defineUnitMemory');
 p.modules.push(...generated);p.workflows[parent.id]={nodes:clone(nodes),workspace};return p;
}
function crc32(data){let c=0xffffffff;for(const b of data){c^=b;for(let j=0;j<8;j++)c=(c>>>1)^((c&1)?0xedb88320:0);}return (c^0xffffffff)>>>0;}
function zip(files){const enc=new TextEncoder(),parts=[],central=[];let offset=0;const u16=(a,o,v)=>new DataView(a.buffer).setUint16(o,v,true),u32=(a,o,v)=>new DataView(a.buffer).setUint32(o,v,true);for(const f of files){if(!/^[\w.\-/]+$/.test(f.name)||f.name.includes('..'))throw Error('不安全的导出路径。');const name=enc.encode(f.name),data=typeof f.data==='string'?enc.encode(f.data):f.data,crc=crc32(data),h=new Uint8Array(30+name.length);u32(h,0,0x04034b50);u16(h,4,20);u16(h,6,0x800);u16(h,12,33);u32(h,14,crc);u32(h,18,data.length);u32(h,22,data.length);u16(h,26,name.length);h.set(name,30);parts.push(h,data);const c=new Uint8Array(46+name.length);u32(c,0,0x02014b50);u16(c,4,20);u16(c,6,20);u16(c,8,0x800);u16(c,14,33);u32(c,16,crc);u32(c,20,data.length);u32(c,24,data.length);u16(c,28,name.length);u32(c,42,offset);c.set(name,46);central.push(c);offset+=h.length+data.length;}
 const size=central.reduce((n,a)=>n+a.length,0),end=new Uint8Array(22);u32(end,0,0x06054b50);u16(end,8,files.length);u16(end,10,files.length);u32(end,12,size);u32(end,16,offset);return new Blob([...parts,...central,end],{type:'application/zip'});
}
function archive(project){const files=[{name:'mod-info.txt',data:serialize(project,'mod-info.txt')},{name:'units/'+cleanName(get(project.modules.find(x=>x.type==='core'),'name'))+'.ini',data:serialize(project)}];for(const a of project.assets||[])files.push({name:'units/'+a.name,data:Uint8Array.from(atob(a.data),c=>c.charCodeAt(0))});return zip(files);}
const api={configure,clone,uid,cleanName,definition,section,identify,lookup,moduleFields,field,makeModule,get,set,starter,serialize,parseINI,importProject,declaredMemory,validate,splitTop,compileWorkflow,crc32,zip,archive};root.RWCore=api;if(typeof module!=='undefined')module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
