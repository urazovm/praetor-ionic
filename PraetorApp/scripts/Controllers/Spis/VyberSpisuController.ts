module PraetorApp.Controllers {

    export class VyberSpisuController extends BaseDialogController<ViewModels.Spis.VyberSpisuViewModel, VyberSpisuParams, VyberSpisuResult>
        implements PraetorApp.Definitely.ISpisyUtilitiesDataChange {

        public static ID = "VyberSpisuController";

        public static get $inject(): string[]{
            return ["$scope", Services.PraetorService.ID, Services.Utilities.ID, Services.Preferences.ID, Services.UiHelper.ID, Services.SpisyUtilities.ID];
        }

        private PraetorService: Services.PraetorService;
        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;
        private UiHelper: Services.UiHelper;
        private SpisyUtilities: Services.SpisyUtilities;

        constructor($scope: ng.IScope, PraetorService: Services.PraetorService, Utilities: Services.Utilities, Preferences: Services.Preferences, UiHelper: Services.UiHelper, SpisyUtilities: Services.SpisyUtilities) {
            super($scope, ViewModels.Spis.VyberSpisuViewModel, UiHelper.DialogIds.VyberSpisu);

            this.PraetorService = PraetorService;
            this.Utilities = Utilities;
            this.Preferences = Preferences;                        
            this.UiHelper = UiHelper;

            this.scope.$on("modal.shown", _.bind(this.Shown, this));

            this.SpisyUtilities = SpisyUtilities;
            this.SpisyUtilities.register(this);

            this.viewModel.PrehledSpisu = new PraetorApp.ViewModels.PrehledSpisuViewModel();

            this.LoadDuleziteSpisy();

            this.viewModel.PrehledSpisu.vsechnySpisy = this.SpisyUtilities.Spisy;
        }

        private LoadDuleziteSpisy() {
            var request = <PraetorServer.Service.WebServer.Messages.LoadDuleziteSpisyRequest>{};
            request.maxPocetPoslednich = 20;

            this.PraetorService.loadDuleziteSpisy(request).then(
                response => {
                    this.viewModel.PrehledSpisu.posledniSpisy = response.posledniSpisy;
                    this.viewModel.PrehledSpisu.oblibeneSpisy = response.oblibeneSpisy;
                }
                );
        }

        public SelectSpis(spis: PraetorServer.Service.WebServer.Messages.Dto.Spis) {
            this.close(new VyberSpisuResult(true, spis.id_Spis));
        }

        public Cancel() {
            this.close(new VyberSpisuResult(false, undefined));
        }

        private LoadParams() {
            var params = this.getData();
            if (params)
                this.viewModel.Reason = params.Reason;
        }

        private Shown() {
            this.LoadParams();
        }

        changeDataSource() {                
            // Došlo k změně u registrované komponenty
            // aktualizujeme seznam spisů
            this.viewModel.PrehledSpisu.vsechnySpisy = this.SpisyUtilities.Spisy;
        }
    }
}
