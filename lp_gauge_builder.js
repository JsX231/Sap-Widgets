(function () {
  let template = document.createElement("template");
  template.innerHTML = `
    <style>
      #root_builder-props {
        font-size: 0.875rem;
        color: #333;
        margin: 7px;
      }

      .builder_propsGroup {
        margin-bottom: 10px;
        padding-left: 5px;
      }

      .builder_propsGroup h3 {
        font-weight: normal;
      }

      .builder_propsContainer {
        display: flex;
        flex-direction: column;
        margin-bottom: 10px;
      }

      .builder_propsContainer label {
        margin-bottom: 10px;
        margin-top: 5px;
        color: #999;
      }
      #isZoneByPercent {
        display: flex;
        flex-direction: column;
      }
      #isZoneByPercent input {
        margin-left: 0;
      }
      #isZoneByPercent label {
        color: unset;
      }
    </style>
    <div id="root_builder-props">
      <fieldset>
        <legend>Gauge Properties</legend>

        <div class="builder_propsGroup">
          <h3>Measures</h3>
          <div class="builder_propsContainer">
            <label for="minValue">Min Value :</label>
            <input id="minValue" type="number" size="10" />
          </div>
          <div class="builder_propsContainer">
            <label for="maxValue">Max Value :</label>
            <input id="maxValue" type="number" size="10" />
          </div>
          <div class="builder_propsContainer">
            <label for="actualValue">Actual Value :</label>
            <input id="actualValue" type="number" size="10" />
          </div>
        </div>
        <div class="builder_propsGroup">
          <h3>Zones</h3>
          <div class="builder_propsContainer">
            <label for="isZoneByPercent">Gauge Zones Is Set By : </label>
            <div id="isZoneByPercent">
              <label for="byPercent">
                <input
                  id="byPercent"
                  type="radio"
                  value="true"
                  name="zoneGroupRadio"
                  checked
                />Percent
              </label>
              <label for="byValue">
                <input
                  id="byValue"
                  type="radio"
                  value="false"
                  name="zoneGroupRadio"
                />Value
              </label>
            </div>
          </div>
          <div id="zoneByValueSetters" style="display:none">
            <h4>Value Pointers :</h4>
            <div
              class="builder_propsContainer"
              title="From Gauge_Min, To First Point"
            >
              <label for="firstPoint">First Point :</label>
              <input id="firstPoint" type="number" size="10" />
            </div>

            <div
              class="builder_propsContainer"
              title="From First Point, To Second Point. And From Second Point to Gauge_Max"
            >
              <label for="secondPoint">Second Point :</label>
              <input id="secondPoint" type="number" size="10" />
            </div>
          </div>
          <div id="zoneByPercentSetters">
            <h4>Percent Pointers :</h4>
            <div class="builder_propsContainer">
              <label for="firstZone">First Zone :</label>
              <input id="firstZone" type="number" size="10" />
            </div>
            <div class="builder_propsContainer">
              <label for="secondZone">Second Zone :</label>
              <input id="secondZone" type="number" size="10" />
            </div>
            <div class="builder_propsContainer">
              <label for="thirdZone">Third Zone :</label>
              <input id="thirdZone" type="number" size="10" />
            </div>
          </div>
        </div>
        <div class="builder_propsGroup">
          <h3>Ticks</h3>
          <div class="builder_propsContainer">
            <label for="majorTicks">Major Ticks Nbr :</label>
            <input id="majorTicks" type="number" size="10" />
          </div>
          <div class="builder_propsContainer">
            <label for="minorTicks">Minor Ticks Nbr :</label>
            <input id="minorTicks" type="number" size="10" />
          </div>
        </div>
      </fieldset>
    </div>`;

  customElements.define(
    "ph-gauge-builder",
    class LpGaugeBuilderPanel extends HTMLElement {
      _inputsId = [
        "minValue",
        "maxValue",
        "actualValue",
        "firstPoint",
        "secondPoint",
        "firstZone",
        "secondZone",
        "thirdZone",
        "majorTicks",
        "minorTicks",
      ];

      constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._shadowRoot
          .querySelectorAll('input[name="zoneGroupRadio"]')
          .forEach((radioInput) => {
            radioInput.addEventListener("change", (event) => {
              this._changeZoneSettersVisibility();
              this._submit(event);
            });
          });
        this._inputsId.forEach((id) =>
          this._shadowRoot
            .getElementById(id)
            .addEventListener("change", this._submit.bind(this))
        );
      }

      _changeZoneSettersVisibility() {
        if (this._shadowRoot.getElementById("byPercent").checked) {
          this._shadowRoot
            .getElementById("zoneByPercentSetters")
            .style.removeProperty("display");
          this._shadowRoot.getElementById("zoneByValueSetters").style.display =
            "none";
        } else {
          this._shadowRoot
            .getElementById("zoneByValueSetters")
            .style.removeProperty("display");
          this._shadowRoot.getElementById(
            "zoneByPercentSetters"
          ).style.display = "none";
        }
      }

      _submit(e) {
        e.preventDefault();
        this.dispatchEvent(
          new CustomEvent("propertiesChanged", {
            detail: {
              properties: {
                isZoneByPercent: this.isZoneByPercent,
                minValue: this.minValue,
                maxValue: this.maxValue,
                actualValue: this.actualValue,
                firstPoint: this.firstPoint,
                secondPoint: this.secondPoint,
                firstZone: this.firstZone,
                secondZone: this.secondZone,
                thirdZone: this.thirdZone,
                minorTicks: this.minorTicks,
                majorTicks: this.majorTicks,
              },
            },
          })
        );
      }

      _stringToNumber(value) {
        const parsed = parseInt(value);
        if (isNaN(parsed)) {
          return 0;
        }
        return parsed;
      }

      set minorTicks(newMinorTicks) {
        this._shadowRoot.getElementById("minorTicks").value = newMinorTicks;
      }

      get minorTicks() {
        return this._stringToNumber(
          this._shadowRoot.getElementById("minorTicks").value
        );
      }

      set majorTicks(newMajorTicks) {
        this._shadowRoot.getElementById("majorTicks").value = newMajorTicks;
      }

      get majorTicks() {
        return this._stringToNumber(
          this._shadowRoot.getElementById("majorTicks").value
        );
      }

      set minValue(newMinValue) {
        this._shadowRoot.getElementById("minValue").value = newMinValue;
      }

      get minValue() {
        return this._stringToNumber(
          this._shadowRoot.getElementById("minValue").value
        );
      }

      set maxValue(newMaxValue) {
        this._shadowRoot.getElementById("maxValue").value = newMaxValue;
      }

      get maxValue() {
        return this._stringToNumber(
          this._shadowRoot.getElementById("maxValue").value
        );
      }

      set actualValue(newActualValue) {
        this._shadowRoot.getElementById("actualValue").value = newActualValue;
      }

      get actualValue() {
        return this._stringToNumber(
          this._shadowRoot.getElementById("actualValue").value
        );
      }

      set firstPoint(newFirstPoint) {
        this._shadowRoot.getElementById("firstPoint").value = newFirstPoint;
      }

      get firstPoint() {
        return this._stringToNumber(
          this._shadowRoot.getElementById("firstPoint").value
        );
      }

      set secondPoint(newSecondPoint) {
        this._shadowRoot.getElementById("secondPoint").value = newSecondPoint;
      }

      get secondPoint() {
        return this._stringToNumber(
          this._shadowRoot.getElementById("secondPoint").value
        );
      }

      set firstZone(newFirstZone) {
        this._shadowRoot.getElementById("firstZone").value = newFirstZone;
      }

      get firstZone() {
        return this._stringToNumber(
          this._shadowRoot.getElementById("firstZone").value
        );
      }

      set secondZone(newSecondZone) {
        this._shadowRoot.getElementById("secondZone").value = newSecondZone;
      }

      get secondZone() {
        return this._stringToNumber(
          this._shadowRoot.getElementById("secondZone").value
        );
      }

      set thirdZone(newThirdZone) {
        this._shadowRoot.getElementById("thirdZone").value = newThirdZone;
      }

      get thirdZone() {
        return this._stringToNumber(
          this._shadowRoot.getElementById("thirdZone").value
        );
      }

      set isZoneByPercent(newIsZoneByPercent) {
        if (newIsZoneByPercent)
          this._shadowRoot.getElementById("byPercent").checked = true;
        else this._shadowRoot.getElementById("byValue").checked = true;
        this._changeZoneSettersVisibility();
      }

      get isZoneByPercent() {
        return this._shadowRoot.getElementById("byPercent").checked;
      }
    }
  );
})();
