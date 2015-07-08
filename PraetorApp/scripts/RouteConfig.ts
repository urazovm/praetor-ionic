
module PraetorApp {

    /**
     * Used to define all of the client-side routes for the application.
     * This maps routes to the controller/view that should be used.
     */
    export class RouteConfig {

        public static setupRoutes($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider): void {

            // Setup an abstract state for the tabs directive.
            $stateProvider.state("app", {
                url: "/app",
                abstract: true,
                templateUrl: "templates/menu.html",
                controller: Controllers.MenuController.ID
            });

            // An blank view useful as a place holder etc.
            $stateProvider.state("app.login", {
                url: "/login",
                views: {
                    "menuContent": {
                        templateUrl: "templates/login.html",
                        controller: Controllers.LoginController.ID
                    }
                }
            });                        

            // An blank view useful as a place holder etc.
            $stateProvider.state("app.home", {
                url: "/home",
                views: {
                    "menuContent": {
                        templateUrl: "templates/home.html",
                        controller: Controllers.HomeController.ID
                    }
                }
            });

            $stateProvider.state('app.home.spisy', {
                url: "/spisy",
                views: {
                    'tab-spisy': {
                        templateUrl: "templates/home/spisy.html",
                        controller: Controllers.HomeSpisyController.ID
                    }
                }
            });

            $stateProvider.state('app.home.cinnosti', {
                url: "/cinnosti",
                views: {
                    'tab-cinnosti': {
                        templateUrl: "templates/home/vykazovani.html",
                        controller: Controllers.HomeVykazovaniController.ID
                    }
                }
            });

            $stateProvider.state("app.spis", {
                url: "/spis/{id}",
                views: {
                    "menuContent": {
                        templateUrl: "templates/spis.html",
                        controller: Controllers.SpisController.ID
                    }
                }
            });

            $stateProvider.state('app.spis.zakladniudaje', {
                url: "/zakladniudaje",
                views: {
                    'tab-zakladni-udaje': {
                        templateUrl: "templates/spis/zakladniudaje.html",
                        controller: Controllers.SpisZakladniUdajeController.ID
                    }
                }
            });

            $stateProvider.state('app.spis.dokumenty', {
                url: "/dokumenty",
                views: {
                    'tab-dokumenty': {
                        templateUrl: "templates/spis/dokumenty.html",
                        controller: Controllers.SpisDokumentyController.ID
                    }
                }
            });

            $stateProvider.state("app.about", {
                url: "/settings/about",
                views: {
                    "menuContent": {
                        templateUrl: "templates/settings/About.html",
                        controller: Controllers.AboutController.ID
                    }
                }
            });

            // If none of the above states are matched, use the blank route.
            $urlRouterProvider.otherwise('/app/login');
        }
    }
}