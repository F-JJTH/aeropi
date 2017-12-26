'use strict';

class EMS {
    constructor(element, settingsMgr, options = {}) {

        this.sMgr = settingsMgr;
        this.settings = {
            emsTemperatureUnit: 'C',
            emsAsiUnit: 'Km/h',
        };
        this.sMgr.addDefaultSettings(this.settings);

        this.colors = {
            red: "#CC0000",
            green: "#00B200",
            orange: "#EDB200"
        }

        this.defaultGaugeConfig = {
            titleFontColor: '#CCCCCC',
            valueFontColor: '#CCCCCC',
            levelColorsGradient: true,
            gaugeWidthScale: 0.6,
            pointer: true,
            pointerOptions: {
                toplength: 5,
                bottomlength: 8,
                bottomwidth: 2,
                color: '#444444',
                stroke: '#FFFFFF',
                stroke_width: 1,
                stroke_linecap: 'round'
            },
            relativeGaugeSize: true,
        }

        this.cylTempGauge  = this._createCylTempGauge();
        this.oilTempGauge  = this._createOilTempGauge();
        this.oilPressGauge = this._createOilPressGauge();
        this.mapGauge      = this._createMapGauge();
        this.ampGauge      = this._createAmpGauge();
        this.voltGauge     = this._createVoltGauge();
        this.rpmGauge      = this._createRpmGauge();
        this.asiGauge      = this._createAsiGauge();
        this.hdgGauge      = this._createHdgGauge();

        this.cylTemp  = 0;
        this.oilTemp  = 0;
        this.oilPress = 0;
        this.map      = 0;
        this.amp      = 0;
        this.volt     = 0;
        this.rpm      = 0;
        this.asi      = 0;
        this.hdg      = 0;
    }

    _createCylTempGauge(v = 0) {
        return new JustGage({
            id: 'cylTempGauge',
            value: v,
            min: 0,
            max: 150,
            title: 'CHT',
            label: '°'+this.sMgr.get('emsTemperatureUnit'),
            textRenderer: value => {
                let rValue = value;
                if(this.sMgr.get('emsTemperatureUnit') == 'F') {
                    rValue = 1.8*rValue + 32;
                }
                return Math.round(rValue);
            },
            customSectors: {
                ranges: [
                    {color: this.colors.red,    lo: 0,   hi: 45 },
                    {color: this.colors.orange, lo: 45,  hi: 65 },
                    {color: this.colors.green,  lo: 65,  hi: 100},
                    {color: this.colors.orange, lo: 101, hi: 115},
                    {color: this.colors.red,    lo: 115, hi: 150}
                ]
            },
            defaults: this.defaultGaugeConfig,
        });
    }

    _createOilTempGauge(v = 0) {
        return new JustGage({
            id: 'oilTempGauge',
            value: v,
            min: 0,
            max: 150,
            title: 'Oil Temp',
            label: '°'+this.sMgr.get('emsTemperatureUnit'),
            textRenderer: value => {
                let rValue = value;
                if(this.sMgr.get('emsTemperatureUnit') == 'F') {
                    rValue = 1.8*rValue + 32;
                }
                return Math.round(rValue);
            },
            customSectors: {
                ranges: [
                    {color: this.colors.red,    lo: 0,   hi: 45 },
                    {color: this.colors.orange, lo: 45,  hi: 65 },
                    {color: this.colors.green,  lo: 65,  hi: 100},
                    {color: this.colors.orange, lo: 101, hi: 115},
                    {color: this.colors.red,    lo: 115, hi: 150}
                ]
            },
            defaults: this.defaultGaugeConfig,
        });
    }

    _createOilPressGauge() {
        return new JustGage({
            id: 'oilPressGauge',
            value: 5,
            min: 0,
            max: 10,
            title: 'Oil Press',
            label: 'PSI',
            customSectors: {
                ranges: [
                    {color: this.colors.red,    lo: 0,   hi: 3  },
                    {color: this.colors.orange, lo: 3,   hi: 3.9},
                    {color: this.colors.green,  lo: 3.9, hi: 6  },
                    {color: this.colors.orange, lo: 6,   hi: 6.9},
                    {color: this.colors.red,    lo: 6.9, hi: 10 }
                ]
            },
            decimals: 1,
            defaults: this.defaultGaugeConfig,
        });
    }

    _createMapGauge() {
        return new JustGage({
            id: 'mapGauge',
            value: 25.4,
            min: 0,
            max: 32,
            title: 'MAP',
            label: 'inHg',
            customSectors: {
                ranges: [{color: this.colors.green, lo: 0, hi: 32}]
            },
            decimals: 1,
            defaults: this.defaultGaugeConfig,
        });
    }

