const {app, BrowserWindow, globalShortcut, ipcMain, clipboard, Menu} = require('electron');
const path = require('path');
const url = require('url');
const robot = require("robotjs");
const ClipboardWatcher = require('./util/clipboard-watcher');
const db = require('./util/db');
const tray = require('./util/tray');

let mainWindow

if (app.makeSingleInstance(() => {})) {
  app.quit();
}

function init() {
  globalShortcut.register('CommandOrControl+Shift+V', show);
  createWindow();
  whatchForClipboard();
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 300,
    height: 400,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true
  })

  hide();
  mainWindow.on('blur', () => hide());
  app.dock.hide()

  tray.buildTrayMenu({
    show,
    clearHistory
  });


  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null
  });
}

app.on('ready', init)

// Quit when all windows are closed.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow();
  }
});

ipcMain.on('hide', () => mainWindow.hide());

ipcMain.on('pageready', () => {
  db.findAll().then(rows => mainWindow.webContents.send('data', rows));
});

ipcMain.on('filter', (event, data) => {
  db.filter(data.input).then(rows => mainWindow.webContents.send('data-filter', rows));
});

ipcMain.on('select', (event, data) => {
  hide();
  clipboard.writeText(data.text);
  setTimeout(() => {
    robot.keyTap('v', 'command');
  }, 100)
});

ipcMain.on('delete', (event, data) => db.remove(data));

function show() {
  mainWindow.show();
  mainWindow.webContents.send('page-show');
}

function hide() {
  Menu.sendActionToFirstResponder('hide:');
  mainWindow.hide();
}

function clearHistory() {
  db.clear();
  db.findAll().then(rows => mainWindow.webContents.send('data', rows));
}

function whatchForClipboard() {
  new ClipboardWatcher().watchForClipboard((item) => {
    db.insertEntry(item).then((rows) => mainWindow.webContents.send('data', rows));
  });
}
