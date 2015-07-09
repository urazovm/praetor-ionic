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

                var rowData = "";

                if (value.spisovaZnacka)
                    rowData += value.spisovaZnacka.toLowerCase() + "|#|";

                if (value.predmet)
                    rowData += value.predmet.toLowerCase() + "|#|";

                if (value.hlavniKlient)
                    rowData += value.hlavniKlient.toLowerCase() + "|#|";

                if (rowData.indexOf(search.toLowerCase()) >= 0)
                    out.push(value);
            });

            return out;
        }
    }
}
