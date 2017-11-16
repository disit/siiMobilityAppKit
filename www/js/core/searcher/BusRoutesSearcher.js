var BusRoutesSearcher = {

    infoRouteModalOpen: false,
    open: false,
    expanded: false,
    results: null,
    currentRoute: null,
    varName: "BusRoutesSearcher",
    idMenu: "busRoutesMenu",

    getRoutesForLineToBusStop: function (line, agencyUri, busStopName) {
        var busStopsRoutesQuery = QueryManager.createBusStopsRoutesQuery(line, agencyUri, Utility.unescapeHtml(busStopName), 'false', "user");
        APIClient.executeQuery(busStopsRoutesQuery, BusRoutesSearcher.successGetRoutes, BusRoutesSearcher.errorQuery);
    },

    successGetRoutes: function (routes) {
        ViewManager.render(routes, '#infoRouteModal', 'InfoRouteModal');
        BusRoutesSearcher.showInfoRouteModal();
        InfoManager.collapseInfoAboutOneMarker();
    },

    show: function () {
        application.resetInterface();
        MapManager.showMenuReduceMap("#" + BusRoutesSearcher.idMenu);
        $("#" + BusRoutesSearcher.idMenu + "Collapse").hide();
        BusRoutesSearcher.open = true;
        InfoManager.addingMenuToManage(BusRoutesSearcher.varName);
        application.addingMenuToCheck(BusRoutesSearcher.varName);
        application.setBackButtonListener();
    },

    hide: function () {
        MapManager.reduceMenuShowMap("#" + BusRoutesSearcher.idMenu);
        BusRoutesSearcher.open = false;
        InfoManager.removingMenuToManage(BusRoutesSearcher.varName);
        application.removingMenuToCheck(BusRoutesSearcher.varName);
    },

    checkForBackButton: function () {
        if (BusRoutesSearcher.open) {
            BusRoutesSearcher.hide();
        }
    },

    refreshMenuPosition: function () {
        if (BusRoutesSearcher.open) {
            MapManager.showMenuReduceMap("#" + BusRoutesSearcher.idMenu);
            Utility.checkAxisToDrag("#" + BusRoutesSearcher.idMenu);
            if (BusRoutesSearcher.expanded) {
                BusRoutesSearcher.expandBusRoutesMenu();
            }
        }
    },

    closeAll: function () {
       BusRoutesSearcher.hide();
    },


    expandBusRoutesMenu: function () {
        Utility.expandMenu("#" + BusRoutesSearcher.idMenu, "#" + BusRoutesSearcher.idMenu + "Expand", "#" + BusRoutesSearcher.idMenu + "Collapse");
        BusRoutesSearcher.expanded = true;
    },

    collapseBusRoutesMenu: function () {
        Utility.collapseMenu("#" + BusRoutesSearcher.idMenu, "#" + BusRoutesSearcher.idMenu + "Expand", "#" + BusRoutesSearcher.idMenu + "Collapse");
        BusRoutesSearcher.expanded = false;
    },

    showInfoRouteModal: function () {
        $("#infoRouteModal").modal('show');
        $('#infoRouteModal').on('hide.bs.modal', function (e) { BusRoutesSearcher.infoRouteModalOpen = false; });
        BusRoutesSearcher.infoRouteModalOpen = true;
    },

    hideInfoRouteModal: function () {
        $("#" + BusRoutesSearcher.idMenu).css({ 'z-index': '1001' });
        $("#infoRouteModal").modal('hide');
        BusRoutesSearcher.infoRouteModalOpen = false;
    },

    drawRoute: function (routeNumber) {
        var routeQuery = QueryManager.createRouteQuery(routeNumber, 'true', "user");
        APIClient.executeQuery(routeQuery, BusRoutesSearcher.successQuery, BusRoutesSearcher.errorQuery);
    },

    successQuery: function (results) {

        response = results["BusStops"];
        BusRoutesSearcher.hideInfoRouteModal();

        if (response.features.length != 0) {
            var indexMinDistanceFromCenter = 0;
            var indexMinDistanceFromGPS = 0;
            for (var i = 0; i < response.features.length; i++) {
                Utility.enrichService(response.features[i], i)

                if (response.features[i].properties.distanceFromSearchCenter != null) {
                    if (response.features[i].properties.distanceFromSearchCenter < response.features[indexMinDistanceFromCenter].properties.distanceFromSearchCenter) {
                        indexMinDistanceFromCenter = i
                    }
                }
                if (response.features[i].properties.distanceFromGPS < response.features[indexMinDistanceFromGPS].properties.distanceFromGPS) {
                    indexMinDistanceFromGPS = i
                }

            }

            response.features[i - 1].properties.imgsrc = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + "/LastStopOfRoute.png", "classic");
            response.features[i - 1].properties.alternativeIcon = "LastStopOfRoute";
            response.features[0].properties.imgsrc = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + "/FirstStopOfRoute.png", "classic");
            response.features[0].properties.alternativeIcon = "FirstStopOfRoute";

            MapManager.searchOnSelectedServiceMarker = true;
            MapManager.addGeoJSONLayerWithoutArea({
                "Results": response
            });


            response.lineNumber = results.Route.lineNumber;
            response.firstBusStop = response.features[0].properties.name.toUpperCase();
            response.lastBusStop = response.features[i - 1].properties.name.toUpperCase();
            response.features[i - 1].properties.thisIsLastStop = true;
            response.features[0].properties.thisIsLastStop = true;
            if (response.features[0].properties.distanceFromSearchCenter != null) {
                response.features[indexMinDistanceFromCenter].properties.closerSearchCenter = true;
            }
            response.features[indexMinDistanceFromGPS].properties.closerGPS = true;

            BusRoutesSearcher.results = response;
            BusRoutesSearcher.currentRoute = results["Route"].wktGeometry;
            MapManager.addSelectedGeometry(results["Route"].wktGeometry);
            BusRoutesSearcher.refreshMenu();
            BusRoutesSearcher.show();
        }

    },

    errorQuery: function (error) {
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function () { }, Globalization.alerts.servicesServerError.title);
    },

    searchServicesOnRoute: function(){
        var servicesOnRouteQuery = QueryManager.createCategoriesOnWKTQuery(['Service'], BusRoutesSearcher.currentRoute, "user");
        APIClient.executeQuery(servicesOnRouteQuery, BusRoutesSearcher.successQueryServices, BusRoutesSearcher.errorQuery);
    },

    successQueryServices: function(response){
        var responseObject = {
            "Results": {
                "fullCount": 0,
                "type": "FeatureCollection",
                "features": []
            }
        };

        for (var category in response) {
            if (response[category].features.length != 0) {
                responseObject["Results"].features = responseObject["Results"].features.concat(response[category].features);
                responseObject["Results"].fullCount = responseObject["Results"].fullCount + response[category].fullCount;
            }
        }

        if (responseObject["Results"].features.length != 0) {
            for (var i = 0; i < responseObject["Results"].features.length; i++) {
                responseObject["Results"].features[i].id = i;
                Utility.enrichService(responseObject["Results"].features[i], i);
            }

            CategorySearcher.results = responseObject["Results"];
            CategorySearcher.refreshMenu();
            CategorySearcher.show();
            MapManager.addGeoJSONLayerWithoutArea(responseObject);
            MapManager.addSelectedGeometry(BusRoutesSearcher.currentRoute);
        }
    },

    refreshMenu: function () {
        if ($("#" + BusRoutesSearcher.idMenu).length == 0) {
            $("#indexPage").append("<div id=\"" + BusRoutesSearcher.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(BusRoutesSearcher.results, "#" + BusRoutesSearcher.idMenu, "BusRoutesMenu");
        Utility.movingPanelWithTouch("#" + BusRoutesSearcher.idMenu + "ExpandHandler", "#" + BusRoutesSearcher.idMenu);
    }
};
