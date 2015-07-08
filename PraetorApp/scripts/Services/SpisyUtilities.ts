module PraetorApp.Services {

    export class SpisyUtilities {

        public static ID = "SpisyUtilities";

        public static get $inject(): string[] {
            return ["$q", "$timeout", Utilities.ID, Services.PraetorService.ID, Services.Preferences.ID];
        }

        private $q: ng.IQService;
        private Utilities: Utilities;
        private _spisy: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[];
        private $timeout: ng.ITimeoutService;
        private praetorService: Services.PraetorService;
        private Preferences: Services.Preferences;        
        private registerController: PraetorApp.Definitely.ISpisyUtilitiesDataChange[];
        private interval: number;

        constructor($q: ng.IQService, $timeout: ng.ITimeoutService, Utilities: Utilities, praetorService: Services.PraetorService, Preferences: Services.Preferences) {
            this.$q = $q;
            this.Utilities = Utilities;
            this._spisy = null;
            this.$timeout = $timeout;
            this.praetorService = praetorService;
            this.Preferences = Preferences;
            this.registerController = [];
        }

        get Spisy(): PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[]{
            return this._spisy;
        }
        set Spisy(value: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[]) {
            this._spisy = value;
        }

        public Synchronize() {

            var self = this;
            this.Preferences.spisy = null;            
            // Zjistíme jestli máme načtené spisy
            // pokud ano tak je hned nastavíme
            if (this.Preferences.spisy != null) {
                this.Spisy = this.Preferences.spisy;
                self.onChangedDataSource();
            }

            if (this.Preferences.spisy == null) {
                this.loadSpisy();
            }

            this.interval = setInterval(function () {
                self.loadSpisy();
            }, 10000);
        }

        private loadSpisy() {
            var self = this;
            var request = <PraetorServer.Service.WebServer.Messages.LoadChangedSpisyRequest>{};

            this.praetorService.getData("LoadChangedSpisy", request).then(function (response: PraetorServer.Service.WebServer.Messages.LoadChangedSpisyResponse) {
                if (response.success) {
                    self.Preferences.spisy = response.changedSpisy;
                    self.Spisy = response.changedSpisy;
                    self.onChangedDataSource();
                }
            });
        }

        private onChangedDataSource() {
            debugger;        
            _.each(this.registerController,
                function (controller: PraetorApp.Definitely.ISpisyUtilitiesDataChange) {                    
                    controller.changeDataSource.apply(controller);
                });
        }

        public register(controller: PraetorApp.Definitely.ISpisyUtilitiesDataChange) {
            this.registerController.push(controller);
        }
    }
}
