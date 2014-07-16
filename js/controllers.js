angular.module('starter.controllers', ['ui.utils'])

.controller('AppCtrl', function ($scope, $state) {
    $scope.$root.canGoBack = true;
    $scope.$root.sideMenuEnabled = false;//function() { return $state.current.name == 'app.home';} ;
})

.controller('DocumentCtrl', function ($scope, $stateParams, $sce) {
    $scope.document = $sce.trustAsResourceUrl('http://update.praetoris.cz/test/' + $stateParams.documentId);
})

.controller('HomeCtrl', function ($scope, $location, $ionicLoading, praetorService) {
    $scope.$root.canGoBack = false;
    $scope.$root.sideMenuEnabled = true;

    // Zobrazí loading panel
    $ionicLoading.show({
        template: 'Loading...'
    });

    // Načte všechny spisy
    praetorService.getSpisy().then(function (d) {
        $scope.spisy = d.spisy;
        $ionicLoading.hide();
    });


    // Otevře detail spisu
    $scope.openSpis = function (spis) {
        $location.path('/app/spis').search({ id_spis: spis.id });
    }
})
.controller('SpisCtrl', function ($scope, $location, $ionicLoading, praetorService, androidFileOpenerService) {
    var searchObject = $location.search();

    // Zobrazí loading panel
    $ionicLoading.show({
        template: 'Loading...'
    });

    // Načte seznam všech spisů
    praetorService.getSpis(searchObject.id_spis).then(function (d) {
        $scope.spis = d.spis;
        $ionicLoading.hide();
    });

    $scope.$root.sideMenuEnabled = false;

    // Otevře dokumenty
    $scope.openDocument = function (file) {
        var server = window.localStorage.getItem('server');
        praetorService.getFileToken(file.id).then(function (d) {
            var token = d.token;
            console.log("open file toke: " + token);
            if (ionic.Platform.isAndroid()) {
                console.log("open android file");
                androidFileOpenerService.downloadFile('http://' + server + '/praetorapi/getFile/' + token, file.mime, 'tmp001.' + file.pripona);
            }
            else
                window.open(
                'http://' + server + '/praetorapi/getFile/' + token,
                '_blank',
                'enableViewportScale=yes,location=no,toolbarposition=bottom,transitionstyle=fliphorizontal,hidden=no,closebuttoncaption=Zpět'
                );
        });
    }
})
.controller('LoginCtrl', function ($scope, $location, $ionicLoading, praetorService) {

    function doLogin() {
        $ionicLoading.show({
            template: 'Loading...'
        });
        praetorService.login().then(function (d) {
            $ionicLoading.hide();
            if (d.success) {
                $location.path('/app/home');
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
        password: ''
    };

    // Přihlášení pos tisknutí tlačítka přihlásit
    $scope.login = function () {
        window.localStorage.setItem('server', $scope.formData.server);
        window.localStorage.setItem('username', $scope.formData.username);
        var passwordHash = hex_md5("Praetor_salt" + $scope.formData.password);
        window.localStorage.setItem('password', passwordHash.toString());

        doLogin();
    }

})

.controller('SideMenuCtrl', function ($scope, $location, $state, $ionicSideMenuDelegate) {

    $scope.logout = function () {
        window.localStorage.removeItem('password');
        $location.path('/login');
    }
    // toggle side menu with Menu button
    document.addEventListener('menubutton', function () { $ionicSideMenuDelegate.toggleRight(); }, false);

    // prevent returning to login page, close the app instead
    document.addEventListener('backbutton', function () {
        if ($state.current.name == 'app.home') {
            // TODO: better stay at the home page
            ionic.Platform.exitApp();
        }
    }, false);



});

