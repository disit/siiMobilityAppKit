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
var GpsManager = {

    checkGPS: null,
    timeout: Parameters.timeoutGPS,
    mode: null,
    status: false,
    latitude: null,
    longitude: null,
    heading: null,
    accuracy: null,
    altitude: null,
    speed: null,
    timestamp: null,
    gpsStarted: false,
    watchID: null,

    refresh: function () {
        if (SettingsManager.gpsPosition == "true" && GpsManager.gpsStarted == false) {
            GpsManager.initializePosition();
        } else if (SettingsManager.gpsPosition == "false" && GpsManager.gpsStarted == true) {
            GpsManager.stopWatchingPosition();
            MapManager.removeGpsMarker();
            GpsManager.gpsStarted = false;
        }
    },

    initializePosition: function () {
        if (GpsManager.gpsStarted == false) {
            if (device.platform == "Android" || device.platform == "iOS") {
                if (device.platform == "iOS") {
                    setInterval(function () {
                        CheckGPS.check(function () { GpsManager.status = true }, function () { GpsManager.status = false })
                    }, 20000);
                }
                CheckGPS.check(function () {
                    var options = { timeout: GpsManager.timeout, enableHighAccuracy: true };
                    navigator.geolocation.getCurrentPosition(GpsManager.onSuccessInit, GpsManager.onErrorInit, options);
                },
                    function () {
                        if (GpsManager.checkGPS === null) {
                            MapManager.disableGpsZoom();
                            GpsManager.checkGPS = setInterval(function () {
                                GpsManager.initializePosition();
                            }, GpsManager.timeout);
                        }
                    });
            }
            if (device.platform == "Win32NT" || device.platform == "windows" || device.platform == "Web") {
                navigator.geolocation.getCurrentPosition(GpsManager.onSuccessInit, GpsManager.onErrorInit, {
                    timeout: GpsManager.timeout
                });
            }
        }
    },

    onSuccessInit: function (position) {
        if (GpsManager.checkGPS != null) {
            clearInterval(GpsManager.checkGPS);
        }
        GpsManager.status = true;
        GpsManager.latitude = position.coords.latitude;
        GpsManager.longitude = position.coords.longitude;
        GpsManager.heading = Math.round(position.coords.heading);
        GpsManager.accuracy = position.coords.accuracy;
        GpsManager.timestamp = position.timestamp;
        if (position.coords.altitude != null && position.coords.speed != null) {
            GpsManager.altitude = position.coords.altitude;
            GpsManager.speed = position.coords.speed;
            GpsManager.mode = "gps";
        } else {
            GpsManager.mode = "network";
        }
        GpsManager.watchingPosition();
        GpsManager.gpsStarted = true;
        MapManager.initializeGpsMarker(GpsManager.latitude, GpsManager.longitude);
        if (typeof Notificator != "undefined") {
            Notificator.startNotifySuggestions();
        }
    },

    onErrorInit: function (error) {
        if (GpsManager.checkGPS === null) {
            //navigator.notification.alert(Globalization.alerts.positionWarning.message, function () { }, Globalization.alerts.positionWarning.title);
            if (error.code != 1)
                GpsManager.checkGPS = setInterval(function () {
                    GpsManager.initializePosition();
                }, GpsManager.timeout);
        }
    },

    watchingPosition: function () {
        var options = { timeout: GpsManager.timeout, enableHighAccuracy: true };
        GpsManager.watchID = navigator.geolocation.watchPosition(GpsManager.onSuccessUpdate, GpsManager.onErrorUpdate, options);
    },

    stopWatchingPosition: function () {
        navigator.geolocation.clearWatch(GpsManager.watchID);
        GpsManager.watchID = null;
    },

    onSuccessUpdate: function (position) {
        GpsManager.status = true;
        GpsManager.latitude = position.coords.latitude;
        GpsManager.longitude = position.coords.longitude;
        GpsManager.heading = Math.round(position.coords.heading);
        GpsManager.accuracy = position.coords.accuracy;
        GpsManager.timestamp = position.timestamp;
        if (position.coords.altitude != null && position.coords.speed != null) {
            GpsManager.altitude = position.coords.altitude;
            GpsManager.speed = position.coords.speed;
            GpsManager.mode = "gps";
        } else {
            GpsManager.mode = "network";
        }
        if (GpsManager.heading != null && !isNaN(GpsManager.heading) && CompassManager.isAvailable != true) {
            MapManager.updateRotation(GpsManager.heading, "gps");
        }
        MapManager.updateGpsMarker(GpsManager.latitude, GpsManager.longitude);
    },

    onErrorUpdate: function (error) {
        // Nothing To Do
    },

    currentCoordinates: function () {
        if (GpsManager.latitude != null && GpsManager.longitude != null) {
            return [GpsManager.latitude, GpsManager.longitude];
        }
        return null;
    },

    getDistanceFromLatLonInM: function (lat1, lon1, lat2, lon2) {
        var R = 6371; // Radius of the earth in km
        var dLat = GpsManager.deg2rad(lat2 - lat1); // deg2rad below
        var dLon = GpsManager.deg2rad(lon2 - lon1);
        var a =
            Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(GpsManager.deg2rad(lat1)) * Math.cos(GpsManager.deg2rad(lat2)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
        var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        var d = R * c; // Distance in km
        return d * 1000;
    },

    getDistanceFromGPSInM: function (latitude, longitude) {
        if (GpsManager.latitude != null && GpsManager.longitude != null) {
            var R = 6371; // Radius of the earth in km
            var dLat = GpsManager.deg2rad(GpsManager.latitude - latitude); // deg2rad below
            var dLon = GpsManager.deg2rad(GpsManager.longitude - longitude);
            var a =
                Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                Math.cos(GpsManager.deg2rad(latitude)) * Math.cos(GpsManager.deg2rad(GpsManager.latitude)) *
                Math.sin(dLon / 2) * Math.sin(dLon / 2);
            var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
            var d = R * c; // Distance in km
            return d * 1000;
        } else {
            return null;
        }
    },

    deg2rad: function (deg) {
        return deg * (Math.PI / 180)
    }


};

