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
var PictureManager = {

    sendPhotoModalOpen: false,
    sendPhotoAlbumModalOpen: false,
    currentServiceUri: null,
    formDataArrayToUpload: null,
    sendedImages: 0,
    errorSendedImagesLabels: [],
    errorSendedImagesPath: [],
    fileArrayToUpload: [],
    maxImages: 5,
    abortOperation: false,

    takePhoto: function (serviceUri) {
        PictureManager.currentServiceUri = serviceUri;
        PictureManager.fileArrayToUpload = [];
        navigator.camera.getPicture(PictureManager.successTake, PictureManager.errorTake);
    },

    successTake: function (imageUri) {
        $('#sendPhotoPreview').attr('src', imageUri);
        PictureManager.showSendPhotoModal();
        PictureManager.fileArrayToUpload.push(imageUri);
    },

    errorTake: function () {
        console.log("Error!");
    },

    pickPhotoFromAlbum: function (serviceUri) {
        PictureManager.currentServiceUri = serviceUri;
        PictureManager.fileArrayToUpload = [];
        if (device.platform == "Android") {
            plugins.imagePicker.getPictures(PictureManager.successPickArray, PictureManager.errorPick, { maxImages: PictureManager.maxImages, quality: 70 });
        } else {
            var destinationTypeValue = (device.platform == 'windows' || device.platform == 'Win32NT' ? 2 : 1)
            navigator.camera.getPicture(PictureManager.successPickUri, PictureManager.errorPick, { sourceType: 0, quality: 70, destinationType: destinationTypeValue });
        }
    },
    successPickUri: function (imageUri) {
        $('#sendPhotoAlbumModalImageList').empty();
        var content = "<img src='" + imageUri + "'style=\"margin-right: 2.5px; margin-left: 2.5px; max-width: 70%\" class=\"photoAlbum card-2\">";
        PictureManager.fileArrayToUpload.push(imageUri);
        $('#sendPhotoAlbumModalImageList').html(content);
        PictureManager.showSendPhotoAlbumModal();
    },

    successPickArray: function (results) {
        if (results.length != 0) {
            $('#sendPhotoAlbumModalImageList').empty();
            var content = "";
            for (var i = 0; i < results.length; i++) {
                content = content + "<img src='" + results[i] + "'style=\"margin-right: 2.5px; margin-left: 2.5px\" class=\"photoAlbum\">";
                PictureManager.fileArrayToUpload.push(results[i]);
            }

            $('#sendPhotoAlbumModalImageList').html(content);
            PictureManager.showSendPhotoAlbumModal();
        }
    },

    errorPick: function (error) {
        console.log('Error: ' + error);
    },

    uploadPhoto: function () {
        PictureManager.abortOperation = false;
        PictureManager.sendedImages = 0;
        PictureManager.errorSendedImagesLabels = [];
        PictureManager.errorSendedImagesPath = [];
        if (device.platform != "Web") {
            for (var i = 0; i < PictureManager.fileArrayToUpload.length; i++) {
                APIClient.uploadPhoto(PictureManager.fileArrayToUpload[i], PictureManager.currentServiceUri, PictureManager.successUpload, PictureManager.errorUpload);
            }
        } else {
            var photoUploadQuery = QueryManager.createPhotoUploadQuery(PictureManager.currentServiceUri, "user");
            for (var i = 0; i < PictureManager.formDataArrayToUpload.length; i++) {
                APIClient.uploadPhotoFromWeb(photoUploadQuery, PictureManager.formDataArrayToUpload[i], PictureManager.successUpload, PictureManager.errorUpload);
            }
        }

    },

    successUpload: function (r) {
        PictureManager.sendedImages++;
        if (device.platform != "Web") {
            console.log("Code = " + r.responseCode + " Response = " + r.response + " Sent = " + r.bytesSent);
            if ((PictureManager.sendedImages + PictureManager.errorSendedImagesPath.length) == PictureManager.fileArrayToUpload.length) {
                PictureManager.finalOperation();
            }
        } else {
            console.log("Sent Image");
            if ((PictureManager.sendedImages + PictureManager.errorSendedImagesPath.length) == PictureManager.formDataArrayToUpload.length) {
                PictureManager.finalOperation();
            }
        }
    },

    errorUpload: function (error) {

        if (device.platform != "Web") {
            console.log("An error has occurred: Code = " + error.code + " upload error source " + error.source + " upload error target " + error.target);
            PictureManager.errorSendedImagesLabels.push(error.source.substring(error.source.lastIndexOf("/") + 1));
            PictureManager.errorSendedImagesPath.push(error.source);
            if (PictureManager.errorSendedImagesPath != null && PictureManager.formDataArrayToUpload != null) {
                if ((PictureManager.sendedImages + PictureManager.errorSendedImagesPath.length) == PictureManager.fileArrayToUpload.length) {
                    PictureManager.finalOperation();
                }
            }
        } else {
            console.log("An error has occurred");
            if (PictureManager.errorSendedImagesPath != null && PictureManager.formDataArrayToUpload != null) {
                if ((PictureManager.sendedImages + PictureManager.errorSendedImagesPath.length) == PictureManager.formDataArrayToUpload.length) {
                    PictureManager.finalOperation();
                }
            } else {
                PictureManager.finalOperation();
            }
        }
    },

    retryUploadPhoto: function () {
        PictureManager.fileArrayToUpload = PictureManager.errorSendedImagesPath;
        PictureManager.uploadPhoto();
    },

    finalOperation: function () {
        FeedbackManager.currentServiceUri = PictureManager.currentServiceUri;
        FeedbackManager.sendStars();
        if (PictureManager.abortOperation) {
            navigator.notification.alert(Globalization.alerts.photoUpload.sendedImages + PictureManager.sendedImages + "\n" + Globalization.alerts.photoUpload.moderator, function () { }, Globalization.alerts.photoUpload.problemTitle);
            PictureManager.hideSendPhotoAlbumModal();
        } else if ((PictureManager.fileArrayToUpload != null && PictureManager.sendedImages == PictureManager.fileArrayToUpload.length) || (PictureManager.formDataArrayToUpload != null && PictureManager.sendedImages == PictureManager.formDataArrayToUpload.length)) {
            navigator.notification.alert(Globalization.alerts.photoUpload.sendedImages + PictureManager.sendedImages + "\n" + Globalization.alerts.photoUpload.moderator, function () { }, Globalization.alerts.photoUpload.doneTitle);
            PersonalAssistant.removeMessage(PersonalAssistant.currentIdToRemove);
            PictureManager.hideSendPhotoModal();
            PictureManager.hideSendPhotoAlbumModal();
        } else {
            navigator.notification.confirm(Globalization.alerts.photoUpload.sendedImages + PictureManager.sendedImages + "\n" + Globalization.alerts.photoUpload.moderator + "\n" + Globalization.alerts.photoUpload.unsendedImages + "\n" + PictureManager.errorSendedImagesLabels.join("\n"), function (indexButton) {
                if (indexButton == 2) {
                    PictureManager.retryUploadPhoto();
                }
                if (indexButton == 1) {
                    PictureManager.hideSendPhotoModal();
                    PictureManager.hideSendPhotoAlbumModal();
                }
            }, Globalization.alerts.photoUpload.problemTitle, Globalization.alerts.photoUpload.buttonName);
        }
    },

    showSendPhotoModal: function () {
        $("#sendPhotoModalCancelButton").html(Globalization.labels.commonLabels.cancel);
        $("#sendPhotoModalSendButton").html(Globalization.labels.commonLabels.send);
        $("#userStarsLabelSendPhotoModal").html(Globalization.labels.infoMenu.userStars);
        $("#commentLabelSendPhotoModal").html(Globalization.labels.infoMenu.comment);
        //$("#textAreaCommentsSendPhotoModal").attr("placeholder", Globalization.labels.pictureModal.insertComment);
        $('#sendPhotoModal').modal('show');
        $('#sendPhotoModal').on('hide.bs.modal', function (e) { PictureManager.sendPhotoModalOpen = false; });
        $("#inputStarsSendPhotoModal").parent().children("div.rating").children("span.empty-stars").children("span.star").css("color", $("#infoMenuHeader").css("background-color"));
        $("#inputStarsSendPhotoModal").parent().children("div.rating").children("span.filled-stars").children("span.star").css("color", $("#infoMenuHeader").css("background-color"));
        PictureManager.sendPhotoModalOpen = true;
    },
    hideSendPhotoModal: function () {
        $('#sendPhotoModal').modal('hide');
        PictureManager.sendPhotoModalOpen = false;
    },

    showSendPhotoAlbumModal: function () {
        $("#sendPhotoAlbumModalCancelButton").html(Globalization.labels.commonLabels.cancel);
        $("#sendPhotoAlbumModalSendButton").html(Globalization.labels.commonLabels.send);
        $("#userStarsLabelSendPhotoAlbumModal").html(Globalization.labels.infoMenu.userStars);
        $("#commentLabelSendPhotoAlbumModal").html(Globalization.labels.infoMenu.comment);
        //$("#textAreaCommentsSendPhotoAlbumModal").attr("placeholder", Globalization.labels.pictureModal.insertComment);
        $('#sendPhotoAlbumModal').modal('show');
        $('#sendPhotoAlbumModal').on('hide.bs.modal', function (e) { PictureManager.sendPhotoAlbumModalOpen = false; });
        $("#inputStarsSendPhotoAlbumModal").parent().children("div.rating").children("span.empty-stars").children("span.star").css("color", $("#infoMenuHeader").css("background-color"));
        $("#inputStarsSendPhotoAlbumModal").parent().children("div.rating").children("span.filled-stars").children("span.star").css("color", $("#infoMenuHeader").css("background-color"));
        PictureManager.sendPhotoAlbumModalOpen = true;
    },
    hideSendPhotoAlbumModal: function () {
        $('#sendPhotoAlbumModal').modal('hide');
        PictureManager.sendPhotoAlbumModalOpen = false;
    },

};

