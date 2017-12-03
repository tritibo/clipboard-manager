const electron = require('electron');
const AutoLaunch = require('auto-launch');
const path = require('path')

let tray;
let currentStartupStatus = electron.app.getLoginItemSettings().openAtLogin;

function buildTrayMenu(actions) {
  const trayItems = [{
    label: 'Show',
    accelerator: 'CommandOrControl+Shift+V',
    click: actions.show
  }, {
    label: 'Run at startup',
    type: 'checkbox',
    click: toggleRunStartup,
    checked: currentStartupStatus
  }, {
    label: 'Clear history',
    click: actions.clearHistory
  }, {
    label: 'Quit',
    accelerator: 'CommandOrControl+Q',
    click: electron.app.exit
  }]
  const contextMenu = electron.Menu.buildFromTemplate(trayItems);
  if (!tray) {
    tray = new electron.Tray(path.join(__dirname, '..', 'icon.png'));
  }
  tray.setContextMenu(contextMenu);
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

module.exports = {
  buildTrayMenu: buildTrayMenu
}