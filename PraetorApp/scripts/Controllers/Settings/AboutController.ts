﻿module PraetorApp.Controllers {

    export class AboutController extends BaseController<ViewModels.AboutViewModel> {

        public static ID = "AboutController";

        public static get $inject(): string[] {
            return ["$scope", "$location", Services.Utilities.ID, Services.Preferences.ID, Services.UiHelper.ID, "versionInfo"];
        }

        private $location: ng.ILocationService;
        private Utilities: Services.Utilities;
        private Preferences: Services.Preferences;
        private UiHelper: Services.UiHelper;
        private versionInfo: Interfaces.VersionInfo;

        constructor($scope: ng.IScope, $location: ng.ILocationService, Utilities: Services.Utilities, Preferences: Services.Preferences, UiHelper: Services.UiHelper, versionInfo: Interfaces.VersionInfo) {
            super($scope, ViewModels.AboutViewModel);

            this.$location = $location;
            this.Utilities = Utilities;
            this.Preferences = Preferences;
            this.UiHelper = UiHelper;
            this.versionInfo = versionInfo;
        }

        //#region BaseController Overrides

        protected view_beforeEnter(): void {
            super.view_beforeEnter();

            this.viewModel.logoClickCount = 0;

            this.viewModel.applicationName = this.versionInfo.applicationName;
            this.viewModel.versionString = this.Utilities.format("{0}.{1}.{2}", this.versionInfo.majorVersion, this.versionInfo.minorVersion, this.versionInfo.buildVersion);
            this.viewModel.timestamp = this.versionInfo.buildTimestamp;
        }

        //#endregion

        //#region Controller Methods

        protected logo_click() {

        }

        protected copyrightInfo_click(): void {
            window.open(this.versionInfo.copyrightInfoUrl, "_system");
        }

        protected website_click(): void {
            window.open(this.versionInfo.websiteUrl, "_system");
        }

        protected gitHubRepo_click(): void {
            window.open(this.versionInfo.githubUrl, "_system");
        }

        //#endregion
    }
}
