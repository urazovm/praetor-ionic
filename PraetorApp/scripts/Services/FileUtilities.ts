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

        public openFile(token: string, pripona: string): ng.IPromise<boolean> {
            return this.openUrl('http://' + this.Preferences.serverUrl + '/praetorapi/getFile/' + token + '.' + pripona);
        }

        public openUrl(path: string): ng.IPromise<boolean> {
            console.log("opening: " + path);
            
            var q = this.$q.defer<boolean>();

            (<any>window).handleDocumentWithURL(
                function () {
                    console.log('success');
                    q.resolve(true);
                },
                function (error) {
                    console.log('failure');
                    if (error == 53) {
                        console.log('No app that handles this file type.');
                    }
                    q.resolve(false);
                },
                path
                );

            return q.promise;
        }
    }
}
