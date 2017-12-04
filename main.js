const {app, BrowserWindow, globalShortcut, ipcMain, clipboard, Menu} = require('electron');
const electron = require('electron');
const path = require('path');
const url = require('url');
const fs = require('fs');
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
  globalShortcut.register('CommandOrControl+;', show);
  createWindow();
  whatchForClipboard();

  tray.buildTrayMenu({
    show,
    clearHistory
  });
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


  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools({mode: 'undocked'});

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
  db.filter(data.input).then(rows => mainWindow.webContents.send('data-filter', {rows: rows, filter: data.input}));
});

ipcMain.on('select', (event, data) => {
  hide();
  if (data.file) {
    clipboard.writeText(fs.readFileSync(data.file).toString());
  } else {
    clipboard.writeText(data.text);
  }
  setTimeout(() => {
    robot.keyTap('v', 'command');
  }, 100)
});

ipcMain.on('delete', (event, data) => db.remove(data));

function show() {
  const currentDisplay = electron.screen.getDisplayNearestPoint(electron.screen.getCursorScreenPoint());
  const x = currentDisplay.bounds.x + currentDisplay.bounds.width / 2 - 150;
  const y = currentDisplay.bounds.y + currentDisplay.bounds.height / 2 - 200;
  mainWindow.setBounds({
    width: 300,
    height: 400,
    x: x,
    y: y
  });
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
