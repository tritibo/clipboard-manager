var ipcRenderer = require('electron').ipcRenderer;

const table = document.getElementById('table')
ipcRenderer.on('data', function (event, data) {
  table.populate(data);
});
table.addEventListener('select', (event) => ipcRenderer.send('select', {text: event.detail}));

ipcRenderer.send('pageready', true);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    ipcRenderer.send('hide');
  }
});
