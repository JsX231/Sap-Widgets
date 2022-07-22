(function () {
  let template = document.createElement("template");
  template.innerHTML = `
    <style>
       h3 { font-weight:normal; }
    .propsContainer{
        margin-bottom: 10px;
        color: #333;
    }

    .inputContainer{
        display: flex;
        align-items: center;
        margin-top: 7px;
    }

    .inputContainer input {
        margin-right: 5px;
    }

    .propsContainer input[type="color"] {
        border: none;
        width: 42px;
        margin: 0;
    }
    </style>
    <div id="root_props">
    <h3>Visibility</h3>
    <div class="propsContainer">
        <input type="checkbox" id="isValVisible">
        <label for="isValVisible">Show values and title</label>
    </div>
    <div class="propsContainer">
        <input type="checkbox" id="isColorfulPointer">
        <label for="isColorfulPointer">Colorful pointer</label>
    </div>
    <h3>Zones color <small>(from left to right)</small>
    </h3>
    <div class="propsContainer">
        <label>First zone color</label>
        <div class="inputContainer">
        <input id="firstZoneColorValue" type="text" size="10" />
        <input id="firstZoneColor" type="color" />
        </div>
    </div>
    <div class="propsContainer">
        <label>Second zone color</label>
        <div class="inputContainer">
        <input id="secondZoneColorValue" type="text" size="10" />
        <input id="secondZoneColor" type="color" />
        </div>
    </div>
    <div class="propsContainer">
        <label>Third zone color</label>
        <div class="inputContainer">
        <input id="thirdZoneColorValue" type="text" size="10" />
        <input id="thirdZoneColor" type="color" />
        </div>
    </div>`;

  customElements.define(
    "ph-gauge-styling",
    class LpGaugeStylingPanel extends HTMLElement {
      constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
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
              event.preventDefault();
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
        console.log("ChangeTo:", newThirdZoneColor);
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
        return this._shadowRoot.getElementById("firstZoneColor").value;
      }
      get secondZoneColor() {
        return this._shadowRoot.getElementById("secondZoneColor").value;
      }
      get thirdZoneColor() {
        return this._shadowRoot.getElementById("thirdZoneColor").value;
      }

      //   set color(newColor) {
      //     this._shadowRoot.getElementById("styling_color").value = newColor;
      //   }

      //   get color() {
      //     return this._shadowRoot.getElementById("styling_color").value;
      //   }
    }
  );
})();