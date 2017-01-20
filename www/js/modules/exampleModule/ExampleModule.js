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
var ExampleModule = {

    open: false,
    expanded: false,
    result: null,
    varName: "ExampleModule",
    idMenu: "exampleMenu",

    refreshMenu: function () {
        if ($("#" + ExampleModule.idMenu).length == 0) {
            $("#indexPage").append("<div id=\"" + ExampleModule.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(ExampleModule.results, "#" + ExampleModule.idMenu, "ExampleMenu");
        Utility.movingPanelWithTouch("#" + ExampleModule.idMenu + "ExpandHandler", "#" + ExampleModule.idMenu);
    },

    show: function () {
        application.resetInterface();
        MapManager.showMenuReduceMap("#" + ExampleModule.idMenu);
        $("#" + ExampleModule.idMenu + "Collapse").hide();
        ExampleModule.open = true;
        InfoManager.addingMenuToManage(ExampleModule.varName);
        application.addingMenuToCheck(ExampleModule.varName);
        application.setBackButtonListener();
    },

    hide: function () {
        $("#" + ExampleModule.idMenu).css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap("#" + ExampleModule.idMenu);
        InfoManager.removingMenuToManage(ExampleModule.varName);
        application.removingMenuToCheck(ExampleModule.varName);
        ExampleModule.open = false;
    },

    checkForBackButton: function () {
        if (ExampleModule.open) {
            ExampleModule.hide();
        }
    },

    refreshMenuPosition: function () {
        if (ExampleModule.open) {
            MapManager.showMenuReduceMap("#" + ExampleModule.idMenu);
            Utility.checkAxisToDrag("#" + ExampleModule.idMenu);
            if (ExampleModule.expanded) {
                ExampleModule.expandBusRoutesMenu();
            }
        }
    },

    closeAll: function () {
        if (ExampleModule.open) {
            ExampleModule.hide();
        }
    },

    expandExampleModule: function () {
        Utility.expandMenu("#" + ExampleModule.idMenu, "#" + ExampleModule.idMenu + "Expand", "#" + ExampleModule.idMenu + "Collapse");
        ExampleModule.expanded = true;
    },

    collapseExampleModule: function () {
        Utility.collapseMenu("#" + ExampleModule.idMenu, "#" + ExampleModule.idMenu + "Expand", "#" + ExampleModule.idMenu + "Collapse");
        ExampleModule.expanded = false;
    },

    //callBack
    successQuery: function (response) {
        //SearchManager.startAutoSearch(ExampleModule.varName);
        ExampleModule.results = response;
        ExampleModule.refreshMenu();
        ExampleModule.show();
        MapManager.addGeoJSONLayerWithoutArea(response);
        //MapManager.addGeoJSONLayer(response);
        ExampleModule.resetSearch();
    },

    //callBack
    errorQuery: function(error) {
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function() {}, Globalization.alerts.servicesServerError.title);
    },

    resetSearch: function () {
        QueryManager.resetMaxDists();
        Loading.hideAutoSearchLoading();
    },

}