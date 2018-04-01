'use strict';

class EMS {
    constructor(elements, settingsMgr, options = {}) {
        this.svgNS = 'http://www.w3.org/2000/svg';
        this.sMgr = settingsMgr;
        this.settings = {
            emsTemperatureUnit: 'C',
            emsPressureUnit: 'Bar',
            emsAsiUnit: 'Km/h',
        };
        this.sMgr.addDefaultSettings(this.settings);

        this.colors = {
            red: "#CC0000",
            green: "#00B200",
            orange: "#EDB200"
        };

        this.generalGaugeConfig = {
            colorPlate: 'transparent',
            colorNumbers: 'white',
            needle: false,
            tickSide: 'left',
            numberSide: 'left',
            borderOuterWidth: 0,
            borderInnerWidth: 0,
            borderMiddleWidth: 0,
            borderShadowWidth: 0,
            highlightsWidth: 0,
            minorTicks: 0,
            exactTicks: true,
            colorBarProgress: this.colors.green,
            valueBoxStroke: 0,
            valueDec: 0,
            valueInt: 0,
            colorValueBoxBackground: 'transparent',
            barBeginCircle: false,
            fontValueSize: 28,
            colorTitle: 'white',
            colorValueText: 'white',
            fontTitleSize: 36,
            fontUnitsSize: 0,
            fontNumbersSize: 28,
            strokeTicks: false,
            //animationDuration: 800,
            animation: false,
        }

        this.rpmGauge       = this._createRpmGauge(elements.rpm);
        this.cylTempGauge   = this._createCylTempGauge(elements.cylTemp);
        this.oilTempGauge   = this._createOilTempGauge(elements.oilTemp);
        this.oilPressGauge  = this._createOilPressGauge(elements.oilPress);
        
        this.mapGauge       = this._createMapGauge(elements.map);
        this.fuelQtyGauge   = this._createFuelQtyGauge(elements.fuelQty);
        this.fuelFlowGauge  = this._createFuelFlowGauge(elements.fuelFlow);
        this.fuelPressGauge = this._createFuelPressGauge(elements.fuelPress);

        this.ampGauge       = this._createAmpGauge(elements.amp);
        this.voltGauge      = this._createVoltGauge(elements.volt);

        this.rpm       = 0;
        this.cylTemp   = 0;
        this.oilTemp   = 0;
        this.oilPress  = 0;

        this.map       = 0;        
        this.fuelQty   = 0;
        this.fuelFlow  = 0;
        this.fuelPress = 0;

        this.amp       = 0;
        this.volt      = 0;

        this.timers = [];
        //this.animateGauges();
    }

    animateGauges() {
        document.gauges.forEach(gauge => {
            this.timers.push(setInterval(() => {
                var min = gauge.options.minValue;
                var max = gauge.options.maxValue;

                let val = min + Math.random() * (max - min);
                gauge.value = parseInt(val);

            }, 1500));
        });
    }

    _createCylTempGauge(element) {
        let _this = this;

        let config = {
            renderTo: element,
            minValue: 40,
            maxValue: 120,
            value: 0,
            title: 'Cyl. T°'+this.sMgr.get('emsTemperatureUnit'),
            majorTicks: [45, 90, 120],
            minorTicks: 0,
            listeners: {
                value: function(val, oldValue) {
                    if( val > 65 && val < 115 ) {
                        this.options.colorBarProgress = _this.colors.green;
                    } else if( (val > 45 && val <= 65) || (val < 115 && val >= 100) ) {
                        this.options.colorBarProgress = _this.colors.orange;
                    } else if ( val <= 45 ) {
                        this.options.colorBarProgress = 'transparent';
                    }else {
                        this.options.colorBarProgress = _this.colors.red;
                    }
                }
            },
            colorMajorTicks: [this.colors.red, this.colors.green, this.colors.red]
        };
        $.extend(true, config, this.generalGaugeConfig);

        return new LinearGauge(config).draw();
    }

    _createOilTempGauge(element) {
        let _this = this;

        let config = {
            renderTo: element,
            minValue: 40,
            maxValue: 120,
            value: 0,
            title: 'Oil. T°'+this.sMgr.get('emsTemperatureUnit'),
            majorTicks: [45, 90, 120],
            minorTicks: 0,
            listeners: {
                value: function(val, oldValue) {
                    if( val > 65 && val < 115 ) {
                        this.options.colorBarProgress = _this.colors.green;
                    } else if( (val > 45 && val <= 65) || (val < 115 && val >= 100) ) {
                        this.options.colorBarProgress = _this.colors.orange;
                    } else if ( val <= 45 ) {
                        this.options.colorBarProgress = 'transparent';
                    }else {
                        this.options.colorBarProgress = _this.colors.red;
                    }
                }
            },
            colorMajorTicks: [this.colors.red, this.colors.green, this.colors.red]
        };
        $.extend(true, config, this.generalGaugeConfig);

        return new LinearGauge(config).draw();
    }

