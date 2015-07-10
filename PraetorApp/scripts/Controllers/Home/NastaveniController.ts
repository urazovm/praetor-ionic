module PraetorApp.Controllers {

    export class HomeNastaveniController
        extends BaseController<ViewModels.Home.NastaveniViewModel> {

        public static ID = "HomeNastaveniController";

        public static get $inject(): string[] {
            return ["$scope", "$state", Services.Preferences.ID];
        }

        private $state: ng.ui.IStateService;
        private Preferences: Services.Preferences;        

        constructor($scope: ng.IScope, $state: ng.ui.IStateService, Preferences: Services.Preferences) {
            super($scope, ViewModels.Home.NastaveniViewModel);

            this.$state = $state;
            this.Preferences = Preferences;            
        }

        logout() {
            this.Preferences.password = null;
            this.$state.go("app.login");
        }
    }
}
