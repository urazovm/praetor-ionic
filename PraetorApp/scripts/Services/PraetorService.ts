module PraetorApp.Services {

    export class PraetorService {

        public static ID = "PraetorService";

        public static get $inject(): string[] {
            return ["$q", Utilities.ID, "$http"];
        }

        private $q: ng.IQService;
        private Utilities: Utilities;
        private $http: ng.IHttpService;

        constructor($q: ng.IQService, Utilities: Utilities, $http: ng.IHttpService) {
            this.$q = $q;
            this.$http = $http;
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
                    q.resolve(false);
                },
                path
                );

            return q.promise;
        }

        public login(server: string, username: string, password: string): ng.IPromise<PraetorServer.Service.WebServer.Messages.LoginResponse> {
            
            var q = this.$q.defer<PraetorServer.Service.WebServer.Messages.LoginResponse>();

            var data = { username: username, password: password };

            this.$http.post(
                'http://' + server + '/praetorapi/login',
                data,
                {
                    headers: { 'Content-Type': 'application/json' }
                })
                .then(function (response: ng.IHttpPromiseCallbackArg<PraetorServer.Service.WebServer.Messages.LoginResponse>) {                
                q.resolve(response.data);
            })
            ['catch'](function (e) {
                q.resolve({ success: false, message: "Error " + e.status });                
            });

            return q.promise;
        }

        //private getData(action: string, data: any): ng.IPromise<boolean> {

        //    var promise = this.$http.post(
        //        'http://' + server + '/praetorapi/' + action,
        //        data,
        //        { headers: { 'Content-Type': 'application/json' } })
        //        .then(function (response) {
        //        return response.data;
        //    })
        //    ['catch'](function (e) {
        //        return { success: false, message: "Error " + e.status };
        //    });
        //    return promise;
        //}
    }
}
