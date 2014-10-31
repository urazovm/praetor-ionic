angular.module('praetor.spis.dokumenty', [])

.controller('SpisDocumentyCtrl', function ($scope, $stateParams, $sce) {

    var searchObject = $location.search();

    // Zobrazí loading panel
    $ionicLoading.show({
        template: 'Loading...'
    });

    // Možná takto načítat data 
    //$scope.$parent.GetData().then(function (d) {
    //    $scope.Data.files = d.Data.files;
    //});

    // Načte seznam všech spisů
    praetorService.getSpis(searchObject.id_spis).then(function (d) {
        $scope.spis = d.spis;
        $ionicLoading.hide();
    });

    $scope.$root.sideMenuEnabled = false;

    // Otevře dokumenty
    $scope.openDocument = function (file) {
        var server = window.localStorage.getItem('server');
        praetorService.getFileToken(file.id).then(function (d) {
            var token = d.token;
            console.log("open file toke: " + token);
            if (ionic.Platform.isAndroid()) {
                console.log("open android file");
                androidFileOpenerService.downloadFile('http://' + server + '/praetorapi/getFile/' + token, file.mime, 'tmp001.' + file.pripona);
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

