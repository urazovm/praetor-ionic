module PraetorApp.Controllers {

    export class HomeSpisyController extends BaseController<ViewModels.Home.SpisyViewModel> {

        public static ID = "HomeSpisyController";

        public static get $inject(): string[] {
            return ["$scope", "$location", "$http", "$state", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID];
        }

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private $state: ng.ui.IStateService;

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, $state: ng.ui.IStateService, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences) {
            super($scope, ViewModels.Home.SpisyViewModel);

            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
            this.$state = $state;                                
        }

        openSpis(spis: PraetorServer.Service.WebServer.Messages.Dto.Spis) {
            // Otevřeme detail spisu
            this.$state.go('app.spis.dokumenty', { id: spis.id_Spis });
        }

    }
}
