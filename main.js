const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url');
const robot = require("robotjs");
const Datastore = require('nedb');
const DB_DIR = path.join(process.env['HOME'], ".clipboard-manager");
require('mkdirp')(DB_DIR);

let mainWindow

let db = new Datastore({ filename: path.join(DB_DIR, '/.db'), autoload: true });

function init() {
  electron.globalShortcut.register('CommandOrControl+Alt+V', () => {
    mainWindow.show();
  });

  createWindow();
  watchForClipboard();
}

function createWindow() {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 300,
    height: 500,
    frame: false,
    fullscreenable: false,
    resizable: false,
    transparent: true
  })

  /*mainWindow.hide();
  mainWindow.on ( 'blur', () => mainWindow.hide());
  electron.app.dock.hide()*/

  const tray = new electron.Tray(path.join(__dirname, 'icon.png'));
  tray.on('click', () => mainWindow.show());

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))
  
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  electron.ipcMain.on('hide', () => mainWindow.hide());

  electron.ipcMain.on('pageready', () => {
    db.find({}).sort({id: -1}).limit(100).exec((err, rows) => {
      mainWindow.webContents.send('data', rows);
    });
  });

  electron.ipcMain.on('select', (event, data) => {
    electron.Menu.sendActionToFirstResponder('hide:');
    electron.clipboard.writeText(data.text);
    setTimeout(()=>{
      robot.keyTap('v', 'command');
    }, 100)
  });

  // Emitted when the window is closed.
  mainWindow.on('closed', function () {
    mainWindow = null
  })
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
    createWindow()
  }
});


function watchForClipboard() {
  let currentElement = electron.clipboard.readText();
  setInterval(() => {
      let nextElement = electron.clipboard.readText();
      if (currentElement !== nextElement) {
        currentElement = nextElement;
          let item = {
              id: new Date().getTime(),
              "text": currentElement
          };
          db.insert(item, err => err && console.error(err));
          //console.log('new item inserted');
          db.find({}).sort({id: -1}).limit(100).exec((err, rows) => {
            mainWindow.webContents.send('data', rows);
          });
      }
  }, 1000);
}
