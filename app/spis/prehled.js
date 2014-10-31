angular.module('praetor.spis.prehled', [])

.controller('SpisPrehledCtrl', function ($scope, $state, praetorService) {
    $scope.openSpis = function(spis) {
        $state.go('app.spis.dokumenty', {id: spis.id_Spis})
    }
});

