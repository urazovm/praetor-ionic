angular.module('praetor.homepage', [])

.controller('HomePageCtrl', function ($scope, $stateParams) {
    console.log($stateParams.data);
});
