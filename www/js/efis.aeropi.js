'use strict';

class Efis {
    constructor(element, settingsMgr, options = {}) {
        this.element = element;
        this.sMgr = settingsMgr;

        this.settings = {
            efisSpeedUnit: 'Km/h',
            efisAltitudeUnit: 'Ft',
            efisQnhUnit: 'Mb',
            efisVisible: true,
        }
        this.sMgr.addDefaultSettings(this.settings);

        this.options = {};
        $.extend(true, this.options, options);
    }

    toggle() {}
    show() {}
    hide() {}

    setSpeedUnit(unit) {
        /*if( unit != 'Km/h' && unit != 'Kt' ) return;
        this.sMgr.set('efisSpeedUnit', unit);*/
    }

    setAltitudeUnit(unit) {
        /*if( unit != 'M' && unit != 'Ft' ) return;
        this.sMgr.set('efisAltitudeUnit', unit);*/
    }

    setQnhUnit(unit) {}
}