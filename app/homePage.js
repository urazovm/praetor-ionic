angular.module('praetor.homepage', [])

.controller('HomePageCtrl', function ($scope, $stateParams, praetorService) {
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
        $scope.vsechnySpisy = response.vsechnySpisy;
        $scope.posledniSpisy = response.posledniSpisy;
        $scope.cinnosti = response.cinnosti;
    });
});
