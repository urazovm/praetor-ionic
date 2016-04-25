module PraetorApp.Services {

    export class FileUtilities {

        public static ID = "FileUtilities";

        public static get $inject(): string[]{
            return ["$q", Utilities.ID, Preferences.ID];
        }

        private $q: ng.IQService;
        private Utilities: Utilities;
        private Preferences: Preferences;

        constructor($q: ng.IQService, Utilities: Utilities, Preferences: Preferences) {
            this.$q = $q;
            this.Utilities = Utilities;
            this.Preferences = Preferences;
        }       

        public openUrl(path: string): ng.IPromise<void> {
            console.log("opening document: " + path);
            
            var q = this.$q.defer<void>();

            (<any>window).handleDocumentWithURL(
                function () {
                    q.resolve();
                },
                function (error) {
                    var message: string;
                    if (error == 53) {
                        message = "Nebyla nalezena aplikace pro otevření tohoto typu souboru.";
                    }
                    else {
                        // Tato chyba se vyskytuje i v případě, že není v systému aplikace, která by uměla dokument otevřít, takže volíme dostatečně obecnou chybu.
                        message = "Dokument nelze otevřít.";
                    }
                    q.reject(message);
                },
                path
                );

            return q.promise;
        }
    }
}
