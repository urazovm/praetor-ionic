module PraetorApp.Services {

    export class FileUtilities {

        public static ID = "FileUtilities";

        public static get $inject(): string[] {
            return ["$q", Utilities.ID];
        }

        private $q: ng.IQService;
        private Utilities: Utilities;

        constructor($q: ng.IQService, Utilities: Utilities) {
            this.$q = $q;
            this.Utilities = Utilities;
        }       

        public openFile(path: string): ng.IPromise<boolean> {
            var q = this.$q.defer<boolean>();


            (<any>window).handleDocumentWithURL(
                function () { console.log('success'); q.resolve(true); },
                function (error) {
                    console.log('failure');
                    if (error == 53) {
                        console.log('No app that handles this file type.');
                    }
                    q.resolve(true);
                },
                'http://www.example.com/path/to/document.pdf'
                );           

            return q.promise;
        }
    }
}
