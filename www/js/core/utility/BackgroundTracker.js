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
var BackgroundTracker = {

    tracker: null,
    result: null,
    config: {

    },

    initialize: function () {
        BackgroundTracker.tracker = cordova.plugins.backgroundServices.tracker;
        BackgroundTracker.start();
        BackgroundTracker.bootStart();
    },

    getStatus: function () {
        BackgroundTracker.tracker.getStatus(function (r) {
            BackgroundTracker.displayResult(r)
        }, function (e) {
            BackgroundTracker.displayError(e)
        });
    },

    displayResult: function (data) {
        console.log("Is service running: " + data.ServiceRunning);
    },

    displayError: function (data) {
        console.log("We have an error");
    },

    handleSuccess: function (data) {
        console.log("Success");
    },

    handleError: function (data) {
        console.log("Error" + data);
    },


    updateHandler: function (data) {
        if (data.LatestResult != null) {
            if (data.LatestResult.Message != null) {
                var resultMessage = JSON.parse(data.LatestResult.Message);
                resultMessage.lines = resultMessage.lines.reverse();
                localStorage.setItem("logTracker", JSON.stringify(resultMessage));
            }
            Log.refreshLog();
        }
    },

    start: function () {
        BackgroundTracker.tracker.getStatus(function (r) {
            BackgroundTracker.startService(r)
        }, function (e) {
            BackgroundTracker.displayError(e)
        });
    },

    stop: function () {
        if (BackgroundTracker.tracker != null) {
            BackgroundTracker.tracker.getStatus(function (r) {
                BackgroundTracker.stopService(r)
            }, function (e) {
                BackgroundTracker.displayError(e)
            });
        }
    },

    bootStart: function () {
        BackgroundTracker.tracker.getStatus(function (r) {
            BackgroundTracker.registerForBootStart(r)
        }, function (e) {
            BackgroundTracker.displayError(e)
        });
    },

    removeBootStart: function () {
        if (BackgroundTracker.tracker != null) {
            BackgroundTracker.tracker.getStatus(function (r) {
                BackgroundTracker.deregisterForBootStart(r)
            }, function (e) {
                BackgroundTracker.displayError(e)
            })
        };
    },

    registerForBootStart: function (data) {
        if (!data.RegisteredForBootStart) {
            BackgroundTracker.tracker.registerForBootStart(function (r) {
                BackgroundTracker.handleSuccess(r)
            }, function (e) {
                BackgroundTracker.handleError(e)
            });
        }
    },

    deregisterForBootStart: function (data) {
        if (data.RegisteredForBootStart) {
            BackgroundTracker.tracker.deregisterForBootStart(function (r) {
                BackgroundTracker.handleSuccess(r)
            }, function (e) {
                BackgroundTracker.handleError(e)
            });
        }
    },

    startService: function (data) {
        if (data.ServiceRunning) {
            BackgroundTracker.enableTimer(data);
        } else {
            BackgroundTracker.tracker.startService(function (r) {
                BackgroundTracker.enableTimer(r)
            }, function (e) {
                BackgroundTracker.displayError(e)
            });
        }
    },

    stopService: function (data) {
        if (data.ServiceRunning) {
            BackgroundTracker.tracker.stopService(function (r) {
                BackgroundTracker.handleSuccess(r)
            }, function (e) {
                BackgroundTracker.handleError(e)
            });
        }
    },

    enableTimer: function (data) {
        if (data.TimerEnabled) {
            BackgroundTracker.registerForUpdates(data);
        } else {
            BackgroundTracker.tracker.enableTimer(BackgroundTracker.config.doWorkIntervalPeriod, function (r) {
                BackgroundTracker.registerForUpdates(r)
            }, function (e) {
                BackgroundTracker.displayError(e)
            });
        }
    },

    registerForUpdates: function (data) {
        if (!data.RegisteredForUpdates) {
            BackgroundTracker.tracker.registerForUpdates(function (r) {
                BackgroundTracker.updateHandler(r)
            }, function (e) {
                BackgroundTracker.handleError(e)
            });
        }
    },

    refreshOrStartService: function (data) {
        if (data.ServiceRunning) {
            BackgroundTracker.tracker.setConfiguration(BackgroundTracker.config, function (r) {
                BackgroundTracker.handleSuccess(r)
            }, function (e) {
                BackgroundTracker.handleError(e)
            });
            BackgroundTracker.tracker.disableTimer(function (r) {
                BackgroundTracker.handleSuccess(r)
            },
                function (e) {
                    BackgroundTracker.handleError(e)
                });
            BackgroundTracker.tracker.enableTimer(BackgroundTracker.config.doWorkIntervalPeriod,
                function (r) {
                    BackgroundTracker.handleSuccess(r)
                },
                function (e) {
                    BackgroundTracker.handleError(e)
                });
        } else {
            BackgroundTracker.initialize();
        }
    }
};
