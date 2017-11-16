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
var FeedbackManager = {

    modalOpen: false,
    currentServiceUri: null,

    sendStars: function () {
        var starsFeedback = $("#inputStarsFeedbackModal").val();
        var starsSendPhoto = $("#inputStarsSendPhotoModal").val();
        var starsSendPhotoAlbum = $("#inputStarsSendPhotoAlbumModal").val();
        if (starsFeedback != 0 || starsSendPhoto != 0) {
            var feedbackQuery = "";
            if (starsFeedback != 0) {
                feedbackQuery = QueryManager.createFeedbackQuery(FeedbackManager.currentServiceUri, null, starsFeedback, "user");
            } else if (starsSendPhoto != 0) {
                feedbackQuery = QueryManager.createFeedbackQuery(FeedbackManager.currentServiceUri, null, starsSendPhoto, "user");
            } else if (starsSendPhotoAlbum != 0) {
                feedbackQuery = QueryManager.createFeedbackQuery(FeedbackManager.currentServiceUri, null, starsSendPhotoAlbum, "user");
            }
            if (feedbackQuery != "") {
                APIClient.executeQueryText(feedbackQuery, FeedbackManager.successStars, FeedbackManager.errorStars);
            }
            FeedbackManager.hideModal();
        } else {
            FeedbackManager.sendComments();
        }
    },

    sendDirectStars: function (stars) {
        if (stars != 0) {
            var feedbackQuery = QueryManager.createFeedbackQuery(FeedbackManager.currentServiceUri, null, stars, "user");
            APIClient.executeQueryText(feedbackQuery, function () { }, function () { });
        }
    },

    sendDirectComment: function(){
        var comment = $("#serviceTextAreaComment").val();
        if (comment != 0) {
            var feedbackQuery = QueryManager.createFeedbackQuery(FeedbackManager.currentServiceUri, comment, null, "user");
            APIClient.executeQueryText(feedbackQuery, FeedbackManager.successComments, FeedbackManager.errorComments);
        }
    },

    successStars: function (response) {
        $("#inputStarsFeedbackModal").rating('clear');
        $("#inputStarsSendPhotoModal").rating('clear');
        $("#inputStarsSendPhotoAlbumModal").rating('clear');
        FeedbackManager.sendComments();
        navigator.notification.alert(Globalization.alerts.sendStarsDone.message, function () { }, Globalization.alerts.sendStarsDone.title);

    },

    errorStars: function (error) {
        navigator.notification.alert(Globalization.alerts.sendStarsError.message, function () { }, Globalization.alerts.sendStarsError.title);
    },

    sendComments: function () {
        PersonalAssistant.removeMessage(PersonalAssistant.currentIdToRemove);
        var commentFeedback = $("#textAreaCommentsFeedbackModal").val();
        var commentSendPhoto = $("#textAreaCommentsSendPhotoModal").val();
        var commentSendPhoto = $("#textAreaCommentsSendPhotoAlbumModal").val();
        if (commentFeedback != 0 || commentSendPhoto != 0) {
            var feedbackQuery = "";
            if (commentFeedback != 0) {
                feedbackQuery = QueryManager.createFeedbackQuery(FeedbackManager.currentServiceUri, commentFeedback, null, "user");
            } else if (commentSendPhoto != 0) {
                feedbackQuery = QueryManager.createFeedbackQuery(FeedbackManager.currentServiceUri, commentSendPhoto, null, "user");
            }
            if (feedbackQuery != "") {
                APIClient.executeQueryText(feedbackQuery, FeedbackManager.successComments, FeedbackManager.errorComments);
            }
        }
        FeedbackManager.hideModal();
    },

    successComments: function (response) {
        PersonalAssistant.removeMessage(PersonalAssistant.currentIdToRemove);
        $("#textAreaCommentsFeedbackModal").val("");
        $("#textAreaCommentsSendPhotoModal").val("");
        $("#textAreaCommentsSendPhotoAlbumModal").val("");
        navigator.notification.alert(Globalization.alerts.sendCommentDone.message, function () { }, Globalization.alerts.sendCommentDone.title);
    },

    errorComments: function (error) {
        console.log(error);
        navigator.notification.alert(Globalization.alerts.sendCommentError.message, function () { }, Globalization.alerts.sendCommentError.title);
    },

    sendVoteSuggestion: function (serviceUri, genID, vote, suggType) {
        var voteSuggestionQuery = QueryManager.createVoteSuggestion(serviceUri, genID, vote, suggType);
        APIClient.executeRecommenderQueryWithoutAlert(voteSuggestionQuery, FeedbackManager.successVoteSuggestion, FeedbackManager.errorVoteSuggestion);
    },

    successVoteSuggestion: function (data) {
        console.log("SUCCESS VOTE");
        console.log(JSON.stringify(data));
    },

    errorVoteSuggestion: function (data) {
        console.log("ERROR VOTE");
        console.log(JSON.stringify(data));
    },

    showModal: function (serviceUri) {
        FeedbackManager.currentServiceUri = serviceUri;
        $("#starsModalCancelButton").html(Globalization.labels.commonLabels.cancel);
        $("#starsModalSendButton").html(Globalization.labels.commonLabels.send);
        $("#userStarsLabelSendFeedbackModal").html(Globalization.labels.infoMenu.userStars);
        $("#commentLabelSendFeedbackModal").html(Globalization.labels.infoMenu.comment);
        $("#buttonUploadPhotoFeedbackModal").html(Globalization.labels.feedbackModal.uploadPhoto);
        $("#buttonTakePhotoFeedbackModal").html(Globalization.labels.feedbackModal.takePhoto);
        //$("#textAreaCommentsFeedbackModal").attr("placeholder", Globalization.labels.feedbackModal.comment);
        $("#starsModal").modal('show');
        $('#starsModal').on('hide.bs.modal', function (e) { FeedbackManager.modalOpen = false; });
        $("#inputStarsFeedbackModal").parent().children("div.rating").children("span.empty-stars").children("span.star").css("color", $("#infoMenuHeader").css("background-color"));
        $("#inputStarsFeedbackModal").parent().children("div.rating").children("span.filled-stars").children("span.star").css("color", $("#infoMenuHeader").css("background-color"));

        FeedbackManager.modalOpen = true;

        if (device.platform == "Web") {
            $("#buttonUploadPhotoFeedbackModal").hide();
            $("#buttonTakePhotoFeedbackModal").hide();
            $("#inputUploadPhotoFeedbackModal").filestyle({ "buttonText": Globalization.labels.feedbackModal.uploadPhoto, "buttonBefore": true, "icon": false, "input": false })
            $("#inputUploadPhotoFeedbackModal").filestyle('clear');
            $("#inputUploadPhotoFeedbackModal").show();
            $("#inputUploadPhotoFeedbackModal").change(function (input) {
                FeedbackManager.hideModal();
                if (input.target.files != null) {
                    var filesReadedArray = [];
                    var formDataArray = [];

                    for (var i = 0; i < input.target.files.length; i++) {
                        var reader = new FileReader();
                        FeedbackManager.currentType = input.target.files[i].type;
                        FeedbackManager.currentFileName = input.target.files[i].name;
                        reader.onload = function (e) {
                            var blob = new Blob([e.target.result], { "type": FeedbackManager.currentType });
                            var fd = new FormData();
                            fd.append("file", blob, FeedbackManager.currentFileName);
                            formDataArray.push(fd);

                            if (formDataArray.length == input.target.files.length) {
                                PictureManager.formDataArrayToUpload = formDataArray;
                            }
                        }
                        reader.readAsArrayBuffer(input.target.files[i]);
                    }

                    for (var i = 0; i < input.target.files.length; i++) {
                        var reader = new FileReader();
                        reader.onload = function (e) {
                            filesReadedArray.push(e.target.result);

                            if (filesReadedArray.length == input.target.files.length) {
                                PictureManager.currentServiceUri = FeedbackManager.currentServiceUri;
                                PictureManager.successPickArray(filesReadedArray);
                            }
                        }
                        reader.readAsDataURL(input.target.files[i]);
                    }

                }
            });
        }
    },

    hideModal: function () {
        $("#starsModal").modal('hide');
        FeedbackManager.modalOpen = false;
    },

    takePhoto: function () {
        $("#inputStarsSendPhotoModal").rating('update', $("#inputStarsFeedbackModal").val());
        $("#inputStarsFeedbackModal").rating('clear')
        $("#textAreaCommentsSendPhotoModal").val($("#textAreaCommentsFeedbackModal").val());
        $("#textAreaCommentsFeedbackModal").val("");
        FeedbackManager.hideModal();
        PictureManager.takePhoto(FeedbackManager.currentServiceUri);
    },

    pickPhotoFromAlbum: function () {
        $("#inputStarsSendPhotoAlbumModal").rating('update', $("#inputStarsFeedbackModal").val());
        $("#inputStarsFeedbackModal").rating('clear')
        $("#textAreaCommentsSendPhotoAlbumModal").val($("#textAreaCommentsFeedbackModal").val());
        $("#textAreaCommentsFeedbackModal").val("");
        FeedbackManager.hideModal();
        PictureManager.pickPhotoFromAlbum(FeedbackManager.currentServiceUri);

    },

    setServiceUri: function (serviceUri) {
        FeedbackManager.currentServiceUri = Utility.unescapeHtml(serviceUri);
    }

};

