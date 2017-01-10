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
var PrincipalMenu = {

    open: false,
    fromPrincipalMenu: false,
    suggestionsBadge: 0,
    eventsBadge: 0,
    principalMenuButtons: [],
    draggedButton: null,
    droppedButton: null,
    modifing: false,


    createPrincipalMenu: function () {
        if (PrincipalMenu.principalMenuButtons.length == 0) {
            PrincipalMenu.principalMenuButtons = JSON.parse(localStorage.getItem("principalMenuButtons"));
        }
        if (PrincipalMenu.principalMenuButtons == null) {
            $.ajax({
                url: RelativePath.jsonFolder + "principalMenu.json",
                async: false,
                dataType: "json",
                success: function (data) {
                    PrincipalMenu.principalMenuButtons = data
                }
            });
        }
        ViewManager.render({ "principalMenuButtons": PrincipalMenu.principalMenuButtons }, '#principalMenu', 'PrincipalMenu');
        for (var i = 0; i < PrincipalMenu.principalMenuButtons.length; i++) {
            if (PrincipalMenu.principalMenuButtons[i] != undefined) {
                $("#" + PrincipalMenu.principalMenuButtons[i].captionId).html(
                           Globalization.labels.principalMenu[PrincipalMenu.principalMenuButtons[i].captionTextId]);
            }
        }
        $("#principalMenuInner div.principalMenuButton").on("taphold", function (event) { PrincipalMenu.modifyPrincipalMenu();} )
        if (PrincipalMenu.modifing == true) {
            PrincipalMenu.modifyPrincipalMenu();
        }

    },

    resetPrincipalMenu: function(){
        $.ajax({
            url: RelativePath.jsonFolder + "principalMenu.json",
            async: false,
            dataType: "json",
            success: function (data) {
                PrincipalMenu.principalMenuButtons = data
            }
        });
        PrincipalMenu.createPrincipalMenu();
    },

    show: function () {
        PrincipalMenu.createPrincipalMenu();
        $('#principalMenu').show();
        MapManager.resetMapInterface();
        MapManager.resetMarker();
        PrincipalMenu.open = true;
        PrincipalMenu.fromPrincipalMenu = false;
        if (Math.abs(localStorage.getItem("latestEventsClickedTime") - (new Date().getTime())) > Parameters.showBadgeAfterThisTime || localStorage.getItem("latestEventsClickedTime") == null) {
            var eventsQuery = QueryManager.createEventsQuery("day", "app");
            APIClient.executeQueryWithoutAlert(eventsQuery, PrincipalMenu.updatingEventsBadge, null);
        }
        if (PrincipalMenu.weatherInterval != null) {
            clearInterval(PrincipalMenu.weatherInterval);
        }
        PrincipalMenu.refreshingBadge();
    },

    hide: function() {
        $('#principalMenu').hide(Parameters.hidePanelGeneralDuration);
        application.setBackButtonListener();
        PrincipalMenu.open = false;
    },

    clickOnLogo: function(){
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
        if (eventsBadge != null && eventsBadge != 0) {
            PrincipalMenu.eventsBadge = eventsBadge;
            localStorage.setItem("eventsBadge", PrincipalMenu.eventsBadge);
        }
        PrincipalMenu.refreshingBadge();
    },

    updatingEventsBadge: function(response){
        PrincipalMenu.updateBadge(null, response.Event.features.length);
    },

    resetEventsBadge: function () {
        PrincipalMenu.eventsBadge = 0;
        localStorage.setItem("eventsBadge", PrincipalMenu.eventsBadge);
        PrincipalMenu.refreshingBadge();
        $('#eventsBadge').hide();
    },

    refreshingBadge: function () {
        PrincipalMenu.eventsBadge = localStorage.getItem("eventsBadge");
        if (PrincipalMenu.eventsBadge != null) {
            if (PrincipalMenu.eventsBadge != 0) {
                $('#eventsBadge').html(PrincipalMenu.eventsBadge);
                $('#eventsBadge').show();
            }
        }
    },

    logPrincipalMenuChoices: function (buttonId) {
        if (buttonId != null ) {
            var logPrincipalMenuChoicesQuery = QueryManager.createLogPrincipalMenuChoices(buttonId, "app");
            APIClient.executeQueryWithoutAlert(logPrincipalMenuChoicesQuery, PrincipalMenu.logPrincipalMenuChoicesSuccessQuery, null);
        }
    },

    logPrincipalMenuChoicesSuccessQuery: function (data) {
        console.log(JSON.stringify(data));
        console.log("SUCCESS LOG BUTTON");
    },

    modifyPrincipalMenu: function(){
        $("#principalMenuInner div.principalMenuButton").draggable({
                drag: function (event, ui) {
                    PrincipalMenu.draggedButton = $(this).data('index');
                },
                containment: "#principalMenuInner",
                revert: "invalid",
                handle: "i.glyphicon-move",
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
        $('#principalMenuResetMenuButton').show();
        $('#principalMenuSaveMenuButton').show();
        $("#principalMenuInner i.iconModifing").show();
        $('#principalMenuInner div').prop('onclick', null).off('click');
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

    savePrincipalMenu: function(){
        localStorage.setItem("principalMenuButtons", JSON.stringify(PrincipalMenu.principalMenuButtons));
        PrincipalMenu.modifing = false;
        $("#principalMenuInner div.principalMenuButtonRemoved").hide();
        $('#principalMenuModifyMenuButton').show();
        $('#principalMenuResetMenuButton').hide();
        $('#principalMenuSaveMenuButton').hide();
        $("#principalMenuInner i.iconModifing").hide();
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
    }

}
