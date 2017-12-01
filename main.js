const electron = require('electron')
const app = electron.app
const BrowserWindow = electron.BrowserWindow

const path = require('path')
const url = require('url');
const robot = require("robotjs");
const Datastore = require('nedb');
const DB_DIR = path.join(process.env['HOME'], ".clipboard-manager");
const MAX_ENTRIES = 1000;
const ClipboardWatcher = require('./util/clipboard-watcher');
require('mkdirp')(DB_DIR);
const AutoLaunch = require('auto-launch');

let currentStartupStatus = app.getLoginItemSettings().openAtLogin;
let mainWindow

let db = new Datastore({
  filename: path.join(DB_DIR, '/.db'),
  autoload: true
});
let tray;

function init() {
  electron.globalShortcut.register('CommandOrControl+Alt+V', show);

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
  electron.app.dock.hide()

  if (!tray) {
    buildTrayMenu();
  }

  // and load the index.html of the app.
  mainWindow.loadURL(url.format({
    pathname: path.join(__dirname, 'app/index.html'),
    protocol: 'file:',
    slashes: true
  }))

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();

  electron.ipcMain.on('hide', () => mainWindow.hide());

  electron.ipcMain.on('pageready', () => {
    db.find({}).sort({
      id: -1
    }).limit(MAX_ENTRIES).exec((err, rows) => {
      mainWindow.webContents.send('data', rows);
    });
  });

  electron.ipcMain.on('filter', (event, data) => {
    db.find({
      text: new RegExp(escapeRegExp(data.input), 'i')
    }).sort({
      id: -1
    }).limit(100).exec((err, rows) => {
      mainWindow.webContents.send('data-filter', rows);
    });
  });

  electron.ipcMain.on('select', (event, data) => {
    hide();
    electron.clipboard.writeText(data.text);
    setTimeout(() => {
      robot.keyTap('v', 'command');
    }, 100)
  });

  electron.ipcMain.on('delete', (event, data) => db.remove(data));

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

function show() {
  mainWindow.show();
  mainWindow.webContents.send('page-show');
}

function hide() {
  electron.Menu.sendActionToFirstResponder('hide:');
  mainWindow.hide();
}

function clearHistory() {
  db.remove({}, {multi: true});
  db.find({}).sort({
    id: -1
  }).limit(MAX_ENTRIES).exec((err, rows) => {
    mainWindow.webContents.send('data', rows);
  });
}

function whatchForClipboard() {
  new ClipboardWatcher().watchForClipboard((item) => {
    db.remove({
      text: item.text
    }, {
      multi: true
    });
    db.insert(item, err => err && console.error(err));
    db.find({}).sort({
      id: -1
    }).limit(MAX_ENTRIES).exec((err, rows) => {
      mainWindow.webContents.send('data', rows);
      if (rows.length == MAX_ENTRIES) {
        db.remove({
          id: {
            $lt: rows[MAX_ENTRIES - 1].id
          }
        }, {
          multi: true
        });
      }
    });
  });
}

function buildTrayMenu() {
  const trayItems = [{
    label: 'Show',
    accelerator: 'CommandOrControl+Alt+V',
    click: show
  }, {
    label: 'Run at startup',
    type: 'checkbox',
    click: toggleRunStartup,
    checked: currentStartupStatus
  }, {
    label: 'Clear history',
    click: clearHistory
  }, {
    label: 'Quit',
    accelerator: 'CommandOrControl+Q',
    click: app.exit
  }]
  const contextMenu = electron.Menu.buildFromTemplate(trayItems);
  tray = new electron.Tray(path.join(__dirname, 'icon.png'));
  tray.setContextMenu(contextMenu);
}

function escapeRegExp(str) {
  return str.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&");
}

function toggleRunStartup() {
  currentStartupStatus = !currentStartupStatus;
  var autoLaunch = new AutoLaunch({
    name: 'clipboard-manager'
  });
  if (currentStartupStatus) {
    autoLaunch.enable();
  } else {
    autoLaunch.disable();
  }
}
