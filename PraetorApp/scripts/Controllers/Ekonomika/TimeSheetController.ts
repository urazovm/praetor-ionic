module PraetorApp.Controllers {

    export class TimeSheetController extends BaseDialogController<ViewModels.Ekonomika.TimeSheetViewModel, TimeSheetParams, TimeSheetResult> {
        public static ID = "TimeSheetController";

        public static get $inject(): string[]{
            return ["$scope", Services.PraetorService.ID, Services.Utilities.ID, Services.Preferences.ID, Services.UiHelper.ID];
        }

        private PraetorService: Services.PraetorService;
        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;
        private UiHelper: Services.UiHelper;

        constructor($scope: ng.IScope, PraetorService: Services.PraetorService, Utilities: Services.Utilities, Preferences: Services.Preferences, UiHelper: Services.UiHelper) {
            super($scope, ViewModels.Ekonomika.TimeSheetViewModel, UiHelper.DialogIds.TimeSheet);

            this.PraetorService = PraetorService;
            this.Utilities = Utilities;
            this.Preferences = Preferences;                        
            this.UiHelper = UiHelper;

            this.scope.$on("modal.shown", _.bind(this.Shown, this));
        }

        public LoadData() {
            var request = <PraetorServer.Service.WebServer.Messages.LoadTimeSheetRequest>{};
            request.id_Spis = this.getData().Id_Spis;

            this.PraetorService.loadTimeSheet(request).then(
                response => {
                    this.viewModel.Data = response.timeSheet;
                    this.viewModel.Aktivity = response.aktivity;
                    this.viewModel.Datum = new Date(<any>response.timeSheet.datum);
                    this.viewModel.Aktivita = _.find(response.aktivity, x => x.id_Aktivita == response.timeSheet.id_Aktivita);
                },
                ex => {
                    this.close();
                }
            );
        }

        public SaveData() {
            var request = <PraetorServer.Service.WebServer.Messages.SaveTimeSheetRequest>{};
            this.viewModel.Data.datum = <any>this.viewModel.Datum.toISOString();
            this.viewModel.Data.id_Aktivita = this.viewModel.Aktivita.id_Aktivita;
            request.timeSheet = this.viewModel.Data;

            this.PraetorService.SaveTimeSheet(request).then(response => {
                if (response.success) {
                    this.close();
                }
                else {
                    this.UiHelper.alert("Došlo k chybě při ukládání činnosti: " + response.message);
                }
            });
        }

        private AktivitaChanged() {
            var aktivita = this.viewModel.Aktivita;
            var popis = this.viewModel.Data.popis;

            if (!popis || _.any(this.viewModel.Aktivity, x => x.popis == popis))
                this.viewModel.Data.popis = aktivita.popis;
        }

        public Cancel() {
            this.close();
        }

        private Shown() {
            this.LoadData();
        }
    }
}
