angular.module('praetor.homepage', [])

.controller('HomePageCtrl', function ($scope, $state, $stateParams, $ionicLoading, praetorService) {
    $ionicLoading.show({
        template: '<i class="icon ion-loading-c"></i> Loading...'
    });
    today = new Date();
    since = new Date(today);
    since.setDate(since.getDate() - 6);
    until = new Date(today);
    until.setDate(until.getDate() + 1);
    praetorService.loadHome({
        loadVsechnySpisy: true,
        loadPosledniSpisy: true,
        pocetPoslednichSpisu: 20,
        loadCinnosti: true,
        cinnostiSince: since,
        cinnostiUntil: until
    })
    .then(function (response) {
        $ionicLoading.hide();
        $scope.vsechnySpisy = response.vsechnySpisy;
        $scope.posledniSpisy = response.posledniSpisy;
        $scope.cinnosti = response.cinnosti;
    });
})

//.directive('autoFocus', function ($timeout) {
//    return {
//        restrict: 'AC',
//        link: function (_scope, _element) {
//            $timeout(function () {
//                _element[0].focus();
//            }, 0);
//        }
//    };
//});
;
