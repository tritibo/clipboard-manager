const {dialog, app, Menu, Tray} = require('electron');
const AutoLaunch = require('auto-launch');
const path = require('path')

let tray;
let currentStartupStatus = app.getLoginItemSettings().openAtLogin;

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
    click: clearHistory.bind(undefined, actions.clearHistory)
  }, {
    label: 'Quit',
    accelerator: 'CommandOrControl+Q',
    click: app.exit
  }]
  const contextMenu = Menu.buildFromTemplate(trayItems);
  const nativeImage = require('electron').nativeImage;
  var image = nativeImage.createFromPath(path.join(__dirname, '..', 'icon.png'));
  image.setTemplateImage(true);
  if (!tray) {
    tray = new Tray(image);
  }
  tray.setContextMenu(contextMenu);
}

function clearHistory(cb) {
  dialog.showMessageBox({
    title: 'Clear history',
    message: 'Are you sure?',
    buttons: ['Yes', 'No']
  }, (btn) => {
    if (btn === 0) {
      cb();
    }
  });
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