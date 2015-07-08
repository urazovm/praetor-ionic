module PraetorApp.Controllers {

    export class SpisZakladniUdajeController
        extends BaseController<ViewModels.Spis.ZakladniUdajeViewModel> {

        public static ID = "SpisZakladniUdajeController";

        public static get $inject(): string[]{
            return ["$scope", "$location", "$http", "$state", "$stateParams", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID, Services.PraetorService.ID];
        }

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private $state: ng.ui.IStateService;
        private $stateParams: any;
        private PraetorService: Services.PraetorService;

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, $state: ng.ui.IStateService, $stateParams: any, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, PraetorService: Services.PraetorService) {
            super($scope, ViewModels.Spis.ZakladniUdajeViewModel);
                        
            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
            this.$state = $state;
            this.$stateParams = $stateParams;       
            this.viewModel.id_spis = this.$stateParams.id;
            this.PraetorService = PraetorService;
            this.loadSpis();            
        }

        private loadSpis() {
            var request = <PraetorServer.Service.WebServer.Messages.LoadSpisZakladniUdajeRequest>{};
            request.id_Spis = this.viewModel.id_spis;
            this.PraetorService.loadSpisZakladniUdaje(request).then((response) => {
                this.viewModel.spis = response.spis;
            });
        }
    }
}
