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
var CategorySearcher = {

    open: false,
    openResultsMenu: false,
    results: null,
    expanded: false,
    searchStarted: false,
    autoSearchStarted: false,
    forceSelectedKeys: null,
    tplSearch: false,
    currentLanguage: null,
    currentProfile: null,
    currentMenu: null,
    activeTree: "categorySearchFancyTree",
    currentMenuAll: null,
    textSize: null,
    defaultTextSize: Parameters.textSizeCategorySearcher,
    newStart: true,

    createMenu: function (divId, source, profile) {
        $("#" + divId).fancytree({
            source: source,
            extensions: ["glyph", "persist", "filter"],
            checkbox: true,
            selectMode: 3,
            imagePath: RelativePath.images,
            clickFolderMode: 2,
            click: function (event, data) {
                if (!data.node.folder) {
                    data.node.toggleSelected();
                    return false;
                }
            },
            glyph: {
                map: {
                    doc: "glyphicon glyphicon-file",
                    docOpen: "glyphicon glyphicon-file",
                    checkbox: "glyphicon glyphicon-unchecked",
                    checkboxSelected: "glyphicon glyphicon-check",
                    checkboxUnknown: "glyphicon glyphicon-share",
                    error: "glyphicon glyphicon-warning-sign",
                    expanderClosed: "glyphicon glyphicon-chevron-right",
                    expanderLazy: "glyphicon glyphicon-chevron-right",
                    // expanderLazy: "glyphicon glyphicon-expand",
                    expanderOpen: "glyphicon glyphicon-chevron-down",
                    // expanderOpen: "glyphicon glyphicon-collapse-down",
                    folder: "glyphicon glyphicon-folder-close",
                    folderOpen: "glyphicon glyphicon-folder-open",
                    loading: "glyphicon glyphicon-refresh"
                    // loading: "icon-spinner icon-spin"
                }
            },
            persist: {
                // Available options with their default:
                cookieDelimiter: "~", // character used to join key strings
                cookiePrefix: undefined, // 'fancytree-<treeId>-' by default
                cookie: { // settings passed to jquery.cookie plugin
                    raw: false,
                    expires: "",
                    path: "",
                    domain: "",
                    secure: false
                },
                expandLazy: false, // true: recursively expand and load lazy nodes
                overrideSource: true, // true: cookie takes precedence over `source` data attributes.
                store: "local", // 'cookie': use cookie, 'local': use localStore, 'session': use sessionStore
                types: "selected" // which status types to store
            },
            filter: {
                autoApply: true,  // Re-apply last filter if lazy data is loaded
                counter: true,  // Show a badge with number of matching child nodes near parent icons
                fuzzy: false,  // Match single characters in order, e.g. 'fb' will match 'FooBar'
                hideExpandedCounter: true,  // Hide counter badge, when parent is expanded
                highlight: false,  // Highlight matches by wrapping inside <mark> tags
                nodata: Globalization.labels.categorySearchMenu.noService,
                mode: "hide"  // Grayout unmatched nodes (pass "hide" to remove unmatched node instead)
            }
        });

        CategorySearcher.rescaleFontSize();
        if (profile != "all") {
            $(".fancytree-exp-n span.fancytree-expander, .fancytree-exp-nl span.fancytree-expander").css("width", "0px");
            $("span.fancytree-checkbox").css("margin-left", "0.2em");
        }
    },

    filterTplResults: function(){
        var match = $("input[name=filterTplResults]").val();
        var resultsFilteredObject = {
            "Results": {
                "fullCount": CategorySearcher.results.features.length,
                "type": "FeatureCollection",
                "features": [],
                "tplSearch": true
            }
        };

        for (var i = 0; i < CategorySearcher.results.features.length; i++) {
            if (CategorySearcher.results.features[i].properties.busLines != null) {
                if (CategorySearcher.results.features[i].properties.busLines.indexOf(match) !== -1) {
                    resultsFilteredObject["Results"].features.push(CategorySearcher.results.features[i]);
                }
            }
        }

        ViewManager.render(resultsFilteredObject["Results"], "#resultsMenu", "ResultsMenu");
        $('#collapseResultsMenu').hide();
        $("input[name=filterTplResults]").val(match);
        $("input[name=filterTplResults]").attr("placeholder", Globalization.labels.categorySearchMenu.filterLines);
        $("#resultsMenuInner").css("top", "92px");
        MapManager.addGeoJSONLayer(resultsFilteredObject);
    },

    resetFilterTplResults: function () {
        $("input[name=filterTplResults]").val("");
        CategorySearcher.showResultsMenu(CategorySearcher.results);
        $("input[name=filterTplResults]").attr("placeholder", Globalization.labels.categorySearchMenu.filterLines);
        $("#resultsMenuInner").css("top", "92px");
        MapManager.addGeoJSONLayer({ "Results": CategorySearcher.results });
    },

    filterMenu: function () {
           var match =  $("input[name=search]").val();
           if (match.length >= 2) {
               CategorySearcher.activeTree = "categorySearchFancyTreeComplete";
               CategorySearcher.selectAll();
               $("#categorySearchFancyTreeComplete").show(0);
               $("#categorySearchFancyTree").hide(0);
               var opts = 
                $("#categorySearchFancyTreeComplete").fancytree("getTree").filterNodes(match, {
                    autoExpand: true,
                    leavesOnly: true
                });
            } else if (match == "") {
                $("#categorySearchFancyTreeComplete").fancytree("getTree").clearFilter();
                CategorySearcher.activeTree = "categorySearchFancyTree";
                $("#categorySearchFancyTreeComplete").hide(0);
                $("#categorySearchFancyTree").show(0);
            }
    },

    

    resetFilterMenu: function(){
        $("input[name=search]").val("");
        $("#categorySearchFancyTreeComplete").fancytree("getTree").clearFilter();
        CategorySearcher.activeTree = "categorySearchFancyTree";
        $("#categorySearchFancyTreeComplete").hide(0);
        $("#categorySearchFancyTree").show(0);
        CategorySearcher.selectAll();
    },

    refreshMenu: function () {
        if (CategorySearcher.textSize != SettingsManager.textSize) {
            CategorySearcher.textSize = SettingsManager.textSize;
        }
        if (CategorySearcher.currentLanguage != SettingsManager.language || CategorySearcher.currentProfile != SettingsManager.profile) {
            CategorySearcher.currentLanguage = SettingsManager.language;
            CategorySearcher.currentProfile = SettingsManager.profile;
            ViewManager.render(null, "#categorySearchMenu", "CategorySearchMenu");
            if (application.checkConnection()) {
                $.ajax({
                    url: "http://www.disit.org/km4city/mapSearchMenu/mapSearchMenu." + SettingsManager.language + "." + SettingsManager.profile + ".json",
                    cache: false,
                    timeout: Parameters.timeoutGettingMenuCategorySearcher,
                    dataType: "json",
                    beforeSend: function () {
                        Loading.showSettingsLoading();
                    },
                    success: function (data) {
                        CategorySearcher.currentMenu = data;
                        localStorage.setItem("categorySearchMenu." + SettingsManager.language + "." + SettingsManager.profile + ".json", JSON.stringify(data));
                        CategorySearcher.createMenu("categorySearchFancyTree", CategorySearcher.currentMenu, SettingsManager.profile);
                    },
                    error: function (data) {
                        CategorySearcher.currentMenu = CategorySearcher.searchMenuLocally(SettingsManager.profile);
                        CategorySearcher.createMenu("categorySearchFancyTree", CategorySearcher.currentMenu, SettingsManager.profile);
                    },
                    complete: function () {
                        Loading.hideSettingsLoading();
                    }

                });
                $.ajax({
                    url: "http://www.disit.org/km4city/mapSearchMenu/mapSearchMenu." + SettingsManager.language + ".all.json",
                    cache: false,
                    timeout: Parameters.timeoutGettingMenuCategorySearcher,
                    dataType: "json",
                    beforeSend: function () {
                        Loading.showSettingsLoading();
                    },
                    success: function (data) {
                        CategorySearcher.currentMenuAll = data;
                        localStorage.setItem("categorySearchMenu." + SettingsManager.language + ".all.json", JSON.stringify(data));
                        CategorySearcher.createMenu("categorySearchFancyTreeComplete", CategorySearcher.currentMenuAll, "all");
                    },
                    error: function (data) {
                        CategorySearcher.currentMenuAll = CategorySearcher.searchMenuLocally("all");
                        CategorySearcher.createMenu("categorySearchFancyTreeComplete", CategorySearcher.currentMenuAll, "all");
                    },
                    complete: function () {
                        Loading.hideSettingsLoading();
                    }

                });
            } else {
                CategorySearcher.currentMenu = CategorySearcher.searchMenuLocally(SettingsManager.profile);
                CategorySearcher.createMenu("categorySearchFancyTree", CategorySearcher.currentMenu, SettingsManager.profile);
                CategorySearcher.currentMenuAll = CategorySearcher.searchMenuLocally("all");
                CategorySearcher.createMenu("categorySearchFancyTreeComplete", CategorySearcher.currentMenuAll, "all");
            }
            CategorySearcher.activeTree = "categorySearchFancyTree";

        }

        CategorySearcher.rescaleFontSize();



    },

    searchMenuLocally: function (profile) {
        var currentMenu = null;
        if (localStorage.getItem("categorySearchMenu." + SettingsManager.language + "." + profile + ".json") != null) {
            currentMenu = JSON.parse(localStorage.getItem("categorySearchMenu." + SettingsManager.language + "." + profile + ".json"));
        }
        if (currentMenu == null) {
            $.ajax({
                url: "js/core/data/json/mapSearchMenu/mapSearchMenu." + SettingsManager.language + "." + profile + ".json",
                async: false,
                dataType: "json",
                success: function (data) {
                    currentMenu = data;
                }
            });
        }
        return currentMenu;
    },

    deselectAll: function () {
        $("#" + CategorySearcher.activeTree).fancytree("getTree").visit(function (node) {
            node.setSelected(false);
        });
        return false;
    },

    selectAll: function () {
        $("#" + CategorySearcher.activeTree).fancytree("getTree").visit(function (node) {
            node.setSelected(true);
        });
        return false;
    },

    resetMenu: function () {
        $("#" + CategorySearcher.activeTree).fancytree("getTree").visit(function (node) {
            node.setExpanded(false);
        });
        CategorySearcher.deselectAll();
    },

    rescaleFontSize: function () {
        var currentTextSize = CategorySearcher.textSize;
        $("div#categorySearchMenu.ui-panel").css("height",$(window).height() - 55 + "px");
        if (currentTextSize == 26) {
            if ($(window).width() > Parameters.veryLargePanelCategorySearcher) {
                $("div#categorySearchMenu.ui-panel").css("width", Parameters.veryLargePanelCategorySearcher + "px");
            } else {
                currentTextSize = 24;
            }
        }
        if (currentTextSize == 24) {
            if ($(window).width() > Parameters.largePanelCategorySearcher) {
                $("div#categorySearchMenu.ui-panel").css("width", Parameters.veryLargePanelCategorySearcher + "px");
            } else {
                currentTextSize = 22;
            }
        }
        if (currentTextSize == 22) {
            if ($(window).width() > Parameters.mediumPanelCategorySearcher) {
                $("div#categorySearchMenu.ui-panel").css("width", Parameters.mediumPanelCategorySearcher + "px");
            } else {
                currentTextSize = 20;
            }
        }
        if (currentTextSize == 20) {
            if ($(window).width() > Parameters.normalPanelCategorySearcher) {
                $("div#categorySearchMenu.ui-panel").css("width", Parameters.normalPanelCategorySearcher + "px");
            } else {
                currentTextSize = 18;
            }
        }
        if (currentTextSize == 18) {
            if ($(window).width() > Parameters.smallPanelCategorySearcher) {
                $("div#categorySearchMenu.ui-panel").css("width", Parameters.smallPanelCategorySearcher + "px");
            } else {
                currentTextSize = 16;
            }
        }
        if (currentTextSize == 16) {
            if ($(window).width() > Parameters.verySmallPanelCategorySearcher) {
                $("div#categorySearchMenu.ui-panel").css("width", Parameters.verySmallPanelCategorySearcher + "px");
            }
        }
        $("#categorySearchFancyTree").children("ul.fancytree-container").css("font-size", currentTextSize + "px");
        $("#categorySearchFancyTreeComplete").children("ul.fancytree-container").css("font-size", currentTextSize + "px");

    },

    search: function (forceSelection) {
        CategorySearcher.searchStarted = true;
        MapManager.resetMapInterface();
        if (SearchManager.searchCenter != null) {
            var selectedNodeNumber = $("#" + CategorySearcher.activeTree).fancytree("getTree").getSelectedNodes().length;

            if (selectedNodeNumber == 0 && CategorySearcher.forceSelectedKeys == null) {

                navigator.notification.alert(Globalization.alerts.servicesCategoryNotSelected.message, function () { }, Globalization.alerts.servicesCategoryNotSelected.title);

                return false;
            }
    
            var selectedKeys = ["Service"];
            if ($("#" + CategorySearcher.activeTree).fancytree("getTree").isFilterActive()) {
                selectedKeys = []
                selectedKeys = $.map($("#" + CategorySearcher.activeTree).fancytree("getTree").getSelectedNodes(), function (node) {
                    if (node.isMatched() && !node.hasChildren()) {
                        return node.key;
                    }
                });
            } else if (selectedNodeNumber != $("#" + CategorySearcher.activeTree).fancytree("getTree").count() || SettingsManager.profile != "all") {
                selectedKeys = $.map($("#" + CategorySearcher.activeTree).fancytree("getTree").getSelectedNodes(true), function (node) {
                        return node.key;
                });
            }

            if (selectedKeys.length == 0 && CategorySearcher.forceSelectedKeys == null) {
                navigator.notification.alert(Globalization.alerts.servicesCategoryNotSelected.message, function () { }, Globalization.alerts.servicesCategoryNotSelected.title);
                return false;
            }

            if (CategorySearcher.forceSelectedKeys != null) {
                selectedKeys = CategorySearcher.forceSelectedKeys;
            } 
            var categoriesQuery = QueryManager.createCategoriesQuery(selectedKeys, SearchManager.searchCenter, "user");
            APIClient.executeQuery(categoriesQuery, CategorySearcher.successQuery, CategorySearcher.errorQuery);
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

    onKeyEnter: function (event) {
        if (event.which == 13 || event.keyCode == 13) {
            //code to execute here
            SearchManager.search('categories');
            CategorySearcher.hide();
            return false;
        }
        return true;
    },

    onFilterEnter: function (event) {
        if (event.which == 13 || event.keyCode == 13) {
            //code to execute here
            CategorySearcher.filterTplResults();
            return false;
        }
        return true;
    },

    show: function () {
        if (CategorySearcher.open == false) {
            CategorySearcher.open = true;
            if (CategorySearcher.newStart != true || localStorage.getItem("firstStart") == null) {
                CategorySearcher.selectAll();
            }
            localStorage.setItem("firstStart", "false");
            CategorySearcher.newStart = false;
            application.setBackButtonListener();
            $('#categorySearchMenu').css('height', $('#content').height() + 'px');
            $("input[name=search]").val(""); 
            $("input[name=search]").attr("placeholder", Globalization.labels.categorySearchMenu.filter);
            $('#categorySearchMenuImage').addClass("glyphicon-chevron-right").removeClass("glyphicon-th-list");
        } else {
            CategorySearcher.resetPanel();
        }

    },

    hide: function () {
        $('#categorySearchMenu').panel('close');
        $('#categorySearchMenuImage').removeClass("glyphicon-chevron-right").addClass("glyphicon-th-list");
        CategorySearcher.open = false;
    },

    expandResultsMenu: function () {
        Utility.expandMenu("#resultsMenu", "#expandResultsMenu", "#collapseResultsMenu");
        CategorySearcher.expanded = true;
    },

    collapseResultsMenu: function () {
        Utility.collapseMenu("#resultsMenu", "#expandResultsMenu", "#collapseResultsMenu");
        CategorySearcher.expanded = false;
    },

    showResultsMenu: function (results) {
        ViewManager.render(results, "#resultsMenu", "ResultsMenu");
        MapManager.showMenuReduceMap('#resultsMenu');
        $('#collapseResultsMenu').hide();
        Utility.movingPanelWithTouch("#resultsMenuExpandHandler", "#resultsMenu");
        CategorySearcher.openResultsMenu = true;
        application.setBackButtonListener();
    },

    hideResultsMenu: function () {
        $('#resultsMenu').css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap('#resultsMenu');
        CategorySearcher.openResultsMenu = false;
        CategorySearcher.tplSearch = false;
    },

    resetPanel: function () {
        CategorySearcher.open = false;
        $('#categorySearchMenuImage').toggleClass("glyphicon-chevron-right glyphicon-th-list");
        application.resetBackButtonListener();
    },

    resetSearch: function () {
        CategorySearcher.searchStarted = false;
        CategorySearcher.autoSearchStarted = false;
        CategorySearcher.forceSelectedKeys = null;
        Loading.hideAutoSearchLoading();
    },


    //callBack
    successQuery: function (response) {
        var lengthCategory = 0;
        var emptyCategory = 0;
        var responseObject = {
            "Results": {
                "fullCount": 0,
                "type": "FeatureCollection",
                "features": []
            }
        };
        for (var category in response) {
            lengthCategory++;
        }
      
        for (var category in response) {
            if (response[category].features.length != 0) {
                responseObject["Results"].features = responseObject["Results"].features.concat(response[category].features);
                responseObject["Results"].fullCount = responseObject["Results"].fullCount + response[category].fullCount;
                CategorySearcher.resetSearch();
            } else {
                emptyCategory++;
                if (emptyCategory == lengthCategory) {
                    CategorySearcher.startAutoSearch();
                }

            }
            
        }
        if (SearchManager.typeOfSearchCenter == "selectedServiceMarker") {
            MapManager.searchOnSelectedServiceMarker = true;
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

            responseObject["Results"].tplSearch = CategorySearcher.tplSearch;

            CategorySearcher.results = responseObject["Results"];
            CategorySearcher.showResultsMenu(CategorySearcher.results);
            MapManager.lastSearchPerformed = "#resultsMenu";
            MapManager.addGeoJSONLayer(responseObject);
            QueryManager.resetMaxDists();
            if (responseObject["Results"].tplSearch) {
                $("input[name=filterTplResults]").attr("placeholder", Globalization.labels.categorySearchMenu.filterLines);
                $("#resultsMenuInner").css("top", "92px");
            }
            $("#categorySearchGoButton").css("width", "50%");
            $("#categorySearchLastResultsButton").show();
        }
    },

    lastResults: function () {
        
        CategorySearcher.showResultsMenu(CategorySearcher.results);
        MapManager.lastSearchPerformed = "#resultsMenu";
        MapManager.addGeoJSONLayerWithoutArea({ "Results": CategorySearcher.results });
        if (CategorySearcher.results.tplSearch) {
            $("input[name=filterTplResults]").attr("placeholder", Globalization.labels.categorySearchMenu.filterLines);
            $("#resultsMenuInner").css("top", "92px");
        }
    },

    //callBack
    errorQuery: function (error) {
        CategorySearcher.resetSearch();
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function () { }, Globalization.alerts.servicesServerError.title);
    },

    startAutoSearch: function () {
        var resultOfIncrease = QueryManager.increaseMaxDistTemporary();
        if (resultOfIncrease == true) {
            if (CategorySearcher.searchStarted == true) {
                CategorySearcher.autoSearchStarted = true;
                Loading.showAutoSearchLoading();
                CategorySearcher.search();
            }
        } else {
            var responseObject = {
                "Results": {
                    "fullCount": 0,
                    "type": "FeatureCollection",
                    "features": []
                }
            };
            MapManager.addGeoJSONLayer(responseObject);
            CategorySearcher.resetSearch();
            QueryManager.resetMaxDists();
            navigator.notification.alert(Globalization.alerts.overMaxDistance.message, function () {}, Globalization.alerts.overMaxDistance.title);
        }
    }

}