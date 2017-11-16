/* SII-MOBILITY DEV KIT MOBILE APP KM4CITY.
   Copyright (C) 2016 DISIT Lab http://www.disit.org/6981 - University of Florence
   This program is free software; you can redistribute it and/or
   modify it under the terms of the GNU Affero General Public License
   as published by the Free Software Foundation.
   The interactive user interfaces in modified source and object code versions 
   of this program must display Appropriate Legal Notices, as required under 
   Section 5 of the GNU Affero GPL . In accordance with Section 7(b) of the 
   GNU Affero GPL , these Appropriate Legal Notices must retain the display 
   of the "Sii-Mobility Dev Kit Mobile App Km4City" logo. The Logo "Sii-Mobility
  Dev Kit Mobile App Km4City" must be a clickable link that leads directly to the
  Internet URL http://www.sii-mobility.org oppure a DISIT Lab., using 
  technology derived from  Http://www.km4city.org.
   This program is distributed in the hope that it will be useful,
   but WITHOUT ANY WARRANTY; without even the implied warranty of
   MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
   GNU General Public License for more details.
   You should have received a copy of the GNU Affero General Public License
   along with this program; if not, write to the Free Software
   Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA. 
*/
var CompassManager = {

    checkCompass: null,
    watchID: null,
    isAvailable: false,
    timeout: 8000,
    heading: null,
    compassStarted: false,

    initializeHeading: function () {
        if (typeof navigator.compass != "undefined") {
            navigator.compass.getCurrentHeading(CompassManager.onSuccessInit, CompassManager.onErrorInit);
        }
    },

    onSuccessInit: function (heading) {
        if (CompassManager.checkCompass != null) {
            clearInterval(CompassManager.checkCompass);
        }
        CompassManager.heading = Math.round(heading.magneticHeading);
        CompassManager.watchingCompass();
        MapManager.updateRotation(CompassManager.heading);
        CompassManager.compassStarted = true;
    },

    onErrorInit: function (error) {
        if (CompassManager.checkCompass === null && error.code != 3 && error.code != 20) {
            CompassManager.checkCompass = setInterval(function () {
                CompassManager.initializeHeading();
            }, CompassManager.timeout);
        }
    },

    watchingCompass: function () {
        CompassManager.watchID = navigator.compass.watchHeading(CompassManager.onSuccessUpdate, CompassManager.onErrorUpdate);
    },

    onSuccessUpdate: function (heading) {
        var newHeading = Math.round(heading.magneticHeading);
        if (Math.abs(newHeading - CompassManager.heading) > 6) {
            CompassManager.heading = newHeading;
            if (CompassManager.heading != 0 && CompassManager.heading != null && !isNaN(CompassManager.heading)) {
                CompassManager.isAvailable = true;
                MapManager.updateRotation(CompassManager.heading);
            }
        }
    },

    onErrorUpdate: function (error) {
        // Nothing To Do
    },

    stopWatchingCompass: function () {
        if (typeof navigator.compass != "undefined") {
            navigator.compass.clearWatch(CompassManager.watchID);
        }
    },

    currentHeading: function () {
        if (CompassManager.heading != null) {
            return CompassManager.heading;
        }
        return null;
    }
};
