(function () {
  let template = document.createElement("template");

  const gaugeStyles = `#root {
  width:100%;
  height: 100%;
}
.gauge {
  fill:#000000;
  stroke-width:0px;
  font-family:Helvetica;
} 
.gauge .outer-circle {
  fill:rgb(52,75,109);
  stroke:rgb(52,75,109);
  stroke-width:2px;
}
.gauge .inner-circle {
  fill:#ebffe7;
  stroke:#e0e0e0;
  stroke-width:2px;
}
.gauge .minor-ticks {
  stroke:#000000;
  stroke-width:1px;
}
.gauge .major-ticks {
  stroke:#000000;
  stroke-width:2px;
}
.gauge .pointer {
  fill:rgb(255,0,0);
  stroke:#eaeaea;
  fill-opacity: 1;
  opacity:1;
  stroke-width:1;
}
.gauge .pointer-pin {
  fill:rgb(150,168,195);
  stroke:#fff;
  opacity:1;
}

.gauge #first-color{ fill:  rgb(255,0,0); }
.gauge #second-color{ fill: rgb(0,176,80);}
.gauge #third-color{ fill: rgb(255,255,0);}`;

  template.innerHTML = `
    <style id="styling_styleComponent">
      h3 {
        font-weight: normal;
      }
      .styling_propsContainer {
        margin-bottom: 10px;
        color: #333;
      }

      .styling_inputContainer {
        display: flex;
        align-items: center;
        margin-top: 7px;
      }

      .styling_inputContainer input {
        margin-right: 5px;
      }

      .styling_propsContainer input[type="color"] {
        border: none;
        width: 42px;
        margin: 0;
      }
    </style>
    <div id="root_style-props">
      <h3>Visibility</h3>
      <div class="styling_propsContainer">
        <input type="checkbox" id="isValVisible" />
        <label for="isValVisible">Show values and title</label>
      </div>
      <div class="styling_propsContainer">
        <input type="checkbox" id="isColorfulPointer" />
        <label for="isColorfulPointer">Colorful pointer</label>
      </div>
      <h3>Zones color <small>(from left to right)</small></h3>
      <div class="styling_propsContainer">
        <label for="firstZoneColorValue">First zone color</label>
        <div class="styling_inputContainer">
          <input id="firstZoneColorValue" type="text" size="10" />
          <input id="firstZoneColor" type="color" />
        </div>
      </div>
      <div class="styling_propsContainer">
        <label for="secondZoneColorValue">Second zone color</label>
        <div class="styling_inputContainer">
          <input id="secondZoneColorValue" type="text" size="10" />
          <input id="secondZoneColor" type="color" />
        </div>
      </div>
      <div class="styling_propsContainer">
        <label for="thirdZoneColorValue">Third zone color</label>
        <div class="styling_inputContainer">
          <input id="thirdZoneColorValue" type="text" size="10" />
          <input id="thirdZoneColor" type="color" />
        </div>
      </div>
      <div class="styling_propsContainer">
        <label for="cssEditor">Css Editor</label>
        <div class="styling_inputContainer">
          <textarea id="cssEditor" rows="25" style="width:100%;">${gaugeStyles}</textarea>
        </div>
        <button id="saveCss">Save</button>
        <button id="resetCss">Reset to defaults</button>
      </div>
    </div>`;

  customElements.define(
    "ph-gauge-styling",
    class LpGaugeStylingPanel extends HTMLElement {
      constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._shadowRoot
          .getElementById("saveCss")
          .addEventListener("click", this._submit.bind(this));
        this._shadowRoot
          .getElementById("resetCss")
          .addEventListener("click", (event) => {
            event.preventDefault();
            this._shadowRoot.getElementById("cssEditor").value = gaugeStyles;
          });

        const changeZoneColorElementsId = [
          "firstZoneColor",
          "secondZoneColor",
          "thirdZoneColor",
          "firstZoneColorValue",
          "secondZoneColorValue",
          "thirdZoneColorValue",
        ];

        changeZoneColorElementsId.forEach((id) =>
          this._shadowRoot
            .getElementById(id)
            .addEventListener("change", (event) => {
              if (id.includes("Value"))
                this[id.replace("Value", "")] = event.target.value;
              else this[id] = event.target.value;
            })
        );

        [
          "isValVisible",
          "isColorfulPointer",
          ...changeZoneColorElementsId,
        ].forEach((id) =>
          this._shadowRoot
            .getElementById(id)
            .addEventListener("change", this._submit.bind(this))
        );
      }

      _submit(e) {
        e.preventDefault();
        this.dispatchEvent(
          new CustomEvent("propertiesChanged", {
            detail: {
              properties: {
                isValVisible: this.isValVisible,
                isColorfulPointer: this.isColorfulPointer,
                firstZoneColor: this.firstZoneColor,
                secondZoneColor: this.secondZoneColor,
                thirdZoneColor: this.thirdZoneColor,
                css: this.css,
              },
            },
          })
        );
      }
      set isValVisible(newIsValVisible) {
        this._shadowRoot.getElementById("isValVisible").checked =
          newIsValVisible;
      }
      set isColorfulPointer(newIsColorfulPointer) {
        this._shadowRoot.getElementById("isColorfulPointer").checked =
          newIsColorfulPointer;
      }
      set firstZoneColor(newFirstZoneColor) {
        this._shadowRoot.getElementById("firstZoneColor").value =
          newFirstZoneColor;
        this._shadowRoot.getElementById("firstZoneColorValue").value =
          newFirstZoneColor;
      }
      set secondZoneColor(newSecondZoneColor) {
        this._shadowRoot.getElementById("secondZoneColor").value =
          newSecondZoneColor;
        this._shadowRoot.getElementById("secondZoneColorValue").value =
          newSecondZoneColor;
      }
      set thirdZoneColor(newThirdZoneColor) {
        this._shadowRoot.getElementById("thirdZoneColor").value =
          newThirdZoneColor;
        this._shadowRoot.getElementById("thirdZoneColorValue").value =
          newThirdZoneColor;
      }
      get isValVisible() {
        return this._shadowRoot.getElementById("isValVisible").checked;
      }
      get isColorfulPointer() {
        return this._shadowRoot.getElementById("isColorfulPointer").checked;
      }
      get firstZoneColor() {
        return this._shadowRoot.getElementById("firstZoneColorValue").value;
      }
      get secondZoneColor() {
        return this._shadowRoot.getElementById("secondZoneColorValue").value;
      }
      get thirdZoneColor() {
        return this._shadowRoot.getElementById("thirdZoneColorValue").value;
      }
      get css() {
        return this._shadowRoot.getElementById("cssEditor").value;
      }
    }
  );
})();
