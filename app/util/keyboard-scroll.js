class KeyboardScroll {
  constructor(element, selector) {
    this.element = element;
    this.selector = selector;
    this.bindListener();
  }
  
  setItems(items) {
    this.selectedIndex = -1;
    this.items = items;
  }

   bindListener() {
     window.addEventListener('keydown', (event) => {
       if (event.key === 'ArrowDown') {
         this.activeItem(1);
       } else if (event.key === 'ArrowUp') {
         this.activeItem(-1);
       }
     });
   }

   activeItem(index) {
     this.selectedIndex = Math.max(0, this.selectedIndex + index);
     if (this.selectedIndex >= this.items.length) {
       this.selectedIndex = 0;
       index = -1;
     }
     
     const activeElement = this.element.querySelector('.Active');
     if (activeElement) {
       activeElement.classList.remove('Active');
     }
     const activatedElement = this.element.querySelector(this.selector + ':nth-child(' + (this.selectedIndex + 1) + ')');
     activatedElement.classList.add('Active');
     const height = document.documentElement.clientHeight;
 
     if (index > 0) {
       const bottom = activatedElement.getBoundingClientRect().bottom + this.element.scrollTop + 20;
       if (bottom > height) {
         this.element.scrollTop = bottom - height;
       }
     } else {
       const top = activatedElement.getBoundingClientRect().top;
       if (top < 0) {
         this.element.scrollTop = top + this.element.scrollTop - 20;
       }
     }
   }
}
  