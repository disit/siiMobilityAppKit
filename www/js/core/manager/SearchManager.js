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
var SearchManager = {

    searchCenter: null,
    typeOfSearchCenter: null,
    currentType: null,
    fireLastCallback: false,

    search: function (searcher) {
        SearchManager.fireLastCallback = false;
        SearchManager.currentType = searcher;
        if (MapManager.gpsMarkerCoordinates() != null) {
            if (MapManager.manualMarkerCoordinates() != null) {
                if (MapManager.selectedServiceMarkerCoordinates() != null) {
                    navigator.notification.confirm(Globalization.alerts.chooseThreeSearchCenter.message, function (indexButton) {
                        if (device.platform == "Android" || device.platform == "Web") {
                            if (indexButton == 3) {
                                SearchManager.searchOnSelectedServiceMarker(SearchManager.currentType);
                            }
                            if (indexButton == 2) {
                                SearchManager.searchOnManualMarker(SearchManager.currentType);
                            }
                            if (indexButton == 1) {
                                SearchManager.searchOnGpsMarker(SearchManager.currentType);
                            }
                        } else if (device.platform == "iOS" || device.platform == "Win32NT" || device.platform == "windows") {
                            if (indexButton == 2) {
                                SearchManager.searchOnSelectedServiceMarker(SearchManager.currentType);
                            }
                            if (indexButton == 1) {
                                SearchManager.searchOnManualMarker(SearchManager.currentType);
                            }
                        }
                    }, Globalization.alerts.chooseThreeSearchCenter.title, Globalization.alerts.chooseThreeSearchCenter.buttonName);
                } else {
                    navigator.notification.confirm(Globalization.alerts.chooseGpsManualSearchCenter.message, function (indexButton) {
                        if (indexButton == 2) {
                            SearchManager.searchOnManualMarker(SearchManager.currentType);
                        }
                        if (indexButton == 1) {
                            SearchManager.searchOnGpsMarker(SearchManager.currentType);
                        }

                    }, Globalization.alerts.chooseGpsManualSearchCenter.title, Globalization.alerts.chooseGpsManualSearchCenter.buttonName);
                }
            } else {
                if (MapManager.selectedServiceMarkerCoordinates() != null) {
                    navigator.notification.confirm(Globalization.alerts.chooseGpsServiceSearchCenter.message, function (indexButton) {
                        if (indexButton == 2) {
                            SearchManager.searchOnSelectedServiceMarker(SearchManager.currentType);
                        }
                        if (indexButton == 1) {
                            SearchManager.searchOnGpsMarker(SearchManager.currentType);
                        }
                    }, Globalization.alerts.chooseGpsServiceSearchCenter.title, Globalization.alerts.chooseGpsServiceSearchCenter.buttonName);
                } else {
                    SearchManager.searchOnGpsMarker(SearchManager.currentType);
                }
            }
        } else {
            if (MapManager.manualMarkerCoordinates() != null) {
                if (MapManager.selectedServiceMarkerCoordinates() != null) {
                    navigator.notification.confirm(Globalization.alerts.chooseManualServiceSearchCenter.message, function (indexButton) {
                        if (indexButton == 2) {
                            SearchManager.searchOnSelectedServiceMarker(SearchManager.currentType);
                        }
                        if (indexButton == 1) {
                            SearchManager.searchOnManualMarker(SearchManager.currentType);
                        }
                    }, Globalization.alerts.chooseManualServiceSearchCenter.title, Globalization.alerts.chooseManualServiceSearchCenter.buttonName);
                } else {
                    SearchManager.searchOnManualMarker(SearchManager.currentType);
                }
            } else {
                if (MapManager.selectedServiceMarkerCoordinates() != null) {
                    SearchManager.searchOnSelectedServiceMarker(SearchManager.currentType);
                } else {
                    navigator.notification.confirm(Globalization.alerts.noPosition.message, function (indexButton) {
                        if (device.platform == "Android") {
                            if (indexButton == 3) {
                                CheckGPS.openSettings();
                            }
                            if (indexButton == 2) {
                                SearchManager.fireLastCallback = true;
                            }
                        }
                    }, Globalization.alerts.noPosition.title, Globalization.alerts.noPosition.buttonName);
                }
            }
        }
    },

    searchOnManualMarker: function (searcher) {
        SearchManager.searchCenter = MapManager.manualMarkerCoordinates();
        SearchManager.typeOfSearchCenter = "manualMarker";
        SearchManager.rightSearch(searcher);
    },

    searchOnGpsMarker: function (searcher) {
        SearchManager.searchCenter = MapManager.gpsMarkerCoordinates();
        SearchManager.typeOfSearchCenter = "gpsMarker";
        SearchManager.rightSearch(searcher);
    },

    searchOnSelectedServiceMarker: function (searcher) {
        SearchManager.searchCenter = MapManager.selectedServiceMarkerCoordinates();
        SearchManager.typeOfSearchCenter = "selectedServiceMarker";
        SearchManager.rightSearch(searcher);
    },

    rightSearch: function (searcher) {
        if (window[searcher] != null) {
            if (window[searcher]["search"] != null) {
                window[searcher]["search"]();
            }
        }
    },

    startAutoSearch: function (searcher) {
        var resultOfIncrease = QueryManager.increaseMaxDistTemporary();
        if (resultOfIncrease == true) {
            Loading.showAutoSearchLoading();
            if (window[searcher] != null) {
                if (window[searcher]["search"] != null) {
                    window[searcher]["search"]();
                }
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

            if (window[searcher] != null) {
                if (window[searcher]["results"] != null) {
                    window[searcher]["results"] = response["Results"];
                }
                if (window[searcher]["refreshMenu"] != null) {
                    window[searcher]["refreshMenu"]();
                }
                if (window[searcher]["resetSearch"] != null) {
                    window[searcher]["resetSearch"]();
                }
            }
            navigator.notification.alert(Globalization.alerts.overMaxDistance.message, function () { }, Globalization.alerts.overMaxDistance.title);
        }
    }

};
