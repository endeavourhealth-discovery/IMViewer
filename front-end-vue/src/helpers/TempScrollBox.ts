export class TempScrollBox {
  private scrollBarWidth: number;

  constructor() {
    this.scrollBarWidth = 0;
    this.measureScrollbarWidth();
  }

  measureScrollbarWidth() {
    const scrollbox = document.createElement("div");
    scrollbox.style.overflow = "scroll";
    document.body.appendChild(scrollbox);
    this.scrollBarWidth = scrollbox.offsetWidth - scrollbox.clientWidth;
    document.body.removeChild(scrollbox);
  }

  get width() {
    return this.scrollBarWidth;
  }
}
