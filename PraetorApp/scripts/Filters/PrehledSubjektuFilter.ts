module PraetorApp.Filters {

    export class PrehledSubjektuFilter {

        public static ID = "PrehledSubjektuFilter";

        public static filter(input: PraetorServer.Service.WebServer.Messages.Dto.SubjektPrehledEntry, search: string): any {

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

                if (value.oznaceni)
                    rowData += value.oznaceni.toLowerCase() + "|#|";

                if (rowData.indexOf(search.toLowerCase()) >= 0)
                    out.push(value);
            });

            return out;
        }
    }
}
