var ipcRenderer = require('electron').ipcRenderer;

const table = document.getElementById('table')
const searchField = document.getElementById('search');


window.addEventListener('keydown', (event) => {
  const checkTarget = event.target !== searchField && !searchField.vlaue;
  if (checkTarget && !(event.key >= "1" && event.key <= "9") && event.key.length === 1) {
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
  table.populate(data);
});

table.addEventListener('select',  (event) => select(event.detail));

table.addEventListener('delete',  (event) => ipcRenderer.send('delete', {_id: event.detail}));

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

function select(text) {
  searchField.value = null;
  ipcRenderer.send('select', {
    text: text
  });
}