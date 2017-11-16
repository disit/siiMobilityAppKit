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
var LogRecommender = {

    open: false,
    maxRow: Parameters.maxRowLog,

    show: function () {
        if ($("#logRecommender").length == 0) {
            $("#indexPage").append("<div id=\"logRecommender\"></div>")
        }
        ViewManager.render(JSON.parse(localStorage.getItem("logRecommender")), '#logRecommender', 'Log');
        $('#logRecommender').show();
        LogRecommender.open = true;
        application.addingMenuToCheck("LogRecommender");
        application.setBackButtonListener();
    },

    refreshLog: function () {
        if ($("#logRecommender").length == 0) {
            $("#indexPage").append("<div id=\"logRecommender\"></div>")
        }
        ViewManager.render(JSON.parse(localStorage.getItem("logRecommender")), '#logRecommender', 'Log');
    },

    hide: function () {
        $('#logRecommender').hide(Parameters.hidePanelGeneralDuration);
        LogRecommender.open = false;
        application.removingMenuToCheck("LogRecommender");
    },

    checkForBackButton: function () {
        if (LogRecommender.open) {
            LogRecommender.hide();
        }
    },

    closeAll: function () {
            LogRecommender.hide();
    },

    write: function (textToWrite) {
        var currentLog = JSON.parse(localStorage.getItem("logRecommender"));
        if (currentLog != null) {
            currentLog.lines.push({
                "line": textToWrite
            });
            if (currentLog.lines.length > LogRecommender.maxRow) {
                localStorage.setItem("logRecommender", JSON.stringify({
                    "lines": currentLog.lines.slice(currentLog.lines.length - LogRecommender.maxRow)
                }));
            } else {
                localStorage.setItem("logRecommender", JSON.stringify(currentLog));
            }

        } else {
            localStorage.setItem("logRecommender", JSON.stringify({
                "lines": [{
                    "line": textToWrite
                }]
            }));
        }

        ViewManager.render(JSON.parse(localStorage.getItem("logRecommender")), '#logRecommender', 'Log');

    }

};
