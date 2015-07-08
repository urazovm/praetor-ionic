module PraetorApp.Controllers {

    export class SpisController extends BaseController<ViewModels.SpisViewModel> {

        public static ID = "SpisController";

        public static get $inject(): string[] {
            return ["$scope", "$location", "$http", "$stateParams", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID];
        }

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private $ionicHistory: any;
        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, $stateParams, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences) {
            super($scope, ViewModels.SpisViewModel);
            
            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;            
        }
    }
}
