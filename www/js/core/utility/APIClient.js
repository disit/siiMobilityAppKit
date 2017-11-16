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
var APIClient = {

    apiUrl: "http://www.disit.org/ServiceMap/api/v1/",                    
    photoServerUrl: "http://www.disit.org/ServiceMap/api/v1/photo",
    fileTransfer: null,
    lockQuery: false,

    executeQuery: function (query, successCallback, errorCallback) {
        if (query != null && successCallback != null) {
            if (!APIClient.lockQuery) {
                console.log(APIClient.apiUrl + query);
                $.ajax({
                    url: encodeURI(APIClient.apiUrl + query),
                    timeout: Parameters.timeoutGetQuery,
                    method: "GET",
                    dataType: "json",
                    beforeSend: function () {
                        APIClient.lockQuery = true;
                        Loading.show();
                    },
                    success: function (data) {
                        APIClient.lockQuery = false;
                        if (successCallback != null) {
                            successCallback(data);
                        }
                    },
                    error: function (error) {
                        APIClient.lockQuery = false;
                        if (error.statusText == "timeout") {
                            navigator.notification.alert(Globalization.alerts.timeoutError.message, function () { }, Globalization.alerts.timeoutError.title);
                        } else if (error.statusText == "error") {
                            navigator.notification.alert(Globalization.alerts.connectionError.message, function () { }, Globalization.alerts.connectionError.title);
                        } else {
                            if (errorCallback != null) {
                                errorCallback(error);
                            }
                        }
                    },
                    complete: function () {
                        Loading.hide();
                    }
                }); 
            } else {
                APIClient.showOperationRunning();
            }
        }
    },

    executeQueryWithoutAlert: function (query, successCallback, errorCallback) {
        if (query != null && successCallback != null) {
            console.log(APIClient.apiUrl + query);
            $.ajax({
                url: encodeURI(APIClient.apiUrl + query),
                timeout: Parameters.timeoutGetQuery,
                method: "GET",
                dataType: "json",
                success: function (data) {
                    if (successCallback != null) {
                        successCallback(data);
                    }
                },
                error: function (error) {
                    if (errorCallback != null) {
                        errorCallback(error);
                    }
                },
                beforeSend: function () {
                    if (NavigatorSearcher.started) {
                        Loading.show();
                    }
                },
                complete: function () {
                    if (NavigatorSearcher.started) {
                        Loading.hide();
                    }
                }
            });
        }
    },

    executeQueryText: function (query, successCallback, errorCallback) {
        if (query != null && successCallback != null) {
            if (!APIClient.lockQuery) {
                console.log(APIClient.apiUrl + query);
                $.ajax({
                    url: encodeURI(APIClient.apiUrl + query),
                    timeout: Parameters.timeoutGetQuery,
                    method: "GET",
                    dataType: "text",
                    beforeSend: function () {
                        APIClient.lockQuery = true;
                        Loading.showSettingsLoading();
                    },
                    success: function (data) {
                        APIClient.lockQuery = false;
                        if (successCallback != null) {
                            successCallback(data);
                        }
                    },
                    error: function (error) {
                        APIClient.lockQuery = false;
                        if (error.statusText == "timeout") {
                            navigator.notification.alert(Globalization.alerts.timeoutError.message, function () { }, Globalization.alerts.timeoutError.title);
                        } else if (error.statusText == "error") {
                            navigator.notification.alert(Globalization.alerts.connectionError.message, function () { }, Globalization.alerts.connectionError.title);
                        } else {
                            if (errorCallback != null) {
                                errorCallback(error);
                            }
                        }
                    },
                    complete: function () {
                        Loading.hideSettingsLoading();

                    }
                });
             
            } else {
                APIClient.showOperationRunning();
            }
        }
    },

    uploadPhoto: function (photoUrl, serviceUri, successCallback, errorCallback) {
        APIClient.fileTransfer = new FileTransfer();
        var options = new FileUploadOptions();


        var params = {};
        params.uid = application.uid;
        params.serviceUri = serviceUri;
        options.params = params;
        if (photoUrl.substring(photoUrl.lastIndexOf(".") + 1) == "jpg") {
            options.mimeType = "image/jpeg";
        } else {
            options.mimeType = "image/" + photoUrl.substring(photoUrl.lastIndexOf(".") + 1);
        }
        var paramsWindows = "";

        options.fileKey = "file";
        options.fileName = photoUrl.substring(photoUrl.lastIndexOf("/") + 1);

        APIClient.fileTransfer.upload(photoUrl, encodeURI(APIClient.photoServerUrl), successCallback, errorCallback, options);
    },

    uploadPhotoFromWeb: function (query, formData, successCallback, errorCallback) {
        console.log(APIClient.photoServerUrl);
        $.ajax({
            data: formData,
            processData: false,
            contentType: false,
            type: 'POST',
            url: encodeURI(APIClient.photoServerUrl + query),
            timeout: Parameters.timeoutPostQuery,
            success: function (data) {
                if (successCallback != null) {
                    successCallback(data);
                }
            },
            error: function (error) {
                if (error.statusText == "timeout") {
                    navigator.notification.alert(Globalization.alerts.timeoutError.message, function () { }, Globalization.alerts.timeoutError.title);
                } else if (error.statusText == "error") {
                    navigator.notification.alert(Globalization.alerts.connectionError.message, function () { }, Globalization.alerts.connectionError.title);
                } else {
                    if (errorCallback != null) {
                        errorCallback(error);
                    }
                }
            },
        });
        
    },

    abortUploadingPhoto: function () {
        if (APIClient.fileTransfer != null) {
            APIClient.fileTransfer.abort();
        }
    },

    showOperationRunning: function () {
        if (typeof window.plugins != "undefined") {
            window.plugins.toast.showWithOptions({
                message: Globalization.labels.apiclient.operationRunning,
                duration: "long", // which is 2000 ms. "long" is 4000. Or specify the nr of ms yourself.
                position: "bottom",
                addPixelsY: -40  // added a negative value to move it up a bit (default 0) 
                },
                function () { }, // optional
                function () { }    // optional 
            );
        }
    },

};