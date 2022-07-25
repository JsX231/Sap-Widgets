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
      </fieldset>
    </div>`;

  customElements.define(
    "ph-gauge-builder",
    class LpGaugeBuilderPanel extends HTMLElement {
      constructor() {
        super();
        this._shadowRoot = this.attachShadow({ mode: "open" });
        this._shadowRoot.appendChild(template.content.cloneNode(true));
        this._shadowRoot
          .querySelectorAll('input[name="zoneGroupRadio"]')
          .forEach((radioInput) => {
            radioInput.addEventListener("change", (event) => {
              this._changeZoneSettersVisibility(event.target.value === "true");
              this._submit(event);
            });
          });
      }

      _changeZoneSettersVisibility(inputValue) {
        if (inputValue) {
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
              },
            },
          })
        );
      }

      set isZoneByPercent(newIsZoneByPercent) {
        if (newIsZoneByPercent)
          this._shadowRoot.getElementById("byPercent").checked = true;
        else this._shadowRoot.getElementById("byValue").checked = true;
        this._changeZoneSettersVisibility(newIsZoneByPercent);
      }

      get isZoneByPercent() {
        return (
          this._shadowRoot.querySelector('input[name="zoneGroupRadio"]:checked')
            .value === "true"
        );
      }
    }
  );
})();
