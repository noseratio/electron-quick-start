// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

'use strict';

async function main() {
  const { ipcRenderer, remote } = require('electron');
  const isDevelopment = require('electron-is-dev');

  console.log(process.env);

  if (isDevelopment) {
    // this is to give Chrome Debugger time to attach to the new window 
    await new Promise(r => setTimeout(r, 1000));
  }

  // breakpoints should work from here on,
  // toggle them with F9 or just use 'debugger'
  debugger;

  // await the document to finish loading
  await new Promise(resolve => 
    document.readyState === 'loading'? 
      document.addEventListener('DOMContentLoaded', resolve):
      resolve());

  // notify Main that Renderer is ready
  ipcRenderer.send('rendererReady', null);

  // await confirmation that Main is ready
  await new Promise(resolve => ipcRenderer.once('mainReady', resolve));
  
  // now both Main and Renderer processes are ready
  // we can do whatever we want
  statusElement.innerHTML = 'Main and Renderer are ready.';
}

main().catch(function (error) {
  console.log(error);
  alert(error);
});
