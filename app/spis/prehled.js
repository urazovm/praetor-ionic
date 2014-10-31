angular.module('praetor.spis.prehled', [])

.controller('SpisPrehledCtrl', function ($scope, praetorService) {
    $scope.openSpis = function(spis) {
        $state.go('app.spis', {id: spis.id_Spis})
    }
});

