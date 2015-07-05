module PraetorApp.Services {

    export class HashUtilities {

        public static ID = "HashUtilities";

        public static get $inject(): string[] {
            return ["$q", Utilities.ID];
        }

        private $q: ng.IQService;
        private Utilities: Utilities;

        constructor($q: ng.IQService, Utilities: Utilities) {
            this.$q = $q;
            this.Utilities = Utilities;
        }       
        
        public md5(data: string): string {       
            return (<any>window).hex_md5(data);            
        }
    }
}
