angular.module('praetor.spispage', [])

.controller('SpisPageCtrl', function ($scope, $state, $ionicLoading, $stateParams, praetorService) {
    // Zobrazí loading panel
    $ionicLoading.show({
        template: '<i class="icon ion-loading-c"></i> Načítám spis...'
    });

    today = new Date();
    since = new Date(today);
    since.setDate(since.getDate() - 6);
    until = new Date(today);
    until.setDate(until.getDate() + 1);
    praetorService.loadSpis({
        id_Spis: $stateParams.id,
        loadSpis: true,
        loadDokumenty: true,
        loadCinnosti: true,
        cinnostiSince: since,
        cinnostiUntil: until
    })
    .then(function (response) {
        $scope.loadingSuccess = response.success;
        $scope.spis = response.spis;
        $scope.dokumenty = response.dokumenty;
        $scope.cinnosti = response.cinnosti;

        // Skryje loading panel
        $ionicLoading.hide();
    });

    $scope.gotoPage = function(page)
    {
        $state.go('app.spis.' + page);
    }
});
