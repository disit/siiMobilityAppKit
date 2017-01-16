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

    refreshMenu: function () {
        if ($("#exampleMenu").length == 0) {
            $("#indexPage").append("<div id=\"exampleMenu\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(ExampleModule.results, "#exampleMenu", "ExampleMenu");
        Utility.movingPanelWithTouch("#exampleMenuExpandHandler", "#exampleMenu");
    },

    show: function () {
        MapManager.resetMapInterface();
        MapManager.showMenuReduceMap('#exampleMenu');
        $('#collapseExampleMenu').hide();
        ExampleModule.open = true;
        application.addingMenuToCheck("ExampleModule");
        application.setBackButtonListener();
    },

    hide: function () {
        $('#exampleMenu').css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap('#exampleMenu');
        application.removingMenuToCheck("ExampleModule");
        ExampleModule.open = false;
    },

    checkForBackButton: function () {
        if (ExampleModule.open) {
            ExampleModule.hide();
        }
    },

    expandExampleModule: function () {
        Utility.expandMenu("#exampleMenu", "#expandExampleMenu", "#collapseExampleMenu");
        ExampleModule.expanded = true;
    },

    collapseExampleModule: function () {
        Utility.collapseMenu("#exampleMenu", "#expandExampleMenu", "#collapseExampleMenu");
        ExampleModule.expanded = false;
    },

    //callBack
    successQuery: function(response) {
        ExampleModule.results = response;
        ExampleModule.refreshMenu();
        ExampleModule.show();
         
         MapManager.addGeoJSONLayerWithoutArea(response);
    },

    //callBack
    errorQuery: function(error) {
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function() {}, Globalization.alerts.servicesServerError.title);
    }

}