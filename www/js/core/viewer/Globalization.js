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
var Globalization = {

    labels: [],
    alerts: [],
    currentLanguage: null,

    refresh: function () {
        if (Globalization.labels.length == 0) {
            if (JSON.parse(localStorage.getItem("globalizationLabels" + SettingsManager.language)) != null) {
                Globalization.labels = JSON.parse(localStorage.getItem("globalizationLabels" + SettingsManager.language));
            }
        }
        if (Globalization.alerts.length == 0) {
            if (JSON.parse(localStorage.getItem("globalizationAlerts" + SettingsManager.language)) != null) {
                Globalization.alerts = JSON.parse(localStorage.getItem("globalizationAlerts" + SettingsManager.language));
            }
        }

        if (Globalization.currentLanguage != SettingsManager.language) {

            $.ajax({
                url: RelativePath.build + "labels." + SettingsManager.language + ".json",
                async: false,
                dataType: "json",
                success: function (data) {
                    if (Globalization.labels.length == 0) {
                        Globalization.labels = data;
                    } else {
                        Globalization.modifyLabels(data);
                    }
                }
            });
            $.ajax({
                url: RelativePath.alerts + "alerts." + SettingsManager.language + ".json",
                async: false,
                dataType: "json",
                success: function (data) {
                    if (Globalization.alerts.length == 0) {
                        Globalization.alerts = data;
                    } else {
                        Globalization.modifyAlerts(data);
                    }
                }
            });

            $.ajax({
                url: RelativePath.alerts + "alerts." + device.platform + "." + SettingsManager.language + ".json",
                async: false,
                dataType: "json",
                success: function (data) {
                    if (Globalization.alerts.length == 0) {
                        Globalization.alerts = data;
                    } else {
                        Globalization.modifyAlerts(data);
                    }
                }
            });

            $.ajax({
                url: RelativePath.build + "alerts." + SettingsManager.language + ".json",
                async: false,
                dataType: "json",
                success: function (data) {
                    Globalization.modifyAlerts(data);
                }
            });

            $.ajax({
                url: RelativePath.build + "alerts." + device.platform + "." + SettingsManager.language + ".json",
                async: false,
                dataType: "json",
                success: function (data) {
                    Globalization.modifyAlerts(data);
                }
            });

            localStorage.setItem("globalizationLabels" + SettingsManager.language, JSON.stringify(Globalization.labels));
            localStorage.setItem("globalizationAlerts" + SettingsManager.language, JSON.stringify(Globalization.alerts));
            PrincipalMenu.refreshMenu();
            //$("#loadingOverlayPage").hide();
            Globalization.currentLanguage = SettingsManager.language;

        }
    },

    loadAndAddLabels: function (fullPath) {
        $.ajax({
            url: fullPath,
            async: false,
            dataType: "json",
            success: function (data) {
                Globalization.modifyLabels(data);
            }
        });

    },

    loadAndAddAlerts: function (fullPath) {
        $.ajax({
            url: fullPath,
            dataType: "json",
            success: function (data) {
                Globalization.modifyAlerts(data);
            }
        });
    },

    modifyLabels: function (labelsToAdd) {
        for (var objectName in labelsToAdd) {
            for (var fieldName in labelsToAdd[objectName]) {
                if (Globalization.labels[objectName] != null) {
                    Globalization.labels[objectName][fieldName] = labelsToAdd[objectName][fieldName];
                } else {
                    var jsonObject = {};
                    jsonObject[fieldName] = labelsToAdd[objectName][fieldName];
                    Globalization.labels[objectName] = jsonObject;
                }
            }
        }
    },

    modifyAlerts: function (alertsToAdd) {
        for (var objectName in alertsToAdd) {
            for (var fieldName in alertsToAdd[objectName]) {
                if (Globalization.alerts[objectName] != null) {
                    Globalization.alerts[objectName][fieldName] = alertsToAdd[objectName][fieldName];
                } else {
                    var jsonObject = {};
                    jsonObject[fieldName] = alertsToAdd[objectName][fieldName];
                    Globalization.alerts[objectName] = jsonObject;
                }
            }
        }
    }

};
