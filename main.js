const {app,BrowserWindow,shell}=require('electron');
function create(){
  const w=new BrowserWindow({width:1200,height:820,autoHideMenuBar:true,title:'G.V.R.M.Solutions Online Coaching Platform',webPreferences:{contextIsolation:true}});
  w.setMenuBarVisibility(false);
  w.loadFile('index.html');
  w.webContents.setWindowOpenHandler(({url})=>{shell.openExternal(url);return{action:'deny'}});
  w.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith('file:')){e.preventDefault();shell.openExternal(url)}});
}
app.whenReady().then(create);
app.on('window-all-closed',()=>app.quit());
