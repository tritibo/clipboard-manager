window.customElements.define('cm-table', class extends HTMLElement {

  constructor() {
    super();
    window.addEventListener('keydown', (event) => {
      if (event.key >= "1" && event.key <= "9") {
        this.dispatchEvent(new CustomEvent('select', {detail: this.items[event.key - 1].text}));
      } else if (event.key === 'Enter') {
        this.dispatchEvent(new CustomEvent('select', {detail: this.items[this.keyboardScroll.selectedIndex].text}));        
      }
    });
    this.keyboardScroll = new KeyboardScroll(this, '.TableElement');
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

    row.onclick = () => this.dispatchEvent(new CustomEvent('select', {detail: item.text}));

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
    this.appendChild(row);
  }
});