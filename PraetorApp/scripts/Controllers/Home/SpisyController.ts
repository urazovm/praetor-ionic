module PraetorApp.Controllers {

    export class HomeSpisyController extends BaseController<ViewModels.Home.SpisyViewModel> {

        public static ID = "HomeSpisyController";

        public static get $inject(): string[]{
            return ["$scope", "$location", "$http", "$state", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID, Services.SpisyUtilities.ID];
        }

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private $state: ng.ui.IStateService;
        private SpisyUtilities: Services.SpisyUtilities;
        public PrehledSpisu: PraetorApp.ViewModels.PrehledSpisuViewModel;

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, $state: ng.ui.IStateService, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, SpisyUtilities: Services.SpisyUtilities) {
            super($scope, ViewModels.Home.SpisyViewModel);
                        
            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
            this.$state = $state;
            this.SpisyUtilities = SpisyUtilities;

            this.viewModel.PrehledSpisu = new PraetorApp.ViewModels.PrehledSpisuViewModel();
            this.viewModel.PrehledSpisu.vsechnySpisy = this.SpisyUtilities.Spisy;                        
                                 
        }

        protected changedSpisy(): void {
            this.scope.$apply();            
        }

        openSpis(spis: PraetorServer.Service.WebServer.Messages.Dto.Spis) {
            // Otevřeme detail spisu
            this.$state.go('app.spis.dokumenty', { id: spis.id_Spis });
        }

    }
}
