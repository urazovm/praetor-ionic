module PraetorApp.Filters {

    export class PrehledSpisuFilter {

        public static ID = "PrehledSpisuFilter";

        public static filter(input: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry, search: string): any {

            if (input == null) {
                return [];
            }

            if (search == null || search == "") {
                return [];
            }

            var out = [];

            (<any>input).filter((value, index, array) => {                
                
                if (out.length >= 50)
                    return;

                if (value.spisovaZnacka != undefined || value.spisovaZnacka != "")
                    search += value.spisovaZnacka.toLowerCase()

                if (value.predmet != undefined || value.predmet != "")
                    search += value.predmet.toLowerCase()

                if (value.hlavniKlient != undefined || value.hlavniKlient != "")
                    search += value.hlavniKlient.toLowerCase()

                if (search.indexOf(search.toLowerCase()) >= 0)
                    out.push(value);
            });

            return out;
        }
    }
}
