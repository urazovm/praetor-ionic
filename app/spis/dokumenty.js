angular.module('praetor.spis.dokumenty', [])

.controller('SpisDocumentyCtrl', function ($scope, praetorService, androidFileOpenerService) {
    // Otevře dokumenty
    $scope.openDokument = function (dokument) {
        var server = window.localStorage.getItem('server');
        praetorService.getFileToken(dokument.id).then(function (d) {
            var token = d.token;
            console.log("open file token: " + token);
            if (ionic.Platform.isAndroid()) {
                console.log("open android file");
                
                androidFileOpenerService.downloadFile('http://' + server + '/praetorapi/getFile/' + token, dokument.mime, 'tmp001.' + dokument.pripona, function (percent)
                {                                        
                    $scope.$apply(function () { dokument.downloadProgress = percent; });
                });
            }
            else                
                window.open(
                'http://' + server + '/praetorapi/getFile/' + token,
                '_blank',
                'enableViewportScale=yes,location=no,toolbarposition=bottom,transitionstyle=fliphorizontal,hidden=no,closebuttoncaption=Zpět'
                );
        });
    }
});

