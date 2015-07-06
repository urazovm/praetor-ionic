
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
                templateUrl: "templates/Menu.html",
                controller: Controllers.MenuController.ID
            });

            // An blank view useful as a place holder etc.
            $stateProvider.state("app.login", {
                url: "/login",
                views: {
                    "menuContent": {
                        templateUrl: "templates/Login.html",
                        controller: Controllers.LoginController.ID
                    }
                }
            });                        

            $stateProvider.state("app.about", {
                url: "/settings/about",
                views: {
                    "menuContent": {
                        templateUrl: "templates/Settings/About.html",
                        controller: Controllers.AboutController.ID
                    }
                }
            });

            // If none of the above states are matched, use the blank route.
            $urlRouterProvider.otherwise('/app/login');            
        }
    }
}