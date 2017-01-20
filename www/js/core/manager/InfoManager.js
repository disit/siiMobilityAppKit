/// <reference path="../searcher/CategorySearcher.js" />
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
var InfoManager = {

    open: false,
    modalImageOpen: false,
    modalTimetableOpen: false,
    expanded: false,
    latitude: null,
    longitude: null,
    lockSharing: false,
    currentResponse: null,
    currentTimetable: null,
    menuToManageList: [],
    lastRemovedMenu: null,

    showImageModal: function (image) {
        var backupExpanded = InfoManager.expanded;
        if (InfoManager.expanded) {
            InfoManager.collapseInfoAboutOneMarker();
            InfoManager.expanded = backupExpanded;
        }
        $('#serviceImagePreview').attr('src', image);
        $("#serviceImagePreview").panzoom("reset");
        $('#serviceImageModal').modal('show');
        $('#serviceImageModalBody').css('height', $(window).height() * 0.80 + 'px');
        $('#serviceImageModalFooterButton').html(Globalization.labels.infoMenu.closeButton);
        $('#serviceImageModal').on('hide.bs.modal', function (e) {
            InfoManager.modalImageOpen = false;
            $('#serviceImagePreview').attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP//&‌​#47;ywAAAAAAQABAAACA‌​UwAOw==');
            if (InfoManager.expanded) {
                InfoManager.expandInfoAboutOneMarker();
            }
        });
        InfoManager.modalImageOpen = true;
    },
    hideImageModal: function () {
        $('#serviceImageModal').modal('hide');
        $('#serviceImagePreview').attr('src', 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP//&‌​#47;ywAAAAAAQABAAACA‌​UwAOw==');
        InfoManager.modalImageOpen = false;
        if (InfoManager.expanded) {
            InfoManager.expandInfoAboutOneMarker();
        }
    },

    rescaleModalHeight: function () {
        if (InfoManager.modalImageOpen) {
            $('#serviceImageModalBody').css('height', $(window).height() * 0.80 + 'px');
        }
        if (InfoManager.modalTimetableOpen) {
            $('div.dataTables_scrollBody').css("max-height", $(window).height() - 210 + "px");
            $.fn.dataTable.tables({ visible: true, api: true }).columns.adjust();
        }
    },

    showTimetableModal: function () {
        var backupExpanded = InfoManager.expanded;
        if (InfoManager.expanded) {
            InfoManager.collapseInfoAboutOneMarker();
            InfoManager.expanded = backupExpanded;
        }

        ViewManager.render(InfoManager.currentTimetable, '#timetableModal', 'TimetableModal');
        $("#timetableModal").modal('show');
        $.fn.dataTable.moment('HH:MM:ss yyyy-mm-dd');
        $("#timetableModaltimetable").DataTable({
            "columnDefs": [
                    { "width": "60px", "targets": 0 },
                    { "type": "date", "targets": 0 }],
            "autowidth": true,
            "order": [[ 0, "asc" ]],
            "scrollY": $(window).height() - 210 + "px",
            "scrollCollapse": true,
            "lengthMenu": [[10, 25, 50, 100, 200], [10, 25, 50, 100, 200]],
            "pagingType": "numbers",
            "language": {
                "search": "",
                "lengthMenu": Globalization.labels.busStop.datatableLengthMenu,
                "info": Globalization.labels.busStop.datatableInfo,
                "infoEmpty": Globalization.labels.busStop.datatableInfoEmpty,
                "infoFiltered": "",
                "zeroRecords": Globalization.labels.busStop.datatableZeroRecords
            }
        });
        $("#timetableModaltimetable_filter input").attr("placeholder", Globalization.labels.busStop.datatableSearch).css("width", "100%").css("margin-left", "0px");
        $('#timetableModal').on('hide.bs.modal', function (e) {
            InfoManager.modalTimetableOpen = false;
            if (InfoManager.expanded) {
                InfoManager.expandInfoAboutOneMarker();
            }
        });
        InfoManager.modalTimetableOpen = true;
    },

    hideTimetableModal: function () {
        $("#timetableModal").modal('hide');
        InfoManager.modalTimetableOpen = false;
        if (InfoManager.expanded) {
            InfoManager.expandInfoAboutOneMarker();
        }
    },

    showInfoAboutOneMarker: function (serviceUri, latitude, longitude) {
        InfoManager.latitude = latitude;
        InfoManager.longitude = longitude;
        PrincipalMenu.hide();
        var serviceQuery = QueryManager.createServiceQuery(serviceUri,"user");
        APIClient.executeQuery(serviceQuery, InfoManager.successQuery, InfoManager.errorQuery);
    },

    expandInfoAboutOneMarker: function () {
        if (InfoManager.currentResponse != null) {
            InfoManager.changePhotoOnCarousel(InfoManager.currentResponse.properties.carouselContent);
        }
        Utility.expandMenu("#infoMenu", "#expandInfoMenu", "#collapseInfoMenu");
        $('#serviceCarouselPhotos .carousel-inner .item').css('height', $(window).width() * 0.4 + "px");
        $('#serviceCarouselPhotos .carousel-inner .item img').css('max-height', $(window).width() * 0.4 + "px");
        InfoManager.expanded = true;
    },

    collapseInfoAboutOneMarker: function () {
        InfoManager.changePhotoOnCarousel(InfoManager.currentResponse.properties.carouselThumbContent);
        Utility.collapseMenu("#infoMenu", "#expandInfoMenu", "#collapseInfoMenu");
        $('#serviceCarouselPhotos .carousel-inner .item').css('height', $(window).width() * 0.2 + "px");
        $('#serviceCarouselPhotos .carousel-inner .item img').css('max-height', $(window).width() * 0.2 + "px");
        InfoManager.expanded = false;
    },

    hideInfoAboutOneMarker: function (latitude, longitude) {
        $('#infoMenu').css({
            'bottom': '-100%',
            'top': 'auto',
            'right': 'auto',
            'width': '100%',
            'height': '35%',
            'z-index': '1002'
        });
        $('#infoMenu').empty();
        if (InfoManager.menuToManageList.length == 0) {
            $('#content').css({
                'height': '100%',
                'width': '100%'
            });
            $('#servicesFounded').css({
                'left': '20%',
                'width': '60%',

            });
            $('#loadingImage').css({
                'left': '48%',
            });

            $('#settingsLoadingImage').css({
                'left': '48%',
            });

            $('#autoSearchLoadingImage').css({
                'left': '48%',
            });

        }
        $('#categorySearchMenu').css('height', $('#content').height() + 'px');

        $('#serviceCarouselPhotos .carousel-inner .item').css('height', $(window).width() * 0.2 + "px");
        $('#serviceCarouselPhotos .carousel-inner .item img').css('max-height', $(window).width() * 0.2 + "px");

        MapManager.updateMap();
        MapManager.centerMapOnCoordinates(latitude, longitude);
        InfoManager.open = false;
        application.removingMenuToCheck("InfoManager");
        InfoManager.expanded = false;
    },

    checkForBackButton: function () {
        if (InfoManager.open) {
            if (PictureManager.sendPhotoModalOpen) {
                PictureManager.hideSendPhotoModal();
            } else if (PictureManager.sendPhotoAlbumModalOpen) {
                PictureManager.hideSendPhotoAlbumModal();
            } else if (FeedbackManager.modalOpen) {
                FeedbackManager.hideModal();
            } else if (InfoManager.modalImageOpen) {
                InfoManager.hideImageModal();
            } else if (InfoManager.modalTimetableOpen) {
                InfoManager.hideTimetableModal();
            } else if (BusRoutesSearcher.infoRouteModalOpen) {
                BusRoutesSearcher.hideInfoRouteModal();
            } else {
                InfoManager.hideInfoAboutOneMarker.apply(this, MapManager.mapCenterCoordinates());
            }
        }
    },

    refreshMenuPosition: function () {
        if (InfoManager.open) {
            MapManager.showMenuReduceMap('#infoMenu');
            Utility.checkAxisToDrag("#infoMenu");
            if (InfoManager.expanded) {
                InfoManager.expandInfoAboutOneMarker();
            }
        }
        InfoManager.rescaleCarouselHeight();
        InfoManager.rescaleModalHeight();
    },

    closeAll: function(){
        if (InfoManager.open) {
            PictureManager.hideSendPhotoModal();
            PictureManager.hideSendPhotoAlbumModal();
            FeedbackManager.hideModal();
            InfoManager.hideImageModal();
            BusRoutesSearcher.hideInfoRouteModal();
            InfoManager.hideInfoAboutOneMarker.apply(this, MapManager.mapCenterCoordinates());
        }
    },

    rescaleCarouselHeight: function () {
        if (InfoManager.expanded) {
            $('#serviceCarouselPhotos .carousel-inner .item').css('height', $(window).width() * 0.4 + "px");
            $('#serviceCarouselPhotos .carousel-inner .item img').css('max-height', $(window).width() * 0.4 + "px");
        } else {
            $('#serviceCarouselPhotos .carousel-inner .item').css('height', $(window).width() * 0.2 + "px");
            $('#serviceCarouselPhotos .carousel-inner .item img').css('max-height', $(window).width() * 0.2 + "px");
        }
    },

    //callBack
    successQuery: function (response) {
        if ($("#infoMenu").length == 0) {
            $("#indexPage").append("<div id=\"infoMenu\" class=\"commonHalfMenu\" style=\"background-color: white; z-index: 1002;\"></div>")
        }
        for (var category in response) {
            var wktGeometry = null;
            if (response[category].features != null) {
                if (response[category].features.length != 0) {

                    Utility.enrichService(response[category].features[0]);

                    if (response[category].features[0].properties.serviceType != null) {
                        if (response[category].features[0].properties.serviceType == "TransferServiceAndRenting_Car_park") {
                            ViewManager.render(response, "#infoMenu", "Parking");
                        } else if (response.busLines != null) {
                            response.busLines.head.busStopEscaped = Utility.escapeHtml(response.busLines.head.busStop);
                            if (response.timetable != null) {
                                InfoManager.currentTimetable = response
                                if (response.timetable.results != null && response.timetable.results.bindings != null) {
                                    response.timetable.results.bindingsReduced = response.timetable.results.bindings.slice(0, 10);
                                    response.timetable.results.bindingsReduced.sort(function (a, b) {
                                            var aDate = new Date(a.date.value + "T" + a.departureTime.value);
                                            var bDate = new Date(b.date.value + "T" + b.departureTime.value);
                                            return aDate.getTime() - bDate.getTime();
                                    });
                                }
                            }
                            ViewManager.render(response, "#infoMenu", "BusStop");
                        } else if (response[category].features[0].properties.serviceType == "TransferServiceAndRenting_SensorSite") {
                            ViewManager.render(response, "#infoMenu", "SensorSite");
                        } else {
                            ViewManager.render(response, "#infoMenu", null);
                        }
                    } else {
                        ViewManager.render(response, "#infoMenu", null);
                    }

                    if (InfoManager.longitude == null) {
                        InfoManager.longitude = response[category].features[0].geometry.coordinates[0];
                    }
                    if (InfoManager.latitude == null) {
                        InfoManager.latitude = response[category].features[0].geometry.coordinates[1];
                    }

                    wktGeometry = response[category].features[0].properties.wktGeometry;

                    if (response[category].features[0] != null) {
                        InfoManager.currentResponse = response[category].features[0];
                    }

                } else {
                    navigator.notification.alert(Globalization.alerts.servicesServerError.message, function () { }, Globalization.alerts.servicesServerError.title);
                    break;
                }
            } else if (category == "head" || category == "ERROR") {
                for (var i = 0; i < response.results.bindings.length; i++){
                    response.results.bindings[i].day.value =  Globalization.labels.weather[response.results.bindings[i].day.value];
                }
                ViewManager.render(response, "#infoMenu", "Weather");
            }

            MapManager.showMenuReduceMap('#infoMenu');
            $('#collapseInfoMenu').hide();
            $("#serviceCarouselPhotos").swiperight(function () { $("#serviceCarouselPhotos").carousel('prev'); });
            $("#serviceCarouselPhotos").swipeleft(function () { $("#serviceCarouselPhotos").carousel('next'); });

            $("#infoMenu").draggable({
                drag: function (e, ui) {
                    if ($(window).height() > $(window).width()) {
                        $("#infoMenu").css({
                            top: (e.pageY) + 'px',
                            height: "auto"
                        });
                    } else {
                        $("#infoMenu").css({
                            left: (e.pageX) + 'px',
                            width: "auto"
                        });
                    }
                },
                handle: "#infoMenuExpandHandler",
                stop: function (event, ui) {
                    if ($(window).height() > $(window).width()) {
                        if ($("#infoMenu").position().top < ($(window).height() * 0.5)) {
                            if (InfoManager.currentResponse != null) {
                                InfoManager.changePhotoOnCarousel(InfoManager.currentResponse.properties.carouselContent);
                                $('#serviceCarouselPhotos .carousel-inner .item').css('height', $(window).width() * 0.4 + "px");
                                $('#serviceCarouselPhotos .carousel-inner .item img').css('max-height', $(window).width() * 0.4 + "px");
                            }
                        } else {
                            if (InfoManager.currentResponse != null) {
                                InfoManager.changePhotoOnCarousel(InfoManager.currentResponse.properties.carouselThumbContent);
                                $('#serviceCarouselPhotos .carousel-inner .item').css('height', $(window).width() * 0.2 + "px");
                                $('#serviceCarouselPhotos .carousel-inner .item img').css('max-height', $(window).width() * 0.2 + "px");
                            }
                        }
                    } else {
                        if ($("#infoMenu").position().left < ($(window).width() * 0.5)) {
                            if (InfoManager.currentResponse != null) {
                                InfoManager.changePhotoOnCarousel(InfoManager.currentResponse.properties.carouselContent);
                                $('#serviceCarouselPhotos .carousel-inner .item').css('height', $(window).width() * 0.4 + "px");
                                $('#serviceCarouselPhotos .carousel-inner .item img').css('max-height', $(window).width() * 0.4 + "px");
                            }
                        } else {
                            if (InfoManager.currentResponse != null) {
                                InfoManager.changePhotoOnCarousel(InfoManager.currentResponse.properties.carouselThumbContent);
                                $('#serviceCarouselPhotos .carousel-inner .item').css('height', $(window).width() * 0.2 + "px");
                                $('#serviceCarouselPhotos .carousel-inner .item img').css('max-height', $(window).width() * 0.2 + "px");
                            }
                        }
                    }
                }
            });

            if (wktGeometry != null && wktGeometry != "" && wktGeometry.indexOf("POINT") == -1) {
                MapManager.addSelectedGeometry(wktGeometry);
            } else {
                if (InfoManager.latitude != null && InfoManager.longitude != null) {
                    MapManager.centerMapOnCoordinates(InfoManager.latitude, InfoManager.longitude);
                }
            }
            if (InfoManager.open) {
                application.removingMenuToCheck("InfoManager");
            }
            InfoManager.open = true;
            application.addingMenuToCheck("InfoManager");
            Utility.checkAxisToDrag("#infoMenu");
            $("#serviceImagePreview").panzoom({ minScale: 1, contain: 'invert' });
            application.setBackButtonListener();
            break;
        }
    },

    //callBack
    errorQuery: function (error) {
        navigator.notification.alert(Globalization.alerts.servicesServerError.message, function () { }, Globalization.alerts.servicesServerError.title);
    },

    addToCalendar: function (title, location, note, startDate, endDate) {
        window.plugins.calendar.createEvent(Utility.capitalize(Utility.unescapeHtml(title).replace(/"/g, ""), true), Utility.unescapeHtml(location), Utility.unescapeHtml(note), new Date(startDate), new Date(endDate), function (message) { InfoManager.successAddCalendar(message); }, function (message) { InfoManager.errorAddCalendar(message); });
    },

    successAddCalendar: function (message) {
        navigator.notification.alert(Globalization.alerts.addCalendarSuccess.message, function () { }, Globalization.alerts.addCalendarSuccess.title);
    },
    errorAddCalendar: function (message) {
        navigator.notification.alert(Globalization.alerts.addCalendarError.message, function () { }, Globalization.alerts.addCalendarError.title);
    },

    share: function (message, title, image, link, divToShare) {
        if (device.platform != "Win32NT" && device.platform != "windows") {
            if (!InfoManager.lockSharing) {
                InfoManager.lockSharing = true;
                var backupExpanded = InfoManager.expanded;
                var height = 0;
                if (divToShare == 'infoMenu') {
                    InfoManager.expandInfoAboutOneMarker();
                    InfoManager.expanded = backupExpanded;
                    $('#infoMenu').css({
                        'height': 'auto',
                        'bottom': '',
                        'overflow': 'visible'
                    });
                    $('#infoMenuInner').css({
                        'bottom': '',
                    });
                    $('#indexPage').css({
                        'overflow': 'visible'
                    });

                    height = $("#infoMenu ul").height() + 60;

                } else {
                    height = $("#" + divToShare).height();
                    Loading.showSettingsLoading();
                }

                html2canvas(document.getElementById(divToShare), { allowTaint: true, height: height }).then(function (canvas) {
                    Loading.hideSettingsLoading();
                    if (divToShare == 'infoMenu') {
                        if (InfoManager.expanded) {
                            $('#infoMenu').css({
                                'height': '100%',
                                'bottom': '0px',
                                'overflow': ''
                            });
                            $('#infoMenuInner').css({
                                'bottom': '0px'
                            });

                        } else {
                            InfoManager.collapseInfoAboutOneMarker();
                        }
                        $('#indexPage').css({
                            'overflow': 'hidden'
                        });
                    }
                    window.plugins.socialsharing.shareWithOptions({ message: Utility.capitalize(Utility.unescapeHtml(Utility.unescapeHtml(message)).replace(/"/g, ""), true), subject: title, files: [canvas.toDataURL()], url: "http://www.km4city.org/app/" }, function () { InfoManager.lockSharing = false; }, function () { InfoManager.lockSharing = false; });

                });
            } else {
                InfoManager.showSharedRunning();
            }
        } else {
            window.plugins.socialsharing.share(Utility.capitalize(Utility.unescapeHtml(message).replace(/"/g, ""), true), Utility.capitalize(Utility.unescapeHtml(title).replace(/"/g, ""), true), image, link);
        }
    },

    shareFacebook: function (message, image, link) {
        window.plugins.socialsharing.shareViaFacebookWithPasteMessageHint(Utility.capitalize(Utility.unescapeHtml(Utility.unescapeHtml(message)).replace(/"/g, ""), true), image, link, Globalization.labels.shareFacebook.paste, function () { console.log('Shared') }, function (errormsg) { navigator.notification.alert(Globalization.alerts.shareFacebook.message, function () { }, Globalization.alerts.shareFacebook.title); });
    },

    showSharedRunning: function () {
        window.plugins.toast.showWithOptions(
                    {
                        message: Globalization.labels.infoMenu.sharedRunning,
                        duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself. 
                        position: "bottom",
                        addPixelsY: -40  // added a negative value to move it up a bit (default 0) 
                    },
                    function () { }, // optional
                    function () { }    // optional 
                    );
    },

    changePhotoOnCarousel: function(imagesArray){
        $("#serviceCarouselPhotos .carousel-inner .item").each(function (index) {
            $(this).children("img").attr("src", imagesArray[index].photo);
        });
    },

    addingMenuToManage: function (menuToManage) {
        InfoManager.menuToManageList.unshift(menuToManage);
    },

    removingMenuToManage: function (menuToManage) {
        var index = InfoManager.menuToManageList.indexOf(menuToManage);
        if (index != -1) {
            InfoManager.lastRemovedMenu = menuToManage;
            InfoManager.menuToManageList.splice(InfoManager.menuToManageList.indexOf(menuToManage), 1);
        }
    },
    
    openLastSearchPerformed: function () {
        var menuToOpen = null;
        if (InfoManager.menuToManageList.length != 0) {
            menuToOpen = InfoManager.menuToManageList[0];
        } else{
            menuToOpen = InfoManager.lastRemovedMenu;
        }
        if (menuToOpen != null) {
            if (window[menuToOpen] != null) {
                if (window[menuToOpen]["show"] != null) {
                    window[menuToOpen]["show"]();
                }
            }
        }
    }

}
