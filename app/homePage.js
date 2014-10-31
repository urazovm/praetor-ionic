angular.module('praetor.homepage', [])

.controller('HomePageCtrl', function ($scope, $state, $stateParams, praetorService) {
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

    $scope.startSearch = function () {
        $state.go('app.home.spisy', {search: true}, { reload: true });
    };
})

.directive('autoFocus', function ($timeout) {
    return {
        restrict: 'AC',
        link: function (_scope, _element) {
            $timeout(function () {
                _element[0].focus();
            }, 0);
        }
    };
});
;
