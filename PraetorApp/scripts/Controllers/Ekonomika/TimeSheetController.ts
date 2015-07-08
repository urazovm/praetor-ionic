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
            debugger;
            this.LoadData();
        }

        public LoadData() {
            var request: PraetorServer.Service.WebServer.Messages.LoadTimeSheetRequest
            {
                id_Spis: this.getData().Id_Spis;
            }

            this.PraetorService.loadTimeSheet(request).then(response => {
                this.viewModel.Data = response.timeSheet;
                this.viewModel.Aktivity = response.aktivity;
            });
        }

        public SaveData() {
            debugger;
            var request: PraetorServer.Service.WebServer.Messages.SaveTimeSheetRequest
            {
                timeSheet: this.viewModel.Data;
            }

            this.PraetorService.SaveTimeSheet(request).then(response => {
                if (response.success) {
                    this.close();
                }
                else {
                    this.UiHelper.alert("Došlo k chybě při ukládání činnosti: " + response.message);
                }
            });
        }
    }
}
