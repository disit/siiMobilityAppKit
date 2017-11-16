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
var Log = {

    open: false,
    maxRow: Parameters.maxRowLog,

    showLogTracker: function () {
        if ($("#log").length == 0) {
            $("#indexPage").append("<div id=\"log\"></div>")
        }
        if (device.platform != "Android") {
            ViewManager.render(JSON.parse(localStorage.getItem("log")), '#log', 'Log');
        } else {
            ViewManager.render(JSON.parse(localStorage.getItem("logTracker")), '#log', 'Log');
        }

        $('#log').show();
        Log.open = true;
        application.addingMenuToCheck("Log");
        application.setBackButtonListener();
    },

    showLogNotifier: function () {
        if ($("#log").length == 0) {
            $("#indexPage").append("<div id=\"log\"></div>")
        }
        ViewManager.render(JSON.parse(localStorage.getItem("logNotifier")), '#log', 'Log');
        $('#log').show();
        Log.open = true;
        application.addingMenuToCheck("Log");
        application.setBackButtonListener();
    },

    refreshLog: function () {
        if ($("#log").length == 0) {
            $("#indexPage").append("<div id=\"log\"></div>")
        }
        ViewManager.render(JSON.parse(localStorage.getItem("logTracker")), '#log', 'Log');
    },

    hide: function () {
        $('#log').hide(Parameters.hidePanelGeneralDuration);
        Log.open = false;
        application.removingMenuToCheck("Log");
    },

    checkForBackButton: function () {
        if (Log.open) {
            Log.hide();
        }
    },

    closeAll: function () {
            Log.hide();
    },

    write: function (textToWrite) {
        var currentLog = JSON.parse(localStorage.getItem("log"));
        if (currentLog != null) {
            currentLog.lines.push({
                "line": textToWrite
            });
            if (currentLog.lines.length > Log.maxRow) {
                localStorage.setItem("log", JSON.stringify({
                    "lines": currentLog.lines.slice(currentLog.lines.length - Log.maxRow)
                }));
            } else {
                localStorage.setItem("log", JSON.stringify(currentLog));
            }

        } else {
            localStorage.setItem("log", JSON.stringify({
                "lines": [{
                    "line": textToWrite
                }]
            }));
        }

        ViewManager.render(JSON.parse(localStorage.getItem("log")), '#log', 'Log');

    }

};

