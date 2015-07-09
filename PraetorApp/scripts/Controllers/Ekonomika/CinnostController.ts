module PraetorApp.Controllers {

    export class CinnostController extends BaseDialogController<ViewModels.Ekonomika.CinnostViewModel, CinnostParams, CinnostResult> {
        public static ID = "CinnostController";

        public static get $inject(): string[]{
            return ["$scope", Services.PraetorService.ID, Services.Utilities.ID, Services.Preferences.ID, Services.UiHelper.ID];
        }

        private PraetorService: Services.PraetorService;
        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;
        private UiHelper: Services.UiHelper;

        constructor($scope: ng.IScope, PraetorService: Services.PraetorService, Utilities: Services.Utilities, Preferences: Services.Preferences, UiHelper: Services.UiHelper) {
            super($scope, ViewModels.Ekonomika.CinnostViewModel, UiHelper.DialogIds.Cinnost);

            this.PraetorService = PraetorService;
            this.Utilities = Utilities;
            this.Preferences = Preferences;                        
            this.UiHelper = UiHelper;

            this.scope.$on("modal.shown", _.bind(this.Shown, this));
        }

        public LoadData() {
            var request = <PraetorServer.Service.WebServer.Messages.LoadCinnostRequest>{};
            var params = this.getData();
            request.id_Spis = params.Id_Spis;

            this.PraetorService.loadCinnost(request).then(
                response => {
                    this.viewModel.Data = response.cinnost;
                    this.viewModel.Aktivity = _.sortBy(response.aktivity, x => x.ord);
                    if (params.Date)
                        this.viewModel.Datum = params.Date;
                    else
                        this.viewModel.Datum = DateTools.GetDateTimeFromJsonFormat(response.cinnost.datum);
                    this.viewModel.Aktivita = _.find(response.aktivity, x => x.id_Aktivita == response.cinnost.id_Aktivita);
                    this.AktivitaChanged();
                },
                ex => {
                    this.close(new CinnostResult(false));
                }
            );
        }

        public SaveData() {
            var request = <PraetorServer.Service.WebServer.Messages.SaveCinnostRequest>{};
            this.viewModel.Data.datum = DateTools.GetDateInJsonFormat(this.viewModel.Datum);
            this.viewModel.Data.id_Aktivita = this.viewModel.Aktivita.id_Aktivita;
            request.cinnost = this.viewModel.Data;

            this.PraetorService.SaveCinnost(request).then(
                response => {
                    this.close(new CinnostResult(true));
                }
            );
        }

        private AktivitaChanged() {
            var aktivita = this.viewModel.Aktivita;
            var popis = this.viewModel.Data.popis;

            if (!popis || _.any(this.viewModel.Aktivity, x => x.popis == popis))
                this.viewModel.Data.popis = aktivita.popis;
        }

        public Cancel() {
            this.close(new CinnostResult(false));
        }

        private Shown() {
            this.LoadData();
        }
    }
}
