module PraetorApp.Services {

    export class SubjektyUtilities {

        public static ID = "SubjektyUtilities";

        public static get $inject(): string[] {
            return ["$q", "$timeout", Utilities.ID, Services.PraetorService.ID, Services.Preferences.ID];
        }

        private $q: ng.IQService;
        private Utilities: Utilities;
        private _subjekty: PraetorServer.Service.WebServer.Messages.Dto.SubjektPrehledEntry[];
        private $timeout: ng.ITimeoutService;
        private praetorService: Services.PraetorService;
        private Preferences: Services.Preferences;        
        private registerController: PraetorApp.Definitely.ISubjektyUtilitiesDataChange[];
        private interval: number;

        constructor($q: ng.IQService, $timeout: ng.ITimeoutService, Utilities: Utilities, praetorService: Services.PraetorService, Preferences: Services.Preferences) {
            this.$q = $q;
            this.Utilities = Utilities;
            this._subjekty = null;
            this.$timeout = $timeout;
            this.praetorService = praetorService;
            this.Preferences = Preferences;
            this.registerController = [];
        }

        get Subjekty(): PraetorServer.Service.WebServer.Messages.Dto.SubjektPrehledEntry[]{
            return this._subjekty;
        }
        set Subjekty(value: PraetorServer.Service.WebServer.Messages.Dto.SubjektPrehledEntry[]) {
            this._subjekty = value;
        }

        public Synchronize() {

            var self = this;
            this.Preferences.subjekty = null;            
            // Zjistíme jestli máme načtené subjekty
            // pokud ano tak je hned nastavíme
            if (this.Preferences.subjekty != null) {
                this.Subjekty = this.Preferences.subjekty;
                self.onChangedDataSource();
            }

            if (this.Preferences.subjekty == null) {
                this.loadSubjekty();
            }

            //this.interval = setInterval(function () {
            //    self.loadSubjekty();
            //}, 10000);
        }

        private loadSubjekty() {
            var self = this;
            var request = <PraetorServer.Service.WebServer.Messages.LoadChangedSubjektyRequest>{};

            this.praetorService.getData("LoadChangedSubjekty", request).then(function (response: PraetorServer.Service.WebServer.Messages.LoadChangedSubjektyResponse) {
                if (response.success) {
                    self.Preferences.subjekty = response.changedSubjekty;
                    self.Subjekty = response.changedSubjekty;
                    self.onChangedDataSource();
                }
            });
        }

        private onChangedDataSource() {                    
            _.each(this.registerController,
                function (controller: PraetorApp.Definitely.ISubjektyUtilitiesDataChange) {                    
                    controller.changeDataSource.apply(controller);
                });
        }

        public register(controller: PraetorApp.Definitely.ISubjektyUtilitiesDataChange) {
            this.registerController.push(controller);
        }
    }
}
