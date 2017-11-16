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
var SettingsManager = {

    urlDefaultSettings: RelativePath.jsonFolder + "defaultSettings.json",
    open: false,
    menu: null,
    defaultSettings: null,
    language: null,
    textSize: null,
    maxDistance: null,
    maxDistanceRecommender: null,
    numberOfItems: null,
    track: null,
    scanPeriod: null,
    profile: null,
    notifySuggestions: null,
    notifyInfoSoc: null,
    notifyPersonalAssistant: null,
    notifyPeriod: null,
    periodBackgroundNotifier: null,
    nightDay: null,
    chronologyMaxSize: null,
    gpsPosition: null,

    initializeSettings: function (settingsOnInit) {

        if (SettingsManager.defaultSettings == null) {
            $.ajax({
                url: SettingsManager.urlDefaultSettings,
                async: false,
                dataType: "json",
                success: function (data) {
                    SettingsManager.defaultSettings = data
                }
            });
        }

        for (var setting in SettingsManager.defaultSettings) {
            if (localStorage.getItem(setting) === null) {
                localStorage.setItem(setting, SettingsManager.defaultSettings[setting]);
            }
            SettingsManager[setting] = localStorage.getItem(setting);
        }

        if (SettingsManager["language"] == "it") {
            localStorage.setItem("language", "ita");
        } else if (SettingsManager["language"] == "es") {
            localStorage.setItem("language", "esp");
        } else if (SettingsManager["language"] == "en") {
            localStorage.setItem("language", "eng");
        } else if (SettingsManager["language"] == "fr") {
            localStorage.setItem("language", "fra");
        } else if (SettingsManager["language"] == "de") {
            localStorage.setItem("language", "deu");
        }
        SettingsManager["language"] = localStorage.getItem("language");

        if (settingsOnInit == "true") {
            Globalization.refresh();
            SettingsManager.refreshMenu();
        } else {
            SettingsManager.refreshAll();
        }
    },

    resetSettings: function () {
        for (var setting in SettingsManager.defaultSettings) {
            SettingsManager[setting] = SettingsManager.defaultSettings[setting];
        }
        SettingsManager.refreshMenu();
    },

    saveSettings: function () {
        for (var setting in SettingsManager.defaultSettings) {
            SettingsManager[setting] = $("[name='" + setting + "']").val();
            localStorage.setItem(setting, SettingsManager[setting]);
        }
        SettingsManager.refreshAll();
    },

    cancelChanges: function () {
        for (var setting in SettingsManager.defaultSettings) {
            if (localStorage.getItem(setting) === null) {
                localStorage.setItem(setting, SettingsManager.defaultSettings[setting]);
            }
            SettingsManager[setting] = localStorage.getItem(setting);
        }
    },

    refreshMenu: function () {

        $.ajax({
            url: RelativePath.jsonFolder + "settingsMenu/settingsMenu." + SettingsManager.language + ".json",
            async: false,
            dataType: "json",
            success: function (data) {
                SettingsManager.menu = data;
            }
        });

        for (var i = 0; i < SettingsManager.menu.Settings.groups.length; i++) {
            for (var j = 0; j < SettingsManager.menu.Settings.groups[i].items.length; j++) {
                var item = SettingsManager.menu.Settings.groups[i].items[j];
                if (item.options != null) {
                    for (var l = 0; l < item.options.length; l++) {
                        var option = item.options[l];
                        if (option.key == SettingsManager[item.key]) {
                            SettingsManager.menu.Settings.groups[i].items[j].options[l].selected = "selected";
                        }
                    }
                }
            }
        }

        SettingsManager.menu.Settings.platform = device.platform;
        if ($("#settingsMenu").length == 0) {
            $("#indexPage").append("<div id=\"settingsMenu\" class=\"commonMenu\"></div>")
        }
        ViewManager.render(SettingsManager.menu, "#settingsMenu", null);
    },

    showSettingsMenu: function () {
        SettingsManager.refreshMenu();
        $('#settingsMenu').show();
        SettingsManager.open = true;
        application.addingMenuToCheck("SettingsManager");
        application.setBackButtonListener();
    },

    checkSaveSettings: function(){
        navigator.notification.confirm(Globalization.alerts.saveSettings.message, function (indexButton) {
            if (indexButton == 2) {
                application.resetInterface(); MapManager.resetMarker(); SettingsManager.saveSettings();
            }
            if (indexButton == 1) {
                SettingsManager.cancelChanges(); SettingsManager.hideSettingsMenu();
            }

        }, "", Globalization.alerts.saveSettings.buttonName);
    },

    hideSettingsMenu: function () {

        setTimeout(function () {
            $('#settingsMenu').hide(Parameters.hidePanelGeneralDuration);
            
            application.removingMenuToCheck("SettingsManager");
            if (PrincipalMenu.fromPrincipalMenu && SettingsManager.open) {
                PrincipalMenu.show();
            }
            SettingsManager.open = false;
        }, 1000);
    },

    refreshAll: function () {
        Globalization.refresh();
        SettingsManager.refreshMenu();
        CategorySearcher.refreshCategoryMenu();
        GpsManager.refresh();
        MapManager.initializeAndUpdatePopUpGpsMarker();
        MapManager.initializeAndUpdatePopUpManualMarker(Globalization.labels.searchPopUp.aroundYou, MapManager.manualMarkerCallback);
        ViewManager.render(null, '#threeVerticalDotMenu', 'ThreeVerticalDotMenu');
        QueryManager.refreshParameters();

        if (SettingsManager.profile == "operator") {
            if (SettingsManager.language == "ita") {
                $("#profileShowerInner").html("Operatore");
            }
            else {
                $("#profileShowerInner").html("Operator");
            }
            $("#profileShower").show(0);
        } else {
            $("#profileShower").hide(0);
        }
        SettingsManager.hideSettingsMenu();
    },

    checkForBackButton: function () {
        SettingsManager.checkSaveSettings();
    },

    closeAll: function () {
       SettingsManager.hideSettingsMenu();
    }


};
