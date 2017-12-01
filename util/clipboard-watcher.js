const electron = require('electron')
class ClipboardWatcher {

  watchForClipboard(cb) {
    let currentElement = electron.clipboard.readText();
    setInterval(() => {
        let nextElement = electron.clipboard.readText();
        if (nextElement && currentElement !== nextElement) {
          currentElement = nextElement;
            let item = {
                id: new Date().getTime(),
                "text": currentElement
            };
            cb(item);
        }
    }, 1000);
  }
}

module.exports = ClipboardWatcher;