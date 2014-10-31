angular.module('praetor.spis.prehled', [])

.controller('SpisPrehledCtrl', function ($scope, $location, $ionicLoading, praetorService, androidFileOpenerService) {

    // Načte všechny spisy
    praetorService.getSpisy().then(function (d) {
        $scope.spisy = d.spisy;
    });    
});

