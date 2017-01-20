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
var BusRoutesSearcher = {

    infoRouteModalOpen: false,
    open: false,
    expanded: false,
    results: null,
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
        if (BusRoutesSearcher.open) {
            BusRoutesSearcher.hide();
        }
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

    drawRoute: function(routeNumber){
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
            MapManager.addSelectedGeometry(results["Route"].wktGeometry);
            BusRoutesSearcher.refreshMenu();
            BusRoutesSearcher.show();
        }

    },

    errorQuery: function (error) {
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function () { }, Globalization.alerts.servicesServerError.title);
    },

    refreshMenu: function () {
        if ($("#" + BusRoutesSearcher.idMenu).length == 0) {
            $("#indexPage").append("<div id=\""+ BusRoutesSearcher.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(BusRoutesSearcher.results, "#" + BusRoutesSearcher.idMenu, "BusRoutesMenu");
        Utility.movingPanelWithTouch( "#" + BusRoutesSearcher.idMenu + "ExpandHandler", "#" + BusRoutesSearcher.idMenu);
    }
}