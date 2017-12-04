const electron = require('electron');
const { exec } = require('child_process');

const blacklist = 'de.pixel-paws.KeePassMac;com.apple.keychainaccess';

function checkApplication(cb) {
  exec('lsappinfo info `lsappinfo front` | grep bundleID | cut -d\\" -f2', (err, stdout, stderr) => {
    //console.log(stdout);
    if (!~blacklist.indexOf(stdout.replace('\n', ''))) {
      cb();
    }
  });
}

class ClipboardWatcher {
  watchForClipboard(cb) {
    let currentElement = this.readClipboard();
    setInterval(() => {
      let nextElement = this.readClipboard();
      if (nextElement && currentElement !== nextElement) {
        currentElement = nextElement;
        let item = {
          id: new Date().getTime(),
          "text": currentElement
        };
        checkApplication(cb.bind(undefined, item));
      }
    }, 1000);
  }

  readClipboard() {
    return electron.clipboard.readText();
  }
}

module.exports = ClipboardWatcher;