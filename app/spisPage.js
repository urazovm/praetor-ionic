angular.module('praetor.spispage', [])

.controller('SpisPageCtrl', function ($scope, $ionicLoading, $stateParams, praetorService) {
    // Zobrazí loading panel
    $ionicLoading.show({
        template: 'Loading...'
    });

    praetorService.loadSpis({
        id_Spis: $stateParams.id,
        loadSpis: true,
        loadDokumenty: true,
        loadCinnosti: true,
        cinnostiSince: Date() - 7,
        cinnostiUntil: Date()
    })
    .then(function (response) {
        $scope.loadingSuccess = response.success;
        $scope.spis = response.spis;
        $scope.dokumenty = response.dokumenty;
        $scope.cinnosti = response.cinnosti;

        // Skryje loading panel
        $ionicLoading.hide();
    });
});
