window.customElements.define('cm-table', class extends HTMLElement {

  constructor() {
    super();
    window.addEventListener('keydown', (event) => {
      if (event.key >= "1" && event.key <= "9") {
        const index = event.key - 1;
        if (index < this.items.length) {
          this.dispatchEvent(new CustomEvent('fast-select', {detail: this.items[index].text}));
        }
      } else if (event.key === 'Enter') {
        this.selectRow(this.items[this.keyboardScroll.selectedIndex].text);        
      }
    });
    this.keyboardScroll = new KeyboardScroll(this, '.TableElement');
  }

  selectRow(text) {
    this.dispatchEvent(new CustomEvent('select', {detail: text}));            
  }
  
  populate(data) {
    this.innerHTML = null;
    let index = 1;
    this.items = data;
    this.keyboardScroll.setItems(data);
    data.forEach(item => this.createRow(item, index++));
  }

  createRow(item, index) {
    const row = document.createElement('div');

    row.onclick = () => this.selectRow(item.text);

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
      this.dispatchEvent(new CustomEvent('delete', {detail: item._id}));
      row.remove();
    }    
    row.appendChild(del);
  }
});