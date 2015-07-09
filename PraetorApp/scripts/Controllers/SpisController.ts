module PraetorApp.Controllers {

    export class SpisController extends BaseController<ViewModels.SpisViewModel> {

        public static ID = "SpisController";

        public static get $inject(): string[]{
            return ["$scope", "$location", "$http", "$state",  "$stateParams", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID, Services.PraetorService.ID, Services.FileUtilities.ID];
        }

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private $ionicHistory: any;
        private PraetorService: Services.PraetorService;
        private FileService: Services.FileUtilities;        
        private $state: ng.ui.IStateService;

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, $state: ng.ui.IStateService, $stateParams, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, PraetorService: Services.PraetorService, FileService: Services.FileUtilities) {
            super($scope, ViewModels.SpisViewModel);
            
            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
            this.PraetorService = PraetorService;
            this.FileService = FileService;
            this.viewModel.id_spis = $stateParams.id;
            this.$state = $state;          
            
            // načteme data
            this.reloadData();      
        }

        private loadSpis() {   
            this.onBeforeLoading();         
            var request = <PraetorServer.Service.WebServer.Messages.LoadSpisZakladniUdajeRequest>{};
            request.id_Spis = this.viewModel.id_spis;
            this.PraetorService.loadSpisZakladniUdaje(request).then((response) => {
                this.viewModel.spis = response.spis;
                this.viewModel.subjekty = response.subjekty;                
                this.onAftterLoading();
            });
        }

        loadDokumenty() {
            this.onBeforeLoading();
            var request = <PraetorServer.Service.WebServer.Messages.LoadSpisDokumentyRequest>{};
            request.id_Spis = this.viewModel.id_spis;
            this.PraetorService.loadSpisDokumenty(request).then((response) => {
                this.viewModel.dokumenty = response.dokumenty;
                this.onAftterLoading();
            });
        }

        openDokument(dokument: PraetorServer.Service.WebServer.Messages.Dto.DokumentNode) {

            var request = <PraetorServer.Service.WebServer.Messages.GetFileTokenRequest>{};
            request.id_file = dokument.id;

            this.PraetorService.getFileToken(request).then((response) => {
                this.FileService.openFile(<string>response.token, dokument.nazev + '.' + dokument.pripona);
            });
        }

        public CreateCinnost() {
            var id_Spis = this.viewModel.id_spis;
            var params = new CinnostParams(id_Spis);
            var options = new Models.DialogOptions(params);
            this.UiHelper.showDialog(this.UiHelper.DialogIds.Cinnost, options).then(
                (result: CinnostResult) => {
                    if (result && result.Success)
                        this.UiHelper.toast.show("Činnost byla uložena.", "short", "center");
                },
                (ex) => {
                    this.UiHelper.alert("Činnost se nepodařilo uložit.");
                }
                );
        }

        reloadData() {
            this.loadSpis();
            this.loadDokumenty();
        }
    }
}
