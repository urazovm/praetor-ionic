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

        constructor($q: ng.IQService, $timeout: ng.ITimeoutService, Utilities: Utilities, praetorService: Services.PraetorService, Preferences: Services.Preferences) {
            this.$q = $q;
            this.Utilities = Utilities;
            this._spisy = null;
            this.$timeout = $timeout;
            this.praetorService = praetorService;
            this.Preferences = Preferences;
        }

        get Spisy(): PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[]{
            return this._spisy;
        }

        public Synchronize() {

            var self = this;

            // Zjistíme jestli máme načtené spisy
            // pokud ano tak je hned nastavíme
            if (this.Preferences.spisy != null) {
                this._spisy = this.Preferences.spisy;
            }

            if (this.Preferences.spisy == null) {
                var request = <PraetorServer.Service.WebServer.Messages.LoadChangedSpisyRequest>{};

                this.praetorService.getData("LoadChangedSpisy", request).then(function (response: PraetorServer.Service.WebServer.Messages.LoadChangedSpisyResponse) {                    
                    if (response.success) {
                        self.Preferences.spisy = response.changedSpisy;
                        self._spisy = response.changedSpisy;
                    }
                });
            }
        }
    }
}
