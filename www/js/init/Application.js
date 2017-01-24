/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
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
var application = {

    appID: "smak-x",
    version: "0.0.1",
    uid: null,
    uid2: null,
    menuToCheckArray: [],
    remoteJsonUrl: "http://www.disit.org/km4city/appdevkit/",

    initialize: function () {
        application.bindEvents();
    },

    bindEvents: function () {
        document.addEventListener('deviceready', application.onDeviceReady, false);
        document.addEventListener("pause", application.onPause, false);
        document.addEventListener("resume", application.onResume, false);
        document.addEventListener('backbutton', application.onBackKeyDown, false);
        window.addEventListener('resize', application.onResize, false);
    },

    checkConnection: function () {
        var networkState = navigator.connection.type;
        if (networkState == Connection.NONE) {
            return false;
        }
        return true;
    },

    onDeviceReady: function () {
        application.receivedEvent('deviceready');
        if (device.platform == "Android") {
            var loadAllTimeout = 5500;
        } else {
            loadAllTimeout = 0;
        }

        setTimeout(function () {
            Utility.loadFilesInsideDirectory("www/js/lib/", "js", null, true, Utility.loadJS).then(function (e) {
                Utility.loadFilesInsideDirectory("www/js/core/", "js", null, true, Utility.loadJS).then(function (e) {
                    Utility.loadFilesInsideDirectory("www/js/modules/", "js", null, true, Utility.loadJS).then(function (e) {
                        if (localStorage.getItem("acceptInformation") === null || (localStorage.getItem("profile") == "all" && localStorage.getItem("appVersion") != application.version)) {
                            ChooseLanguage.show();
                            $("#splashScreenVideoContainer").remove();
                            screen.unlockOrientation();
                        } else {
                            application.startingApp();
                        }

                        cordova.getAppVersion.getVersionNumber().then(function (version) {
                            application.version = version;
                        });

                        cordova.getAppVersion.getAppName().then(function (appName) {
                            application.appID = appName.substring(0, 1).toLowerCase() + "dck-" + device.platform.substring(0, 1).toLowerCase();
                        });
                        application.uid = forge_sha256(device.uuid);
                        if (typeof window.MacAddress != "undefined") {
                            window.MacAddress.getMacAddress(
                                function (macAddress) {
                                    application.uid2 = hex_md5(macAddress.toLowerCase().replace(/:/g, "")).substring(0, 24);
                                    application.uid2 = XXH.h64(application.uid2, 0).toString(16);
                                },
                                function (fail) { }
                            );
                        }
                    })
                })
            });
        }, loadAllTimeout);


    },

    startingApp: function () {
        SettingsManager.initializeSettings();
        PrincipalMenu.show();
        screen.unlockOrientation();
        if (!application.checkConnection()) {
            navigator.notification.alert(Globalization.alerts.connectionError.message, function () { }, Globalization.alerts.connectionError.title);
        }

        MapManager.createMap();
        $.ajax({
            url: "js/Cesium/Cesium.js",
            dataType: "script",
            success: function () {
                CESIUM_BASE_URL = "js/Cesium";
            }
        });
        if (device.platform == "Win32NT" || device.platform == "windows") {
            application.resetBackButtonListener();
        }

    },

    resetInterface: function(){
        for (var i = application.menuToCheckArray.length - 1; i >= 0; i--) {
            if (window[application.menuToCheckArray[i]] != null) {
                if (window[application.menuToCheckArray[i]]["closeAll"] != null) {
                    window[application.menuToCheckArray[i]]["closeAll"]();
                }
            }
        }
    },

    onResize: function () {
        for (var i = 0; i < application.menuToCheckArray.length; i++) {
            if (window[application.menuToCheckArray[i]] != null) {
                if (window[application.menuToCheckArray[i]]["refreshMenuPosition"] != null) {
                    window[application.menuToCheckArray[i]]["refreshMenuPosition"]();
                }
            }
        }
    },

    onBackKeyDown: function (event) {

        if (device.platform == "Android" || device.platform == "iOS") {
            if (PrincipalMenu.open && !ChooseLanguage.open && !ChooseProfile.open) {
                if (PrincipalMenu.modifing) {
                    PrincipalMenu.savePrincipalMenu();
                } else {
                    PrincipalMenu.resetEventsBadge();
                    application.close();
                }
            }
        }

        if (application.menuToCheckArray.length == 0) {
            PrincipalMenu.show();
            if (PrincipalMenu.modifing) {
                PrincipalMenu.savePrincipalMenu();
            } else {
                application.resetBackButtonListener();
            }
        } else {
            if (window[application.menuToCheckArray[0]] != null) {
                if (window[application.menuToCheckArray[0]]["checkForBackButton"] != null) {
                    window[application.menuToCheckArray[0]]["checkForBackButton"]();
                }
            }
        }

        if (application.menuToCheckArray.length == 0) {
            if (!PrincipalMenu.open && device.platform != "Web") {
                window.plugins.toast.showWithOptions({
                    message: Globalization.labels.principalMenu.returnMenu,
                    duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself. 
                    position: "bottom",
                    addPixelsY: -40 // added a negative value to move it up a bit (default 0) 
                },
                    function () { }, // optional
                    function () { } // optional 
                );
            }
        }
    },

    onPause: function (event) {
        if (typeof GpsManager != "undefined") {
            GpsManager.stopWatchingPosition();
        }
    },

    onResume: function (event) {
        if (typeof GpsManager != "undefined") {
            GpsManager.watchingPosition();
        }
    },

    close: function () {
        navigator.Backbutton.goHome(function () { }, function () { });
    },

    setBackButtonListener: function () {
        if (device.platform == "Win32NT" || device.platform == "windows") {
            document.addEventListener('backbutton', application.onBackKeyDown, false);
        }
    },

    resetBackButtonListener: function () {
        if (device.platform == "Win32NT" || device.platform == "windows") {
            document.removeEventListener('backbutton', application.onBackKeyDown, false);
        }
    },

    addingMenuToCheck: function(menuToCheck){
        application.menuToCheckArray.unshift(menuToCheck);
    },

    removingMenuToCheck: function (menuToCheck) {
        var index = application.menuToCheckArray.indexOf(menuToCheck);
        if (index != -1) {
            application.menuToCheckArray.splice(application.menuToCheckArray.indexOf(menuToCheck), 1);
        }
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) { }
};