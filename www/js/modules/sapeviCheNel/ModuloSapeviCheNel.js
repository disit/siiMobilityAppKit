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
var ModuloSapeviCheNel = {

    TAG: "ModuloSapeviCheNel",
    debug: true,

    open: false,
    expanded: false,
    startWithMenu: false,
    result: null,
    identifierModule: "ModuloSapeviCheNel",
    responseLength: 0,
    temporaryResponse: null,

    //dichiaro gli id della layout
    idMenu: "#idMenu",
    idHandlerMenu: "#idHandlerMenu",
    idExpandMenu: "#idExpandMenu",
    idCollapseMenu: "#idCollapseMenu",
    idHeaderTitleMenu: "#idHeaderTitleMenu",
    idInnerMenu: "#idInnerMenu",

    //dichiaro il nome del template da richiamare
    nameTemplate: "js/modules/sapeviCheNel/LayoutWithMoreResultSapeviCheNel.mst.html",

    setupMenu: function () 
    {
        ModuloSapeviCheNel.print('init setupMenu');
        if ($(ModuloSapeviCheNel.idMenu).length == 0) 
        {
            $("#indexPage").append("<div id=\"idMenu\" class=\"commonHalfMenu\"></div>")
        }

        ViewManager.render(ModuloSapeviCheNel.results, ModuloSapeviCheNel.idMenu, ModuloSapeviCheNel.nameTemplate);
        Utility.movingPanelWithTouch(ModuloSapeviCheNel.idHandlerMenu, ModuloSapeviCheNel.idMenu);
        
        ModuloSapeviCheNel.print('finish setupMenu');
    },

    init: function () 
    {
        ModuloSapeviCheNel.print('on Init');
        ModuloSapeviCheNel.show();
        
        if (ModuloSapeviCheNel.startWithMenu)
        {
            ModuloSapeviCheNel.setupMenu();
            ModuloSapeviCheNel.showMenu();
        }
    },

    reloadMenu: function ()
    {
        ModuloSapeviCheNel.print('on ReloadMenu');
        ModuloSapeviCheNel.setupMenu();
        ModuloSapeviCheNel.showMenu();
    },

    show: function () 
    {
        //mostro il modulo
        application.resetInterface();
        ModuloSapeviCheNel.open = true;
        application.setBackButtonListener();
    },

    hide: function () 
    {
        //chiudo il modulo
        ModuloSapeviCheNel.hideMenu();
        ModuloSapeviCheNel.open = false;
    },

    hideMenu: function ()
    {   
        MapManager.reduceMenuShowMap(ModuloSapeviCheNel.idMenu);
        InfoManager.removingMenuToManage(ModuloSapeviCheNel.identifierModule);
        application.removingMenuToCheck(ModuloSapeviCheNel.identifierModule);
    },

    showMenu: function ()
    {
        MapManager.showMenuReduceMap(ModuloSapeviCheNel.idMenu);
        InfoManager.addingMenuToManage(ModuloSapeviCheNel.identifierModule);
        application.addingMenuToCheck(ModuloSapeviCheNel.identifierModule);
        $(ModuloSapeviCheNel.idCollapseMenu).hide();
    },

    checkForBackButton: function () 
    {
        ModuloSapeviCheNel.print('click back');
        if (ModuloSapeviCheNel.open) 
        {
            ModuloSapeviCheNel.hide();
        }
    },

    closeAll: function () 
    {
        if (ModuloSapeviCheNel.open) 
        {
            ModuloSapeviCheNel.hide();
        }
    },

    expandMenu: function () 
    {
        //viene richiamato al click dell'espand menu
        Utility.expandMenu(ModuloSapeviCheNel.idMenu, ModuloSapeviCheNel.idExpandMenu, ModuloSapeviCheNel.idCollapseMenu);
        ModuloSapeviCheNel.expanded = true;
    },

    collapseMenu: function () 
    {
        //viene richiamato al click del collapse menu
        Utility.collapseMenu(ModuloSapeviCheNel.idMenu, ModuloSapeviCheNel.idExpandMenu, ModuloSapeviCheNel.idCollapseMenu);
        ModuloSapeviCheNel.expanded = false;
    },

    //////////////////// INIT SEARCH QUERY ////////////////////

    search: function () 
    {
        ModuloSapeviCheNel.print('on Search');
        var CulturalActivityQuery = QueryManager.createCategoriesQuery(['CulturalActivity'], SearchManager.searchCenter, "user");
        APIClient.executeQuery(CulturalActivityQuery, ModuloSapeviCheNel.searchInformationForEachFeature, ModuloSapeviCheNel.errorQuery);
    },

    searchInformationForEachFeature(response) 
    {
        ModuloSapeviCheNel.print('on searchInformationForEachFeature');
        for (var category in response) 
        {
            if (response[category].features.length != 0) 
            {
                ModuloSapeviCheNel.responseLength = response[category].features.length;
                ModuloSapeviCheNel.temporaryResponse = 
                {
                    "Results": {
                        "features": [],
                        "fullCount": ModuloSapeviCheNel.responseLength,
                        "type": "FeatureCollection",
                    }
                };

                Loading.showAutoSearchLoading();
                for (var i = 0; i < response[category].features.length; i++) 
                {
                    var serviceQuery = QueryManager.createServiceQuery(response[category].features[i].properties.serviceUri, "app");
                    APIClient.executeQueryWithoutAlert(serviceQuery, ModuloSapeviCheNel.mergeResults, ModuloSapeviCheNel.decrementAndCheckRetrieved);
                }
            } 
            else 
            {
                ModuloSapeviCheNel.print('##startAutoSearch## -> ' + ModuloSapeviCheNel.identifierModule);
                SearchManager.startAutoSearch(ModuloSapeviCheNel.identifierModule);
            }
        } 
        ModuloSapeviCheNel.print('finish searchInformationForEachFeature');
    },

    mergeResults: function (response) 
    {
        ModuloSapeviCheNel.print('on mergeResults');
        for (var category in response) 
        {
            if (response[category].features != null) 
            {
                if (response[category].features.length != 0) 
                {
                    if (response.realtime != null) 
                    {
                        if (response.realtime.results != null) 
                        {
                            if (response.realtime.results.bindings[0] != null) 
                            {
                                
                            }
                        }
                    }
                    ModuloSapeviCheNel.temporaryResponse["Results"].features.push(response[category].features[0]);
                }
            }
        }

        ModuloSapeviCheNel.decrementAndCheckRetrieved();
    },

    decrementAndCheckRetrieved: function()
    {
        ModuloSapeviCheNel.print('on decrementAndCheckRetrieved');
        ModuloSapeviCheNel.responseLength--;

        if (ModuloSapeviCheNel.responseLength == 0) 
        {
            ModuloSapeviCheNel.successQuery(ModuloSapeviCheNel.temporaryResponse);
            Loading.hideAutoSearchLoading();
        }
    },

    //success callBack
    successQuery: function (response) 
    {
        ModuloSapeviCheNel.print('init successQuery');
        var responseObject = response;

        if (SearchManager.typeOfSearchCenter == "selectedServiceMarker") 
        {
            MapManager.searchOnSelectedServiceMarker = true;
        }
        
        for (var i = 0; i < responseObject["Results"].features.length; i++) 
        {
            responseObject["Results"].features[i].id = i;
            Utility.enrichService(responseObject["Results"].features[i], i);
        }
        
        if (responseObject["Results"].features[0].properties.distanceFromSearchCenter != null) 
        {
            responseObject["Results"].features.sort(function (a, b) 
            {
                return a.properties.distanceFromSearchCenter - b.properties.distanceFromSearchCenter
            });
        } 
        else 
        {
            responseObject["Results"].features.sort(function (a, b) 
            {
                return a.properties.distanceFromGPS - b.properties.distanceFromGPS
            });
        }

        ModuloSapeviCheNel.results = responseObject["Results"];
        ModuloSapeviCheNel.reloadMenu();
        MapManager.addGeoJSONLayer(responseObject);
        ModuloSapeviCheNel.resetSearch();
        ModuloSapeviCheNel.print('finish successQuery');
    },

    //callBack
    errorQuery: function(error) 
    {
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function() {}, Globalization.alerts.servicesServerError.title);
    },

    resetSearch: function () 
    {
        QueryManager.resetMaxDists();
        Loading.hideAutoSearchLoading();
    },

    print: function (text)
    {
        if (ModuloSapeviCheNel.debug)
        {
            console.log(ModuloSapeviCheNel.TAG + " : " + text);
        }
    },

    //////////////////// FINISH SEARCH QUERY ////////////////////

}