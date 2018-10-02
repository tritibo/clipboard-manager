window.customElements.define('cm-table', class extends HTMLElement {

  constructor() {
    super();
    window.addEventListener('keydown', (event) => {
      if (event.key >= "1" && event.key <= "9") {
        const index = event.key - 1;
        if (index < this.items.length) {
          const item = this.items[index];
          if (!item.deleted) {
            this.dispatchEvent(new CustomEvent('fast-select', {detail: item}));
          }
        }
      } else if (event.key === 'Enter') {
        if (this.keyboardScroll.selectedIndex >= 0) {
          this.selectRow(this.items[this.keyboardScroll.selectedIndex]);
        }
      }
    });
    this.keyboardScroll = new KeyboardScroll(this, '.TableElement');
  }

  selectRow(item) {
    this.dispatchEvent(new CustomEvent('select', {detail: item}));
  }

  populate(data, filter) {
    this.innerHTML = null;
    let index = 1;
    this.items = data;
    this.keyboardScroll.setItems(data);
    data.forEach(item => this.createRow(item, index++, filter));
  }

  createRow(item, index, filter) {
    const row = document.createElement('div');

    row.onclick = () => this.selectRow(item);

    row.classList.add('TableElement');
    const shortcut = document.createElement('div');
    shortcut.classList.add('Shortcut');
    if (index < 10) {
      shortcut.innerText = index;
    }
    row.appendChild(shortcut);

    const text = document.createElement('div');
    text.classList.add('Text');
    text.innerText = item.text;
    row.appendChild(text);

    if (filter) {
      const html = text.innerHTML;
      const index = html.toUpperCase().indexOf(filter.toUpperCase());
      if (~index) {
        text.innerHTML = html.substring(0, index) + '<span class="ht">' + html.substring(index, index + filter.length) + '</span>' + html.substring(index + filter.length);
      }
    }

    this.createMenu(row, text, item);
    this.appendChild(row);
  }

  createMenu(row, text, item) {
    const menu = document.createElement('div');
    menu.classList.add('Menu');
    menu.onclick = (e) => {
      e.stopPropagation();
      if (row.classList.contains('MenuOpen')) {
        row.classList.remove('MenuOpen')
      } else {
         row.classList.add('MenuOpen');
      }
    }
    text.appendChild(menu);

    const del = document.createElement('div');
    del.classList.add('DeleteItem');
    del.title = 'Remove';
    del.onclick = (event) =>  {
      event.stopPropagation();
      item.deleted = true;
      this.dispatchEvent(new CustomEvent('delete', {detail: {_id: item._id, file: item.file}}));
      row.remove();
    }
    row.appendChild(del);
  }
});