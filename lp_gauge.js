(function () {
  let d3script = document.createElement("script");
  d3script.src = "https://d3js.org/d3.v7.min.js";
  d3script.async = false;
  document.head.appendChild(d3script);

  // create template of widget, without properties
  let template = document.createElement("template");
  template.innerHTML = `
      <div id="root">
      <style>
        #root {
          width:100%;
          height: 100%;
        }
        .gauge {fill:#e5e5e5;stroke-width:0px;font-family:Helvetica} 
        .gauge .outer-circle {fill:#ffffff;stroke:#353535;stroke-width:0.5px}
        .gauge .inner-circle {fill:#ffffff;stroke:#e0e0e0;stroke-width:2px}
        .gauge .minor-ticks {stroke:#e5e5e5;stroke-width:1px}
        .gauge .major-ticks {stroke:#e5e5e5;stroke-width:2px}
        .gauge .pointer {fill:#FFFF00;stroke:#eaeaea;stroke-width:1;fill-opacity 1}
        .gauge .pointer-pin {fill:#FFD700;stroke:#fff;opacity:1}

        .gauge .first-color{ fill: #FF0000}
        .gauge .second-color{ fill: #00B050}
        .gauge .third-color{ fill: #FFFF00}
      </style>
      </div>
    `;

  d3script.onload = () => {
    const _d3 = d3;

    customElements.define(
      "ph-gauge",
      class LpGauge extends HTMLElement {
        _propsAffectOnBands = [
          "firstPoint",
          "secondPoint",
          "firstZone",
          "secondZone",
          "thirdZone",
          "minValue",
          "maxValue",
          "actualValue",
          "isZoneByPercent",
        ];

        _propsAffectOnTicks = [
          "minValue",
          "maxValue",
          "minorTicks",
          "majorTicks",
          "isValVisible",
        ];

        _propsAffectOnPointer = [
          "isColorfulPointer",
          ...this._propsAffectOnBands,
        ];

        //First redraw queue counter:1
        //when the custom widget is added to the canvas or the analytic application is opened.
        constructor() {
          super();
          this._shadowRoot = this.attachShadow({ mode: "open" });
          this._shadowRoot.appendChild(template.content.cloneNode(true));
          this._afterFirstConnection = false;
          this.addEventListener("click", async (event) => {
            this.dispatchEvent(new Event("onClick"));
          });
          this._props = {};
          this._gaugeConfig = {
            transitionDuration: 500,
            pointerColor: "yellow",
          };
        }

        //First redraw queue counter:5
        //called when component rendered for the first time or when it's dragged
        connectedCallback() {
          this._divRootD3 = _d3.select(this._shadowRoot).select("#root");
          this._svgContainer = this._divRootD3
            .append("svg:svg")
            .attr("width", "100%")
            .attr("height", "100%");
          this._initLayout(this.offsetWidth, this.offsetHeight);
          this._redraw(this._props);
          this._afterFirstConnection = true;
        }

        //First redraw queue counter:2
        //After update queue counter:1
        // before the properties of the custom widget are updated.
        onCustomWidgetBeforeUpdate(oChangedProperties) {
          this._props = { ...this._props, ...oChangedProperties };
        }

        //First redraw queue counter:3
        //After update queue counter:2
        //Setters/Getters...

        //First redraw queue counter:4
        //After update queue counter:3
        // after the properties of the custom widget are updated.
        // Set new values(from props) there(this is preferred method either then use setter/getter)
        //TODO: test it later.
        onCustomWidgetAfterUpdate(oChangedProperties) {
          this._processProperties(oChangedProperties);
          if (this._afterFirstConnection) {
            this._redraw(oChangedProperties);
          }
        }

        // implement only if u need it/Yes i need it
        onCustomWidgetResize(width, height) {
          this._initLayout(width, height);
          this._afterFirstConnection = false;
          this._redraw(this._props);
          this._afterFirstConnection = true;
        }

        onCustomWidgetDestroy() {}

        disconnectedCallback() {
          this._divRootD3.selectAll("svg").remove();
        }

        _initLayout(width, height) {
          const padding = {
            top: 10,
            left: 10,
            right: 10,
            bottom: 10,
          };

          const svgContainerWidth = width - padding.left - padding.right;
          const svgContainerHeight = height - padding.top - padding.bottom;
          const svgContainerSize = Math.min(
            svgContainerWidth,
            svgContainerHeight
          );

          this._svgLayoutConfig = {
            width: svgContainerWidth,
            height: svgContainerHeight,
            size: svgContainerSize,
            radius: svgContainerSize / 2,
            centerX: width / 2 - padding.right + padding.left,
            centerY: height / 2 - padding.bottom + padding.top,
            padding,
          };
        }

        _drawBands() {
          this._svgGroup.selectAll(".band").remove();
          for (let index in this._gaugeConfig.redZones) {
            if (
              this._gaugeConfig.actual >=
                this._gaugeConfig.redZones[index].from &&
              this._gaugeConfig.actual < this._gaugeConfig.redZones[index].to
            )
              this._gaugeConfig.pointerColor = this._props.firstZoneColor;
            this._drawBand(
              this._gaugeConfig.redZones[index].from,
              this._gaugeConfig.redZones[index].to,
              this._props.firstZoneColor
            );
          }

          for (let index in this._gaugeConfig.greenZones) {
            if (
              this._gaugeConfig.actual >=
                this._gaugeConfig.greenZones[index].from &&
              this._gaugeConfig.actual < this._gaugeConfig.greenZones[index].to
            )
              this._gaugeConfig.pointerColor = this._props.secondZoneColor;
            this._drawBand(
              this._gaugeConfig.greenZones[index].from,
              this._gaugeConfig.greenZones[index].to,
              this._props.secondZoneColor
            );
          }

          for (let index in this._gaugeConfig.yellowZones) {
            if (
              this._gaugeConfig.actual >=
              this._gaugeConfig.yellowZones[index].from
            )
              this._gaugeConfig.pointerColor = this._props.thirdZoneColor;
            this._drawBand(
              this._gaugeConfig.yellowZones[index].from,
              this._gaugeConfig.yellowZones[index].to,
              this._props.thirdZoneColor
            );
          }
        }

        _drawTicks() {
          this._svgGroup
            .selectAll(".minor-ticks,.major-ticks,.tick-value")
            .remove();
          const valueFontSize = Math.round(this._svgLayoutConfig.size / 16);
          const majorDelta =
            parseInt(
              (
                this._gaugeConfig.range /
                (this._gaugeConfig.majorTicks - 1)
              ).toFixed()
            ) || 1;
          for (
            let major = this._gaugeConfig.min;
            major < this._gaugeConfig.max + majorDelta;
            major += majorDelta
          ) {
            if (major > this._gaugeConfig.max) major = this._gaugeConfig.max;
            const minorDelta = majorDelta / this._gaugeConfig.minorTicks;
            for (
              let minor = major + minorDelta;
              minor < Math.min(major + majorDelta, this._gaugeConfig.max);
              minor += minorDelta
            ) {
              const point1 = this._valueToPoint(minor, 0.75);
              const point2 = this._valueToPoint(minor, 0.85);

              this._svgGroup
                .append("svg:line")
                .attr("x1", point1.x)
                .attr("y1", point1.y)
                .attr("x2", point2.x)
                .attr("y2", point2.y)
                .attr("class", "minor-ticks");
            }
            const point1 = this._valueToPoint(major, 0.7);
            const point2 = this._valueToPoint(major, 0.85);

            this._svgGroup
              .append("svg:line")
              .attr("x1", point1.x)
              .attr("y1", point1.y)
              .attr("x2", point2.x)
              .attr("y2", point2.y)
              .attr("class", "major-ticks");
            if (
              this._props.isValVisible &&
              (major === this._gaugeConfig.min ||
                major === this._gaugeConfig.max)
            ) {
              const point = this._valueToPoint(major, 0.63);

              this._svgGroup
                .append("svg:text")
                .attr("x", point.x)
                .attr("class", "tick-value")
                .attr("y", point.y)
                .attr("dy", valueFontSize / 3)
                .attr(
                  "text-anchor",
                  major === this._gaugeConfig.min ? "start" : "end"
                )
                .text(major)
                .style("font-size", valueFontSize + "px");
            }
          }
        }

        _drawPointer() {
          this._svgGroup.select(".pro_viz_ext_gauge_pointerContainer").remove();

          const pointerContainer = this._svgGroup
            .append("svg:g")
            .attr("class", "pro_viz_ext_gauge_pointerContainer");

          const midValue = (this._gaugeConfig.min + this._gaugeConfig.max) / 2;

          const pointerPath = this._buildPointerPath(midValue);

          const pointerLine = _d3
            .line()
            .x((d) => d.x)
            .y((d) => d.y)
            .curve(_d3.curveBasis);

          const pointer = pointerContainer
            .selectAll("path")
            .data([pointerPath])
            .enter()
            .append("svg:path")
            .attr("d", pointerLine)
            .attr("class", "pointer");

          if (this._props.isColorfulPointer)
            pointer.style("fill", this._gaugeConfig.pointerColor);

          pointerContainer
            .append("svg:circle")
            .attr("cx", this._svgLayoutConfig.centerX)
            .attr("cy", this._svgLayoutConfig.centerY)
            .attr("r", 0.12 * this._svgLayoutConfig.radius)
            .attr("class", "pointer-pin");

          const valueFontSize = Math.round(this._svgLayoutConfig.size / 10);
          pointerContainer
            .selectAll("text")
            .data([midValue])
            .enter()
            .append("svg:text")
            .attr("x", this._svgLayoutConfig.centerX)
            .attr("y", this._svgLayoutConfig.centerY + valueFontSize * 3)
            .attr("dy", valueFontSize / 2)
            .attr("text-anchor", "middle")
            .style("font-size", valueFontSize + "px");

          this._redrawPointer(this._gaugeConfig.min);
          setTimeout(
            () => this._redrawPointer(this._gaugeConfig.actual, 3000),
            1000
          );
        }

        _redrawPointer(value, transitionDuration) {
          const pointerContainer = this._svgGroup.select(
            ".pro_viz_ext_gauge_pointerContainer"
          );
          if (this._props.isValVisible)
            pointerContainer
              .selectAll("text")
              .transition()
              .duration(transitionDuration)
              .ease(_d3.easeLinear)
              .tween("text", function () {
                const i = _d3.interpolate(this.textContent, value);
                return function (t) {
                  this.textContent = Math.round(i(t));
                };
              });

          const pointer = pointerContainer.selectAll("path");
          pointer
            .transition()
            .duration(
              undefined !== transitionDuration
                ? transitionDuration
                : this._gaugeConfig.transitionDuration
            )
            //			.delay(0)
            //			.ease("linear")
            //			.attr("transform", function(d)
            .attrTween("transform", () => {
              let pointerValue = value;
              if (value > this._gaugeConfig.max) {
                pointerValue =
                  this._gaugeConfig.max + 0.02 * this._gaugeConfig.range;
              } else if (value < this._gaugeConfig.min) {
                pointerValue =
                  this._gaugeConfig.min - 0.02 * this._gaugeConfig.range;
              }
              const targetRotation = this._valueToDegrees(pointerValue) - 90;
              const currentRotation =
                this._gaugeConfig.currentRotation || targetRotation;
              this._gaugeConfig.currentRotation = targetRotation;

              return (step) => {
                const rotation =
                  currentRotation + (targetRotation - currentRotation) * step;
                return (
                  "translate(" +
                  this._svgLayoutConfig.centerX +
                  ", " +
                  this._svgLayoutConfig.centerY +
                  ") rotate(" +
                  rotation +
                  ")"
                );
              };
            });
        }

        _checkAttributesInObj(attributes, targetObj) {
          return attributes.some((item) => item in targetObj);
        }

        _redraw(updatedProps) {
          if (updatedProps === this._props) {
            this._svgContainer.selectAll("g").remove();

            this._svgGroup = this._svgContainer
              .append("g")
              .attr("class", "gauge");

            this._svgGroup
              .append("svg:circle")
              .attr("cx", this._svgLayoutConfig.centerX)
              .attr("cy", this._svgLayoutConfig.centerY)
              .attr("r", this._svgLayoutConfig.radius)
              .attr("class", "outer-circle");

            this._svgGroup
              .append("svg:circle")
              .attr("cx", this._svgLayoutConfig.centerX)
              .attr("cy", this._svgLayoutConfig.centerY)
              .attr("r", 0.9 * this._svgLayoutConfig.radius)
              .attr("class", "inner-circle");
          }

          // Label draw
          if (
            this._checkAttributesInObj(["title", "isValVisible"], updatedProps)
          ) {
            this._svgGroup.select(".label").remove();
            if (this._props["isValVisible"]) {
              const fontSize = Math.round(this._svgLayoutConfig.size / 10.5);
              this._svgGroup
                .append("svg:text")
                .attr("x", this._svgLayoutConfig.centerX)
                .attr("y", this._svgLayoutConfig.centerY - fontSize * 2)
                .attr("dy", fontSize / 2)
                .attr("text-anchor", "middle")
                .attr("class", "label")
                .text(this._gaugeConfig.label)
                .style("font-size", fontSize + "px");
            }
          }

          if (
            this._checkAttributesInObj(this._propsAffectOnBands, updatedProps)
          ) {
            this._drawBands();
          }

          if (
            this._checkAttributesInObj(this._propsAffectOnTicks, updatedProps)
          ) {
            this._drawTicks();
          }

          if (
            this._checkAttributesInObj(this._propsAffectOnPointer, updatedProps)
          ) {
            if (this._afterFirstConnection)
              this._redrawPointer(this._gaugeConfig.actual, 1000);
            else this._drawPointer();
          }
        }

        _buildPointerPath(value) {
          const delta = this._gaugeConfig.range / 13;

          const pointerValueToPoint = (value, factor) => {
            const point = this._valueToPoint(value, factor);
            point.x -= this._svgLayoutConfig.centerX;
            point.y -= this._svgLayoutConfig.centerY;
            return point;
          };

          const head = pointerValueToPoint(value, 0.85);
          const head1 = pointerValueToPoint(value - delta, 0.12);
          const head2 = pointerValueToPoint(value + delta, 0.12);

          const tailValue =
            value - (this._gaugeConfig.range * (1 / (270 / 360))) / 2;
          const tail = pointerValueToPoint(tailValue, 0.28);
          const tail1 = pointerValueToPoint(tailValue - delta, 0.12);
          const tail2 = pointerValueToPoint(tailValue + delta, 0.12);
          return [head, head1, tail2, tail, tail1, head2, head];
        }

        _drawBand(start, end, color) {
          if (0 >= end - start) {
            return;
          }

          this._svgGroup
            .append("svg:path")
            .attr("class", "band")
            .style("fill", color)
            .attr(
              "d",
              _d3
                .arc()
                .innerRadius(0.65 * this._svgLayoutConfig.radius)
                .outerRadius(0.85 * this._svgLayoutConfig.radius)
                .startAngle(this._valueToRadians(start))
                .endAngle(this._valueToRadians(end))
            )
            .attr(
              "transform",
              () =>
                `translate(${this._svgLayoutConfig.centerX},${this._svgLayoutConfig.centerY}) rotate(270)`
            );
        }

        _valueToDegrees(value) {
          return (
            (value / this._gaugeConfig.range) * 270 -
            ((this._gaugeConfig.min / this._gaugeConfig.range) * 270 + 45)
          );
        }

        _valueToRadians(value) {
          return (this._valueToDegrees(value) * Math.PI) / 180;
        }

        _valueToPoint(value, factor) {
          return {
            x:
              this._svgLayoutConfig.centerX -
              this._svgLayoutConfig.radius *
                factor *
                Math.cos(this._valueToRadians(value)),
            y:
              this._svgLayoutConfig.centerY -
              this._svgLayoutConfig.radius *
                factor *
                Math.sin(this._valueToRadians(value)),
          };
        }

        _processProperties(props) {
          if ("minValue" in props) {
            const gaugeMin = props["minValue"];
            this._gaugeConfig.min = parseInt(gaugeMin.toFixed());
            if (this._gaugeConfig.max)
              this._gaugeConfig.range =
                this._gaugeConfig.max - this._gaugeConfig.min;
          }
          if ("maxValue" in props) {
            let gaugeMax = props["maxValue"];
            if (gaugeMax < +this._gaugeConfig.min) {
              gaugeMax = this._gaugeConfig.min + 1;
            }
            this._gaugeConfig.max = parseInt(gaugeMax.toFixed());
            this._gaugeConfig.range =
              this._gaugeConfig.max - this._gaugeConfig.min;
          }
          if ("actualValue" in props) {
            const gaugeActual = props["actualValue"];
            this._gaugeConfig.actual = parseInt(gaugeActual.toFixed());
          }

          if ("title" in props && props["title"].length)
            this._gaugeConfig.label = props["title"];
          if ("majorTicks" in props) {
            let majorTicks = props["majorTicks"];
            if (majorTicks < 2) majorTicks = 2;
            this._gaugeConfig.majorTicks = majorTicks;
          }
          if ("minorTicks" in props)
            this._gaugeConfig.minorTicks = props["minorTicks"];

          this._setGaugeZones();
        }

        _setGaugeZones() {
          if (this._props.isZoneByPercent) {
            const redColorPercent = this._props.firstZone / 100;
            const greenColorPercent = this._props.secondZone / 100;
            const yellowColorPercent = this._props.thirdZone / 100;

            this._gaugeConfig.redZones = [
              {
                from: this._gaugeConfig.min,
                to:
                  this._gaugeConfig.min +
                  this._gaugeConfig.range * redColorPercent, //redColorPercent
              },
            ];

            this._gaugeConfig.greenZones = [
              {
                from:
                  this._gaugeConfig.min +
                  this._gaugeConfig.range * redColorPercent, //redColorPercent
                to:
                  this._gaugeConfig.min +
                  this._gaugeConfig.range *
                    (redColorPercent + greenColorPercent), //greenColorPercent + redColorPercent
              },
            ];

            this._gaugeConfig.yellowZones = [
              {
                from:
                  this._gaugeConfig.min +
                  this._gaugeConfig.range *
                    (redColorPercent + greenColorPercent), //greenColorPercent + redColorPercent
                to:
                  this._gaugeConfig.max *
                  (redColorPercent + greenColorPercent + yellowColorPercent), //redColorPercent + greenColorPercent + yellowColorPercent
              },
            ];
          } else {
            this._gaugeConfig.redZones = [
              {
                from: this._gaugeConfig.min,
                to: this._props.firstPoint,
              },
            ];

            this._gaugeConfig.greenZones = [
              {
                from: this._props.firstPoint,
                to: this._props.secondPoint,
              },
            ];

            this._gaugeConfig.yellowZones = [
              {
                from: this._props.secondPoint,
                to: this._gaugeConfig.max,
              },
            ];
          }
        }
      }
    );
  };
})();
