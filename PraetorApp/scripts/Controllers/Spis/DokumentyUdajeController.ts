module PraetorApp.Controllers {

    export class SpisDokumentyController
        extends BaseController<ViewModels.Spis.DokumentyViewModel> {

        public static ID = "SpisDokumentyController";

        public static get $inject(): string[] {
            return ["$scope", "$location", "$http", "$state", "$stateParams", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID];
        }

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private $state: ng.ui.IStateService;
        private $stateParams: any;

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, $state: ng.ui.IStateService, $stateParams: any, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences) {
            super($scope, ViewModels.Spis.DokumentyViewModel);

            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
            this.$state = $state;
            this.$stateParams = $stateParams;
            this.viewModel.id_spis = this.$stateParams.id;

        }
    }
}
