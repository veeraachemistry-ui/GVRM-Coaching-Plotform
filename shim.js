// Browser-local runtime (GitHub Pages / offline): db, user, downloads, files. Data stays in THIS browser.
(function(){
if(window.claude)return;
const KEY="gvrm_db_v1";let data={};
try{data=JSON.parse(localStorage.getItem(KEY)||"{}")}catch(e){}
const L={},clone=v=>JSON.parse(JSON.stringify(v));
const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(data))}catch(e){alert("Save aagala (storage full). Backup eduthu space free pannunga.")}};
const meta={fromCache:false,hasPendingWrites:false};
const sd=(id,c)=>{const v=(data[c]||{})[id];return{id,exists:v!==undefined,data:()=>v===undefined?undefined:clone(v),metadata:meta}};
const sc=c=>{const docs=Object.keys(data[c]||{}).map(i=>sd(i,c));return{docs,size:docs.length,empty:!docs.length,docChanges:()=>[],metadata:meta}};
const fire=c=>(L[c]||[]).slice().forEach(f=>{try{f()}catch(e){}});
const listen=(c,mk)=>next=>{const f=()=>next(mk());(L[c]=L[c]||[]).push(f);setTimeout(f,0);return()=>{L[c]=(L[c]||[]).filter(x=>x!==f)}};
const db={collection:c=>({
 doc:id=>({id,path:c+"/"+id,
  get:async()=>sd(id,c),
  set:async d=>{(data[c]=data[c]||{})[id]=clone(d);save();fire(c)},
  update:async d=>{const o=data[c]=data[c]||{};o[id]={...(o[id]||{}),...clone(d)};save();fire(c)},
  delete:async()=>{if(data[c])delete data[c][id];save();fire(c)},
  onSnapshot:listen(c,()=>sd(id,c))}),
 onSnapshot:listen(c,()=>sc(c))})};
const user={canEdit:async()=>true,isOwner:async()=>true,can:async()=>true,id:async()=>"local-user",
 me:async()=>({id:"local-user",name:"Teacher",isOwner:true,canEdit:true})};
const downloads={save:async({filename,data:d})=>{const b=d instanceof Blob?d:new Blob([d]);const a=document.createElement("a");a.href=URL.createObjectURL(b);a.download=filename;document.body.appendChild(a);a.click();setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},1500);return{ok:true}}};
// File storage (IndexedDB) for notes uploaded from computer
const idb=()=>new Promise((res,rej)=>{const r=indexedDB.open("gvrm_files",1);r.onupgradeneeded=()=>r.result.createObjectStore("f");r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
const tx=async(mode,fn)=>{const d=await idb();return new Promise((res,rej)=>{const t=d.transaction("f",mode);const q=fn(t.objectStore("f"));t.oncomplete=()=>res(q&&q.result);t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error)})};
const files={
 put:async f=>{const id=Date.now().toString(36)+Math.random().toString(36).slice(2,6);await tx("readwrite",s=>s.put(f,id));return id},
 url:async id=>{const b=await tx("readonly",s=>s.get(id));if(!b)throw new Error("missing");return URL.createObjectURL(b)},
 del:async id=>{await tx("readwrite",s=>s.delete(id))}};
window.claude={use:async n=>({db,user,downloads}[n]||null),files};
try{navigator.storage&&navigator.storage.persist&&navigator.storage.persist()}catch(e){}
if("serviceWorker" in navigator&&/^https?:/.test(location.protocol))navigator.serviceWorker.register("sw.js").catch(()=>{});
})();
