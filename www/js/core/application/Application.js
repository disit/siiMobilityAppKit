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
        if (networkState == Connection.NONE || networkState == Connection.UNKNOWN) {
            return false;
        }
        return true;
    },

    onDeviceReady: function () {
        application.receivedEvent('deviceready');

        if (device.platform == "Android") {
            var loadAllTimeout = 5000;
            setTimeout(function () {
                $("#splashScreenVideoContainer").remove();
                screen.unlockOrientation();
            }, 7000);
        } else {
            $("#splashScreenVideoContainer").remove();
            loadAllTimeout = 0;
            screen.unlockOrientation();
        }



        setTimeout(function () {
            Utility.loadInitJS();
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
            if (localStorage.getItem("acceptInformation") === null || (localStorage.getItem("profile") == "all" && localStorage.getItem("appVersion") != application.version)) {

                ChooseLanguage.show();
            } else {
                application.startingApp();
            }

        }, loadAllTimeout);


    },

    startingApp: function () {
        SettingsManager.initializeSettings();
        PrincipalMenu.show();
        if (!application.checkConnection()) {
            navigator.notification.alert(Globalization.alerts.connectionError.message, function () { }, Globalization.alerts.connectionError.title);
        }

        MapManager.createMap();

        if (device.platform == "Win32NT" || device.platform == "windows") {
            application.resetBackButtonListener();
        }

    },

    onResize: function () {
        if (typeof MapManager != "undefined") {
            MapManager.refreshMenuPosition();
        }
        if (typeof CategorySearcher != "undefined") {
            CategorySearcher.rescaleFontSize();
        }
        if (typeof InfoManager != "undefined") {
            InfoManager.rescaleCarouselHeight();
            InfoManager.rescaleModalHeight();
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
        if (!EventsSearcher.open && !CategorySearcher.open && !TextSearcher.open && !CategorySearcher.openResultsMenu && !InfoManager.open && !SettingsManager.open && !Information.open && !Log.open && !LogRecommender.open && !BusRoutesSearcher.open && !StartInformation.open && !ChooseLanguage.open && !ChooseProfile.open) {
            PrincipalMenu.show();
            if (PrincipalMenu.modifing) {
                PrincipalMenu.savePrincipalMenu();
            } else {
                application.resetBackButtonListener();
            }
        }
        if (SettingsManager.open) {
            SettingsManager.hideSettingsMenu();
            if (PrincipalMenu.fromPrincipalMenu) {
                PrincipalMenu.show();
            }
        }
        if (Information.open && !Log.open && !LogRecommender.open) {
            Information.hide();
            if (PrincipalMenu.fromPrincipalMenu) {
                PrincipalMenu.show();
            }
        }
        if (Log.open) {
            Log.hide();
        }
        if (LogRecommender.open) {
            LogRecommender.hide();
        }
        if (EventsSearcher.open && !InfoManager.open && !CategorySearcher.open) {
            EventsSearcher.hide();
        }
        if (BusRoutesSearcher.open && !InfoManager.open) {
            BusRoutesSearcher.hide();
        }
        if (TextSearcher.open && !InfoManager.open && !CategorySearcher.open) {
            TextSearcher.hide();
        }
        if (CategorySearcher.open && !InfoManager.open) {
            CategorySearcher.hide();
        }
        if (CategorySearcher.openResultsMenu && !InfoManager.open) {
            CategorySearcher.hideResultsMenu();
        }
        if (InfoManager.open) {
            if (PictureManager.sendPhotoModalOpen) {
                PictureManager.hideSendPhotoModal();
            } else if (PictureManager.sendPhotoAlbumModalOpen) {
                PictureManager.hideSendPhotoAlbumModal();
            } else if (FeedbackManager.modalOpen) {
                FeedbackManager.hideModal();
            } else if (InfoManager.modalImageOpen) {
                InfoManager.hideImageModal();
            } else if (InfoManager.modalTimetableOpen) {
                InfoManager.hideTimetableModal();
            } else if (BusRoutesSearcher.infoRouteModalOpen) {
                BusRoutesSearcher.hideInfoRouteModal();
            } else {
                InfoManager.hideInfoAboutOneMarker.apply(this, MapManager.mapCenterCoordinates());
            }
        }
        if (ChooseProfile.open && !StartInformation.open) {
            ChooseProfile.hide();
            ChooseLanguage.show();
        }
        if (StartInformation.open) {
            StartInformation.hide();
        }
        if (!EventsSearcher.open && !CategorySearcher.open && !TextSearcher.open && !CategorySearcher.openResultsMenu && !InfoManager.open && !SettingsManager.open && !Information.open && !Log.open && !LogRecommender.open && !BusRoutesSearcher.open && !StartInformation.open && !ChooseLanguage.open && !ChooseProfile.open) {
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
        GpsManager.stopWatchingPosition();
    },

    onResume: function (event) {
        GpsManager.watchingPosition();
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

    // Update DOM on a Received Event
    receivedEvent: function (id) { }
};