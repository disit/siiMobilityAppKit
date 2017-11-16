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
var QueryManager = {

    defaultDists: Parameters.distsQueryManager,
    defaultDistsRecommender: Parameters.distsRecommenderQueryManager,
    defaultResults: Parameters.resultsQueryManager,
    defaultLanguage: "ita",
    defaultProfile: "all",
    uid: null,
    uid2: null,
    version: null,
    appID: null,
    maxDists: null,
    maxDistsRecommender: null,
    maxResults: null,
    language: null,
    profile: null,
    backupMaxDists: null,
    format: "json",

    refreshParameters: function () {

        if (SettingsManager.maxDistanceRecommender != null) {
            QueryManager.maxDistsRecommender = SettingsManager.maxDistanceRecommender;
        } else {
            QueryManager.maxDistsRecommender = QueryManager.defaultDistsRecommender;
        }
        if (SettingsManager.maxDistance != null) {
            QueryManager.maxDists = SettingsManager.maxDistance;
        } else {
            QueryManager.maxDists = QueryManager.defaultDists;
        }

        if (SettingsManager.numberOfItems != null) {
            QueryManager.maxResults = SettingsManager.numberOfItems;
        } else {
            QueryManager.maxResults = QueryManager.defaultResults;
        }

        if (SettingsManager.language != null) {
            QueryManager.language = SettingsManager.language.substring(0, 2);
        } else {
            QueryManager.language = QueryManager.defaultLanguage;
        }

        if (SettingsManager.profile != null) {
            QueryManager.profile = SettingsManager.profile;
        } else {
            QueryManager.profile = QueryManager.defaultProfile;
        }
        QueryManager.uid2 = application.uid2
        QueryManager.appID = application.appID;
        QueryManager.version = application.version;

    },

    createRetrieveActionsQuery: function () {
        return "engager-api/engager?uid=" + application.uid;
    },


    createBusStopsRoutesQuery: function (line, agencyUri, busStopName, geometry, requestFrom) {
        return "tpl/bus-routes/?line=" + line + "&agency=" + agencyUri + "&busStopName=" + busStopName + "&geometry=" + geometry + "&requestFrom=" + requestFrom + "&uid=" + application.uid;
    },


    createRouteQuery: function (route, geometry, requestFrom) {
        return "tpl/bus-stops/?route=" + route + "&geometry=" + geometry + "&requestFrom=" + requestFrom + "&uid=" + application.uid;
    },

    createLocationQuery: function (queryCoordinates, requestFrom) {
        return "location/?position=" + queryCoordinates.join(";") + "&requestFrom=" + requestFrom + "&uid=" + application.uid + "&lang=" + QueryManager.language;
    },

    createCategoriesQuery: function (categories, queryCoordinates, requestFrom) {
        if (QueryManager.maxDists === null || QueryManager.maxResults === null) {
            QueryManager.refreshParameters();
        }
        return "?selection=" + queryCoordinates.join(";") + "&requestFrom=" + requestFrom + "&categories=" + categories.join(";") + "&maxResults=" + QueryManager.maxResults + "&maxDists=" + QueryManager.maxDists + "&format=" + QueryManager.format + "&uid=" + application.uid + "&lang=" + QueryManager.language + "&geometry=true";
    },

    createCategoriesOnWKTQuery: function (categories, wktGeometry, requestFrom) {
        if (QueryManager.maxDists === null || QueryManager.maxResults === null) {
            QueryManager.refreshParameters();
        }
        return "?selection=wkt:" + wktGeometry + "&requestFrom=" + requestFrom + "&categories=" + categories.join(";") + "&maxResults=" + QueryManager.maxResults + "&maxDists=" + QueryManager.maxDists + "&format=" + QueryManager.format + "&uid=" + application.uid + "&lang=" + QueryManager.language + "&geometry=true";
    },

    createServiceQuery: function (serviceUri, requestFrom) {
        return "?serviceUri=" + serviceUri + "&requestFrom=" + requestFrom + "&format=" + QueryManager.format + "&uid=" + application.uid + "&lang=" + QueryManager.language;
    },

    createTextQuery: function (text, queryCoordinates, requestFrom) {
        return "?selection=" + queryCoordinates.join(";") + "&requestFrom=" + requestFrom + "&search=" + text + "&maxResults=" + QueryManager.maxResults + "&maxDists=" + QueryManager.maxDists + "&format=" + QueryManager.format + "&uid=" + application.uid + "&lang=" + QueryManager.language + "&geometry=true";
    },

    createFullTextQuery: function (text, requestFrom) {
        return "?search=" + text + "&requestFrom=" + requestFrom + "&maxResults=" + QueryManager.maxResults + "&format=" + QueryManager.format + "&uid=" + application.uid + "&lang=" + QueryManager.language + "&geometry=true";
    },

    createAddressPOISearchQuery: function (text, queryCoordinates, sortByDistance, searchMode, categories, requestFrom) {
        if (queryCoordinates != null) {
            return "location/?search=" + text + "&position=" + queryCoordinates.join(";") + "&sortByDistance=" + sortByDistance + "&searchMode=" + searchMode + "&categories=" + categories.join(";") + "&requestFrom=" + requestFrom + "&maxResults=" + QueryManager.maxResults + "&format=" + QueryManager.format + "&uid=" + application.uid + "&lang=" + QueryManager.language + "&geometry=true";
        } else {
            return "location/?search=" + text + "&sortByDistance=" + sortByDistance + "&searchMode=" + searchMode + "&categories=" + categories.join(";") + "&requestFrom=" + requestFrom + "&maxResults=" + QueryManager.maxResults + "&format=" + QueryManager.format + "&uid=" + application.uid + "&lang=" + QueryManager.language + "&geometry=true";
        }
    },

    createFeedbackQuery: function (serviceUri, comment, stars, requestFrom) {
        if (stars != null) {
            return "feedback/?serviceUri=" + serviceUri + "&uid=" + application.uid + "&stars=" + stars + "&requestFrom=" + requestFrom;
        } else if (comment != null) {
            return "feedback/?serviceUri=" + serviceUri + "&uid=" + application.uid + "&comment=" + encodeURIComponent(comment) + "&requestFrom=" + requestFrom;
        }
    },

    createLastFeedbackQuery: function (requestFrom) {
        return "feedback/last/?lang=" + QueryManager.language + "&maxResults=" + 8 + "&uid=" + application.uid + "&requestFrom=" + requestFrom;
    },

    createEventsQuery: function (time, requestFrom) {
        return "events/?range=" + time + "&requestFrom=" + requestFrom + "&uid=" + application.uid;
    },

    createVoteSuggestion: function (serviceUri, genID, vote, suggType) {
        if (serviceUri != null) {
            return "?action=assess&uid=" + application.uid + "&serviceUri=" + serviceUri + "&vote=" + vote + "&suggType=" + suggType;
        } else if (genID != null) {
            return "?action=assess&uid=" + application.uid + "&genID=" + genID + "&vote=" + vote + "&suggType=" + suggType;
        }
    },

    createRecommenderQuery: function (queryCoordinates, mode, aroundMe) {
        LogRecommender.write(dateFormat(new Date(), "[yyyy-mm-dd HH:MM:ss]") + "getSuggestions " + " latitude=" + queryCoordinates[0] + " longitude=" + queryCoordinates[1] + " mode=" + mode + " distance=" + QueryManager.maxDistsRecommender);
        return "?action=recommend&uid=" + application.uid + "&uid2=" + QueryManager.uid2 + "&appID=" + QueryManager.appID + "&profile=" + QueryManager.profile + "&version=" + QueryManager.version + "&latitude=" + queryCoordinates[0] + "&longitude=" + queryCoordinates[1] + "&mode=" + mode + "&aroundme=" + aroundMe + "&distance=" + QueryManager.maxDistsRecommender + "&lang=" + QueryManager.language;
    },

    createRecommendAGroupQuery: function (queryCoordinates, groupToRecommend, mode) {
        LogRecommender.write(dateFormat(new Date(), "[yyyy-mm-dd HH:MM:ss]") + "getGroupSuggestions " + " group=" + groupToRecommend + " latitude=" + queryCoordinates[0] + " longitude=" + queryCoordinates[1] + " mode=" + mode + " distance=" + QueryManager.maxDistsRecommender);
        return "?action=recommendForGroup&uid=" + application.uid + "&uid2=" + QueryManager.uid2 + "&appID=" + QueryManager.appID + "&profile=" + QueryManager.profile + "&version=" + QueryManager.version + "&latitude=" + queryCoordinates[0] + "&longitude=" + queryCoordinates[1] + "&mode=" + mode + "&group=" + groupToRecommend + "&distance=" + QueryManager.maxDistsRecommender + "&lang=" + QueryManager.language;
    },

    createDislikeGroupQuery: function (groupToDislike) {
        LogRecommender.write(dateFormat(new Date(), "[yyyy-mm-dd HH:MM:ss]") + "dislikeGroup " + " group=" + groupToDislike);
        return "?action=dislike&uid=" + application.uid + "&group=" + groupToDislike + "&lang=" + QueryManager.language;
    },

    createDislikeSubCategoryQuery: function (subCategoryToDislike) {
        LogRecommender.write(dateFormat(new Date(), "[yyyy-mm-dd HH:MM:ss]") + "dislikeSubCategory " + " subcategory=" + subCategoryToDislike);
        return "?action=dislikeSubclass&uid=" + application.uid + "&subclass=" + subCategoryToDislike + "&lang=" + QueryManager.language;
    },

    createRemoveDislikeQuery: function () {
        LogRecommender.write(dateFormat(new Date(), "[yyyy-mm-dd HH:MM:ss]") + "removeAllDislike");
        return "?action=removeDislike&uid=" + application.uid + "&lang=" + QueryManager.language;
    },

    createLogViewedTweetQuery: function (tweetID, group) {
        LogRecommender.write(dateFormat(new Date(), "[yyyy-mm-dd HH:MM:ss]") + "logViewedTweet");
        return "?action=logViewedTweet&uid=" + application.uid + "&twitterId=" + tweetID + "&group=" + group + "&lang=" + QueryManager.language;
    },

    createLogPrincipalMenuChoices: function (buttonId, requestFrom) {
        return "notification/?uid=" + application.uid + "&selection=" + buttonId + "&requestFrom=" + requestFrom;
    },

    createLogRemoveMessagePersonalAssistant: function (messageId) {
        return "cancel-engagement?id=" + messageId;
    },

    createShortestPathQuery: function (queryCoordinatesSource, queryCoordinatesDestination, routeType, startDatetime, requestFrom) {
        return "shortestpath/?uid=" + application.uid + "&source=" + queryCoordinatesSource.join(";") + "&destination=" + queryCoordinatesDestination.join(";") + "&routeType=" + routeType + "&startDatetime=" + startDatetime + "&format=" + QueryManager.format + "&requestFrom=" + requestFrom;
    },

    increaseMaxDistTemporary: function () {
        if (QueryManager.backupMaxDists == null) {
            QueryManager.backupMaxDists = QueryManager.maxDists;
        }
        QueryManager.maxDists = QueryManager.maxDists * 2;
        if (QueryManager.maxDists > Parameters.limitDistance) {
            return false;
        }
        return true;
    },

    resetMaxDists: function () {
        if (QueryManager.backupMaxDists != null) {
            QueryManager.maxDists = QueryManager.backupMaxDists;
            QueryManager.backupMaxDists = null;
        }
    }

};

