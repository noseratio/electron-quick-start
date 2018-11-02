'use strict';

async function main() {
  // Modules to control application life and create native browser window
  const { app, BrowserWindow, ipcMain } = require('electron');
  const isDevelopment = require('electron-is-dev');

  async function createMainWindow() {
    // Create the browser window.
    const window = new BrowserWindow({ width: 800, height: 600 });

    await new Promise((resolve, reject) => {
      // resolve when when 'did-finish-load' has been fired
      window.webContents.once('did-finish-load', function () {
        resolve();
      });

      // or reject if it was closed before then
      window.once('closed', function () {
        reject(new Error('Window closed prematurely.'));
      });

      // initiate the loading
      window.loadFile(`${__dirname}/index.html`);
    });

    return window;
  }

  // 'ready' will be fired when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  await new Promise(resolve => app.once('ready', resolve));

  // exit when all windows are closed and this promise is resolved
  const terminationPromise = new Promise(resolve => 
    app.once('window-all-closed', () => resolve()));

  // we expect 'rendererReady' notification from Renderer
  const rendererPromise = new Promise(resolve =>
    ipcMain.once('rendererReady', (event, args) => resolve(event.sender)));

  // initiate creating the main window
  const mainWindowPromise = createMainWindow();

  // await both the window to have been loaded 
  // and 'rendererReady' notification to have been fired,
  // while observing premature termination
  await Promise.race([
    Promise.all([rendererPromise, mainWindowPromise]),
    terminationPromise.finally(() => {
        throw new Error('All windows closed prematurely.'); })
  ]);

  // keep the mainWindow reference
  const mainWindow = await mainWindowPromise;

  // notify the Renderer that Main is ready
  mainWindow.webContents.send("mainReady");

  // from here we can do anything we want

  //
  // Open the DevTools if desired
  // mainWindow.webContents.openDevTools()
  //
  
  // awaiting terminationPromise here keeps the mainWindow object alive
  await terminationPromise;

  app.exit(0);
}

main().catch(error => {
  console.log(error);
  process.exit(1);
});
