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
var EasyParkSearcher = {

    open: false,
    expanded: false,
    results: null,
    varName: "EasyParkSearcher",
    idMenu: "easyParkMenu",
    responseLength: 0,
    temporaryResponse: null,

    refreshMenu: function () {
        if ($("#" + EasyParkSearcher.idMenu).length == 0) {
            $("#indexPage").
                append("<div id=\"" + EasyParkSearcher.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(EasyParkSearcher.results, "#" + EasyParkSearcher.idMenu, "EasyParkMenu");
        Utility.movingPanelWithTouch("#" + EasyParkSearcher.idMenu + "ExpandHandler", "#" + EasyParkSearcher.idMenu);
        if (EasyParkSearcher.expanded) {
            $("#" + EasyParkSearcher.idMenu + "Expand").hide();
        } else {
            $("#" + EasyParkSearcher.idMenu + "Collapse").hide();
        }
    },

    show: function () {
        application.resetInterface();
        MapManager.showMenuReduceMap("#" + EasyParkSearcher.idMenu);
        $("#" + EasyParkSearcher.idMenu + "Collapse").hide();
        EasyParkSearcher.open = true;
        InfoManager.addingMenuToManage(EasyParkSearcher.varName);
        application.addingMenuToCheck(EasyParkSearcher.varName);
        application.setBackButtonListener();
    },

    hide: function () {
        $("#" + EasyParkSearcher.idMenu).css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap("#" + EasyParkSearcher.idMenu);
        InfoManager.removingMenuToManage(EasyParkSearcher.varName);
        application.removingMenuToCheck(EasyParkSearcher.varName);
        EasyParkSearcher.open = false;
    },

    checkForBackButton: function () {
        if (EasyParkSearcher.open) {
            EasyParkSearcher.hide();
        }
    },

    refreshMenuPosition: function () {
        if (EasyParkSearcher.open) {
            MapManager.showMenuReduceMap("#" + EasyParkSearcher.idMenu);
            Utility.checkAxisToDrag("#" + EasyParkSearcher.idMenu);
            if (EasyParkSearcher.expanded) {
                EasyParkSearcher.expandBusRoutesMenu();
            }
        }
    },

    closeAll: function () {
        if (EasyParkSearcher.open) {
            EasyParkSearcher.hide();
        }
    },

    expandEasyParkSearcher: function () {
        Utility.expandMenu("#" + EasyParkSearcher.idMenu, "#" + EasyParkSearcher.idMenu + "Expand", "#" + EasyParkSearcher.idMenu + "Collapse");
        EasyParkSearcher.expanded = true;
    },

    collapseEasyParkSearcher: function () {
        Utility.collapseMenu("#" + EasyParkSearcher.idMenu, "#" + EasyParkSearcher.idMenu + "Expand", "#" + EasyParkSearcher.idMenu + "Collapse");
        EasyParkSearcher.expanded = false;
    },

    search: function(){
        var parkingQuery = QueryManager.createCategoriesQuery(['Car_park'], SearchManager.searchCenter, "user");
        APIClient.executeQuery(parkingQuery, EasyParkSearcher.searchInformationForEachFeature, EasyParkSearcher.errorQuery);
    },

    searchInformationForEachFeature(response) {
        for (var category in response) {
            if (response[category].features.length != 0) {
                EasyParkSearcher.responseLength = response[category].features.length;
                EasyParkSearcher.temporaryResponse = {
                    "Results": {
                        "features": [],
                        "fullCount": EasyParkSearcher.responseLength,
                        "type": "FeatureCollection",
                    }
                };
                Loading.showAutoSearchLoading();
                for (var i = 0; i < response[category].features.length; i++) {
                    var serviceQuery = QueryManager.createServiceQuery(response[category].features[i].properties.serviceUri, "app");
                    APIClient.executeQueryWithoutAlert(serviceQuery, EasyParkSearcher.mergeResults, EasyParkSearcher.decrementAndCheckRetrieved);
                }
            } else {
                SearchManager.startAutoSearch(EasyParkSearcher.varName);
            }
        }
    },

    mergeResults: function (response) {
        for (var category in response) {
            if (response[category].features != null) {
                if (response[category].features.length != 0) {
                    if (response.realtime != null) {
                        if (response.realtime.results != null) {
                            if (response.realtime.results.bindings[0] != null) {
                                /*if (response.realtime.results.bindings[0].freeParkingLots != null) {
                                    response[category].features[0].properties.freeParkingLots = response.realtime.results.bindings[0].freeParkingLots.value;
                                    if (response[category].features[0].properties.freeParkingLots > 20) {
                                        response[category].features[0].properties.freeParkingLotsColor = "green";
                                    } else if (response[category].features[0].properties.freeParkingLots > 0) {
                                        response[category].features[0].properties.freeParkingLotsColor = "orange";
                                    } else {
                                        response[category].features[0].properties.freeParkingLotsColor = "red";
                                    }
                                }*/
								/*response[category].features[0].properties.items = [];
								for (var i = 0; i < response.realtime.results.bindings.length; i++) {
									var item = response.realtime.results.bindings[i];
									response[category].features[0].properties.items.push(item);
								}*/
                                if (response.realtime.results.bindings[0].freeParkingLots != null) {
                                    response[category].features[0].properties.freeParkingLots = response.realtime.results.bindings[0].freeParkingLots.value;
                                    if (response[category].features[0].properties.freeParkingLots > 20) {
                                        response[category].features[0].properties.freeParkingLotsColor = "green";
                                    } else if (response[category].features[0].properties.freeParkingLots > 0) {
                                        response[category].features[0].properties.freeParkingLotsColor = "orange";
                                    } else {
                                        response[category].features[0].properties.freeParkingLotsColor = "red";
                                    }

                                    response[category].features[0].properties.capacity = response.realtime.results.bindings[0].capacity.value;

                                    var date = new Date(response.realtime.results.bindings[0].updating.value);
                                    var day = date.getDate() < 10 ? ("0" + date.getDate()) : date.getDate();
                                    var monthIndex = (date.getMonth() + 1) < 10 ? ("0" + (date.getMonth() + 1)) : (date.getMonth() + 1);
                                    var year = date.getFullYear();
                                    var hours = date.getHours() < 10 ? ("0" + date.getHours()) : date.getHours();;
                                    var minutes = date.getMinutes() < 10 ? ("0" + date.getMinutes()) : date.getMinutes();;
                                    var seconds = date.getSeconds() < 10 ? ("0" + date.getSeconds()) : date.getSeconds();;
                                    response[category].features[0].properties.updating = day + "/" + monthIndex + "/" + year + " " + hours + ":" + minutes + ":" + seconds;

                                    response[category].features[0].properties.marker = "•";
                                }
                            }
                        }
                    }
                    EasyParkSearcher.temporaryResponse["Results"].features.push(response[category].features[0]);
                }
            }
        }

        EasyParkSearcher.decrementAndCheckRetrieved();

    },

    decrementAndCheckRetrieved: function(){
        EasyParkSearcher.responseLength--;

        if (EasyParkSearcher.responseLength == 0) {
            EasyParkSearcher.successQuery(EasyParkSearcher.temporaryResponse);
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

        EasyParkSearcher.results = responseObject["Results"];
        EasyParkSearcher.refreshMenu();
        EasyParkSearcher.show();
        MapManager.addGeoJSONLayer(responseObject);
        EasyParkSearcher.resetSearch();
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
        EasyParkSearcher.results.features.sort(function (a, b) {
            if (a.properties.freeParkingLots == null) {
                return 1;
            } else if (b.properties.freeParkingLots == null) {
                return -1;
            }
            return b.properties.freeParkingLots - a.properties.freeParkingLots;
        });
        EasyParkSearcher.refreshMenu();
        $("#EasyParkSearcherMenuFreeParkingOrderImage").addClass('glyphicon-sort-by-attributes-alt');
        $("#EasyParkSearcherMenuGpsOrderImage").removeClass("glyphicon-sort-by-attributes");
        $("#EasyParkSearcherMenuSearchCenterOrderImage").removeClass("glyphicon-sort-by-attributes");

    },

    orderByDistanceFromGPS: function () {
        EasyParkSearcher.results.features.sort(function (a, b) {
            if (a.properties.distanceFromGPS == null) {
                return 1;
            } else if (b.properties.distanceFromGPS == null) {
                return -1;
            }
            return a.properties.distanceFromGPS - b.properties.distanceFromGPS
        });
        EasyParkSearcher.refreshMenu();
        $("#EasyParkSearcherMenuGpsOrderImage").addClass('glyphicon-sort glyphicon-sort-by-attributes');
        $("#EasyParkSearcherMenuFreeParkingOrderImage").removeClass("glyphicon-sort-by-attributes-alt");
        $("#EasyParkSearcherMenuSearchCenterOrderImage").removeClass("glyphicon-sort-by-attributes");
    },

    orderByDistanceFromSearchCenter: function () {
        EasyParkSearcher.results.features.sort(function (a, b) {
            if (a.properties.distanceFromSearchCenter == null) {
                return 1;
            } else if (b.properties.distanceFromSearchCenter == null) {
                return -1;
            }
            return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter
        });
        EasyParkSearcher.refreshMenu();
        $("#EasyParkSearcherMenuSearchCenterOrderImage").addClass("glyphicon-sort-by-attributes");
        $("#EasyParkSearcherMenuGpsOrderImage").removeClass("glyphicon-sort-by-attributes");
        $("#EasyParkSearcherMenuFreeParkingOrderImage").removeClass("glyphicon-sort-by-attributes");
    },

}
