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
var Utility = {

    iconUrl: null,
    retry: 0,
    retryNumber: 3,


    createEmptyFile: function (filename) {
        if (typeof cordova != "undefined") {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
                dir.getFile(filename, { create: true }, function (file) { });
            });
        }
    },

    deleteEmptyFile: function (filename) {
        if (typeof cordova != "undefined") {
            window.resolveLocalFileSystemURL(cordova.file.dataDirectory, function (dir) {
                dir.getFile(filename, { create: false }, function (file) {
                    file.remove(function () {
                        Utility.retry = 0;
                    }, function () {
                        if (Utility.retry < Utility.retryNumber) {
                            Utility.retry++;
                            Utility.deleteEmptyFile(filename);
                        } else {
                            Utility.retry = 0;
                        }
                    });
                });
            });
        }
    },

    capitalize: function (string, a) {
        if (string != "") {
            var tempstr = string.toLowerCase();
            if (a == false || a == undefined)
                return tempstr.replace(tempstr[0], tempstr[0].toUpperCase());
            else {
                return tempstr.replace(tempstr[0], tempstr[0].toUpperCase()).split(" ").map(function (i) { if (i[0] != null) { return i[0].toUpperCase() + i.substring(1) } }).join(" ");
            }
        }
        return string;
    },

    escapeHtml: function (stringToEscape) {
        var escaped = stringToEscape;
        if (stringToEscape != null) {
            escaped = stringToEscape
                .replace(/&/g, "&amp;")
                .replace(/</g, "&lt;")
                .replace(/>/g, "&gt;")
                .replace(/"/g, "&quot;")
                .replace(/'/g, "&#039;");
        }
        return escaped;
    },

    unescapeHtml: function (stringToEscape) {
        return $('<div>').html(stringToEscape).text();
    },


    unescapeHtmlMst: function () {
        return function (text, render) {
            var value = render(text);
            if (value != undefined && value != "")
                value = value.replace(/@\w+/, "");
            return $("<div>" + value + "</div>").text();
        }
    },

    uriToLabelDBPediaMst: function () {
        return function (text, render) {
            var value = render(text);
            return value.substring(value.lastIndexOf(';') + 1).replace(/_/g, ' ').replace(/-/g, ' ');
        }
    },

    uriGlobalizeDBPediaMst: function () {
        return function (text, render) {
            var value = render(text);
            if (SettingsManager.language == 'eng') {
                return value.replace(value.substring(0, value.indexOf('.')), 'http:&#x2F;&#x2F;en.');
            }
            if (SettingsManager.language != 'eng') {
                return value;
            }
        }
    },

    removeUnderscoreMst: function () {
        return function (text, render) {
            var value = render(text);
            return value.replace(/_/g, ' ');
        }
    },

    changeFormatEventsDateMst: function () {
        return function (text, render) {
            var value = render(text);
            if (SettingsManager.language != "eng") {
                try {
                    return dateFormat(value, "dd-mm-yyyy");
                } catch (e) {
                    return value;
                }
               
            } else {
                try {
                    return dateFormat(value, "mm-dd-yyyy");
                } catch (e) {
                    return value;
                }
               
            }

        }
    },

    changeFormatDateTimeMst: function () {
        return function (text, render) {
            var value = render(text);
            console.log(value);
            if (device.platform == "iOS") {
                if (value.indexOf("+") != -1) {
                    console.log("1. " + value.substring(0, value.indexOf("+")).replace("T", " "));
                    return value.substring(0, value.indexOf("+")).replace("T", " ");
                } else {
                    console.log("2. " + value.replace("T", " "));
                    return value.replace("T", " ");
                }
            }
            if (value.indexOf("+") != -1 && (device.platform == "Win32NT" || device.platform == "windows")) {
                value = value.substring(0,value.indexOf("+"));
            }
            if (value.indexOf(".") != -1) {
                value = value.substring(0, value.indexOf("."));
            }
            if (SettingsManager.language != "eng") {
                try {
                    return dateFormat(value.replace("T", " ").replace("Z", ""), "dd-mm-yyyy HH:MM");
                } catch (e) {
                    return value;
                }
               
            } else {
                try {
                    return dateFormat(value.replace("T", " ").replace("Z", ""), "mm-dd-yyyy HH:MM");
                } catch (e) {
                    return value;
                }
                
            }

        }
    },

    changeFormatDateTimeWOYearMst: function () {
        return function (text, render) {
            var value = render(text);
            if (device.platform == "iOS") {
                if (value.indexOf("+") != -1) {
                    return value.substring(4, value.indexOf("+")).replace("T", " ");
                } else {
                    return value.replace("T", " ");
                }
            }
            if (value.indexOf("+") != -1 && (device.platform == "Win32NT" || device.platform == "windows")) {
                value = value.substring(0, value.indexOf("+"));
            }
            if (value.indexOf(".") != -1) {
                value = value.substring(0, value.indexOf("."));
            }
            if (SettingsManager.language != "eng") {
                try{
                   return dateFormat(value.replace("T", " ").replace("Z", ""), "dd-mm HH:MM");
                } catch (e) {
                    return value;
                }
            } else {
                try {
                    return dateFormat(value.replace("T", " ").replace("Z", ""), "mm-dd HH:MM");
                } catch (e) {
                    return value;
                }
            }

        }
    },

    shortingDayWeatherMst: function () {
        return function (text, render) {
            var value = render(text);
            return value.substring(0, 3);
        }
    },



    checkServiceIcon: function (iconUrl, type) {
        $.ajax({
            url: iconUrl,
            async: false,
            success: function () {
                Utility.iconUrl = iconUrl;
            },
            error: function () {
                if (type == "classic") {
                    Utility.iconUrl = RelativePath.images + 'Default.png';
                }
                if (type == "over") {
                    Utility.iconUrl = RelativePath.images + 'Default_over.png';
                }

            }
        });
        return Utility.iconUrl;
    },

    enrichService: function (serviceToEnrich, identifier) {
        if (serviceToEnrich != null) {
            if (serviceToEnrich.properties.name != null) {
                serviceToEnrich.properties.name = serviceToEnrich.properties.name.replace(/_/g, " ").toLowerCase();
                serviceToEnrich.properties.nameEscaped = Utility.escapeHtml(serviceToEnrich.properties.name).replace(/_/g, " ").toLowerCase().replace("/af�/g", "afè");
            }
            if (serviceToEnrich.properties.address != null) {
                serviceToEnrich.properties.addressEscaped = Utility.escapeHtml(serviceToEnrich.properties.address).replace(/_/g, " ");
            }
            if (serviceToEnrich.properties.description != null) {
                serviceToEnrich.properties.descriptionEscaped = Utility.escapeHtml(serviceToEnrich.properties.description).replace(/_/g, " ");
                serviceToEnrich.properties.description = serviceToEnrich.properties.description.replace(/ � /g, " è ").replace(/ pi� /g, " più ").replace(/ch� /g, " ché ").replace(/ll�/g, "ll'").replace(/ l�/gi, "l'").replace(/it�/g, "ità").replace(/ealt�/g, "ealtà").replace(/ed�/g, "edì").replace(/erd�/g, "erdì")
            }
            if (serviceToEnrich.properties.description2 != null) {
                serviceToEnrich.properties.description2Escaped = Utility.escapeHtml(serviceToEnrich.properties.description2).replace(/_/g, " ");
                serviceToEnrich.properties.description2 = serviceToEnrich.properties.description2.replace(/ � /g, " è ").replace(/ pi� /g, " più ").replace(/ch� /g, " ché ").replace(/ll�/g, "ll'").replace(/ l�/gi, "l'").replace(/it�/g, "ità").replace(/ealt�/g, "ealtà").replace(/ed�/g, "edì").replace(/erd�/g, "erdì")
            }
            if (serviceToEnrich.properties.multimedia != null) {
                var multimediaFormat = serviceToEnrich.properties.multimedia.substring(serviceToEnrich.properties.multimedia.length - 4);
                if (multimediaFormat == ".mp3") {
                    serviceToEnrich.properties.audioMP3 = serviceToEnrich.properties.multimedia;
                } else if ((multimediaFormat == ".wav") || (multimediaFormat == ".ogg")) {
                    serviceToEnrich.properties.audio = serviceToEnrich.properties.multimedia;
                    serviceToEnrich.properties.multimediaFormat = multimediaFormat;
                } else if (multimediaFormat == ".pdf") {
                    serviceToEnrich.properties.textPDF = serviceToEnrich.properties.multimedia.replace("http://", "");
                } else if (multimediaFormat != "") {
                    serviceToEnrich.properties.carouselContent = [{ "photo": APIClient.apiUrl + "imgcache?size=medium&imageUrl=" + serviceToEnrich.properties.multimedia, "active": "active", "index": 0 }];
                    serviceToEnrich.properties.carouselThumbContent = [{ "photo": APIClient.apiUrl + "imgcache?size=thumb&imageUrl=" + serviceToEnrich.properties.multimedia, "active": "active", "index": 0, "photoModal": APIClient.apiUrl + "imgcache?size=medium&imageUrl=" + serviceToEnrich.properties.multimedia }];
                    serviceToEnrich.properties.image = APIClient.apiUrl + "imgcache?size=medium&imageUrl=" + serviceToEnrich.properties.multimedia;
                    serviceToEnrich.properties.imageThumb = APIClient.apiUrl + "imgcache?size=thumb&imageUrl=" + serviceToEnrich.properties.multimedia;;
                }
            }

            if (serviceToEnrich.properties.photos != null) {
                if (serviceToEnrich.properties.photos.length != 0) {
                    var j = 0;
                    if (serviceToEnrich.properties.carouselContent == null) {
                        if (serviceToEnrich.properties.image == null) {
                            serviceToEnrich.properties.image = serviceToEnrich.properties.photos[j];
                            if (serviceToEnrich.properties.photoThumbs == null) {
                                serviceToEnrich.properties.imageThumb = serviceToEnrich.properties.photos[j];
                            }
                        }
                        serviceToEnrich.properties.carouselContent = [{ "photo": serviceToEnrich.properties.photos[j], "active": "active", "index": j }];
                        j++;
                    }
                    for (var i = j; i < serviceToEnrich.properties.photos.length; i++) {
                        serviceToEnrich.properties.carouselContent.push({ "photo": serviceToEnrich.properties.photos[i], "active": "", "index": i });
                    }

                }
            }
            if (serviceToEnrich.properties.photoThumbs != null) {
                if (serviceToEnrich.properties.photoThumbs.length != 0) {
                    var j = 0;
                    if (serviceToEnrich.properties.carouselThumbContent == null) {
                        if (serviceToEnrich.properties.imageThumb == null) {
                            serviceToEnrich.properties.imageThumb = serviceToEnrich.properties.photoThumbs[j];
                        }
                        if (serviceToEnrich.properties.photos != null) {
                            serviceToEnrich.properties.carouselThumbContent = [{ "photo": serviceToEnrich.properties.photoThumbs[j], "active": "active", "index": j, "photoModal": serviceToEnrich.properties.photos[j] }];
                        } else {
                            serviceToEnrich.properties.carouselThumbContent = [{ "photo": serviceToEnrich.properties.photoThumbs[j], "active": "active", "index": j, "photoModal": "" }];
                        }
                        j++;
                    }
                    for (var i = j; i < serviceToEnrich.properties.photoThumbs.length; i++) {
                        if (serviceToEnrich.properties.photos != null) {
                            serviceToEnrich.properties.carouselThumbContent.push({ "photo": serviceToEnrich.properties.photoThumbs[i], "active": "", "index": i, "photoModal": serviceToEnrich.properties.photos[i] });
                        } else {
                            serviceToEnrich.properties.carouselThumbContent.push({ "photo": serviceToEnrich.properties.photoThumbs[i], "active": "", "index": i, "photoModal": "" });
                        }
                    }

                }
            }
            if (serviceToEnrich.properties.carouselThumbContent != null) {
                if (serviceToEnrich.properties.carouselThumbContent.length != 0) {
                    serviceToEnrich.properties.carouselThumb = true;
                    serviceToEnrich.properties.carouselThumbHeight = $(window).width() * 0.2;
                    if (serviceToEnrich.properties.carouselThumbContent.length == 1) {
                        serviceToEnrich.properties.onlyOneThumbImage = true;
                    }
                }
            }
            if (serviceToEnrich.properties.carouselContent != null) {
                if (serviceToEnrich.properties.carouselContent.length != 0) {
                    serviceToEnrich.properties.carousel = true;
                    serviceToEnrich.properties.carouselHeight = $(window).width() * 0.2;
                    if (serviceToEnrich.properties.carouselContent.length == 1) {
                        serviceToEnrich.properties.onlyOneImage = true;
                    }
                }
            }
            if (serviceToEnrich.properties.comments != null) {
                if (serviceToEnrich.properties.comments.length != 0) {
                    serviceToEnrich.properties.carouselCommentContent = [{ "comment": serviceToEnrich.properties.comments[0].text, "time": serviceToEnrich.properties.comments[0].timestamp, "active": "active", "index": 0 }];
                    for (var i = 1; i < serviceToEnrich.properties.comments.length; i++) {
                        serviceToEnrich.properties.carouselCommentContent.push({ "comment": serviceToEnrich.properties.comments[i].text, "time": serviceToEnrich.properties.comments[i].timestamp, "active": "", "index": i });
                    }

                }
            }
            if (serviceToEnrich.properties.carouselCommentContent != null) {
                if (serviceToEnrich.properties.carouselCommentContent.length != 0) {
                    serviceToEnrich.properties.carouselComment = true;
                    if (serviceToEnrich.properties.carouselCommentContent.length == 1) {
                        serviceToEnrich.properties.onlyOneComment = true;
                    }
                }
            }


            if (serviceToEnrich.properties.startDate != null && serviceToEnrich.properties.endDate != null) {
                if (serviceToEnrich.properties.startDate == serviceToEnrich.properties.endDate) {
                    serviceToEnrich.properties.date = serviceToEnrich.properties.startDate;
                    serviceToEnrich.properties.startDate = null;
                    serviceToEnrich.properties.endDate = null;
                }
            }

            if (serviceToEnrich.properties.startTime != null) {
                serviceToEnrich.properties.startTime = serviceToEnrich.properties.startTime.replace(/ed�/g, "edì").replace(/erd�/g, "erdì");
            }


            if (serviceToEnrich.properties.website != null) {
                var link = serviceToEnrich.properties.website;
                link = $("<div>" + link + "</div>").text();
                link = link.replace(/http[:]\/\//g, "");
                serviceToEnrich.properties.website = link;
            }

            if (serviceToEnrich.properties.linkDBpedia != null) {
                if (serviceToEnrich.properties.linkDBpedia.length != 0) {
                    serviceToEnrich.properties.dbPedia = "true";
                }
            }

            if (serviceToEnrich.properties.carousel != null || serviceToEnrich.properties.image != null) {
                serviceToEnrich.properties.images = true;
            }

            if (device.platform == "Android") {
                serviceToEnrich.properties.android = "true";
            }
            if (device.platform == "iOS") {
                serviceToEnrich.properties.ios = "true";
            }
            if (device.platform == "Win32NT" || device.platform == "windows") {
                serviceToEnrich.properties.wp8 = "true";
                if (device.platform == "windows") {
                    serviceToEnrich.properties.windows = "true";
                }
            }
            if (device.platform == "Web") {
                serviceToEnrich.properties.web = "true";
            }

            if (serviceToEnrich.properties.serviceType != null) {
                if (serviceToEnrich.properties.category == null) {
                    serviceToEnrich.properties.category = serviceToEnrich.properties.serviceType.substring(0, serviceToEnrich.properties.serviceType.indexOf('_'));
                }
                if (serviceToEnrich.properties.category == "") {
                    serviceToEnrich.properties.category = serviceToEnrich.properties.serviceType;
                }
                if (serviceToEnrich.properties.subCategory == null) {
                    serviceToEnrich.properties.subCategory = serviceToEnrich.properties.serviceType.substring(serviceToEnrich.properties.serviceType.indexOf('_') + 1);
                }
                if (serviceToEnrich.properties.agency != null) {
                    if (serviceToEnrich.properties.alternativeIcon == null) {
                        var temporaryServiceType = serviceToEnrich.properties.serviceType + "_" + serviceToEnrich.properties.agency.toLowerCase().replace(/\./g, "").replace(/&/g, "").replace(/ù/g, "u").replace(/à/g, "a").replace(/ /g, "");
                        var checkIcon = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/' + temporaryServiceType + '.png', "classic");
                        if (checkIcon != null && checkIcon.indexOf("Default") == -1) {
                            serviceToEnrich.properties.alternativeIcon = temporaryServiceType;
                        }
                    }
                }
                if (serviceToEnrich.properties.brand != null && serviceToEnrich.properties.brand != "") {
                    if (serviceToEnrich.properties.alternativeIcon == null) {
                        var temporaryServiceType = serviceToEnrich.properties.serviceType + "_" + serviceToEnrich.properties.brand.toLowerCase().replace(/\./g, "").replace(/&/g, "").replace(/ù/g, "u").replace(/à/g, "a").replace(/ /g, "");
                        var checkIcon = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/' + temporaryServiceType + '.png', "classic");
                        if (checkIcon != null && checkIcon.indexOf("Default") == -1) {
                            serviceToEnrich.properties.alternativeIcon = temporaryServiceType;
                        }
                    }
                }
            }
            Utility.refreshDinamicFields(serviceToEnrich, identifier);
        }
    },

    refreshDinamicFields: function (serviceToRefresh, identifier) {
        serviceToRefresh.properties.unescapeHtml = Utility.unescapeHtmlMst;
        serviceToRefresh.properties.uriToLabelDBPedia = Utility.uriToLabelDBPediaMst;
        serviceToRefresh.properties.uriGlobalizeDBPedia = Utility.uriGlobalizeDBPediaMst;
        serviceToRefresh.properties.removeUnderscore = Utility.removeUnderscoreMst;
        serviceToRefresh.properties.changeFormatEventsDate = Utility.changeFormatEventsDateMst;
        serviceToRefresh.properties.changeFormatDateTime = Utility.changeFormatDateTimeMst;
        serviceToRefresh.properties.changeFormatDateTimeWOYear = Utility.changeFormatDateTimeWOYearMst;
        serviceToRefresh.properties.currentLanguage = SettingsManager.language;
        if (serviceToRefresh.properties.eventCategory != null) {
            serviceToRefresh.properties.imgsrc = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/Event.png', "classic")
        } else {
            if (serviceToRefresh.properties.alternativeIcon == null) {
                serviceToRefresh.properties.imgsrc = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/' + serviceToRefresh.properties.serviceType + '.png', "classic");
            } else {
                serviceToRefresh.properties.imgsrc = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/' + serviceToRefresh.properties.alternativeIcon + '.png', "classic");
            }
        }

        if (identifier != null) {
            serviceToRefresh.properties.identifier = identifier;
        }

        serviceToRefresh.properties.distanceFromGPS = Math.round(GpsManager.getDistanceFromGPSInM(serviceToRefresh.geometry.coordinates[1], serviceToRefresh.geometry.coordinates[0]));

        var manualMarkerCoordinates = MapManager.manualMarkerCoordinates();
        if (manualMarkerCoordinates != null) {
            serviceToRefresh.properties.distanceFromSearchCenter = Math.round(GpsManager.getDistanceFromLatLonInM(serviceToRefresh.geometry.coordinates[1], serviceToRefresh.geometry.coordinates[0], manualMarkerCoordinates[0], manualMarkerCoordinates[1]));
        } else {
            serviceToRefresh.properties.distanceFromSearchCenter = null;
        }

        if (serviceToRefresh.properties.distanceFromGPS != null || serviceToRefresh.properties.distanceFromSearchCenter != null) {
            serviceToRefresh.properties.distanceFromSomething = true;
        }

    },

    expandMenu: function (idMenu, idExpandButton, idCollapseButton) {
        $(idMenu).css({
            'height': '100%',
            'width': '100%',
            'top': '0px',
            'left': '0px'
        });
        $(idExpandButton).hide();
        $(idCollapseButton).show();
    },

    collapseMenu: function (idMenu, idExpandButton, idCollapseButton) {
        MapManager.showMenuReduceMap(idMenu);
        $(idMenu).css({ 'z-index': '1001' });
        $(idCollapseButton).hide();
        $(idExpandButton).show();
    },

    movingPanelWithTouch: function (idTouchElement, idPanel) {
        $(idPanel).draggable({
            drag: function (e, ui) {
                if ($(window).height() > $(window).width()) {
                    $(idPanel).css({
                        top: (e.pageY) + 'px',
                        height: "auto"
                    });
                } else {
                    $(idPanel).css({
                        left: (e.pageX) + 'px',
                        width: "auto"
                    });
                }
            },
            handle: idTouchElement,
        });

        Utility.checkAxisToDrag(idPanel);
    },

    checkAxisToDrag: function (panelName) {
        if ($(window).height() > $(window).width()) {
            $(panelName).draggable("option", { "axis": "y", "containment": [0, 0, $(window).width(), $(window).height() * 0.65] });
            $(panelName + " .realTimeInformation").css("position", "absolute").css("margin-bottom", "0px").css("transform", "translateY(-47%)");
            $(panelName + " .reduceForRealTimeInfo").each(function(){
                $(this).css("margin-right",  $(this).children(".realTimeInformation").width());
            });
        } else {
            $(panelName).draggable("option", { "axis": "x", "containment": [0, 0, $(window).width() * 0.65, $(window).height()] });
            $(panelName + " .realTimeInformation").css("position", "relative").css("margin-bottom", "-10px").css("transform", "none");
            $(panelName + " .reduceForRealTimeInfo").css("margin-right", "0px");
        }
    },

    checkAxisToDragReduced: function (panelName) {
        if ($(window).height() > $(window).width()) {
            $(panelName).draggable("option", { "axis": "y", "containment": [0, 0, $(window).width(), $(window).height() * 0.60] });
            if ($(panelName).css("top").replace("px", "") > $(window).height() * 0.60) {
                $(panelName).css("top", "60%");
                $(panelName).css("height", "40%");
            }
        } else {
            $(panelName).draggable("option", { "axis": "x", "containment": [0, 0, $(window).width() * 0.60, $(window).height()] });
            if ($(panelName).css("left").replace("px", "") > $(window).width() * 0.60) {
                $(panelName).css("left", "60%");
                $(panelName).css("width", "40%");
            }
        }
    },

    loadFilesInsideDirectory: function (relativeDirectory, type, substring, recursive, singleFileCallback, finalCallback) {
        if (device.platform == "Web") {
            Utility.loadFilesInsideDirectoryWeb(relativeDirectory.replace("www/",""), type, substring, recursive, singleFileCallback, finalCallback)
        } else {
            window.resolveLocalFileSystemURL(cordova.file.applicationDirectory + relativeDirectory, function (dir) {
                var reading = 0;
                function readSome(reader) {
                    reading++;
                    reader.readEntries(
                      function (entries) {
                          reading--;
                          if (entries.length > 0) {
                              entries.forEach(function (entry) {

                                  if (entry.isDirectory && recursive == true) {
                                      readSome(entry.createReader());
                                  } else if (type != null && entry.name.split('.').pop() == type) {
                                      if (singleFileCallback != null) {
                                          singleFileCallback(entry.fullPath.substring(5));
                                      }
                                  } else if (substring != null && entry.name.indexOf(substring) != -1) {
                                      if (singleFileCallback != null) {
                                          singleFileCallback(entry.fullPath.substring(5));
                                      }
                                  }
                              })
                          }
                          if (reading == 0) {
                              if (type != null) {
                                  console.log("DONE LOAD " + type + " ON " + relativeDirectory);
                              }
                              if (substring != null) {
                                  console.log("DONE LOAD " + substring + " ON " + relativeDirectory);
                              }
                              if (finalCallback != null) {
                                  finalCallback("SUCCESS LOAD OF " + relativeDirectory);
                              }
                          }
                      },
                      function (err) {
                          console.log(err);
                      }
                    );
                }
                readSome(dir.createReader());
            });
        }
    },

    loadFilesInsideDirectoryWeb: function (relativeDirectory, type, substring, recursive, singleFileCallback, finalCallback) {
        var reading = 0;
        function readSome(reader) {
                reading++;
                readEntries($(reader).find("a:not([href^='/']):not([href^='?'])"), $(reader).filter('title').text().substring($(reader).filter('title').text().indexOf("/")));
                function readEntries(entries, currentDirectory) {
                      reading--;
                      if (entries.length > 0) {
                          entries.each(function () {
                              if ($(this).attr("href").indexOf("/") != -1 && recursive == true) {
                                  $.ajax({
                                      url: currentDirectory + "/" + $(this).attr("href"),
                                      async: false,
                                      success: function (data) {
                                          readSome(data);
                                      }
                                  });
                              } else if (type != null && $(this).attr("href").split('.').pop() == type) {
                                  if (singleFileCallback != null) {
                                      singleFileCallback(currentDirectory + "/" + $(this).attr("href"));
                                  }
                              } else if (substring != null && $(this).attr("href").indexOf(substring) != -1) {
                                  if (singleFileCallback != null) {
                                      singleFileCallback(currentDirectory + "/" + $(this).attr("href"));
                                  }
                              }
                          })
                      }
                      if (reading == 0) {
                          if (type != null) {
                              if (device.platform != "Web") {
                                  console.log("DONE LOAD " + type + " ON " + relativeDirectory);
                              }
                          }
                          if (substring != null) {
                              if (device.platform != "Web") {
                                  console.log("DONE LOAD " + substring + " ON " + relativeDirectory);
                              }
                          }
                          if (finalCallback != null) {
                              finalCallback("SUCCESS LOAD OF " + relativeDirectory);
                          }
                      }
                  }
        }
            $.ajax({
                url: relativeDirectory,
                async: false,
                success: function (data) {
                    readSome(data);
                }
            });
    },

    loadJS: function (fullPath) {
        $.ajax({
            url: fullPath,
            async: false,
            dataType: "script"
        });
    }


};

