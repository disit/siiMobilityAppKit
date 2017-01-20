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
    varName: "TextSearcher",
    idMenu: "textSearchMenu",
    text: null,
    fullSearch: false,

    refreshMenu: function () {
        if ($("#" + TextSearcher.idMenu).length == 0) {
            $("#indexPage").append("<div id=\"" + TextSearcher.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(TextSearcher.results, "#" + TextSearcher.idMenu, "TextSearchMenu");
        $("#" + TextSearcher.idMenu + "Input").val(TextSearcher.text);
        Utility.movingPanelWithTouch("#" + TextSearcher.idMenu + "ExpandHandler", "#" + TextSearcher.idMenu);
    },

    search: function () {
        if (SearchManager.searchCenter != null || TextSearcher.fullSearch) {
            TextSearcher.text = $("#" + TextSearcher.idMenu + "Input").val();
            if (TextSearcher.text != "") {
                    if (TextSearcher.fullSearch) {
                        var fullTextQuery = QueryManager.createFullTextQuery(TextSearcher.text);
                        APIClient.executeQuery(fullTextQuery, TextSearcher.successQuery, TextSearcher.errorQuery, "user");
                    } else {
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
            SearchManager.search(TextSearcher.varName);
            return false;
        }
        return true;
    },

    expandTextSearchMenu: function () {
        Utility.expandMenu("#" + TextSearcher.idMenu, "#" + TextSearcher.idMenu + "Expand", "#" + TextSearcher.idMenu + "Collapse");
        TextSearcher.expanded = true;
    },

    collapseTextSearchMenu: function () {
        Utility.collapseMenu("#" + TextSearcher.idMenu, "#" + TextSearcher.idMenu + "Expand", "#" + TextSearcher.idMenu + "Collapse");
        TextSearcher.expanded = false;
    },

    show: function () {
        application.resetInterface();
        TextSearcher.refreshMenu();
        MapManager.showMenuReduceMap("#" + TextSearcher.idMenu);
        $("#" + TextSearcher.idMenu + "Collapse").hide();
        TextSearcher.expandTextSearchMenu();
        $("#" + TextSearcher.idMenu + "Input").focus();
        TextSearcher.open = true;
        InfoManager.addingMenuToManage(TextSearcher.varName);
        application.addingMenuToCheck(TextSearcher.varName);
        application.setBackButtonListener();
    },

    hide: function () {
        $("#" + TextSearcher.idMenu).css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap("#" + TextSearcher.idMenu);
        InfoManager.removingMenuToManage(TextSearcher.varName);
        application.removingMenuToCheck(TextSearcher.varName);
        TextSearcher.open = false;
    },

    checkForBackButton: function () {
        if (TextSearcher.open) {
            TextSearcher.hide();
        }
    },

    refreshMenuPosition: function () {
        if (TextSearcher.open) {
            MapManager.showMenuReduceMap("#" + TextSearcher.idMenu);
            Utility.checkAxisToDrag("#" + TextSearcher.idMenu);
            if (TextSearcher.expanded) {
                TextSearcher.expandTextSearchMenu();
            }
        }
    },

    closeAll: function () {
        if (TextSearcher.open) {
            TextSearcher.hide();
        }
    },

    resetSearch: function () {
        TextSearcher.fullSearch = false;
        QueryManager.resetMaxDists();
        TextSearcher.collapseTextSearchMenu();
        Loading.hideAutoSearchLoading();
    },

    activeFullSearch: function () {
        TextSearcher.fullSearch = true;
    },


    resetInputText: function(){
        $("#" + TextSearcher.idMenu + "Input").val('');
        $("#" + TextSearcher.idMenu + "Input").focus();
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
            CategorySearcher.hidePanelMenu();

        } else {
            if (TextSearcher.fullSearch) {
                navigator.notification.alert(Globalization.alerts.noFullTextResults.message, function () { }, Globalization.alerts.noFullTextResults.title);
                TextSearcher.fullSearch = false;
            } else {
                SearchManager.startAutoSearch(TextSearcher.varName);
            }
        }

    },

    //callBack
    errorQuery: function (error) {
        TextSearcher.resetSearch();
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function () { }, Globalization.alerts.servicesServerError.title);
    }

}