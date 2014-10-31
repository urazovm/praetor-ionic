angular.module('praetor.homepage', [])

.controller('HomePageCtrl', function ($scope, $stateParams, praetorService) {
    praetorService.loadHome({
        loadVsechnySpisy: true,
        loadPosledniSpisy: true,
        pocetPoslednichSpisu: 20,
        loadCinnosti: true,
        cinnostiSince: Date() - 7,
        cinnostiUntil: Date()
    })
    .then(function (response) {
        $scope.vsechnySpisy = response.vsechnySpisy;
        $scope.posledniSpisy = response.posledniSpisy;
        $scope.cinnosti = response.cinnosti;
    });
});
