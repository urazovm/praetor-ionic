// Ionic praetor App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'praetor' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'praetor.controllers' is found in controllers.js
angular.module('praetor',
    [
        'ionic',
        'ui.utils',
        'praetor.loginpage',
        'praetor.spispage',
        'praetor.homepage',
        'praetor.generalpage',
        'praetor.vykazovani.cinnost',
        'praetor.spis.prehled',
        'praetor.spis.dokumenty',
        'praetor.spis.detail',
        'praetor.praetorService']
        )

.run(function ($ionicPlatform) {
    $ionicPlatform.ready(function () {
        // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
        // for form inputs)
        if (window.cordova && window.cordova.plugins.Keyboard) {
            cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
        }
        if (window.StatusBar) {
            // org.apache.cordova.statusbar required
            StatusBar.styleDefault();
        }

        // Hide android splash screen    
        //navigator.splashscreen.hide();

    });
})
.controller('AppCtrl', function ($scope, $state) {
    $scope.$root.canGoBack = true;
    $scope.$root.sideMenuEnabled = false;//function() { return $state.current.name == 'app.home';} ;
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



    })
.config(function ($stateProvider, $urlRouterProvider) {

    $stateProvider

      .state('app', {
          url: "/app",
          abstract: true,
          templateUrl: "/menu.html",
          controller: 'AppCtrl'
      })

    .state('app.login', {
        url: "/login",
        views: {
            'menuContent': {
                templateUrl: "/app/loginPage.html"
            }
        }
    })

    .state('app.home', {
        url: "/home",
        views: {
            'menuContent': {
                templateUrl: "/app/homePage.html"
            }
        }
    })

            .state('app.spis', {
                url: "/spis",
                views: {
                    'menuContent': { templateUrl: "/app/spisPage.html" },
                }
            })

    .state('app.general', {
        url: "/general",
        views: {
            'menuContent': {
                templateUrl: "/app/generalPage.html"
            }
        }
    })

            .state('app.general.cinnost', {
                url: "/cinnost/{id}",
                views: {
                    'generalContent': {
                        templateUrl: "/app/vykazovani/cinnost.html"
                    }
                }
            })

    .state('app.home.spisy', {
        url: "/spisy",
        views: {
            'tab-spisy': { templateUrl: "/app/spis/prehled.html" }
        }
    })

    .state('app.home.cinnosti', {
                url: "/cinnosti",
                views: {
                    'tab-cinnosti': { templateUrl: "/app/vykazovani/prehled.html" }
                }
            })

    .state('app.spis.detail', {
        url: "/detail",
        views: {
            'menuContent2': { templateUrl: "/app/spis/detail.html" }
        }
    })
        .state('app.spis.dokumenty', {
            url: "/dokumenty/{id}",
            views: {
                'menuContent2': { templateUrl: "/app/spis/dokumenty.html" }
            }
        });

    // if none of the above states are matched, use this as the fallback
    $urlRouterProvider.otherwise('/app/login');

});


//http://forum.ionicframework.com/t/android-look-ionicactionsheet-android-hardware-menu-button/3630/3