(function () {
  let template = document.createElement("template");
  template.innerHTML = `
        <h1>Hello World</h1>
    `;

  class LpGauge extends HTMLElement {
    constructor() {
      super();
      let shadowRoot = this.attachShadow({ mode: "open" });
      shadowRoot.appendChild(template.content.cloneNode(true));
    }

    connectedCallback() {
      this._firstConnection = true;
      this.redraw();
    }

    disconnectedCallback() {}

    onCustomWidgetBeforeUpdate(oChangedProperties) {}

    onCustomWidgetAfterUpdate(oChangedProperties) {
      if (this._firstConnection) {
        this.redraw();
      }
    }

    onCustomWidgetDestroy() {}

    redraw() {}
  }
  customElements.define("pl-com-proholding-gauge", LpGauge);
})();
