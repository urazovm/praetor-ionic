module PraetorApp.Controllers {

    export class HomeController extends BaseController<ViewModels.AppViewModel> {

        public static ID = "HomeController";

        public static get $inject(): string[]{
            return ["$scope", "$location", "$http", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID, Services.SpisyUtilities.ID, Services.SubjektyUtilities.ID];
        }

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private SpisyUtilities: Services.SpisyUtilities;
        private SubjektyUtilities: Services.SubjektyUtilities;

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, SpisyUtilities: Services.SpisyUtilities, SubjektyUtilities: Services.SubjektyUtilities) {
            super($scope, ViewModels.AppViewModel);

            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
            this.SpisyUtilities = SpisyUtilities;
            this.SpisyUtilities.Synchronize();
            this.SubjektyUtilities = SubjektyUtilities;
            this.SubjektyUtilities.Synchronize();
        }        
    }
}
