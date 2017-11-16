var ParkingSearcher = {

    open: false,
    expanded: false,
    results: null,
    varName: "ParkingSearcher",
    idMenu: "parkingMenu",
    responseLength: 0,
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
                ParkingSearcher.expandParkingSearcher();
            }
        }
    },

    refreshMenu: function () {
        if ($("#" + ParkingSearcher.idMenu).length == 0) {
            $("#indexPage").
                append("<div id=\"" + ParkingSearcher.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(ParkingSearcher.results, "#" + ParkingSearcher.idMenu, "js/modules/parkingSearcher/ParkingMenu.mst.html");
        Utility.movingPanelWithTouch("#" + ParkingSearcher.idMenu + "ExpandHandler",
            "#" + ParkingSearcher.idMenu);
        if (ParkingSearcher.expanded) {
            $("#" + ParkingSearcher.idMenu + "Expand").hide();
        } else {
            $("#" + ParkingSearcher.idMenu + "Collapse").hide();
        }
    },

    closeAll: function () {
            ParkingSearcher.hide();
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

    search: function () {
        QueryManager.increaseMaxDistTemporary();
        QueryManager.increaseMaxDistTemporary();
        var parkingQuery = QueryManager.createCategoriesQuery(['Car_park'], SearchManager.searchCenter, "user");
        APIClient.executeQuery(parkingQuery, ParkingSearcher.searchInformationForEachFeature, ParkingSearcher.errorQuery);
    },

    searchInformationForEachFeature: function (response) {
        for (var category in response) {
            if (response[category].features.length != 0) {
                ParkingSearcher.responseLength = response[category].features.length;
                ParkingSearcher.temporaryResponse = {
                    "Results": {
                        "features": [],
                        "fullCount": ParkingSearcher.responseLength,
                        "type": "FeatureCollection",
                    }
                };
                Loading.showAutoSearchLoading();
                for (var i = 0; i < response[category].features.length; i++) {
                    var serviceQuery = QueryManager.createServiceQuery(response[category].features[i].properties.serviceUri, "app");
                    APIClient.executeQueryWithoutAlert(serviceQuery, ParkingSearcher.mergeResults, ParkingSearcher.decrementAndCheckRetrieved);
                }
            } else {
                SearchManager.startAutoSearch(ParkingSearcher.varName);
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
                                if (response.realtime.results.bindings[0].updating != null) {
                                    response[category].features[0].properties.updating = response.realtime.results.bindings[0].updating.value;
                                }
                            }
                        }
                    }
                    if (response.predictions != null && response.predictions.length > 1) {
                        response[category].features[0].properties.prediction = response.predictions[1];
                        if (response[category].features[0].properties.prediction.freePrediction > 20) {
                            response[category].features[0].properties.predictionColor = "green";
                        } else if (response[category].features[0].properties.prediction.freePrediction > 0) {
                            response[category].features[0].properties.predictionColor = "orange";
                        } else {
                            response[category].features[0].properties.predictionColor = "red";
                        }
                    }
                    ParkingSearcher.temporaryResponse["Results"].features.push(response[category].features[0]);
                }
            }
        }

        ParkingSearcher.decrementAndCheckRetrieved();

    },

    decrementAndCheckRetrieved: function () {
        ParkingSearcher.responseLength--;

        if (ParkingSearcher.responseLength == 0) {
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
        if (responseObject["Results"].features[0] != null) {
            if (responseObject["Results"].features[0].properties.distanceFromSearchCenter != null) {
                responseObject["Results"].features.sort(function (a, b) {
                    return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter
                });
            } else {
                responseObject["Results"].features.sort(function (a, b) {
                    return a.properties.distanceFromGPS - b.properties.distanceFromGPS
                });
            }
        }

        ParkingSearcher.results = responseObject["Results"];
        ParkingSearcher.refreshMenu();
        ParkingSearcher.show();
        MapManager.addGeoJSONLayer(responseObject);
        ParkingSearcher.resetSearch();
    },

    //error callBack
    errorQuery: function (error) {
        navigator.notification.alert(
            Globalization.alerts.servicesServerError.message,
            function () { },
            Globalization.alerts.servicesServerError.title);
    },

    renderSingleService: function (singleService) {
        ViewManager.render(singleService, "#" + InfoManager.idMenu, "js/modules/parkingSearcher/Parking.mst.html");
        ViewManager.render(singleService.Service.features[0], "#infoMenuInnerDetailHeader", "ServiceDetailHeader");
        ViewManager.render(singleService.Service.features[0], "#infoMenuInnerDetails", "ServiceDetails");
        if (singleService.trends != null) {
            var chartObject = {};
            for (var i = 0; i < singleService.trends.length; i++) {
                if (typeof chartObject[singleService.trends[i].day] == "undefined") {
                    chartObject[singleService.trends[i].day] = { values: [], labels: [], colorsArea: [], colorsBorder: [], active: "" };
                }
                chartObject[singleService.trends[i].day].values.push(parseInt(singleService.trends[i].free));
                if (parseInt(singleService.trends[i].free) > 20) {
                    chartObject[singleService.trends[i].day].colorsArea.push('rgba(75, 192, 192, 0.2)');
                    chartObject[singleService.trends[i].day].colorsBorder.push('rgba(75, 192, 192, 1)');
                } else {
                    chartObject[singleService.trends[i].day].colorsArea.push('rgba(255, 159, 64, 0.2)');
                    chartObject[singleService.trends[i].day].colorsBorder.push('rgba(255, 159, 64, 1)');
                }
                chartObject[singleService.trends[i].day].labels.push(singleService.trends[i].hour.substring(0, 2));
            }

            var date = new Date();
            var currentWeekDay = date.getDay();

            for (var category in chartObject) {
                if (parseInt(category) == currentWeekDay) {
                    chartObject[category].active = "active";
                }
                if ($("#predictionTrendChart" + category).length == 0) {
                    $("#predictionTrendCarouselInner").
                        append("<div id=\"predictionTrendChart" + category + "\" class=\"item " + chartObject[category].active + "\" style=\"left: 5%; width: 90%;\"> <canvas height=\"180\"></canvas></div>")
                }


                var myChart = new Chart($("#predictionTrendChart" + category + " canvas"), {
                    type: 'bar',
                    data: {
                        labels: chartObject[category].labels,
                        datasets: [{
                            data: chartObject[category].values,
                            backgroundColor: chartObject[category].colorsArea,
                            borderColor: chartObject[category].colorsBorder,
                            borderWidth: 1
                        }]
                    },
                    options: {
                        legend: { display: false }, title: { display: true, text: Globalization.labels.weekDay[category], position: "bottom" },
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                },
                            }]
                        }
                    }
                });
            }
        }
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
    }

};
