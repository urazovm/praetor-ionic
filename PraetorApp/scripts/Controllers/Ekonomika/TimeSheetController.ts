module PraetorApp.Controllers.Ekonomika {

    export class TimeSheetController extends BaseDialogController<ViewModels.Ekonomika.TimeSheetViewModel, TimeSheetParams, TimeSheetResult> {
        public static ID = "TimeSheetController";

        public static get $inject(): string[] {
            return ["$scope", Services.Utilities.ID, Services.Preferences.ID, Services.UiHelper.ID];
        }

        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;
        private UiHelper: Services.UiHelper;

        constructor($scope: ng.IScope, Utilities: Services.Utilities, Preferences: Services.Preferences, UiHelper: Services.UiHelper) {
            super($scope, ViewModels.Ekonomika.TimeSheetViewModel, UiHelper.DialogIds.TimeSheet);

            this.Utilities = Utilities;
            this.Preferences = Preferences;                        
            this.UiHelper = UiHelper;
        }
    }
}
