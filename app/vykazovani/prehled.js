angular.module('praetor.spis.prehled', [])

.controller('VykazovaniCinnostCtrl', function ($scope, praetorService) {
    $scope.openCinnost = function(cinnost) {
        $state.go('app.cinnost', {id: cinnost.id_Cinnost})
    }
});

