module PraetorApp.Controllers {

    export class SpisDokumentyController
        extends BaseController<ViewModels.Spis.DokumentyViewModel> {

        public static ID = "SpisDokumentyController";

        public static get $inject(): string[]{
            return ["$scope", "$location", "$http", "$state", "$stateParams", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID, Services.FileUtilities.ID, Services.PraetorService.ID];
        }

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private $state: ng.ui.IStateService;
        private $stateParams: any;
        private FileService: Services.FileUtilities;
        private PraetorService: Services.PraetorService;

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, $state: ng.ui.IStateService, $stateParams: any, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, FileService: Services.FileUtilities, PraetorService: Services.PraetorService) {
            super($scope, ViewModels.Spis.DokumentyViewModel);

            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
            this.$state = $state;
            this.$stateParams = $stateParams;
            this.viewModel.id_spis = this.$stateParams.id;
            this.FileService = FileService;
            this.PraetorService = PraetorService;
            this.loadDokumenty();
        }

        loadDokumenty() {
            var request = <PraetorServer.Service.WebServer.Messages.LoadSpisDokumentyRequest>{};
            request.id_Spis = this.viewModel.id_spis;
            this.PraetorService.loadSpisDokumenty(request).then((response) =>
            {
                this.viewModel.dokumenty = response.dokumenty;
            });
        }

        openDokument(dokument: PraetorServer.Service.WebServer.Messages.Dto.DokumentNode) {

            var request = <PraetorServer.Service.WebServer.Messages.GetFileTokenRequest>{};
            request.id_file = dokument.id;

            this.PraetorService.getFileToken(request).then((response) => {
                this.FileService.openFile(<string>response.token, dokument.pripona);
            });            
        }
    }
}
