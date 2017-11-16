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
var StartInformation = {

    open: false,

    show: function () {
        if ($("#startInformation").length == 0) {
            $("#indexPage").append("<div id=\"startInformation\"></div>")
        }
        ViewManager.render(null, '#startInformation', 'StartInformation');
        $('#startInformation').show();
        StartInformation.open = true;
        application.addingMenuToCheck("StartInformation");
    },

    hide: function () {
        $('#startInformation').hide();
        StartInformation.open = false;
        application.removingMenuToCheck("StartInformation");
    },

    checkForBackButton: function () {
        if (StartInformation.open) {
            StartInformation.hide();
        }
    }
};
