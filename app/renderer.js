var ipcRenderer = require('electron').ipcRenderer;

const table = document.getElementById('table')
const searchField = document.getElementById('search');


window.addEventListener('keydown', (event) => {
  const checkTarget = event.target !== searchField && !searchField.vlaue;
  const checkEvent = event.key.length === 1 || event.key === 'Backspace';
  if (checkTarget && !(event.key >= "1" && event.key <= "9") && checkEvent) {
    searchField.focus();  
  }
});

ipcRenderer.on('page-show', function (event, data) {
  searchField.blur();
});

ipcRenderer.on('data', function (event, data) {
  searchField.value = null;
  table.populate(data);
});

ipcRenderer.on('data-filter', function (event, data) {
  table.populate(data.rows, data.filter);
});

table.addEventListener('select',  (event) => select(event.detail));

table.addEventListener('delete',  (event) => ipcRenderer.send('delete', {_id: event.detail._id, file: event.detail.file}));

table.addEventListener('fast-select', (event) => {
  if (document.activeElement !== searchField) {
    select(event.detail);
  }
});

searchField.addEventListener('input', debounce(() => {
  ipcRenderer.send('filter', {
    input: searchField.value
  });
}, 100));

ipcRenderer.send('pageready', true);

window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') {
    ipcRenderer.send('hide');
  }
});

function select(item) {
  searchField.value = null;
  ipcRenderer.send('select', item);
}

