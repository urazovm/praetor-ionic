module PraetorApp.Controllers {

    export class HomeSubjektyController
        extends BaseController<ViewModels.Home.SubjektyViewModel>
        implements PraetorApp.Definitely.ISubjektyUtilitiesDataChange {

        public static ID = "HomeSubjektyController";

        public static get $inject(): string[] {
            return ["$scope", "$location", "$http", "$state", "$timeout", Services.Utilities.ID, Services.UiHelper.ID, Services.Preferences.ID, Services.SubjektyUtilities.ID, Services.PraetorService.ID];
        }

        private $location: ng.ILocationService;
        private $http: ng.IHttpService;
        private Utilities: Services.Utilities;
        private UiHelper: Services.UiHelper;
        private Preferences: Services.Preferences;
        private $state: ng.ui.IStateService;
        private SubjektyUtilities: Services.SubjektyUtilities;
        public PrehledSubjektu: PraetorApp.ViewModels.PrehledSubjektuViewModel;
        private PraetorService: Services.PraetorService;

        constructor($scope: ng.IScope, $location: ng.ILocationService, $http: ng.IHttpService, $state: ng.ui.IStateService, $timeout: ng.ITimeoutService, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, SubjektyUtilities: Services.SubjektyUtilities, PraetorService: Services.PraetorService) {
            super($scope, ViewModels.Home.SubjektyViewModel);

            this.$location = $location;
            this.$http = $http;
            this.Utilities = Utilities;
            this.UiHelper = UiHelper;
            this.Preferences = Preferences;
            this.$state = $state;
            this.SubjektyUtilities = SubjektyUtilities;
            this.SubjektyUtilities.register(this);
            this.PraetorService = PraetorService;

            this.viewModel.PrehledSubjektu = new PraetorApp.ViewModels.PrehledSubjektuViewModel();

            this.LoadLocalData();
            this.changeDataSource();
        }

        private LoadLocalData() {
            this.onBeforeLoading();

            var request = <PraetorServer.Service.WebServer.Messages.LoadDuleziteSubjektyRequest>{};

            this.PraetorService.loadDuleziteSubjekty(request).then(
                response => {
                    this.viewModel.PrehledSubjektu.subjektyZOblibenychSpisu = response.subjektyZOblibenychSpisu;

                    this.onAftterLoading();
                }
                );
        }

        //openSubjekt(subjekt: PraetorServer.Service.WebServer.Messages.Dto.Subjekt) {
        //    // Otevřeme detail subjektu
        //    setTimeout(() => {
        //        this.$state.go('app.subjekt.zakladniudaje', { id: subjekt.id_Subjekt });
        //        this.scope.$apply();
        //    }, 100);
        //}

        changeDataSource() {                
            // Došlo k změně u registrované komponenty
            // aktualizujeme seznam subjektů
            this.viewModel.PrehledSubjektu.vsechnySubjekty = this.SubjektyUtilities.Subjekty;
        }

        reloadData() {
            this.onBeforeLoading();
            this.SubjektyUtilities.Synchronize();
            this.changeDataSource();
            this.onAftterLoading();

            this.LoadLocalData();
        }
    }
}