    _createAmpGauge() {
        return new JustGage({
            id: 'ampGauge',
            value: 8,
            min: -30,
            max: 30,
            title: 'Amp meter',
            label: 'A',
            customSectors: {
                ranges: [
                    {color: this.colors.red,   lo: -30, hi: -14.9},
                    {color: this.colors.green, lo: -15, hi:  15.0},
                    {color: this.colors.red,   lo:  15, hi:  30.0}
                ]
            },
            decimals: 1,
            defaults: this.defaultGaugeConfig,
        });
    }

    _createVoltGauge() {
        return new JustGage({
            id: 'voltGauge',
            value: 12.6,
            min: 0,
            max: 15,
            title: 'Volt',
            label: 'V',
            customSectors: {
                ranges: [
                    {color: this.colors.red,   lo: 0,    hi: 10.8},
                    {color: this.colors.green, lo: 10.8, hi: 14.5},
                    {color: this.colors.red,   lo: 14.5, hi: 15.0}
                ]
            },
            decimals: 1,
            defaults: this.defaultGaugeConfig,
        });
    }

    _createRpmGauge() {
        return new JustGage({
            id: 'rpmGauge',
            value: 3450,
            min: 0,
            max: 8000,
            title: 'RPM',
            label: 'tr/min',
            customSectors: {
                ranges: [
                    {color: this.colors.green,  lo: 0,    hi: 5599},
                    {color: this.colors.orange, lo: 5599, hi: 5800},
                    {color: this.colors.red,    lo: 6000, hi: 8000}
                ]
            },
            defaults: this.defaultGaugeConfig,
        });
    }

    _createAsiGauge(v = 0) {
        return new JustGage({
            id: 'asiGauge',
            value: v,
            min: 0,
            max: 270,
            donut: true,
            title: 'ASI',
            label: this.sMgr.get('emsAsiUnit'),
            textRenderer: value => {
                let rValue = value;
                if(this.sMgr.get('emsAsiUnit') == 'Kt') {
                    rValue = rValue*0.539957;
                }
                return Math.round(rValue);
            },
            gaugeWidthScale: 0.4,
            defaults: this.defaultGaugeConfig,
        });
    }

    _createHdgGauge() {
        return new JustGage({
            id: 'hdgGauge',
            value: 75,
            min: 0,
            max: 360,
            donut: true,
            title: 'Heading',
            label: 'deg',
            gaugeWidthScale: 0.4,
            pointer: true,
            pointerOptions: {
                toplength: 5,
                bottomlength: 8,
                bottomwidth: 6,
                color: '#8e8e93',
                stroke: '#ffffff',
                stroke_width: 2,
                stroke_linecap: 'round'
            },
            levelColors: ['#FFFFFF', '#FFFFFF'],
            titleFontColor: '#CCCCCC',
            valueFontColor: '#CCCCCC',
            levelColorsGradient: true,
            gaugeWidthScale: 0.6,
            relativeGaugeSize: true,
        });
    }

    setTemperatureUnit(unit) {
        /*if( unit != 'C' && unit != 'F' ) return;
        this.sMgr.set('emsTemperatureUnit', unit);*/
        this.cylTempGauge.destroy();
        this.oilTempGauge.destroy();
        this.cylTempGauge = this._createCylTempGauge(this.cylTemp);
        this.oilTempGauge = this._createOilTempGauge(this.oilTemp);
    }

    setAsiUnit(unit) {
        if( unit != 'Km/h' && unit != 'Kt' ) return;
        this.sMgr.set('emsAsiUnit', unit);
        this.asiGauge.destroy();
        this.asiGauge = this._createAsiGauge(this.asi);
    }

    setCylTemp(v) {
        this.cylTemp = v;
        this.cylTempGauge.refresh(this.cylTemp);
    }

    setOilTemp(v) {
        this.oilTemp = v;
        this.oilTempGauge.refresh(this.oilTemp);
    }

    setOilPress(v) {
        this.oilPress = v;
        this.oilPressGauge.refresh(this.oilPress);
    }

    setMap(v) {
        this.map = v;
        this.mapGauge.refresh(this.map);
    }

    setAmp(v) {
        this.amp = v;
        this.ampGauge.refresh(this.amp);
    }

    setVolt(v) {
        this.volt = v;
        this.voltGauge.refresh(this.volt);
    }

    setRpm(v) {
        this.rpm = v;
        this.rpmGauge.refresh(this.rpm);
    }

    setAsi(v) {
        this.asi = v;
        this.asiGauge.refresh(this.asi);
    }

    setHdg(v) {
        this.hdg = v;
        this.hdgGauge.refresh(this.hdg);
    }
}
