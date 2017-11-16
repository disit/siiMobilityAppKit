var TextSearcher = {

    open: false,
    results: null,
    varName: "TextSearcher",
    idMenu: "textSearchMenu",
    text: null,
    currentCoordinates: null,
    isManualCoordinates: false,
    isGPSCoordinates: false,
    clickOnManualButton: false,

    refreshMenu: function () {
        if ($("#" + TextSearcher.idMenu).length == 0) {
            $("#indexPage").append("<div id=\"" + TextSearcher.idMenu + "\"></div>")
        }
        ViewManager.render(TextSearcher.results, "#" + TextSearcher.idMenu, "TextSearchMenu");
        if (TextSearcher.isGPSCoordinates) {
            $("#buttonGPSCoordinates").removeClass("btn-default").addClass("btn-primary");
        }
        if (TextSearcher.isManualCoordinates) {
            $("#buttonManualCoordinates").removeClass("btn-default").addClass("btn-primary");
        }
        $("#" + TextSearcher.idMenu + "Input").val(TextSearcher.text);
    },

    search: function () {
        $('#listPOISearched').dropdown().hide();
        TextSearcher.text = $("#" + TextSearcher.idMenu + "Input").val();
        if (TextSearcher.text != "") {
            var shortcut = false;
            if (TextSearcher.text == "km4citytestmodeon") {
                APIClient.useTestAPI();
                TextSearcher.hide();
                shortcut = true;
            }
            if (TextSearcher.text == "km4citytestmodeoff") {
                APIClient.useProductionAPI();
                TextSearcher.hide();
                shortcut = true;
            }
            if (!shortcut) {
                var textQuery = QueryManager.createAddressPOISearchQuery(TextSearcher.text, TextSearcher.currentCoordinates, true, "AND", [], "user");
                APIClient.executeQuery(textQuery, TextSearcher.successQuery, TextSearcher.errorQuery);
            }
        } else {
            navigator.notification.alert(Globalization.alerts.noTextToSearch.message, function () { }, Globalization.alerts.noTextToSearch.title);
        }
    },

    onKeyEnter: function (event) {
        if (event.which == 13 || event.keyCode == 13) {
            TextSearcher.search();
            return false;
        }
        return true;
    },

    show: function () {
        application.resetInterface();
        TextSearcher.refreshMenu();
        $("#" + TextSearcher.idMenu).show();
        $("#" + TextSearcher.idMenu + "Input").focus();
        TextSearcher.setCoordinatesToManual();
        TextSearcher.open = true;
        application.addingMenuToCheck(TextSearcher.varName);
        application.setBackButtonListener();
    },

    hide: function () {
        $("#" + TextSearcher.idMenu).hide();
        application.removingMenuToCheck(TextSearcher.varName);
        TextSearcher.open = false;
    },

    checkForBackButton: function () {
        if (TextSearcher.open) {
            TextSearcher.hide();
        }
    },

    closeAll: function () {
            TextSearcher.hide();
    },

    resetSearch: function () {
        QueryManager.resetMaxDists();
        Loading.hideAutoSearchLoading();
    },

    resetInputText: function () {
        $("#" + TextSearcher.idMenu + "Input").val('');
        $("#" + TextSearcher.idMenu + "Input").focus();
        $('#listPOISearched').dropdown().hide();
    },

    inputTextOnFocus: function () {
        TextSearcher.searchPOIFast();
    },

    //callBack
    successQuery: function (response) {
        if (SearchManager.typeOfSearchCenter == "selectedServiceMarker") {
            MapManager.searchOnSelectedServiceMarker = true;
        }

        if (response.features.length != 0) {

            for (var i = 0; i < response.features.length; i++) {
                response.features[i].properties.serviceType = response.features[i].properties.serviceType.replace(/\ /g, "_");
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

            MapManager.addGeoJSONLayerWithoutArea({
                "Results": response
            });


            TextSearcher.results = response;
            CategorySearcher.results = response;
            CategorySearcher.refreshMenu();
            CategorySearcher.showWithoutResetInterface();
            TextSearcher.resetSearch();
            CategorySearcher.hidePanelMenu();

        } else {
            navigator.notification.alert(Globalization.alerts.noFullTextResults.message, function () { }, Globalization.alerts.noFullTextResults.title);
        }

    },

    //callBack
    errorQuery: function (error) {
        TextSearcher.resetSearch();
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function () { }, Globalization.alerts.servicesServerError.title);
    },

    searchPOIFast: function () {
        TextSearcher.text = $("#" + TextSearcher.idMenu + "Input").val();
        if (TextSearcher.text.length >= 3) {
            $("#listPOISearched").html("<img src='img/loader.gif' style='position: absolute;left: 40%;' width='64'>");
            var addressPOISearchQuery = QueryManager.createAddressPOISearchQuery(TextSearcher.text, TextSearcher.currentCoordinates, true, "AND", [], "user");
            APIClient.executeQueryWithoutAlert(addressPOISearchQuery, TextSearcher.successFastQuery);
        } else if (TextSearcher.text == "") {
            $('#listPOISearched').dropdown().hide();
        }
    },

    successFastQuery: function (response) {
        var responseObject = {
            "Results": {
                "fullCount": 0,
                "type": "FeatureCollection",
                "features": []
            }
        };

        var itemToShow = response.features.length > 20 ? 20 : response.features.length;

        for (var i = 0; i < itemToShow; i++) {
            response.features[i].properties.serviceType = response.features[i].properties.serviceType.replace(/\ /g, "_");
            if (response.features[i].properties.address != null) {
                response.features[i].properties.address = response.features[i].properties.address.replace(/'/g, " ");
            }
            if (response.features[i].properties.city != null) {
                response.features[i].properties.city = response.features[i].properties.city.replace(/'/g, " ");
            }

            responseObject["Results"].features.push(response.features[i]);
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
            responseObject["Results"]["generalCallback"] = "TextSearcher.hide();";
            SearchDropDown.createAndShow("#listPOISearched", responseObject["Results"]);
            $("#listPOISearched").css("max-height", $(window).height() * 0.8 + "px");
        } else {
            $('#listPOISearched').dropdown().show();
            $("#listPOISearched").html("<b style='position: absolute;left: 35%;top: 25px;'>" + Globalization.labels.timetable.noResults + "</b>");
        }
    },

    setCoordinatesToManual: function () {
        if (MapManager.manualMarkerCoordinates() != null) {
            $("#buttonManualCoordinates").removeClass("btn-default").addClass("btn-primary");
            $("#buttonGPSCoordinates").removeClass('btn-primary').addClass("btn-default");
            TextSearcher.currentCoordinates = MapManager.manualMarkerCoordinates();
            TextSearcher.isManualCoordinates = true;
            TextSearcher.isGPSCoordinates = false;
            TextSearcher.searchPOIFast();
        } else {
            if (TextSearcher.clickOnManualButton) {
                navigator.notification.alert(Globalization.alerts.manualPosition.message, function () { }, Globalization.alerts.manualPosition.title);
            }
            $("#buttonManualCoordinates").removeClass('btn-primary').addClass("btn-default");
            TextSearcher.setCoordinatesToGPS(true);
        }
        TextSearcher.clickOnManualButton = false;
    },

    setCoordinatesToGPS: function (fromManualButton) {
        if (MapManager.gpsMarkerCoordinates() != null) {
            $("#buttonGPSCoordinates").removeClass("btn-default").addClass("btn-primary");
            $("#buttonManualCoordinates").removeClass('btn-primary').addClass("btn-default");
            TextSearcher.currentCoordinates = MapManager.gpsMarkerCoordinates();
            TextSearcher.isManualCoordinates = false;
            TextSearcher.isGPSCoordinates = true;
            TextSearcher.searchPOIFast();
        } else {
            $("#buttonGPSCoordinates").removeClass('btn-primary').addClass("btn-default");
            if (!fromManualButton) {
                navigator.notification.confirm(Globalization.alerts.noPosition.message, function (indexButton) {
                    if (device.platform == "Android") {
                        if (indexButton == 3) {
                            CheckGPS.openSettings();
                        }
                    }
                }, Globalization.alerts.noPosition.title, Globalization.alerts.noPosition.buttonName);
            }
        }
    }

};