    _createOilPressGauge(element) {
        let _this = this;

        let config = {
            renderTo: element,
            minValue: 0,
            maxValue: 10,
            value: 0,
            valueDec: 1,
            title: 'Oil. P '+this.sMgr.get('emsPressureUnit'),
            majorTicks: [0, 4, 6, 10],
            minorTicks: 2,
            listeners: {
                value: function(val, oldValue) {
                    if( val > 3.9 && val < 6 ) {
                        this.options.colorBarProgress = _this.colors.green;
                    } else if( (val >= 3 && val <= 3.9) || (val < 6.9 && val >= 6) ) {
                        this.options.colorBarProgress = _this.colors.orange;
                    }else {
                        this.options.colorBarProgress = _this.colors.red;
                    }
                }
            },
            colorMajorTicks: [this.colors.red, this.colors.green, this.colors.green, this.colors.red]
        };
        $.extend(true, config, this.generalGaugeConfig);
        config.valueDec = 1;

        return new LinearGauge(config).draw();
    }

    _createAmpGauge(element) {
        let _this = this;

        let config = {
            renderTo: element,
            minValue: -30,
            maxValue: 30,
            value: 0,
            title: 'Amp',
            majorTicks: [-15, 0, 15],
            minorTicks: 0,
            listeners: {
                value: function(val, oldValue) {
                    if( val > -15 && val < 15 ) {
                        this.options.colorBarProgress = _this.colors.green;
                    }else {
                        this.options.colorBarProgress = _this.colors.red;
                    }
                }
            },
            colorMajorTicks: [this.colors.red, this.colors.green, this.colors.red]
        };
        $.extend(true, config, this.generalGaugeConfig);
        config.valueDec = 1;

        return new LinearGauge(config).draw();
    }

    _createVoltGauge(element) {
       let _this = this;

       let config = {
            renderTo: element,
            minValue: 0,
            maxValue: 15,
            value: 0,
            title: 'Volt',
            majorTicks: [0, 12, 15],
            minorTicks: 0,
            listeners: {
                value: function(val, oldValue) {
                    if( val > 14.5 || val < 10.8 ) {
                        this.options.colorBarProgress = _this.colors.red;
                    }else {
                        this.options.colorBarProgress = _this.colors.green;
                    }
                }
            },
            colorMajorTicks: [this.colors.red, this.colors.green, this.colors.red]
        };
        $.extend(true, config, this.generalGaugeConfig);
        config.valueDec = 1;

        return new LinearGauge(config).draw();
    }

    _createFuelQtyGauge(element) {
        let _this = this;

        let config = {
            renderTo: element,
            minValue: 0,
            maxValue: 70,
            value: 0,
            title: 'F. Qty',
            majorTicks: [0, 8, 35, 70],
            minorTicks: 0,
            listeners: {
                value: function(val, oldValue) {
                    if( val < 8 ) {
                        this.options.colorBarProgress = _this.colors.red;
                    }else {
                        this.options.colorBarProgress = _this.colors.green;
                    }
                }
            },
            colorMajorTicks: [this.colors.red, this.colors.red, this.colors.green, this.colors.green]
        };
        $.extend(true, config, this.generalGaugeConfig);

        return new LinearGauge(config).draw();
    }

    _createFuelFlowGauge(element) {
        let _this = this;

        let config = {
            renderTo: element,
            minValue: 0,
            maxValue: 50,
            value: 0,
            title: 'F. Flow',
            majorTicks: [0, 18, 32, 50],
            listeners: {
                value: function(val, oldValue) {
                    if( val > 32 ) {
                        this.options.colorBarProgress = _this.colors.red;
                    }else {
                        this.options.colorBarProgress = _this.colors.green;
                    }
                }
            },
            colorMajorTicks: [this.colors.green, this.colors.green, this.colors.green, this.colors.red]
        };
        $.extend(true, config, this.generalGaugeConfig);

        return new LinearGauge(config).draw();
    }

    _createFuelPressGauge(element) {
        let _this = this;

        let config = {
            renderTo: element,
            minValue: 0,
            maxValue: 10,
            value: 0,
            title: 'F. Press',
            majorTicks: [0, 4, 6, 10],
            minorTicks: 2,
            listeners: {
                value: function(val, oldValue) {
                    if( val > 3.9 && val < 6 ) {
                        this.options.colorBarProgress = _this.colors.green;
                    } else if( (val >= 3 && val <= 3.9) || (val < 6.9 && val >= 6) ) {
                        this.options.colorBarProgress = _this.colors.orange;
                    }else {
                        this.options.colorBarProgress = _this.colors.red;
                    }
                }
            },
            colorMajorTicks: [this.colors.red, this.colors.green, this.colors.green, this.colors.red]
        };
        $.extend(true, config, this.generalGaugeConfig);

        return new LinearGauge(config).draw();
    }

