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

    labels: null,
    alerts: null,

    refresh: function() {
        $.ajax({
            url: RelativePath.labels + "labels." + SettingsManager.language + ".json",
            async: false,
            dataType: "json",
            success: function(data) {
                Globalization.labels = data;
            }
        });
        $.ajax({
            url: RelativePath.alerts + "alerts." + SettingsManager.language + ".json",
            async: false,
            dataType: "json",
            success: function (data) {
                Globalization.alerts = data;
            }
        });
        $.ajax({
            url: RelativePath.alerts + "alerts." + device.platform + "." + SettingsManager.language + ".json",
            async: false,
            dataType: "json",
            success: function (data) {
                $.extend(Globalization.alerts, data);
            }
        });
        Utility.loadFilesInsideDirectory("www/js/modules/", null, "labels." + SettingsManager.language + ".json", true, Globalization.loadAndAddLabels, function (e) {
            Utility.loadFilesInsideDirectory("www/js/modules/", null, "alerts." + SettingsManager.language + ".json", true, Globalization.loadAndAddAlerts, function (e) {
                Utility.loadFilesInsideDirectory("www/js/modules/", null, "alerts." + device.platform + "." + SettingsManager.language + ".json", true, Globalization.loadAndAddAlerts, function (e) {
                    $.ajax({
                        url: application.remoteJsonUrl + "labels/labels." + SettingsManager.language + ".json",
                        cache: false,
                        timeout: Parameters.timeoutGettingMenuCategorySearcher,
                        dataType: "json",
                        success: function (data) {
                            Globalization.modifyLabels(data);
                            PrincipalMenu.refreshMenu();
                        }
                    });
                    $.ajax({
                        url: application.remoteJsonUrl + "alerts/alerts." + SettingsManager.language + ".json",
                        cache: false,
                        timeout: Parameters.timeoutGettingMenuCategorySearcher,
                        dataType: "json",
                        success: function (data) {
                            Globalization.modifyAlerts(data);
                            PrincipalMenu.refreshMenu();
                        }
                    });
                    $.ajax({
                        url: application.remoteJsonUrl + "alerts/alerts." + device.platform + "." + SettingsManager.language + ".json",
                        cache: false,
                        timeout: Parameters.timeoutGettingMenuCategorySearcher,
                        dataType: "json",
                        success: function (data) {
                            Globalization.modifyAlerts(data);
                            PrincipalMenu.refreshMenu();
                        }
                    });
                })
            })
        });
        
        
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
            async: false,
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
                    Globalization.labels[objectName]= jsonObject;
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

}