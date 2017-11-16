var CategorySearcher = {

    openPanelMenu: false,
    open: false,
    results: null,
    expanded: false,
    forceSelectedKeys: null,
    tplSearch: false,
    currentLanguage: null,
    currentProfile: null,
    currentMenu: null,
    activeTree: "categorySearchFancyTree",
    currentMenuAll: null,
    textSize: null,
    defaultTextSize: Parameters.textSizeCategorySearcher,
    idMenu: "resultsMenu",
    varName: "CategorySearcher",

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
                    checkbox: "icon ion-android-checkbox-outline-blank",
                    checkboxSelected: "icon ion-android-done",
                    checkboxUnknown: "icon ion-android-checkbox-outline",
                    error: "glyphicon glyphicon-warning-sign",
                    expanderClosed: "icon ion-chevron-right",
                    expanderLazy: "icon ion-chevron-right",
                    expanderOpen: "icon ion-chevron-up",
                    folder: "glyphicon glyphicon-folder-close",
                    folderOpen: "glyphicon glyphicon-folder-open",
                    loading: "glyphicon glyphicon-refresh"
                }
            },
            persist: {
                cookiePrefix: "categorySearchFancyTree",
                expandLazy: false, // true: recursively expand and load lazy nodes
                overrideSource: true, // true: cookie takes precedence over `source` data attributes.
                store: "local", // 'cookie': use cookie, 'local': use localStore, 'session': use sessionStore
                types: "selected" // which status types to store
            },
            filter: {
                autoApply: false,  // Re-apply last filter if lazy data is loaded
                counter: false,  // Show a badge with number of matching child nodes near parent icons
                fuzzy: false,  // Match single characters in order, e.g. 'fb' will match 'FooBar'
                leavesOnly: true,
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
        $("span.fancytree-checkbox").css("font-size", "24px").css("margin-top", "-1px");
        $("img.fancytree-icon").css("font-size", "24px");
    },

    filterMenu: function () {
        var match = $("input[name=search]").val();
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



    resetFilterMenu: function () {
        $("input[name=search]").val("");
        $("#categorySearchFancyTreeComplete").fancytree("getTree").clearFilter();
        CategorySearcher.activeTree = "categorySearchFancyTree";
        $("#categorySearchFancyTreeComplete").hide(0);
        $("#categorySearchFancyTree").show(0);
        CategorySearcher.selectAll();
    },

    refreshCategoryMenu: function () {
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
                url: RelativePath.jsonFolder + "mapSearchMenu/mapSearchMenu." + SettingsManager.language + "." + profile + ".json",
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
        $("div#categorySearchMenu.ui-panel").css("height", $(window).height() - 55 + "px");
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
            SearchManager.search("CategorySearcher");
            CategorySearcher.hidePanelMenu();
            return false;
        }
        return true;
    },

    showPanelMenu: function () {
        if (CategorySearcher.openPanelMenu == false) {
            CategorySearcher.openPanelMenu = true;
            if (localStorage.getItem("firstStart") == null) {
                CategorySearcher.selectAll();
                localStorage.setItem("firstStart", "false");
            }
            
            application.addingMenuToCheck(CategorySearcher.varName);
            application.setBackButtonListener();
            $('#categorySearchMenu').css('height', $('#content').height() + 'px');
            $("input[name=search]").attr("placeholder", Globalization.labels.categorySearchMenu.filter);
            $('#categorySearchMenuImage').addClass("glyphicon-chevron-right").removeClass("glyphicon-th-list");
        } else {
            CategorySearcher.resetPanel();
        }

    },

    hidePanelMenu: function () {
        $('#categorySearchMenu').panel('close');
        $('#categorySearchMenuImage').removeClass("glyphicon-chevron-right").addClass("glyphicon-th-list");
        CategorySearcher.openPanelMenu = false;
        if (!CategorySearcher.open) {
            application.removingMenuToCheck(CategorySearcher.varName);
        }
    },

    checkForBackButton: function () {
        if (CategorySearcher.open && !CategorySearcher.openPanelMenu) {
            CategorySearcher.hide();
        }
        if (CategorySearcher.openPanelMenu) {
            CategorySearcher.hidePanelMenu();
        }
    },

    refreshMenuPosition: function () {
        if (CategorySearcher.open) {
            MapManager.showMenuReduceMap("#" + CategorySearcher.idMenu);
            Utility.checkAxisToDrag("#" + CategorySearcher.idMenu);
            if (CategorySearcher.expanded) {
                CategorySearcher.expandResultsMenu();
            }
        }
        CategorySearcher.rescaleFontSize();
    },

    closeAll: function () {
            CategorySearcher.hidePanelMenu();
            CategorySearcher.hide();
    },

    refreshMenu: function () {
        if ($("#" + CategorySearcher.idMenu).length == 0) {
            $("#indexPage").append("<div id=\"" + CategorySearcher.idMenu + "\" class=\"commonHalfMenu\"></div>")
        }
        ViewManager.render(CategorySearcher.results, "#" + CategorySearcher.idMenu, "ResultsMenu");
        Utility.movingPanelWithTouch("#" + CategorySearcher.idMenu + "ExpandHandler", "#" + CategorySearcher.idMenu);
    },

    expandResultsMenu: function () {
        Utility.expandMenu("#" + CategorySearcher.idMenu, "#" + CategorySearcher.idMenu + "Expand", "#" + CategorySearcher.idMenu + "Collapse");
        CategorySearcher.expanded = true;
    },

    collapseResultsMenu: function () {
        Utility.collapseMenu("#" + CategorySearcher.idMenu, "#" + CategorySearcher.idMenu + "Expand", "#" + CategorySearcher.idMenu + "Collapse");
        CategorySearcher.expanded = false;
    },

    show: function () {
        application.resetInterface();
        MapManager.showMenuReduceMap("#" + CategorySearcher.idMenu);
        $("#" + CategorySearcher.idMenu + "Collapse").hide();
        CategorySearcher.open = true;
        InfoManager.addingMenuToManage(CategorySearcher.varName);
        application.addingMenuToCheck(CategorySearcher.varName);
        application.setBackButtonListener();
    },

    showWithoutResetInterface: function () {
        MapManager.showMenuReduceMap("#" + CategorySearcher.idMenu);
        $("#" + CategorySearcher.idMenu + "Collapse").hide();
        CategorySearcher.open = true;
        InfoManager.removingMenuToManage(CategorySearcher.varName);
        application.removingMenuToCheck(CategorySearcher.varName);
        InfoManager.addingMenuToManage(CategorySearcher.varName);
        application.addingMenuToCheck(CategorySearcher.varName);
        application.setBackButtonListener();
    },



    hide: function () {
        $("#" + CategorySearcher.idMenu).css({ 'z-index': '1001' });
        MapManager.reduceMenuShowMap("#" + CategorySearcher.idMenu);
        CategorySearcher.open = false;
        InfoManager.removingMenuToManage(CategorySearcher.varName);
        application.removingMenuToCheck(CategorySearcher.varName);
    },

    resetPanel: function () {
        CategorySearcher.openPanelMenu = false;
        $('#categorySearchMenuImage').toggleClass("glyphicon-chevron-right glyphicon-th-list");
        if (!CategorySearcher.open) {
            application.removingMenuToCheck(CategorySearcher.varName);
        }
        application.resetBackButtonListener();
    },

    resetSearch: function () {
        CategorySearcher.forceSelectedKeys = null;
        QueryManager.resetMaxDists();
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
            } else {
                emptyCategory++;
                if (emptyCategory == lengthCategory) {
                    SearchManager.startAutoSearch(CategorySearcher.varName);
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

            CategorySearcher.results = responseObject["Results"];
            CategorySearcher.refreshMenu();
            CategorySearcher.show();
            MapManager.addGeoJSONLayer(responseObject);
            CategorySearcher.resetSearch();
            $("#categorySearchGoButton").css("width", "50%");
            $("#categorySearchLastResultsButton").show();
        }
    },

    lastResults: function () {
        CategorySearcher.refreshMenu();
        CategorySearcher.show();
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
    }

};
