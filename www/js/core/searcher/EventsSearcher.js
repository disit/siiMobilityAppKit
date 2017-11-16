var EventsSearcher = {

    open: false,
    expanded: false,
    results: null,
    varName: "EventsSearcher",
    idMenu: "eventsMenu",
    currentTime: null,

    refreshMenu: function () {
        if ($("#" + EventsSearcher.idMenu).length == 0) {
            $("#indexPage").append("<div id=\"" + EventsSearcher.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(EventsSearcher.results, "#" + EventsSearcher.idMenu, "EventsMenu");
        if (EventsSearcher.currentTime != null) {
            $("#eventsButton" + EventsSearcher.currentTime.charAt(0).toUpperCase() + EventsSearcher.currentTime.slice(1)).removeClass("btn-primary").addClass("btn-success");
        }
        Utility.movingPanelWithTouch("#" + EventsSearcher.idMenu + "ExpandHandler", "#" + EventsSearcher.idMenu);
    },

    search: function (time) {
        EventsSearcher.currentTime = time;
        var eventsQuery = QueryManager.createEventsQuery(time, "user");
        APIClient.executeQuery(eventsQuery, EventsSearcher.successQuery, EventsSearcher.errorQuery);
    },

    show: function () {
        application.resetInterface();
        MapManager.showMenuReduceMap("#" + EventsSearcher.idMenu);
        $("#" + EventsSearcher.idMenu + "Collapse").hide();
        localStorage.setItem("latestEventsClickedTime", (new Date().getTime()));
        PrincipalMenu.resetEventsBadge();
        EventsSearcher.open = true;
        InfoManager.addingMenuToManage(EventsSearcher.varName);
        application.addingMenuToCheck(EventsSearcher.varName);
        application.setBackButtonListener();
    },

    hide: function () {
        $("#" + EventsSearcher.idMenu).css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap("#" + EventsSearcher.idMenu);
        InfoManager.removingMenuToManage(EventsSearcher.varName);
        application.removingMenuToCheck(EventsSearcher.varName);
        EventsSearcher.open = false;
    },

    checkForBackButton: function () {
        if (EventsSearcher.open) {
            EventsSearcher.hide();
        }
    },

    refreshMenuPosition: function () {
        if (EventsSearcher.open) {
            MapManager.showMenuReduceMap("#" + EventsSearcher.idMenu);
            Utility.checkAxisToDrag("#" + EventsSearcher.idMenu);
            if (EventsSearcher.expanded) {
                EventsSearcher.expandEventsMenu();
            }
        }
    },

    closeAll: function () {
       EventsSearcher.hide();
    },

    expandEventsMenu: function () {
        Utility.expandMenu("#" + EventsSearcher.idMenu, "#" + EventsSearcher.idMenu + "Expand", "#" + EventsSearcher.idMenu + "Collapse");
        EventsSearcher.expanded = true;
    },

    collapseEventsMenu: function () {
        Utility.collapseMenu("#" + EventsSearcher.idMenu, "#" + EventsSearcher.idMenu + "Expand", "#" + EventsSearcher.idMenu + "Collapse");
        EventsSearcher.expanded = false;
    },

    //callBack
    successQuery: function (response) {
        var arrayToAvoidDuplicateEvents = [];
        if (response.Event.features.length != 0) {
            for (var i = 0; i < response.Event.features.length; i++) {
                Utility.enrichService(response.Event.features[i], i);
                if (response.Event.features[i].properties.name != null) {
                    response.Event.features[i].properties.name = response.Event.features[i].properties.name.replace(/_/g, " ");
                    response.Event.features[i].properties.nameEscaped = Utility.escapeHtml(response.Event.features[i].properties.name).replace(/_/g, " ").toLowerCase();
                }
                response.Event.features[i].properties.imgsrc = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/Event.png', "classic")
            }
            if (response.Event.features[0].properties.distanceFromSearchCenter != null) {
                response.Event.features.sort(function (a, b) {
                    return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter
                });
            } else {
                response.Event.features.sort(function (a, b) {
                    return a.properties.distanceFromGPS - b.properties.distanceFromGPS
                });
            }
        }

        EventsSearcher.results = response;
        EventsSearcher.refreshMenu();
        EventsSearcher.show();

        MapManager.addGeoJSONLayerWithoutArea(response);
    },

    //callBack
    errorQuery: function (error) {
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function () { }, Globalization.alerts.servicesServerError.title);
    }

};
