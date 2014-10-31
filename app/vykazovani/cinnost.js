angular.module('praetor.vykazovani.cinnost', [])

.controller('VykazovaniCinnostCtrl', function ($scope) {
    $scope.data =
    {
        spis: "2014/12 Spis",
        datum: '2014-10-01',
        cas: 120,
        popis: 'Dlouhý popis\natd.',
    };
    $scope.aktivity = [
     { id: '12', nazev: 'Jednání s klientem' },
     { id: '12', nazev: 'Studium spisu' }
    ];
    $scope.save = function () { alert('saved' + $scope.popis); };

});
