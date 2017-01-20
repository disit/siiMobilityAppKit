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
var ParkingSearcher = {

    open: false,
    expanded: false,
    results: null,
    varName: "ParkingSearcher",
    idMenu: "parkingMenu",
    responseLength: 0,
    parkRetrieved: 0,
    temporaryResponse: null,

    show: function () {
        application.resetInterface();
        MapManager.showMenuReduceMap("#" + ParkingSearcher.idMenu);
        $("#" + ParkingSearcher.idMenu + "Collapse").hide();
        ParkingSearcher.open = true;
        InfoManager.addingMenuToManage(ParkingSearcher.varName);
        application.addingMenuToCheck(ParkingSearcher.varName);
        application.setBackButtonListener();
    },

    hide: function () {
        $("#" + ParkingSearcher.idMenu).css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap("#" + ParkingSearcher.idMenu);
        InfoManager.removingMenuToManage(ParkingSearcher.varName);
        application.removingMenuToCheck(ParkingSearcher.varName);
        ParkingSearcher.open = false;
    },

    checkForBackButton: function () {
        if (ParkingSearcher.open) {
            ParkingSearcher.hide();
        }
    },

    refreshMenuPosition: function () {
        if (ParkingSearcher.open) {
            MapManager.showMenuReduceMap("#" + ParkingSearcher.idMenu);
            Utility.checkAxisToDrag("#" + ParkingSearcher.idMenu);
            if (ParkingSearcher.expanded) {
                ParkingSearcher.expandBusRoutesMenu();
            }
        }
    },

    refreshMenu: function () {
        if ($("#" + ParkingSearcher.idMenu).length == 0) {
            $("#indexPage").
                append("<div id=\"" + ParkingSearcher.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(ParkingSearcher.results, "#" + ParkingSearcher.idMenu, "ParkingMenu");
        Utility.movingPanelWithTouch("#" + ParkingSearcher.idMenu + "ExpandHandler",
            "#" + ParkingSearcher.idMenu);
        if (ParkingSearcher.expanded) {
            $("#" + ParkingSearcher.idMenu + "Expand").hide();
        } else {
            $("#" + ParkingSearcher.idMenu + "Collapse").hide();
        }
    },

    closeAll: function () {
        if (ParkingSearcher.open) {
            ParkingSearcher.hide();
        }
    },
    
    expandParkingSearcher: function () {
        Utility.expandMenu("#" + ParkingSearcher.idMenu,
                           "#" + ParkingSearcher.idMenu + "Expand",
                           "#" + ParkingSearcher.idMenu + "Collapse");
        ParkingSearcher.expanded = true;
    },

    collapseParkingSearcher: function () {
        Utility.collapseMenu("#" + ParkingSearcher.idMenu,
                             "#" + ParkingSearcher.idMenu + "Expand",
                             "#" + ParkingSearcher.idMenu + "Collapse");
        ParkingSearcher.expanded = false;
    },

    search: function(){
        var parkingQuery = QueryManager.createCategoriesQuery(['Car_park'], SearchManager.searchCenter, "user");
        APIClient.executeQuery(parkingQuery, ParkingSearcher.searchInformationForEachFeature, ParkingSearcher.errorQuery);
    },

    searchInformationForEachFeature(response) {
        for (var category in response) {
            if (response[category].features.length != 0) {
                ParkingSearcher.responseLength = response[category].features.length;
                ParkingSearcher.parkRetrieved = 0;
                Loading.showAutoSearchLoading();
                for (var i = 0; i < response[category].features.length; i++) {
                    var serviceQuery = QueryManager.createServiceQuery(response[category].features[i].properties.serviceUri, "app");
                    APIClient.executeQueryWithoutAlert(serviceQuery, ParkingSearcher.mergeResults, ParkingSearcher.incrementAndCheckRetrieved);
                }
            } else {
                SearchManager.startAutoSearch(ParkingSearcher.varName);
            }
        } 
    },

    mergeResults: function (response) {
        if (ParkingSearcher.parkRetrieved == 0) {
            ParkingSearcher.temporaryResponse = {
                "Results": {
                    "features": [],
                    "fullCount": ParkingSearcher.responseLength,
                    "type": "FeatureCollection",
                }
            };
        }
        for (var category in response) {
            if (response[category].features != null) {
                if (response[category].features.length != 0) {
                    if (response.realtime != null) {
                        if (response.realtime.results != null) {
                            if (response.realtime.results.bindings[0] != null) {
                                if (response.realtime.results.bindings[0].freeParkingLots != null) {
                                    response[category].features[0].properties.freeParkingLots = response.realtime.results.bindings[0].freeParkingLots.value;
                                    if (response[category].features[0].properties.freeParkingLots > 20) {
                                        response[category].features[0].properties.freeParkingLotsColor = "green";
                                    } else if (response[category].features[0].properties.freeParkingLots > 0) {
                                        response[category].features[0].properties.freeParkingLotsColor = "orange";
                                    } else {
                                        response[category].features[0].properties.freeParkingLotsColor = "red";
                                    }
                                }
                            }
                        }
                    }
                    ParkingSearcher.temporaryResponse["Results"].features.push(response[category].features[0]);
                }
            }
        }

        ParkingSearcher.incrementAndCheckRetrieved();
        
    },

    incrementAndCheckRetrieved: function(){
        ParkingSearcher.parkRetrieved++;

        if (ParkingSearcher.parkRetrieved == ParkingSearcher.responseLength) {
            ParkingSearcher.successQuery(ParkingSearcher.temporaryResponse);
            Loading.hideAutoSearchLoading();
        }
    },

    //success callBack
    successQuery: function (response) {
        var responseObject = response;

        if (SearchManager.typeOfSearchCenter == "selectedServiceMarker") {
            MapManager.searchOnSelectedServiceMarker = true;
        }
        for (var i = 0; i < responseObject["Results"].features.length; i++) {
            responseObject["Results"].features[i].id = i;
            Utility.enrichService(responseObject["Results"].features[i], i);
        }
        if (responseObject["Results"].features[0].properties.distanceFromSearchCenter != null) {
            responseObject["Results"].features.sort(function (a, b) {
                return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter
            });
        } else {
            responseObject["Results"].features.sort(function (a, b) {
                return a.properties.distanceFromGPS - b.properties.distanceFromGPS
            });
        }

        ParkingSearcher.results = responseObject["Results"];
        ParkingSearcher.refreshMenu();
        ParkingSearcher.show();
        MapManager.addGeoJSONLayer(responseObject);
        ParkingSearcher.resetSearch();
    },

    //error callBack
    errorQuery: function(error) {
        navigator.notification.alert(
            Globalization.alerts.servicesServerError.message,
            function () { },
            Globalization.alerts.servicesServerError.title);
    },

    resetSearch: function () {
        QueryManager.resetMaxDists();
        Loading.hideAutoSearchLoading();
    },

    orderByFreeParkingLots: function () {
        ParkingSearcher.results.features.sort(function (a, b) {
            if (a.properties.freeParkingLots == null) {
                return 1;
            } else if (b.properties.freeParkingLots == null) {
                return -1;
            }
            return b.properties.freeParkingLots - a.properties.freeParkingLots;
        });
        ParkingSearcher.refreshMenu();
        $("#parkingSearcherMenuFreeParkingOrderImage").addClass('glyphicon-sort-by-attributes-alt');
        $("#parkingSearcherMenuGpsOrderImage").removeClass("glyphicon-sort-by-attributes");
        $("#parkingSearcherMenuSearchCenterOrderImage").removeClass("glyphicon-sort-by-attributes");

    },

    orderByDistanceFromGPS: function () {
        ParkingSearcher.results.features.sort(function (a, b) {
            if (a.properties.distanceFromGPS == null) {
                return 1;
            } else if (b.properties.distanceFromGPS == null) {
                return -1;
            }
            return a.properties.distanceFromGPS - b.properties.distanceFromGPS
        });
        ParkingSearcher.refreshMenu();
        $("#parkingSearcherMenuGpsOrderImage").addClass('glyphicon-sort glyphicon-sort-by-attributes');
        $("#parkingSearcherMenuFreeParkingOrderImage").removeClass("glyphicon-sort-by-attributes-alt");
        $("#parkingSearcherMenuSearchCenterOrderImage").removeClass("glyphicon-sort-by-attributes");
    },

    orderByDistanceFromSearchCenter: function () {
        ParkingSearcher.results.features.sort(function (a, b) {
            if (a.properties.distanceFromSearchCenter == null) {
                return 1;
            } else if (b.properties.distanceFromSearchCenter == null) {
                return -1;
            }
            return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter
        });
        ParkingSearcher.refreshMenu();
        $("#parkingSearcherMenuSearchCenterOrderImage").addClass("glyphicon-sort-by-attributes");
        $("#parkingSearcherMenuGpsOrderImage").removeClass("glyphicon-sort-by-attributes");
        $("#parkingSearcherMenuFreeParkingOrderImage").removeClass("glyphicon-sort-by-attributes");
    },

}