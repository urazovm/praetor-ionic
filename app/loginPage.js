angular.module('praetor.loginpage', [])

.controller('LoginPageCtrl', function ($scope, $location, $ionicLoading, praetorService, $state) {
    
    function doLogin() {
        $ionicLoading.show({
            template: 'Loading...'
        });
        praetorService.login().then(function (d) {
            $ionicLoading.hide();
            if (d.success) {
                $state.go('app.home.spisy', { data: 'aa' }, { location: false, inherit: false });
            }
            else {
                $scope.message = d.message;
            }
        });
    }

    $scope.$root.canGoBack = false;
    $scope.$root.sideMenuEnabled = false;

    var server = window.localStorage.getItem('server');
    var username = window.localStorage.getItem('username');
    var password = window.localStorage.getItem('password');

    if (server && username && password) {
        //doLogin();
    }

    // datamodel pro view
    $scope.formData = {
        server: server || '',
        username: username || '',
        password: 'bohmas'
    };

    // Přihlášení pos tisknutí tlačítka přihlásit
    $scope.login = function () {
        window.localStorage.setItem('server', $scope.formData.server);
        window.localStorage.setItem('username', $scope.formData.username);
        var passwordHash = hex_md5("Praetor_salt" + $scope.formData.password);
        window.localStorage.setItem('password', passwordHash.toString());

        doLogin();
    }

});