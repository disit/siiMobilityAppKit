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
var TextSearcher = {

    open: false,
    expanded: false,
    results: null,
    text: null,
    searchStarted: false,
    fullSearch: false,
    autoSearchStarted: false,

    refreshMenu: function () {
        ViewManager.render(TextSearcher.results, "#textSearchMenu", "TextSearchMenu");
        $("#textSearchMenuInput").val(TextSearcher.text);
        Utility.movingPanelWithTouch("#textSearchMenuExpandHandler", "#textSearchMenu");
    },

    search: function () {
        if (SearchManager.searchCenter != null || TextSearcher.fullSearch) {
            TextSearcher.text = $("#textSearchMenuInput").val();
            if (TextSearcher.text != "") {
                    if (TextSearcher.fullSearch) {
                        var fullTextQuery = QueryManager.createFullTextQuery(TextSearcher.text);
                        APIClient.executeQuery(fullTextQuery, TextSearcher.successQuery, TextSearcher.errorQuery, "user");
                    } else {
                        TextSearcher.searchStarted = true;
                        var textQuery = QueryManager.createTextQuery(TextSearcher.text, SearchManager.searchCenter, "user");
                        APIClient.executeQuery(textQuery, TextSearcher.successQuery, TextSearcher.errorQuery);
                    }
            } else {
                navigator.notification.alert(Globalization.alerts.noTextToSearch.message, function () { }, Globalization.alerts.noTextToSearch.title);
            }
        } else {
            navigator.notification.confirm(Globalization.alerts.noPosition.message, function (indexButton) {
                if (device.platform == "Android") {
                    if (indexButton == 3) {
                        CheckGPS.openSettings();
                    }
                    if (indexButton == 1 || indexButton == 0) {
                        TextSearcher.resetSearch();
                    }
                } else if (device.platform == "iOS" || device.platform == "Win32NT" || device.platform == "windows") {
                    if (indexButton == 1 || indexButton == 0) {
                        TextSearcher.resetSearch();
                    }

                }
            }, Globalization.alerts.noPosition.title, Globalization.alerts.noPosition.buttonName);
        }
    },

    onKeyEnter: function (event) {
        if (event.which == 13 || event.keyCode == 13) {
            TextSearcher.collapseTextSearchMenu();
            SearchManager.search('text');
            return false;
        }
        return true;
    },

    expandTextSearchMenu: function () {
        Utility.expandMenu("#textSearchMenu", "#expandTextSearchMenu", "#collapseTextSearchMenu");
        TextSearcher.expanded = true;
    },

    collapseTextSearchMenu: function () {
        Utility.collapseMenu("#textSearchMenu", "#expandTextSearchMenu", "#collapseTextSearchMenu");
        TextSearcher.expanded = false;
    },

    show: function () {
        MapManager.resetMapInterface();
        TextSearcher.refreshMenu();
        MapManager.showMenuReduceMap('#textSearchMenu');
        $('#collapseTextSearchMenu').hide();
        TextSearcher.expandTextSearchMenu();
        $('#textSearchMenuInput').focus();
        TextSearcher.open = true;
        application.setBackButtonListener();
    },

    hide: function () {
        $('#textSearchMenu').css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap('#textSearchMenu');
        TextSearcher.open = false;
    },

    resetSearch: function () {
        TextSearcher.searchStarted = false;
        TextSearcher.fullSearch = false;
        TextSearcher.autoSearchStarted = false;
        QueryManager.resetMaxDists();
        Loading.hideAutoSearchLoading();
    },

    activeFullSearch: function () {
        TextSearcher.fullSearch = true;
    },


    resetInputText: function(){
        $('#textSearchMenuInput').val('');
        $('#textSearchMenuInput').focus();
    },

    inputTextOnFocus: function () {
        TextSearcher.expandTextSearchMenu();
    },

    //callBack
    successQuery: function (response) {
        if (SearchManager.typeOfSearchCenter == "selectedServiceMarker") {
            MapManager.searchOnSelectedServiceMarker = true;
        }

        if (response.features.length != 0) {

            for (var i = 0; i < response.features.length; i++) {
                Utility.enrichService(response.features[i], i);
            }
            if (response.features[0].properties.distanceFromSearchCenter != null) {
                response.features.sort(function (a, b) {
                    return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter
                });
            } else {
                response.features.sort(function (a, b) {
                    return a.properties.distanceFromGPS - b.properties.distanceFromGPS
                });
            }

            if (TextSearcher.fullSearch) {
                MapManager.addGeoJSONLayerWithoutArea({
                    "Results": response
                });
            } else {
                MapManager.addGeoJSONLayer({
                    "Results": response
                });
            }
            TextSearcher.results = response;
            TextSearcher.refreshMenu();
            TextSearcher.resetSearch();
            TextSearcher.collapseTextSearchMenu();
            MapManager.lastSearchPerformed = "#textSearchMenu";
            CategorySearcher.hide();

        } else {
            if (TextSearcher.fullSearch) {
                navigator.notification.alert(Globalization.alerts.noFullTextResults.message, function () { }, Globalization.alerts.noFullTextResults.title);
                TextSearcher.fullSearch = false;
            } else {
                TextSearcher.startAutoSearch();
            }
        }

    },

    //callBack
    errorQuery: function (error) {
        TextSearcher.resetSearch();
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function () { }, Globalization.alerts.servicesServerError.title);
    },

    startAutoSearch: function () {
        var resultOfIncrease = QueryManager.increaseMaxDistTemporary();
        if (resultOfIncrease == true) {
            if (TextSearcher.searchStarted == true) {
                TextSearcher.autoSearchStarted = true;
                Loading.showAutoSearchLoading();
                TextSearcher.search();
            }
        } else {
            var response = {
                "Results": {
                    "fullCount": 0,
                    "type": "FeatureCollection",
                    "features": []
                }
            };
            MapManager.addGeoJSONLayer(response);
            TextSearcher.results = response;
            TextSearcher.refreshMenu();
            TextSearcher.resetSearch();
            TextSearcher.collapseTextSearchMenu();
            navigator.notification.alert(Globalization.alerts.overMaxDistance.message, function () {}, Globalization.alerts.overMaxDistance.title);
        }
    }

}