    _createMapGauge(element) {
        return new RadialGauge({
            renderTo: element,
            colorNumbers: 'black',
            borderOuterWidth: 0,
            borderInnerWidth: 0,
            borderMiddleWidth: 0,
            borderShadowWidth: 0,
            valueBoxStroke: 0,
            valueDec: 1,
            valueInt: 0,
            colorValueBoxBackground: 'transparent',
            fontValueSize: 28,
            colorTitle: 'black',
            fontTitleSize: 46,
            fontUnitsSize: 0,
            title: 'MAP',
            minValue: 0,
            startAngle: 40,
            ticksAngle: 200,
            maxValue: 34,
            majorTicks: [5, 10, 15, 20, 25, 30],
            minorTicks: 1,
            strokeTicks: false,
            highlights: false,
            highlights: [
                //{ from: 20,  to: 25, color: this.colors.green },
            ],
            exactTicks: true,
            borderShadowWidth: 0,
            borders: false,
            needleType: "arrow",
            needleWidth: 2,
            needleCircleSize: 7,
            needleCircleOuter: true,
            needleCircleInner: false,
            animation: false,
        }).draw();
    }

    _createRpmGauge(element) {
        return new RadialGauge({
            renderTo: element,
            colorNumbers: 'black',
            borderOuterWidth: 0,
            borderInnerWidth: 0,
            borderMiddleWidth: 0,
            borderShadowWidth: 0,
            valueBoxStroke: 0,
            valueDec: 0,
            valueInt: 0,
            colorValueBoxBackground: 'transparent',
            fontValueSize: 28,
            colorTitle: 'black',
            fontTitleSize: 46,
            fontUnitsSize: 0,
            title: 'RPM',
            minValue: 0,
            startAngle: 40,
            ticksAngle: 200,
            maxValue: 7000,
            majorTicks: [1000, 2000, 3000, 4000, 5000, 6000],
            minorTicks: 500,
            strokeTicks: false,
            highlights: [
                { from: 0,    to: 1199, color: this.colors.orange },
                { from: 1200, to: 5599, color: this.colors.green  },
                { from: 5600, to: 5999, color: this.colors.orange },
                { from: 6000, to: 7000, color: this.colors.red    },
            ],
            exactTicks: true,
            borderShadowWidth: 0,
            borders: false,
            needleType: "arrow",
            needleWidth: 2,
            needleCircleSize: 7,
            needleCircleOuter: true,
            needleCircleInner: false,
            animation: false,
        }).draw();
    }

    updateSize() {

    }

    setTemperatureUnit(unit) {
        if( unit != 'C' && unit != 'F' ) return;
        this.sMgr.set('emsTemperatureUnit', unit);
        //this.cylTempGauge.destroy();
        //this.oilTempGauge.destroy();
        //this.cylTempGauge = this._createCylTempGauge(this.cylTemp);
        //this.oilTempGauge = this._createOilTempGauge(this.oilTemp);
    }

    setPressureUnit(unit) {
        if( unit != 'Bar' && unit != 'Psi' ) return;
        this.sMgr.set('emsPressureUnit', unit);
        //this.cylTempGauge.destroy();
        //this.oilTempGauge.destroy();
        //this.cylTempGauge = this._createCylTempGauge(this.cylTemp);
        //this.oilTempGauge = this._createOilTempGauge(this.oilTemp);
    }

    setCylTemp(v) {
        this.cylTemp = v;
        this.cylTempGauge.value = this.cylTemp;
    }

    setOilTemp(v) {
        this.oilTemp = v;
        this.oilTempGauge.value = this.oilTemp;
    }

    setOilPress(v) {
        this.oilPress = v;
        this.oilPressGauge.value = this.oilPress;
    }

    setMap(v) {
        this.map = v;
        this.mapGauge.value = this.map;
    }

    setAmp(v) {
        if(v>30)v=30;
        this.amp = v;
        this.ampGauge.value = this.amp;
    }

    setVolt(v) {
        if(v>15)v=15;
        this.volt = v;
        this.voltGauge.value = this.volt;
    }

    setRpm(v) {
        this.rpm = v;
        this.rpmGauge.value = this.rpm;
    }

    setFuelLevel(v) {
        this.fuelQty = v;
        this.fuelQtyGauge.value = this.fuelQty;
    }

    getFuelLevel() {
        return this.fuelQty;
    }

    setFuelFlow(v) {
        this.fuelFlow = v;
        this.fuelFlowGauge.value = this.fuelFlow;
    }
}