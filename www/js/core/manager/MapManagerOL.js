var MapManager = {

    map: null,
    map3d: null,
    gpsMarker: null,
    gpsMarkerPopUp: null,
    gpsButton: null,
    gpsZoom: true,
    eventsButton: null,
    selectedGeometry: null,
    selectedServiceMarker: null,
    selectedServicePopUp: null,
    searchOnSelectedServiceMarker: false,
    manualMarker: null,
    manualMarkerPopUp: null,
    manualButton: null,
    sharingButton: null,
    ticketButton: null,
    cyclePathsButton: null,
    carParkButton: null,
    busStopButton: null,
    greenAreasButton: null,
    infoSOCButton: null,
    searchArea: null,
    weatherButton: null,
    keyOfMoveEndListener: null,
    navigationSearchButton: null,
    geometryWktLayer: [],
    iconsLayer: [],
    iconUrl: null,
    nightDayLayer: null,
    correctRotation: 0,
    correctRotationButton: null,
    activate3dVisualButton: null,
    currentHeading: null,
    defaultLatitude: 43.7761,
    defaultLongitude: 11.2484,
    menuToCheckForClick: null,


    createMap: function () {
        if (MapManager.map === null) {

            MapManager.map = new ol.Map({
                target: 'map',
                controls: ol.control.defaults({
                    attributionOptions: {
                        collapsible: false
                    },
                }),
                layers: [
                    new ol.layer.Tile({
                        source: new ol.source.OSM()
                    })
                ],
                view: new ol.View({
                    center: ol.proj.fromLonLat([MapManager.defaultLongitude, MapManager.defaultLatitude]),
                    zoom: 14
                })
            });

            if (MapManager.navigationSearchButton == null) {
                MapManager.addSingleButton('<i class=\"icon ion-navigate\"></i>', function () { if (NavigatorSearcher.started != true) { NavigatorSearcher.start(); } else { NavigatorSearcher.stop(); } MapManager.centerMapOnGps(); }, 'navigationSearchButton ol-unselectable ol-control', "navigationSearchButton");
            }

            if (MapManager.gpsButton == null) {
                MapManager.addSingleButton('<i class=\"glyphicon glyphicon-record\"></i>', function () { MapManager.centerMapOnGps(); }, 'gpsButton ol-unselectable ol-control', "gpsButton");
            }

            MapManager.addVariableButtons();


            MapManager.map.on('singleclick', function (event) {
                MapManager.removeSearchArea();
                var feature = MapManager.getFeaturesAtPixel(event.pixel);
                var manualMarkerCallback = "CategorySearcher.forceSelectedKeys = ['Service']; SearchManager.searchOnManualMarker('CategorySearcher')";
                MapManager.closePopUp();
                if (feature) {
                    if (feature.get('name') == "gps") {
                        if (typeof NavigatorSearcher != "undefined") {
                            if (NavigatorSearcher.started != true) {
                                MapManager.initializeAndUpdatePopUpGpsMarker();
                            }
                        } else {
                            MapManager.initializeAndUpdatePopUpGpsMarker();
                        }
                    } else if (feature.get('name') == "manual") {
                        if (MapManager.menuToCheckForClick != null) {
                            if (window[MapManager.menuToCheckForClick]["clickOnManualMarker"] != null) {
                                window[MapManager.menuToCheckForClick]["clickOnManualMarker"](event);
                            }
                        } else {
                            MapManager.initializeAndUpdatePopUpManualMarker(Globalization.labels.searchPopUp.aroundYou, manualMarkerCallback);
                        }
                    } else if (feature.get('name') != null) {
                        var lnglat = ol.proj.toLonLat(feature.getGeometry().getCoordinates());
                        MapManager.addSelectedServiceMarker(feature.get('serviceType'), feature.get('name').replace(/_/g, " ").toLowerCase(), feature.get('civic'), feature.get('busLines'), feature.get('agency'), feature.get('serviceUri'), lnglat[1], lnglat[0], feature.get('alternativeIcon'));
                        InfoManager.showInfoAboutOneMarker(feature.get('serviceUri'), lnglat[1], lnglat[0]);
                    }
                } else if (typeof NavigatorSearcher != "undefined") {
                    if (NavigatorSearcher.started != true) {
                        if (MapManager.menuToCheckForClick != null) {
                            if (window[MapManager.menuToCheckForClick]["clickOnMap"] != null) {
                                window[MapManager.menuToCheckForClick]["clickOnMap"](event);
                            }
                        } else {
                            MapManager.addManualMarker(event.coordinate, Globalization.labels.searchPopUp.aroundYou, manualMarkerCallback);
                        }
                    }
                } else {
                    if (MapManager.menuToCheckForClick != null) {
                        if (window[MapManager.menuToCheckForClick]["clickOnMap"] != null) {
                            window[MapManager.menuToCheckForClick]["clickOnMap"](event);
                        }
                    } else {
                        MapManager.addManualMarker(event.coordinate, Globalization.labels.searchPopUp.aroundYou, manualMarkerCallback);
                    }
                }
            });
        }
    },

    activate3d: function () {
        if (MapManager.map != null && MapManager.map3d == null) {
            try {
                MapManager.map3d = new olcs.OLCesium({ map: MapManager.map }); // map is the ol.Map instance
                MapManager.map3d.setEnabled(true);
                MapManager.map3d.getCamera().setTilt(Math.PI / 3);
                MapManager.map3d.getCamera().setAltitude(200);
                $("#activate3dVisualButton").html('<b>2D</b>');
            } catch (err) {
                console.log(err);
                if (MapManager.activate3dVisualButton != null) {
                    MapManager.map.removeControl(MapManager.activate3dVisualButton);
                    MapManager.activate3dVisualButton = null;
                }
            }
        }
    },

    disabling3d: function () {
        if (MapManager.map3d != null) {
            MapManager.map3d.setEnabled(false);
            MapManager.map3d = null;
            if ($("#activate3dVisualButton") != null) {
                $("#activate3dVisualButton").html('<b>3D</b>');
            }
            MapManager.updateMap();
        }
    },

    getFeaturesAtPixel: function (pixel) {
        var featureToReturn = null;
        if (MapManager.map3d && MapManager.map3d.getEnabled()) {
            var pickedObject = MapManager.map3d.getCesiumScene().pick(new Cesium.Cartesian2(pixel[0], pixel[1]));
            if (typeof pickedObject !== "undefined") {
                featureToReturn = pickedObject.primitive.olFeature;
            }
        } else {
            MapManager.map.forEachFeatureAtPixel(pixel, function (feature) {
                if (feature.get('serviceUri') != null || feature.get('name') != null) {
                    if (featureToReturn == null) {
                        featureToReturn = feature;
                    }
                }
            });
        }

        return featureToReturn;
    },

    updateMap: function () {
        if (MapManager.map != null) {
            MapManager.map.updateSize();
        }
    },

    disactiveInterationsForNavigation: function () {
        MapManager.map.getInteractions().forEach(function (interaction) {
            if (interaction instanceof ol.interaction.DragPan) {
                interaction.setActive(false); 
            }
            if (interaction instanceof ol.interaction.PinchRotate) {
                interaction.setActive(false);
            }
            if (interaction instanceof ol.interaction.DragZoom) {
                interaction.setActive(false);
            }
        }, this);
        MapManager.keyOfMoveEndListener = MapManager.map.on("moveend", function (event) {
            MapManager.map.getView().setCenter(MapManager.gpsMarker.getSource().getFeatures()[0].getGeometry().getCoordinates());
        });

    },

    activeIntereationsAfterNavigation: function () {
        MapManager.map.getInteractions().forEach(function (interaction) {
            if (interaction instanceof ol.interaction.DragPan) {
                interaction.setActive(true);
            }
            if (interaction instanceof ol.interaction.PinchRotate) {
                interaction.setActive(true);
            }
            if (interaction instanceof ol.interaction.DragZoom) {
                interaction.setActive(true);
            }
        }, this);
        MapManager.map.unByKey(MapManager.keyOfMoveEndListener);
    },

    addNavigationButtons: function () {
        if (MapManager.correctRotationButton == null) {
            MapManager.addSingleButton('<i class=\"glyphicon glyphicon-repeat\"></i>', function () { MapManager.increaseCorrectRotation(); }, 'manualButton ol-unselectable ol-control', "correctRotationButton");
        }
        if (MapManager.activate3dVisualButton == null) {
            MapManager.addSingleButton('<b>3D</b>', function () { if (MapManager.map3d == null) { MapManager.activate3d(); } else { MapManager.disabling3d(); } }, 'ticketButton ol-unselectable ol-control', "activate3dVisualButton");
        }
    },

    addSingleButton: function (innerHTML, callback, className, buttonToAdd) {
        var buttonFunction = function (opt_options) {

            var options = opt_options || {};

            var button = document.createElement('button');
            button.innerHTML = innerHTML;
            button.id = buttonToAdd;

            var handle = callback;

            button.addEventListener('click', handle, false);

            var element = document.createElement('div');
            element.className = className;
            element.appendChild(button);

            ol.control.Control.call(this, {
                element: element,
                target: options.target
            });

        };

        ol.inherits(buttonFunction, ol.control.Control);
        MapManager[buttonToAdd] = new buttonFunction();
        MapManager.map.addControl(MapManager[buttonToAdd]);
    },

    addVariableButtons: function () {

        if (MapManager.manualButton == null) {
            MapManager.addSingleButton('<i class=\"glyphicon glyphicon-map-marker\"></i>', function () { MapManager.centerMapOnManual(); }, 'manualButton ol-unselectable ol-control', "manualButton");
        }

        if (MapManager.eventsButton == null) {
            MapManager.addSingleButton('<i class=\"glyphicon glyphicon-calendar\"></i>', function () { EventsSearcher.search("week"); }, 'eventsButton ol-unselectable ol-control', "eventsButton");
        }
        if (MapManager.cyclePathsButton == null) {
            MapManager.addSingleButton('<i class=\"icon ion-android-bicycle\"></i>', function () { CategorySearcher.forceSelectedKeys = ["Cycle_paths"]; SearchManager.search("CategorySearcher"); }, 'cyclePathsButton ol-unselectable ol-control', "cyclePathsButton");
        }


        if (MapManager.greenAreasButton == null) {
            MapManager.addSingleButton('<img style="height:23px" src="img/greenAreas.png">', function () { CategorySearcher.forceSelectedKeys = ["Green_areas", "Gardens"]; SearchManager.search("CategorySearcher"); }, 'greenAreasButton ol-unselectable ol-control', "greenAreasButton");
        } 
        if (MapManager.carParkButton == null) {
            MapManager.addSingleButton('<b>P</b>', function () { SearchManager.search('ParkingSearcher'); }, 'carParkButton ol-unselectable ol-control', "carParkButton");
        }

        if (MapManager.busStopButton == null) {
            MapManager.addSingleButton('<i class=\"icon ion-android-bus\"></i>', function () { SearchManager.search('TPLSearcher'); }, 'busStopButton ol-unselectable ol-control', "busStopButton");
        }

    },

    removeNavigationButtons: function () {
        if (MapManager.correctRotationButton != null) {
            MapManager.map.removeControl(MapManager.correctRotationButton);
            MapManager.correctRotationButton = null;
        }
        if (MapManager.activate3dVisualButton != null) {
            MapManager.map.removeControl(MapManager.activate3dVisualButton);
            MapManager.activate3dVisualButton = null;
        }
    },

    removeVariableButtons: function () {
        if (MapManager.ticketButton != null) {
            MapManager.map.removeControl(MapManager.ticketButton);
            MapManager.ticketButton = null;
        }
        if (MapManager.manualButton != null) {
            MapManager.map.removeControl(MapManager.manualButton);
            MapManager.manualButton = null;
        }
        if (MapManager.weatherButton != null) {
            MapManager.map.removeControl(MapManager.weatherButton);
            MapManager.weatherButton = null;
        }
        if (MapManager.eventsButton != null) {
            MapManager.map.removeControl(MapManager.eventsButton);
            MapManager.eventsButton = null;
        }
        if (MapManager.cyclePathsButton != null) {
            MapManager.map.removeControl(MapManager.cyclePathsButton);
            MapManager.cyclePathsButton = null;
        }
        if (MapManager.carParkButton != null) {
            MapManager.map.removeControl(MapManager.carParkButton);
            MapManager.carParkButton = null;
        }
        if (MapManager.greenAreasButton != null) {
            MapManager.map.removeControl(MapManager.greenAreasButton);
            MapManager.greenAreasButton = null;
        }
        if (MapManager.infoSOCButton != null) {
            MapManager.map.removeControl(MapManager.infoSOCButton);
            MapManager.infoSOCButton = null;
        }
        if (MapManager.busStopButton != null) {
            MapManager.map.removeControl(MapManager.busStopButton);
            MapManager.busStopButton = null;
        }
        if (MapManager.sharingButton != null) {
            MapManager.map.removeControl(MapManager.sharingButton);
            MapManager.sharingButton = null;
        }

    },

    centerMapOnGps: function () {
        if (MapManager.gpsMarker != null && MapManager.map != null) {
            MapManager.map.getView().setCenter(MapManager.gpsMarker.getSource().getFeatures()[0].getGeometry().getCoordinates());
            MapManager.map.getView().setZoom(16);
            if (typeof NavigatorSearcher != "undefined") {
                if (NavigatorSearcher.started != true) {
                    $(document.getElementById('gpsPopup')).popover('show');
                }
            } else {
                $(document.getElementById('gpsPopup')).popover('show');
            }
        } else if (MapManager.manualMarker != null) {
            navigator.notification.alert(Globalization.alerts.noPosition.message, function () { }, Globalization.alerts.noPosition.title);
        } else {
            navigator.notification.confirm(Globalization.alerts.noPosition.message, function (indexButton) {
                if (device.platform == "Android") {
                    if (indexButton == 3) {
                        CheckGPS.openSettings();
                    }
                }
            }, Globalization.alerts.noPosition.title, Globalization.alerts.noPosition.buttonName);
        }


    },

    centerMapOnManual: function () {
        if (MapManager.manualMarker != null) {
            MapManager.map.getView().setCenter(MapManager.manualMarker.getSource().getFeatures()[0].getGeometry().getCoordinates());
            MapManager.map.getView().setZoom(16);
            $(document.getElementById('manualPopup')).popover('show');

        } else {
            navigator.notification.alert(Globalization.alerts.manualPosition.message, function () { }, Globalization.alerts.manualPosition.title);
        }
    },

    centerMapOnCoordinates: function (latitude, longitude) {
        if (MapManager.map != null) {
            MapManager.map.getView().setCenter(ol.proj.fromLonLat([longitude, latitude]));
        }
    },

    updateGpsMarker: function (latitude, longitude) {
        if (MapManager.gpsMarker != null) {
            var currentCoordinates = ol.proj.toLonLat(MapManager.gpsMarker.getSource().getFeatures()[0].getGeometry().getCoordinates());

            var newLongitude = longitude;
            var newLatitude = latitude;
            if (GpsManager.getDistanceFromLatLonInM(latitude, longitude, currentCoordinates[1], currentCoordinates[0]) < 20) {
                newLongitude = (currentCoordinates[0] + longitude) / 2;
                newLatitude = (currentCoordinates[1] + latitude) / 2;
            }

            MapManager.gpsMarker.getSource().getFeatures()[0].setGeometry(new ol.geom.Point(ol.proj.fromLonLat([newLongitude, newLatitude])));
            if (typeof NavigatorSearcher != "undefined") {
                if (NavigatorSearcher.started == true) {
                    MapManager.map.getView().setCenter(MapManager.gpsMarker.getSource().getFeatures()[0].getGeometry().getCoordinates());
                }
            }
            if (MapManager.gpsMarkerPopUp != null) {
                MapManager.gpsMarkerPopUp.setPosition(ol.proj.fromLonLat([longitude, latitude]));
            }
        } else {
            MapManager.initializeGpsMarker(latitude, longitude);
        }
    },

    updateRotation: function (heading, sender) {
        if (typeof NavigatorSearcher != "undefined") {
            if (NavigatorSearcher.started == true) {
                var rad = 0;
                if (Math.abs(heading - MapManager.currentHeading) < 180) {
                    MapManager.currentHeading = (heading + MapManager.currentHeading) / 2;
                } else {
                    MapManager.currentHeading = heading;
                }
                if (sender == "gps") {
                    rad = ((360 - MapManager.currentHeading + MapManager.correctRotation) * Math.PI) / 180;
                } else if (screen.orientation.angle != null) {
                    rad = ((360 - screen.orientation.angle - MapManager.currentHeading + MapManager.correctRotation) * Math.PI) / 180;

                } else {
                    if (screen.orientation == "portrait-primary") {
                        rad = ((360 - MapManager.currentHeading + MapManager.correctRotation) * Math.PI) / 180;
                    } else if (screen.orientation == "landscape-primary") {
                        rad = ((270 - MapManager.currentHeading + MapManager.correctRotation) * Math.PI) / 180;
                    } else if (screen.orientation == "portrait-secondary") {
                        rad = ((180 - MapManager.currentHeading + MapManager.correctRotation) * Math.PI) / 180;
                    } else if (screen.orientation == "landscape-secondary") {
                        rad = ((90 - MapManager.currentHeading + MapManager.correctRotation) * Math.PI) / 180;
                    }
                }
                MapManager.map.getView().setRotation(rad);
            }
        }
    },

    increaseCorrectRotation: function () {
        MapManager.correctRotation = (MapManager.correctRotation + 90) % 360;
        if (MapManager.currentHeading != null) {
            MapManager.updateRotation(MapManager.currentHeading);
        }
    },

    initializeGpsMarker: function (latitude, longitude) {

        var coordinates = [longitude, latitude];

        var gpsFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat(coordinates)),
            name: "gps"
        });

        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                size: [20, 20],
                src: 'img/gpsMarker.png'
            })
        })

        gpsFeature.setStyle(iconStyle);

        MapManager.gpsMarker = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [gpsFeature]
            })
        });
        if (MapManager.map != null) {
            MapManager.map.addLayer(MapManager.gpsMarker);
            MapManager.gpsMarker.setZIndex(1);
            if (MapManager.gpsZoom == true) {
                MapManager.map.getView().setCenter(ol.proj.fromLonLat(coordinates));
                MapManager.map.getView().setZoom(16);
            }
        }
        MapManager.initializeAndUpdatePopUpGpsMarker();
    },

    initializeAndUpdatePopUpGpsMarker: function () {
        if (MapManager.map != null) {
            if (MapManager.gpsMarker != null) {
                $(document.getElementById('gpsPopup')).popover('destroy');
                var element = document.getElementById('gpsPopup');
                var initPopUp = false;
                if (MapManager.gpsMarkerPopUp == null) {
                    initPopUp = true;
                    MapManager.gpsMarkerPopUp = new ol.Overlay({
                        element: element,
                        offset: [0, -9],
                        positioning: 'bottom-center'
                    });
                    MapManager.map.addOverlay(MapManager.gpsMarkerPopUp);
                }

                MapManager.gpsMarkerPopUp.setPosition(MapManager.gpsMarker.getSource().getFeatures()[0].getGeometry().getCoordinates());

                $(element).popover({
                    'placement': 'top',
                    'animation': false,
                    'html': true,
                    'content': "<h4><a onclick=\"CategorySearcher.forceSelectedKeys = ['Service']; SearchManager.searchOnGpsMarker('CategorySearcher');\" style=\"text-decoration: none;cursor: pointer;\"><b style=\"color: blue; \"> " + Globalization.labels.gpsPopUp.aroundYou + " </b></a></h4><h4><a onclick=\"Instigator.show();Instigator.getSuggestions('gps', true);\" style=\"text-decoration: none;cursor: pointer;\"><b style=\"color: green; \"> " + Globalization.labels.gpsPopUp.suggestions + " </b></a></h4><h4><a onclick=\"Instigator.show(); MapManager.addGeoJSONLayerWithoutArea(Instigator.response);\" style=\"text-decoration: none;cursor: pointer;\"><b style=\"color: purple; white-space: nowrap;\"> " + Globalization.labels.gpsPopUp.lastSuggestions + " </b></a></h4>"
                });
                if (device.platform == "iOS" && initPopUp) {
                    setTimeout(function () { $(element).popover('show'); }, 800);
                } else {
                    $(element).popover('show');
                }
            }
        }
    },

    removeAndUpdatePopUpGpsMarker: function () {
        if (MapManager.map != null) {
            if (MapManager.gpsMarker != null) {
                $(document.getElementById('gpsPopup')).popover('hide');
            }
        }
    },

    initializeAndUpdatePopUpManualMarker: function (label, callback) {
        if (MapManager.map != null) {
            if (MapManager.manualMarker != null) {
                $(document.getElementById('manualPopup')).popover('destroy');
                var element = document.getElementById('manualPopup');
                if (MapManager.manualMarkerPopUp == null) {
                    MapManager.manualMarkerPopUp = new ol.Overlay({
                        element: element,
                        offset: [0, -23],
                        positioning: 'bottom-center'
                    });

                    MapManager.map.addOverlay(MapManager.manualMarkerPopUp);
                }

                MapManager.manualMarkerPopUp.setPosition(MapManager.manualMarker.getSource().getFeatures()[0].getGeometry().getCoordinates());
                $(element).popover({
                    'placement': 'top',
                    'animation': false,
                    'html': true,
                    'content': "<h4><a onclick=\"" + callback + "\" style=\"text-decoration: none;cursor: pointer;\"><b style=\"color: blue; white-space: nowrap;\"> " + label + " </b></a></h4><h4><a onclick=\"Instigator.show();Instigator.getSuggestions('manual', true);\" style=\"text-decoration: none;cursor: pointer;\"><b style=\"color: green; white-space: nowrap;\"> " + Globalization.labels.searchPopUp.suggestions + " </b></a></h4><h4><a onclick=\"MapManager.removeManualMarker();\" style=\"text-decoration: none;cursor: pointer;\"><b style=\"color: red\"> " + Globalization.labels.searchPopUp.remove + " </b></a></h4>"
                });
                $(element).popover('show');
            }
        }
    },

    closePopUp: function () {
        if (MapManager.gpsMarker != null) {
            $(document.getElementById('gpsPopup')).popover('hide');
        }
        if (MapManager.manualMarker != null) {
            $(document.getElementById('manualPopup')).popover('hide');
        }
        if (MapManager.selectedServiceMarker != null) {
            $(document.getElementById('selectedServicePopup')).popover('hide');
        }
    },


    mapCenterCoordinates: function () {
        if (MapManager.map != null) {
            var lnglat = ol.proj.toLonLat(MapManager.map.getView().getCenter());
            return [lnglat[1], lnglat[0]];
        } else {
            return null;
        }
    },

    gpsMarkerCoordinates: function () {
        if (MapManager.gpsMarker != null) {
            var lnglat = ol.proj.toLonLat(MapManager.gpsMarker.getSource().getFeatures()[0].getGeometry().getCoordinates());
            return [lnglat[1], lnglat[0]];
        } else {
            return null;
        }
    },

    manualMarkerCoordinates: function () {
        if (MapManager.manualMarker != null) {
            var lnglat = ol.proj.toLonLat(MapManager.manualMarker.getSource().getFeatures()[0].getGeometry().getCoordinates());
            return [lnglat[1], lnglat[0]];
        } else {
            return null;
        }
    },

    selectedServiceMarkerCoordinates: function () {
        if (MapManager.selectedServiceMarker != null) {
            var lnglat = ol.proj.toLonLat(MapManager.selectedServiceMarker.getSource().getFeatures()[0].getGeometry().getCoordinates());
            return [lnglat[1], lnglat[0]];
        } else {
            return null;
        }
    },

    addGeoJSONLayer: function (jsonFile) {

        MapManager.closePopUp();

        if (MapManager.searchOnSelectedServiceMarker == true) {
            MapManager.resetMarkerExceptSelectedServiceMarker();
        } else {
            MapManager.resetMarker();
        }

        var searchAreaFeature = new ol.Feature({
            geometry: new ol.geom.Circle(ol.proj.fromLonLat([SearchManager.searchCenter[1], SearchManager.searchCenter[0]]), QueryManager.maxDists * 1000 * 1.5),
        });
        var areaStyle;
        var serviceUriWithGeometry = [];
        for (var category in jsonFile) {
            if (jsonFile[category].features != null) {
                if (jsonFile[category].features.length != 0) {
                    var features = (new ol.format.GeoJSON()).readFeatures(jsonFile[category]);
                    for (var i = 0; i < features.length; i++) {
                        if (features[i].get('alternativeIcon') == null) {
                            var iconUrl = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/' + features[i].get('serviceType') + '.png', "classic");
                        } else {
                            var iconUrl = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/' + features[i].get('alternativeIcon') + '.png', "classic");
                        }

                        var iconStyle = new ol.style.Style({
                            image: new ol.style.Icon({
                                anchor: [0.5, 1],
                                size: [36, 41],
                                src: iconUrl
                            })
                        });
                        features[i].setStyle(iconStyle);
                        //Si inserisce un po' di rumore (1-5 metri) per evitare che servizi con le stesse coordinate siano posizionati nelle stesse coordinate GPS
                        features[i].getGeometry().getCoordinates()[0] = features[i].getGeometry().getCoordinates()[0] + (Math.random() * (0.000030 - 0.000010) + 0.000010);
                        features[i].getGeometry().getCoordinates()[1] = features[i].getGeometry().getCoordinates()[1] + (Math.random() * (0.000030 - 0.000010) + 0.000010);
                        features[i].setGeometry(new ol.geom.Point(ol.proj.fromLonLat(features[i].getGeometry().getCoordinates())));

                        if (features[i].get('hasGeometry') == true && features[i].get('serviceType') != "TransferServiceAndRenting_Controlled_parking_zone" && features[i].get('serviceType') != "TourismService_Tourist_trail") {
                            serviceUriWithGeometry.push(features[i].get('serviceUri'));
                        }
                    }

                    MapManager.iconsLayer[category] = new ol.layer.Vector({
                        source: new ol.source.Vector({
                            features: features
                        })
                    });

                    if (MapManager.map != null) {
                        MapManager.map.addLayer(MapManager.iconsLayer[category]);
                        MapManager.iconsLayer[category].setZIndex(1);

                        for (var i = 0; i < serviceUriWithGeometry.length; i++) {
                            var serviceQuery = QueryManager.createServiceQuery(serviceUriWithGeometry[i], "app");
                            APIClient.executeQueryWithoutAlert(serviceQuery, MapManager.addGeometryWktElement, MapManager.errorQueryGeometryWktElement);
                        }
                    }

                    if (jsonFile[category].fullCount != null && !isNaN(jsonFile[category].fullCount)) {
                        $("#servicesFoundedInner").html(Globalization.labels.servicesFounded.services + jsonFile[category].features.length + Globalization.labels.servicesFounded.on + jsonFile[category].fullCount + Globalization.labels.servicesFounded.available);
                    } else {
                        $("#servicesFoundedInner").html(Globalization.labels.servicesFounded.services + jsonFile[category].features.length);
                    }
                    $("#servicesFounded").show(0);

                    areaStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(0, 204, 0, 0.3)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#0c0',
                            width: 4
                        })
                    });

                } else {

                    areaStyle = new ol.style.Style({
                        fill: new ol.style.Fill({
                            color: 'rgba(255, 0, 51, 0.3)'
                        }),
                        stroke: new ol.style.Stroke({
                            color: '#f03',
                            width: 4
                        })
                    });
                }
            }

        }

        searchAreaFeature.setStyle(areaStyle);

        MapManager.searchArea = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [searchAreaFeature]
            })
        });

        if (MapManager.map != null) {
            MapManager.map.addLayer(MapManager.searchArea);
            MapManager.searchArea.setZIndex(0);
            MapManager.map.getView().fit(MapManager.searchArea.getSource().getExtent(), MapManager.map.getSize(), {
                constrainResolution: false,
                padding: [10, 10, 10, 10]
            });
        }

        if (MapManager.searchOnSelectedServiceMarker == true) {
            $(document.getElementById('selectedServicePopup')).popover('show');
            MapManager.searchOnSelectedServiceMarker = false;
        }

    },

    addGeoJSONLayerWithoutArea: function (jsonFile) {

        MapManager.closePopUp();

        if (MapManager.searchOnSelectedServiceMarker == true) {
            MapManager.resetMarkerExceptSelectedServiceMarker();
        } else {
            MapManager.resetMarker();
        }

        var serviceUriWithGeometry = [];

        for (var category in jsonFile) {
            if (jsonFile[category].features != null) {
                if (jsonFile[category].features.length != 0) {
                    var features = (new ol.format.GeoJSON()).readFeatures(jsonFile[category]);
                    for (var i = 0; i < features.length; i++) {
                        if (features[i].get('alternativeIcon') == null) {
                            var iconUrl = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/' + features[i].get('serviceType') + '.png', "classic");
                        } else {
                            var iconUrl = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/' + features[i].get('alternativeIcon') + '.png', "classic");
                        }
                        var iconStyle = new ol.style.Style({
                            image: new ol.style.Icon({
                                anchor: [0.5, 1],
                                size: [36, 41],
                                src: iconUrl
                            })
                        });
                        features[i].setStyle(iconStyle);
                        //Si inserisce un po' di rumore (1-5 metri) per evitare che servizi con le stesse coordinate siano posizionati nelle stesse coordinate GPS
                        features[i].getGeometry().getCoordinates()[0] = features[i].getGeometry().getCoordinates()[0] + (Math.random() * (0.000030 - 0.000010) + 0.000010);
                        features[i].getGeometry().getCoordinates()[1] = features[i].getGeometry().getCoordinates()[1] + (Math.random() * (0.000030 - 0.000010) + 0.000010);
                        features[i].setGeometry(new ol.geom.Point(ol.proj.fromLonLat(features[i].getGeometry().getCoordinates())));

                        if (features[i].get('hasGeometry') == true && features[i].get('serviceType') != "TransferServiceAndRenting_Controlled_parking_zone" && features[i].get('serviceType') != "TourismService_Tourist_trail") {
                            serviceUriWithGeometry.push(features[i].get('serviceUri'));
                        }
                    }

                    MapManager.iconsLayer[category] = new ol.layer.Vector({
                        source: new ol.source.Vector({
                            features: features
                        })
                    });

                    if (MapManager.map != null) {
                        MapManager.map.addLayer(MapManager.iconsLayer[category]);
                        MapManager.iconsLayer[category].setZIndex(1);

                        for (var i = 0; i < serviceUriWithGeometry.length; i++) {
                            var serviceQuery = QueryManager.createServiceQuery(serviceUriWithGeometry[i], "app");
                            APIClient.executeQueryWithoutAlert(serviceQuery, MapManager.addGeometryWktElement, MapManager.errorQueryGeometryWktElement);
                        }

                    }

                    if (jsonFile[category].fullCount != null && !isNaN(jsonFile[category].fullCount)) {
                        if (category == "Event") {
                            $("#servicesFoundedInner").html(Globalization.labels.servicesFounded.events + jsonFile[category].features.length + Globalization.labels.servicesFounded.on + jsonFile[category].fullCount + Globalization.labels.servicesFounded.available);
                        } else {
                            $("#servicesFoundedInner").html(Globalization.labels.servicesFounded.services + jsonFile[category].features.length + Globalization.labels.servicesFounded.on + jsonFile[category].fullCount + Globalization.labels.servicesFounded.available);
                        }
                    } else {
                        if (category == "Event") {
                            $("#servicesFoundedInner").html(Globalization.labels.servicesFounded.events + jsonFile[category].features.length);
                        } else {
                            $("#servicesFoundedInner").html(Globalization.labels.servicesFounded.services + jsonFile[category].features.length);
                        }
                    }
                    $("#servicesFounded").show(0);

                    if (MapManager.map != null && NavigatorSearcher.started != true) {
                        if (MapManager.iconsLayer[category].getSource().getFeatures().length > 1) {
                            MapManager.map.getView().fit(MapManager.iconsLayer[category].getSource().getExtent(), MapManager.map.getSize(), {
                                constrainResolution: false,
                                padding: [40, 20, 10, 20]
                            });
                        } else if (MapManager.iconsLayer[category].getSource().getFeatures().length == 1) {
                            MapManager.map.getView().setCenter(MapManager.iconsLayer[category].getSource().getFeatures()[0].getGeometry().getCoordinates());
                        }
                    }
                }
            }
        }

        if (MapManager.searchOnSelectedServiceMarker == true) {
            $(document.getElementById('selectedServicePopup')).popover('show');
            MapManager.searchOnSelectedServiceMarker = false;
        }
    },

    addGeometryWktElement: function (jsonFile) {
        for (var category in jsonFile) {
            if (jsonFile[category].features.length != 0) {
                var features = (new ol.format.GeoJSON()).readFeatures(jsonFile[category]);
                var geometryStyle = new ol.style.Style({
                    fill: new ol.style.Fill({
                        color: 'rgba(0, 0, 255, 0.3)'
                    }),
                    stroke: new ol.style.Stroke({
                        color: '#00f',
                        width: 4
                    })
                });

                for (var i = 0; i < features.length; i++) {
                    features[i] = (new ol.format.WKT().readFeature(features[i].get('wktGeometry'), {
                        dataProjection: 'EPSG:4326',
                        featureProjection: 'EPSG:3857'
                    }));
                    features[i].setStyle(geometryStyle);
                }

                if (MapManager.geometryWktLayer[category] == null) {
                    MapManager.geometryWktLayer[category] = new ol.layer.Vector({
                        source: new ol.source.Vector({
                            features: features
                        })
                    });
                    if (MapManager.map != null) {
                        MapManager.map.addLayer(MapManager.geometryWktLayer[category]);
                    }
                } else {
                    MapManager.geometryWktLayer[category].getSource().addFeatures(features);
                }


            }
        }
    },

    addManualMarker: function (coordinates,label, callback) {
        if (MapManager.manualMarker === null) {
            var manualFeature = new ol.Feature({
                geometry: new ol.geom.Point(coordinates),
                name: "manual"
            });

            var iconStyle = new ol.style.Style({
                image: new ol.style.Icon({
                    anchor: [0.5, 1],
                    size: [16, 24],
                    src: 'img/manualMarker.png'
                })
            })

            manualFeature.setStyle(iconStyle);

            MapManager.manualMarker = new ol.layer.Vector({
                source: new ol.source.Vector({
                    features: [manualFeature]
                })
            });
            if (MapManager.map != null) {
                MapManager.map.addLayer(MapManager.manualMarker);
                MapManager.manualMarker.setZIndex(1);
            }
        } else {
            MapManager.manualMarker.getSource().getFeatures()[0].setGeometry(new ol.geom.Point(coordinates));
        }
        MapManager.initializeAndUpdatePopUpManualMarker(label, callback);
    },

    addSelectedServiceMarker: function (serviceType, name, civic, busLines, agency, serviceUri, latitude, longitude, alternativeIcon) {

        if (MapManager.selectedServiceMarker != null) {
            MapManager.map.removeLayer(MapManager.selectedServiceMarker);
        }

        for (var category in MapManager.geometryWktLayer) {
            MapManager.map.removeLayer(MapManager.geometryWktLayer[category]);
            MapManager.geometryWktLayer = [];
        }

        var coordinates = [longitude, latitude];

        var selectedServiceFeature = new ol.Feature({
            geometry: new ol.geom.Point(ol.proj.fromLonLat(coordinates)),
            name: name,
            civic: civic,
            busLines: busLines,
            agency: agency,
            serviceType: serviceType,
            serviceUri: serviceUri
        });

        if (alternativeIcon == null || alternativeIcon == '') {
            var iconUrl = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/over/' + serviceType + '_over.png', "over");
        } else {
            var iconUrl = Utility.checkServiceIcon(RelativePath.images + SettingsManager.language + '/over/' + alternativeIcon + '_over.png', "over");
        }



        var iconStyle = new ol.style.Style({
            image: new ol.style.Icon({
                anchor: [0.5, 1],
                size: [36, 41],
                src: iconUrl
            })
        });

        selectedServiceFeature.setStyle(iconStyle);

        MapManager.selectedServiceMarker = new ol.layer.Vector({
            source: new ol.source.Vector({
                features: [selectedServiceFeature]
            })
        });

        if (MapManager.map != null) {
            MapManager.map.addLayer(MapManager.selectedServiceMarker);
            MapManager.selectedServiceMarker.setZIndex(2);
        }

        $(document.getElementById('selectedServicePopup')).popover('destroy');
        var element = document.getElementById('selectedServicePopup');
        if (MapManager.selectedServicePopUp == null) {
            MapManager.selectedServicePopUp = new ol.Overlay({
                element: element,
                offset: [0, -40],
                positioning: 'bottom-center'
            });

            MapManager.map.addOverlay(MapManager.selectedServicePopUp);
        }

        MapManager.selectedServicePopUp.setPosition(MapManager.selectedServiceMarker.getSource().getFeatures()[0].getGeometry().getCoordinates());

        var content = "<a style=\"text-transform:capitalize; color: #777;text-decoration: none\" onclick=\"InfoManager.showInfoAboutOneMarker('" + serviceUri + "'," + latitude + "," + longitude + ")\"><h4><b>" + Utility.unescapeHtml(name) + "</b></h4>";

        if (civic != "" && civic != null && (typeof serviceType == 'undefined' || serviceType == "")) {
            content += "<i id=\"civicNumber\">" + Globalization.labels.textSearchMenu.civic + "</i>" + civic;
        }
        if (agency != "" && agency != null && serviceType.indexOf("TransferServiceAndRenting_BusStop") !== -1) {
            content += "<span>" + agency + "</span><br>";
        }
        if (busLines != "" && busLines != null && serviceType.indexOf("TransferServiceAndRenting_BusStop") !== -1) {
            content += "<i id=\"busStopLines\">" + Globalization.labels.textSearchMenu.lines + "</i>" + busLines;
        }

        content += "</a>";

        $(element).popover({
            'placement': 'top',
            'animation': false,
            'html': true,
            'content': content
        });
        setTimeout(function () { $(element).popover('show'); }, 200);
    },

    addSelectedGeometry: function (wktGeometry) {
        if (wktGeometry != null && wktGeometry != "" && wktGeometry.indexOf("POINT") == -1) {
            if (MapManager.selectedGeometry != null) {
                MapManager.map.removeLayer(MapManager.selectedGeometry);
                MapManager.selectedGeometry = null;
            }

            var feature = (new ol.format.WKT().readFeature(wktGeometry, {
                dataProjection: 'EPSG:4326',
                featureProjection: 'EPSG:3857'
            }));

            geometryStyle = new ol.style.Style({
                fill: new ol.style.Fill({
                    color: 'rgba(120, 0, 170, 0.3)'
                }),
                stroke: new ol.style.Stroke({
                    color: '#7800aa',
                    width: 4
                })
            });

            feature.setStyle(geometryStyle);

            if (MapManager.selectedGeometry == null) {
                MapManager.selectedGeometry = new ol.layer.Vector({
                    source: new ol.source.Vector({
                        features: [feature]
                    })
                });
                if (MapManager.map != null) {
                    MapManager.map.addLayer(MapManager.selectedGeometry);
                    MapManager.selectedGeometry.setZIndex(0);
                    MapManager.map.getView().fit(MapManager.selectedGeometry.getSource().getExtent(), MapManager.map.getSize(), {
                        constrainResolution: false,
                        padding: [130, 30, 10, 30]
                    });
                }
            }
        }
    },



    removeGpsMarker: function () {
        if (MapManager.gpsMarker != null) {
            MapManager.map.removeLayer(MapManager.gpsMarker);
            MapManager.gpsMarker = null;
            $(document.getElementById('gpsPopup')).popover('destroy');
        }
    },

    removeManualMarker: function () {
        if (MapManager.manualMarker != null) {
            MapManager.map.removeLayer(MapManager.manualMarker);
            MapManager.manualMarker = null;
            $(document.getElementById('manualPopup')).popover('destroy');
        }
    },

    removeSearchArea: function () {
        if (MapManager.searchArea != null) {
            MapManager.map.removeLayer(MapManager.searchArea);
            MapManager.searchArea = null;
        }
    },

    resetMarker: function () {
        if (MapManager.selectedServiceMarker != null) {
            MapManager.map.removeLayer(MapManager.selectedServiceMarker);
            MapManager.selectedServiceMarker = null;
            $(document.getElementById('selectedServicePopup')).popover('destroy');
        }

        if (MapManager.selectedGeometry != null) {
            MapManager.map.removeLayer(MapManager.selectedGeometry);
            MapManager.selectedGeometry == null;
        }

        MapManager.removeSearchArea();

        for (var category in MapManager.iconsLayer) {
            MapManager.map.removeLayer(MapManager.iconsLayer[category]);
            MapManager.iconsLayer = [];
        }

        for (var category in MapManager.geometryWktLayer) {
            MapManager.map.removeLayer(MapManager.geometryWktLayer[category]);
            MapManager.geometryWktLayer = [];
        }

        $("#servicesFounded").hide(0);
    },

    resetMarkerExceptSelectedServiceMarker: function () {

        MapManager.removeSearchArea();

        for (var category in MapManager.iconsLayer) {
            MapManager.map.removeLayer(MapManager.iconsLayer[category]);
            MapManager.iconsLayer = [];
        }

        for (var category in MapManager.geometryWktLayer) {
            MapManager.map.removeLayer(MapManager.geometryWktLayer[category]);
            MapManager.geometryWktLayer = [];
        }

        $("#servicesFounded").hide(0);
    },

    showMenuReduceMap: function (idDivMenu) {
        if ($(window).height() > $(window).width()) {
            $(idDivMenu).css({
                'bottom': '0px',
                'top': 'auto',
                'right': '0px',
                'left': '0px',
                'width': '100%',
                'height': '35%'

            });
            $('#content').css({
                'height': '65%',
                'width': '100%'
            });
            $(idDivMenu + " div.grippyContainer").removeClass("grippyContainer-vertical").addClass("grippyContainer-horizontal");
            $(idDivMenu + " div.grippy").removeClass("grippy-vertical").addClass("grippy-horizontal");
            $('#categorySearchMenu').css('height', $('#content').height() + 'px');
        } else {
            $(idDivMenu).css({
                'bottom': '0px',
                'top': '0px',
                'left': 'auto',
                'right': '0px',
                'width': '35%',
                'height': '100%'
            });
            $('#content').css({
                'height': '100%',
                'width': '65%'
            });
            $(idDivMenu + " div.grippyContainer").removeClass("grippyContainer-horizontal").addClass("grippyContainer-vertical");
            $(idDivMenu + " div.grippy").removeClass("grippy-horizontal").addClass("grippy-vertical");
            $("#dropdownThreeVertical").removeClass('open');
            CategorySearcher.hidePanelMenu();
        }
        $('#servicesFounded').css({
            'left': $('#content').width() * 0.2 + 'px',
            'width': $('#content').width() * 0.6 + 'px',

        });
        $('#loadingImage').css({
            'left': $('#content').width() * 0.48 + 'px',
        });
        $('#settingsLoadingImage').css({
            'left': $('#content').width() * 0.48 + 'px',
        });

        $('#autoSearchLoadingImage').css({
            'left': $('#content').width() * 0.48 + 'px',
        });

        MapManager.updateMap();

    },

    reduceMenuShowMap: function (idDivMenu) {
        $(idDivMenu).css({
            'bottom': '-100%',
            'top': 'auto',
            'right': 'auto',
            'width': '100%',
            'height': '35%'
        });
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
        $('#categorySearchMenu').css('height', $('#content').height() + 'px');
        MapManager.updateMap();

    },

    disableGpsZoom: function () {
        MapManager.gpsZoom = false;
    },

    addingMenuToCheck: function (menuToCheck) {
        MapManager.menuToCheckForClick = menuToCheck;
    },

    removingMenuToCheck: function () {
        MapManager.menuToCheckForClick = null;
    },

};
