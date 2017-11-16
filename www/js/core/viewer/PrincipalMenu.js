var PrincipalMenu = {

    open: false,
    secondaryMenuOpen: false,
    fromPrincipalMenu: false,
    fromHomeButton: false,
    suggestionsBadge: 0,
    eventsBadge: 0,
    infoSOCBadge: 0,
    personalAssistantBadge: 0,
    principalMenuButtons: [],
    weatherBadge: 0,
    currentWeatherIcon: "icon ion-ios-partlysunny",
    weatherInterval: null,
    gridster: null,
    draggedButton: null,
    droppedButton: null,
    modifing: false,
    init: true,


    createPrincipalMenu: function () {
        if (PrincipalMenu.principalMenuButtons.length == 0) {
            if (JSON.parse(localStorage.getItem("principalMenuButtons")) != null) {
                PrincipalMenu.principalMenuButtons = JSON.parse(localStorage.getItem("principalMenuButtons"));
            }
        }

        PrincipalMenu.refreshMenu();

        if (PrincipalMenu.init) {
            PrincipalMenu.checkNewButtons();
        } 
    },

    refreshMenu: function () {
        if ($("#principalMenu").length == 0) {
            $("#indexPage").append("<div id=\"principalMenu\"></div>")
        }
        ViewManager.render({ "principalMenuButtons": PrincipalMenu.principalMenuButtons }, '#principalMenu', 'PrincipalMenu');
        for (var i = 0; i < PrincipalMenu.principalMenuButtons.length; i++) {
            if (PrincipalMenu.principalMenuButtons[i] != undefined) {
                $("#" + PrincipalMenu.principalMenuButtons[i].captionId).html(
                           Globalization.labels.principalMenu[PrincipalMenu.principalMenuButtons[i].captionTextId]);
            }
        }
        if (PrincipalMenu.modifing == true) {
            PrincipalMenu.modifyPrincipalMenu();
        } else {
            PrincipalMenu.refreshingBadge();
            
        }
    },

    checkNewButtons: function () {
        $.ajax({
            url: RelativePath.jsonFolder + "principalMenu.json",
            async: false,
            dataType: "json",
            success: function (data) {
                PrincipalMenu.checkButtonsToAdd(data);
                PrincipalMenu.refreshMenu();
                localStorage.setItem("principalMenuButtons", JSON.stringify(PrincipalMenu.principalMenuButtons));
                PrincipalMenu.init = false;
            }
        });
    },

    loadModulesButton: function (fullPath) {
        $.ajax({
            url: fullPath,
            async: false,
            dataType: "json",
            success: function (data) {
                PrincipalMenu.checkButtonsToAdd(data);
            }
        });
    },

    checkButtonsToAdd: function (buttonsToAdd) {
        for (var i = 0; i < buttonsToAdd.length; i++) {
            var j = 0;
            var buttonAlreadyInserted = false;
            while (j < PrincipalMenu.principalMenuButtons.length && !buttonAlreadyInserted) {
                if (PrincipalMenu.principalMenuButtons[j].captionId == buttonsToAdd[i].captionId) {
                    buttonAlreadyInserted = true;
                    if (buttonsToAdd[i].delete != true) {
                        if (buttonsToAdd[i].forceRemoved) {
                            PrincipalMenu.principalMenuButtons[j].removed = buttonsToAdd[i].removed;
                        } else {
                            buttonsToAdd[i].removed = PrincipalMenu.principalMenuButtons[j].removed;
                        }
                        PrincipalMenu.principalMenuButtons.splice(j, 1, buttonsToAdd[i]);
                    } else {
                        PrincipalMenu.principalMenuButtons.splice(j, 1);
                    }
                }
                j++;
            }
            if (!buttonAlreadyInserted && buttonsToAdd[i].delete != true) {
                if (buttonsToAdd[i].index == 0) {
                    var inserted = false;
                    for (var k = 0; k < PrincipalMenu.principalMenuButtons.length; k++) {
                        if (PrincipalMenu.principalMenuButtons[k].removed == true) {
                            PrincipalMenu.principalMenuButtons.splice(k, 0, buttonsToAdd[i]);
                            inserted = true;
                            break;
                        }
                    }
                    if (!inserted) {
                        PrincipalMenu.principalMenuButtons.push(buttonsToAdd[i]);
                    }
                } else {
                    PrincipalMenu.principalMenuButtons.splice(buttonsToAdd[i].index, 0, buttonsToAdd[i]);
                }
            }
        }
        PrincipalMenu.refreshIndexOfMenuButton();
    },

    resetPrincipalMenu: function () {
        $.ajax({
            url: RelativePath.jsonFolder + "principalMenu.json",
            async: false,
            dataType: "json",
            success: function (data) {
                PrincipalMenu.principalMenuButtons = data
            }
        });
        PrincipalMenu.init = true;
        PrincipalMenu.createPrincipalMenu();
    },

    show: function () {
        if (!PrincipalMenu.secondaryMenuOpen || PrincipalMenu.fromHomeButton) {
            PrincipalMenu.createPrincipalMenu();
            $('#principalMenu').show();

            if (device.platform != "Web") {
                screen.orientation.unlock();
                navigator.splashscreen.hide();
            }
            application.resetInterface();
            application.menuToCheckArray = [];
            MapManager.resetMarker();
            MapManager.removeVariableButtons();
            MapManager.addVariableButtons();
            PrincipalMenu.open = true;
            PrincipalMenu.fromPrincipalMenu = false;
            PrincipalMenu.fromHomeButton = false;
            PrincipalMenu.secondaryMenuOpen = false;
            PrincipalMenu.resetWeatherBadge();
            if (Math.abs(localStorage.getItem("latestEventsClickedTime") - (new Date().getTime())) > Parameters.showBadgeAfterThisTime || localStorage.getItem("latestEventsClickedTime") == null) {
                var eventsQuery = QueryManager.createEventsQuery("day", "app");
                APIClient.executeQueryWithoutAlert(eventsQuery, PrincipalMenu.updatingEventsBadge, null);
            }
            if (PrincipalMenu.weatherInterval != null) {
                clearInterval(PrincipalMenu.weatherInterval);
            }
            if (Math.abs(localStorage.getItem("latestWeatherClickedTime") - (new Date().getTime())) > (Parameters.showBadgeAfterThisTime / 2) || localStorage.getItem("latestWeatherClickedTime") == null) {
                PrincipalMenu.weatherInterval = setInterval(function () {
                    if (MapManager.gpsMarkerCoordinates() != null) {
                        var municipalityQuery = QueryManager.createLocationQuery(MapManager.gpsMarkerCoordinates(), "app");
                        APIClient.executeQueryWithoutAlert(municipalityQuery, PrincipalMenu.updatingWeatherBadge, PrincipalMenu.updatingWeatherBadge);
                    }
                }, 5000);
            }

            
            PrincipalMenu.refreshingBadge();
            $("#coverMap").hide();
            $("#loadingOverlayPage").hide();
        } else {
            $('#principalMenu').show();
            PrincipalMenu.open = true;
        }
    },

    hide: function (callback) {
       
        $('#principalMenu').hide();
        if (callback != null) {
            $("#loadingOverlayPage").show();
            setTimeout(function () { $("#loadingOverlayPage").hide(); }, 2000);
        }
        application.setBackButtonListener();
        PrincipalMenu.open = false;

        if (callback != null) {
            setTimeout(function () { callback(); }, 300);
        }
    },

    clickOnLogo: function () {
        if (PrincipalMenu.open && device.platform != "Web") {
            window.plugins.toast.showWithOptions(
                    {
                        message: Globalization.labels.principalMenu.alertLogoMessage,
                        duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself. 
                        position: "bottom",
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0) 
                    },
                    function () { }, // optional
                    function () { }    // optional 
                    );
        } else {
            PrincipalMenu.show();
        }
    },

    updateBadge: function (suggestionsBadge, eventsBadge, weatherBadge, infoSOCBadge, personalAssistantBadge) {
        if (suggestionsBadge != null && suggestionsBadge != 0) {
            PrincipalMenu.suggestionsBadge = suggestionsBadge;
            localStorage.setItem("suggestionsBadge", PrincipalMenu.suggestionsBadge);
        }
        if (eventsBadge != null && eventsBadge != 0) {
            PrincipalMenu.eventsBadge = eventsBadge;
            localStorage.setItem("eventsBadge", PrincipalMenu.eventsBadge);
        }
        if (weatherBadge != null && weatherBadge != 0) {
            PrincipalMenu.weatherBadge = weatherBadge;
            localStorage.setItem("weatherBadge", PrincipalMenu.weatherBadge);
        }
        if (infoSOCBadge != null && infoSOCBadge != 0) {
            PrincipalMenu.infoSOCBadge = infoSOCBadge;
            localStorage.setItem("infoSOCBadge", PrincipalMenu.infoSOCBadge);
        }
        if (personalAssistantBadge != null && personalAssistantBadge != 0) {
            PrincipalMenu.personalAssistantBadge = personalAssistantBadge;
            localStorage.setItem("personalAssistantBadge", PrincipalMenu.personalAssistantBadge);
        }
        PrincipalMenu.refreshingBadge();
    },

    updateProfileIcon: function () {
       //
    },

    updatingEventsBadge: function (response) {
        PrincipalMenu.updateBadge(null, response.Event.features.length);
    },

    updatingWeatherBadge: function (response) {
        if (PrincipalMenu.weatherInterval != null) {
            clearInterval(PrincipalMenu.weatherInterval);
            PrincipalMenu.weatherInterval = null;
        }
        if (response.municipalityUri) {
            var serviceQuery = QueryManager.createServiceQuery(response.municipalityUri, "app");
            APIClient.executeQueryWithoutAlert(serviceQuery, PrincipalMenu.updatingWeatherBadge, null);
        } else if (response.results) {
            PrincipalMenu.updateBadge(null, null, 1);
            $("#principalMenuWeatherIcon").css("font-size", "38px");
            if (response.results.bindings[0].description.value == "sereno") {
                $("#principalMenuWeatherIcon").removeClass().addClass("glyphicon glyphicon-sunglasses");
            } else if (response.results.bindings[0].description.value.indexOf("pioggia") != -1 || response.results.bindings[0].description.value.indexOf("temporale") != -1) {
                $("#principalMenuWeatherIcon").removeClass().addClass("glyphicon glyphicon-tint");
            } else if (response.results.bindings[0].description.value.indexOf("neve") != -1) {
                $("#principalMenuWeatherIcon").removeClass().addClass("glyphicon glyphicon-asterisk");
            } else if (response.results.bindings[0].description.value.indexOf("foschia") != -1 || response.results.bindings[0].description.value.indexOf("nebbia") != -1) {
                $("#principalMenuWeatherIcon").removeClass().addClass("glyphicon glyphicon-align-justify");
            } else {
                $("#principalMenuWeatherIcon").removeClass().addClass("glyphicon glyphicon-cloud");
            }
            PrincipalMenu.currentWeatherIcon = $("#principalMenuWeatherIcon").attr("class");
        }
    },

    resetSuggestionsBadge: function () {
        if (typeof cordova != "undefined") {
            cordova.plugins.notification.badge.clear();
        }
        PrincipalMenu.suggestionsBadge = 0;
        localStorage.setItem("suggestionsBadge", PrincipalMenu.suggestionsBadge);
        PrincipalMenu.refreshingBadge();
        $('#suggestionsBadge').hide();
    },

    resetWeatherBadge: function () {
        PrincipalMenu.weatherBadge = 0;
        localStorage.setItem("weatherBadge", PrincipalMenu.weatherBadge);
        PrincipalMenu.refreshingBadge();
        $('#weatherBadge').hide();
    },

    resetEventsBadge: function () {
        PrincipalMenu.eventsBadge = 0;
        localStorage.setItem("eventsBadge", PrincipalMenu.eventsBadge);
        PrincipalMenu.refreshingBadge();
        $('#eventsBadge').hide();
    },

    resetInfoSOCBadge: function () {
        if (typeof cordova != "undefined") {
            cordova.plugins.notification.badge.clear();
        }
        PrincipalMenu.infoSOCBadge = 0;
        localStorage.setItem("infoSOCBadge", PrincipalMenu.infoSOCBadge);
        PrincipalMenu.refreshingBadge();
        $('#infoSOCBadge').hide();
    },

    resetPersonalAssistantBadge: function () {
        if (typeof cordova != "undefined") {
            cordova.plugins.notification.badge.clear();
        }
        PrincipalMenu.personalAssistantBadge = 0;
        localStorage.setItem("personalAssistantBadge", PrincipalMenu.personalAssistantBadge);
        PrincipalMenu.refreshingBadge();
        $('#personalAssistantBadge').hide();
    },

    refreshingBadge: function () {
        PrincipalMenu.suggestionsBadge = localStorage.getItem("suggestionsBadge");
        if (PrincipalMenu.suggestionsBadge != null) {
            if (PrincipalMenu.suggestionsBadge != 0) {
                $('#suggestionsBadge').html(PrincipalMenu.suggestionsBadge);
                $('#suggestionsBadge').show();

            }
        }
        PrincipalMenu.eventsBadge = localStorage.getItem("eventsBadge");
        if (PrincipalMenu.eventsBadge != null) {
            if (PrincipalMenu.eventsBadge != 0) {
                $('#eventsBadge').html(PrincipalMenu.eventsBadge);
                $('#eventsBadge').show();
            }
        }
        PrincipalMenu.weatherBadge = localStorage.getItem("weatherBadge");
        if (PrincipalMenu.weatherBadge != null) {
            if (PrincipalMenu.weatherBadge != 0) {
                $("#principalMenuWeatherIcon").attr("class", PrincipalMenu.currentWeatherIcon);
                $('#weatherBadge').html(PrincipalMenu.weatherBadge);
                $('#weatherBadge').show();
            }
        }
        PrincipalMenu.infoSOCBadge = localStorage.getItem("infoSOCBadge");
        if (PrincipalMenu.infoSOCBadge != null) {
            if (PrincipalMenu.infoSOCBadge != 0) {
                $('#infoSOCBadge').html(PrincipalMenu.infoSOCBadge);
                $('#infoSOCBadge').show();
            }
        }
        PrincipalMenu.personalAssistantBadge = localStorage.getItem("personalAssistantBadge");
        if (PrincipalMenu.personalAssistantBadge != null) {
            if (PrincipalMenu.personalAssistantBadge != 0) {
                $('#personalAssistantBadge').html(PrincipalMenu.personalAssistantBadge);
                $('#personalAssistantBadge').show();
            } else {
                $('#personalAssistantBadge').hide();
            }
        }

        PrincipalMenu.updateProfileIcon();

        if (device.platform != "Android" && device.platform != "Web") {
            var currentBadge = parseInt(PrincipalMenu.personalAssistantBadge) + parseInt(PrincipalMenu.infoSOCBadge) + parseInt(PrincipalMenu.suggestionsBadge);
            cordova.plugins.notification.badge.set(currentBadge);
        }

    },

    logPrincipalMenuChoices: function (buttonId) {
        if (buttonId != null) {
            var logPrincipalMenuChoicesQuery = QueryManager.createLogPrincipalMenuChoices(buttonId, "app");
            APIClient.executeQueryWithoutAlert(logPrincipalMenuChoicesQuery, PrincipalMenu.logPrincipalMenuChoicesSuccessQuery, null);
        }
    },

    logPrincipalMenuChoicesSuccessQuery: function (data) {
        console.log(JSON.stringify(data));
        console.log("SUCCESS LOG BUTTON");
    },

    modifyPrincipalMenu: function () {
        $("#principalMenuInner div.principalMenuButton").draggable({
            drag: function (event, ui) {
                PrincipalMenu.draggedButton = $(this).data('index');
            },
            containment: "#principalMenuInner",
            revert: "invalid",
            handle: "span.btn-primary",
            zIndex: 2,
            opacity: 0.50
        });
        $("#principalMenuInner div.principalMenuButton").droppable({
            drop: function (event, ui) {
                PrincipalMenu.droppedButton = $(this).data('index');
                PrincipalMenu.swapButtons(PrincipalMenu.draggedButton, PrincipalMenu.droppedButton);
            },
            classes: {
                "ui-droppable-hover": "ui-state-hover",
                "ui-droppable-active": "ui-state-default"
            }
        });
        PrincipalMenu.modifing = true;
        $("#principalMenuInner div.principalMenuButtonRemoved").show();
        $("#principalMenuInner div.ribbon").hide();
        $("#principalMenuInner span.step").hide();
        $('#principalMenuModifyMenuButton').hide();
        $('#principalMenuChangeButtonsDimension').hide();
        $('#principalMenuResetMenuButton').show();
        $('#principalMenuSaveMenuButton').show();
        $("#principalMenuInner span.iconModifing").show();
        $('#principalMenuInner div').prop('onclick', null).off('click');
        $('#principalMenuInner div').css({
            "height": "114px",
            "padding-top": "25px"
        });
        $('#principalMenuInner .textCaption').css({
            "bottom": "26px"
        });

    },

    swapButtons: function (buttonIndex, targetIndex) {
        if (buttonIndex != undefined && targetIndex != undefined) {
            var tempElement = PrincipalMenu.principalMenuButtons[targetIndex];
            PrincipalMenu.principalMenuButtons[targetIndex] = PrincipalMenu.principalMenuButtons[buttonIndex];
            PrincipalMenu.principalMenuButtons[targetIndex].index = targetIndex;
            PrincipalMenu.principalMenuButtons[buttonIndex] = tempElement;
            PrincipalMenu.principalMenuButtons[buttonIndex].index = buttonIndex;
        }
        PrincipalMenu.createPrincipalMenu();
    },

    savePrincipalMenu: function () {
        localStorage.setItem("principalMenuButtons", JSON.stringify(PrincipalMenu.principalMenuButtons));
        PrincipalMenu.modifing = false;
        $("#principalMenuInner div.principalMenuButtonRemoved").hide();
        $('#principalMenuChangeButtonsDimension').show();
        $('#principalMenuModifyMenuButton').show();
        $('#principalMenuResetMenuButton').hide();
        $('#principalMenuSaveMenuButton').hide();
        $("#principalMenuInner span.iconModifing").hide();
        $('#principalMenuInner div').css({
            "height": "70px",
            "padding-top": "5px"
        });
        $('#principalMenuInner .textCaption').css({
            "bottom": "1px"
        });
        PrincipalMenu.createPrincipalMenu();
    },

    removeButtonFromPrincipalMenu: function (buttonIndex) {
        PrincipalMenu.principalMenuButtons[buttonIndex].removed = true;
        PrincipalMenu.principalMenuButtons.push(PrincipalMenu.principalMenuButtons.splice(buttonIndex, 1)[0]);
        PrincipalMenu.refreshIndexOfMenuButton();
        PrincipalMenu.createPrincipalMenu();
    },

    addButtonToPrincipalMenu: function (buttonIndex) {
        for (var i = 0; i < PrincipalMenu.principalMenuButtons.length; i++) {
            if (PrincipalMenu.principalMenuButtons[i].removed == true) {
                if (i != buttonIndex) {
                    PrincipalMenu.principalMenuButtons[buttonIndex].removed = false;
                    PrincipalMenu.principalMenuButtons.splice(i, 0, PrincipalMenu.principalMenuButtons.splice(buttonIndex, 1)[0]);
                    break;
                } else {
                    PrincipalMenu.principalMenuButtons[buttonIndex].removed = false;
                    break;
                }
            }
        }
        PrincipalMenu.refreshIndexOfMenuButton();
        PrincipalMenu.createPrincipalMenu();
    },

    refreshIndexOfMenuButton: function () {
        for (var i = 0; i < PrincipalMenu.principalMenuButtons.length; i++) {
            if (PrincipalMenu.principalMenuButtons[i] != undefined) {
                PrincipalMenu.principalMenuButtons[i].index = i;
            }
        }
    },

    showSecondaryMenu: function (idMenu) {
        $.ajax({
            url: RelativePath.jsonFolder + "secondaryMenu/" + idMenu + ".json",
            async: false,
            dataType: "json",
            success: function (data) {
                ViewManager.render({ "principalMenuButtons": data }, '#principalMenu', 'PrincipalMenu');
                for (var i = 0; i < data.length; i++) {
                    if (data[i] != undefined) {
                        $("#" + data[i].captionId).html(
                                   Globalization.labels.principalMenu[data[i].captionTextId]);
                    }
                }
                application.addingMenuToCheck("PrincipalMenu");
                $("#principalMenuModifyMenuButton").hide();
                $("#principalMenuHeaderTitle").parent().children("img").css({
                    "float": "left",
                    "margin-top": "7px"
                })
                $("#principalMenuHeaderTitle").html("<i class=\"fa fa-home\" style=\"color:#777;font-size: 35px; margin-top: 9px; margin-left: -2px;\"></i>")
                PrincipalMenu.secondaryMenuOpen=true;
            }
        });
    },

    checkForBackButton: function () {
        if (PrincipalMenu.open) {
            PrincipalMenu.secondaryMenuOpen = false;
            application.removingMenuToCheck("PrincipalMenu");
        } else {
            PrincipalMenu.open = true;
        }
        PrincipalMenu.show();
    },

    createLastOperationButton: function (index) {
        if ($("#principalMenuInner div.principalMenuButton[data-index='" + index + "'] i").length != 0) {
            $("#lastOperationInner").html($("#principalMenuInner div.principalMenuButton[data-index='" + index + "'] i").clone());
            $("#lastOperationInner i").css("font-size", "35px");
            $("#lastOperationInner i").attr("id", "lastOperationInnerButton");
        } else if ($("#principalMenuInner div.principalMenuButton[data-index='" + index + "'] img").length != 0) {
            $("#lastOperationInner").html($("#principalMenuInner div.principalMenuButton[data-index='" + index + "'] img").clone());
            $("#lastOperationInner img").css("font-size", "35px");
            $("#lastOperationInner img").attr("id", "lastOperationInnerButton");
        } else if ($("#principalMenuInner div.principalMenuButton[data-index='" + index + "'] b.textIcon").length != 0) {
            $("#lastOperationInner").html($("#principalMenuInner div.principalMenuButton[data-index='" + index + "'] b.textIcon").clone());
            $("#lastOperationInner b").css("font-size", "35px");
            $("#lastOperationInner b").attr("id", "lastOperationInnerButton");
        }
        $("#lastOperationInner").attr("onclick", $("#principalMenuInner div.principalMenuButton[data-index='" + index + "']").attr("onclick"));
    }

};
