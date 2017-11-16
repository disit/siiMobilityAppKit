var NavigatorSearcher = {

    searchInterval: null,
    lastCoordinated: null,
    init: null,
    started: null,

    start: function () {
        $("#loadingOverlayPage").show();
        if (NavigatorSearcher.searchInterval == null) {
            navigator.notification.confirm(Globalization.alerts.navigatorSearcherStart.message, function (indexButton) {
                if (indexButton == 2) {
                    NavigatorSearcher.startNavigation();
                } else {
                    $("#loadingOverlayPage").hide();
                }
            }, Globalization.alerts.navigatorSearcherStart.title, Globalization.alerts.navigatorSearcherStart.buttonName);
        }
    },

    stop: function () {
        Loading.hide();
        $('#navbarNavigation').hide(0);
        $('.ol-rotate').show(0);
        clearInterval(NavigatorSearcher.searchInterval);
        NavigatorSearcher.searchInterval = null;
        CompassManager.stopWatchingCompass();
        if (typeof window.plugins != "undefined") {
            window.plugins.insomnia.allowSleepAgain()
        }
        NavigatorSearcher.started = false;
        MapManager.addVariableButtons();
        $("#navigationSearchButton").html('<i class=\"fa fa-location-arrow\"></i>');
        MapManager.removeNavigationButtons();
        MapManager.initializeAndUpdatePopUpGpsMarker();
        MapManager.disabling3d();
        MapManager.activeIntereationsAfterNavigation();
        application.resetInterface();
    },

    startNavigation: function () {
        if (GpsManager.currentCoordinates() != null) {
            if (typeof Cesium == "undefined") {
                $.ajax({
                    url: "js/Cesium/Cesium.js",
                    async: false,
                    dataType: "script",
                    success: function () {
                        CESIUM_BASE_URL = "js/Cesium";
                    }
                });
            }

            //var selectedNodeNumber = $("#categorySearchFancyTree").fancytree("getTree").getSelectedNodes().length;

            //if (selectedNodeNumber == 0) {

            //    navigator.notification.alert(Globalization.alerts.servicesCategoryNotSelected.message, function () { }, Globalization.alerts.servicesCategoryNotSelected.title);

            //    return false;
            //}

            var selectedKeys = ["Service"];

            //if (selectedNodeNumber != $("#categorySearchFancyTree").fancytree("getTree").count() || SettingsManager.profile != "all") {
            //    selectedKeys = $.map($("#categorySearchFancyTree").fancytree("getTree").getSelectedNodes(true), function (node) {
            //        return node.key;
            //    });
            //}

            if (NavigatorSearcher.lastCoordinates == null) {
                NavigatorSearcher.lastCoordinates = MapManager.gpsMarkerCoordinates();
            }

            NavigatorSearcher.init = true;
            NavigatorSearcher.viewAdjustement();
            MapManager.disactiveInterationsForNavigation();
            $("#navigationSearchButton").html('<i class=\"icon ion-android-hand\"></i>');
            CompassManager.initializeHeading();
            if (typeof window.plugins != "undefined") {
                window.plugins.insomnia.keepAwake();
            }
            application.addingMenuToCheck("NavigatorSearcher");
            NavigatorSearcher.started = true;
            NavigatorSearcher.search(selectedKeys);
            $("#loadingOverlayPage").hide();
            NavigatorSearcher.searchInterval = setInterval(function () {
                NavigatorSearcher.search(selectedKeys);
            }, 20000);

        } else {
            navigator.notification.confirm(Globalization.alerts.noPosition.message, function (indexButton) {
                if (device.platform == "Android") {
                    if (indexButton == 3) {
                        CheckGPS.openSettings();
                    }
                    if (indexButton == 1 || indexButton == 0) {
                        CategorySearcher.resetSearch();
                    }
                } else if (device.platform == "iOS" || device.platform == "Win32NT" || device.platform == "windows" || device.platform == "Web") {
                    if (indexButton == 1 || indexButton == 0) {
                        CategorySearcher.resetSearch();
                    }
                }
            }, Globalization.alerts.noPosition.title, Globalization.alerts.noPosition.buttonName);
        }
    },

    search: function (selectedKeys) {
        if (Math.round(GpsManager.getDistanceFromGPSInM(NavigatorSearcher.lastCoordinates[0], NavigatorSearcher.lastCoordinates[1])) > 75 || NavigatorSearcher.init == true) {
            NavigatorSearcher.init = false;
            NavigatorSearcher.lastCoordinates = MapManager.gpsMarkerCoordinates();
            SearchManager.searchCenter = NavigatorSearcher.lastCoordinates;
            var categoriesQuery = QueryManager.createCategoriesQuery(selectedKeys, MapManager.gpsMarkerCoordinates(), "app");
            APIClient.executeQueryWithoutAlert(categoriesQuery, NavigatorSearcher.successQuery, NavigatorSearcher.errorQuery);
        }
    },

    viewAdjustement: function () {
        MapManager.removeManualMarker();
        MapManager.removeAndUpdatePopUpGpsMarker();
        MapManager.removeVariableButtons();
        MapManager.addNavigationButtons();
        MapManager.activate3d();
        MapManager.disabling3d();
        application.resetInterface();
        $("#dropdownThreeVertical").removeClass('open');
        $("#navigationMode").html(Globalization.labels.navigatiorSearcherBar.navigationMode);
        $('#navbarNavigation').show(0);
        $('.ol-rotate').hide(0);
    },

    closeAll: function () {
        if (NavigatorSearcher.started == true) {
            NavigatorSearcher.stop();
        }

        application.removingMenuToCheck("NavigatorSearcher");
        $('#navigationSearchButton').html('<i class=\"fa fa-location-arrow\"></i>');
    },

    checkForBackButton: function () {
        NavigatorSearcher.closeAll();
    },

    //callBack
    successQuery: function (response) {
        if (NavigatorSearcher.started) {
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
                if (responseObject["Results"].features[0].properties.distanceFromSearchCenter != null) {
                    responseObject["Results"].features.sort(function (a, b) {
                        return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter
                    });
                } else {
                    responseObject["Results"].features.sort(function (a, b) {
                        return a.properties.distanceFromGPS - b.properties.distanceFromGPS
                    });
                }

                CategorySearcher.results = responseObject["Results"];
                CategorySearcher.refreshMenu();
                CategorySearcher.showWithoutResetInterface();
                MapManager.addGeoJSONLayerWithoutArea(responseObject);
                navigator.vibrate(500);

            }
        }
    },

    //callBack
    errorQuery: function (error) {

    }

};
