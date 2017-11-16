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
    version: "0.0.2",
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
        return true;
    },

    onDeviceReady: function () {
        application.receivedEvent('deviceready');
        var loadAllTimeout = 0;
        if (device.platform == "Android" || device.platform == "windows") {
            if (localStorage.getItem("acceptInformation") === null || (localStorage.getItem("profile") == "all" && localStorage.getItem("appVersion") != application.version)) {
                loadAllTimeout = 5500;
            } 
        }

        setTimeout(function () {
            if (localStorage.getItem("acceptInformation") === null || (localStorage.getItem("profile") == "all" && localStorage.getItem("appVersion") != application.version)) {
                ChooseLanguage.show();
            } else {
                application.startingApp();
            }

        }, loadAllTimeout);

        cordova.getAppVersion.getVersionNumber().then(function (version) {
            application.version = version;
        });

        cordova.getAppVersion.getAppName().then(function (appName) {
            application.appID = appName.substring(0, 1).toLowerCase() + "dck-" + device.platform.substring(0, 1).toLowerCase();
        });
        application.uid = forge_sha256(device.uuid);
    },

    startingApp: function () {
        SettingsManager.initializeSettings();
        
        if (!application.checkConnection()) {
            navigator.notification.alert(Globalization.alerts.connectionError.message, function () { }, Globalization.alerts.connectionError.title);
        }

        MapManager.createMap();
        PrincipalMenu.show();






        InfoManager.checkNewSingleTemplates();
       
        if (device.platform == "Win32NT" || device.platform == "windows") {
            application.resetBackButtonListener();
        }
    },

    resetInterface: function () {
        for (var i = application.menuToCheckArray.length - 1; i >= 0; i--) {
            if (window[application.menuToCheckArray[i]] != null) {
                if (window[application.menuToCheckArray[i]]["closeAll"] != null) {
                    window[application.menuToCheckArray[i]]["closeAll"]();
                }
            }
        }
        MapManager.reduceMenuShowMap(null, true);
    },

    confirm: function (msg, callback, title, buttons) {
        var buttonsWithLabel = [];

        for (var i = 0; i < buttons.length; i++) {
            var button = {
                "label": buttons[i],
                "indexButton": i + 1,
                "callback": callback.toString().replace(/}$/, "").replace(/.+{/, "").replace(/indexButton/g, i + 1)
            }
            buttonsWithLabel.push(button);
        }

        var confirmModal = {
            "msg": msg,
            "title": title,
            "buttonsWithLabel": buttonsWithLabel
        }

        ViewManager.render(confirmModal, "#dialogModal", "DialogModal");

        $('#dialogModal').modal('show');
    },

    alert: function (msg, callback, title) {
        var alertModal = {
            "msg": msg,
            "title": title
        }

        ViewManager.render(alertModal, "#dialogModal", "Alert");

        $('#dialogModal').modal('show');

    },

    onResize: function () {
        for (var i = application.menuToCheckArray.length - 1; i >= 0; i--) {
            if (window[application.menuToCheckArray[i]] != null) {
                if (window[application.menuToCheckArray[i]]["refreshMenuPosition"] != null) {
                    window[application.menuToCheckArray[i]]["refreshMenuPosition"]();
                }
            }
        }
    },

    onBackKeyDown: function (event) {
        if (device.platform != "Web" || event.oldURL.indexOf("#b") != -1) {
            if (device.platform == "Android" || device.platform == "iOS") {
                if (PrincipalMenu.open && !ChooseLanguage.open && !ChooseProfile.open && !PrincipalMenu.secondaryMenuOpen) {
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
                    if (window[application.menuToCheckArray[0]]["open"] != null && application.menuToCheckArray[0] != "PrincipalMenu") {
                        if (window[application.menuToCheckArray[0]]["open"] == false) {
                            application.resetInterface();
                            PrincipalMenu.show();
                        }
                    }
                }
                if (window[application.menuToCheckArray[0]] != null) {
                    if (window[application.menuToCheckArray[0]]["checkForBackButton"] != null) {
                        window[application.menuToCheckArray[0]]["checkForBackButton"]();
                    }
                }
                if (application.menuToCheckArray.length == 0) {
                    if (!PrincipalMenu.open && device.platform != "Web") {
                        window.plugins.toast.showWithOptions(
                            {
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
            }

            
            if (device.platform == "Web" && !PrincipalMenu.open) {
                application.setBackButtonListener();
            }
        }
    },

    onPause: function (event) {
        if (device.platform != "Web") {

            if (typeof GpsManager != "undefined") {
                GpsManager.stopWatchingPosition();
            }
        }
    },

    onResume: function (event) {
        if (device.platform != "Web") {


            if (typeof GpsManager != "undefined") {
                GpsManager.watchingPosition();
            }
        }
    },

    close: function () {
        if (device.platform != "Web") {
            navigator.Backbutton.goHome(function () { }, function () { });
        }
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

    addingMenuToCheck: function (menuToCheck) {
        application.menuToCheckArray.unshift(menuToCheck);
    },

    removingMenuToCheck: function (menuToCheck) {
        var index = application.menuToCheckArray.indexOf(menuToCheck);
        if (index != -1) {
            application.menuToCheckArray.splice(application.menuToCheckArray.indexOf(menuToCheck), 1);
        }
    },

    // Update DOM on a Received Event
    receivedEvent: function (id) {
    }
};
