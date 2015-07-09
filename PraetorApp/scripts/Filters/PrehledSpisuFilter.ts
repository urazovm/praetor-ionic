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

            _.each(input, (row:any) =>
            {
                var jeTam = false;

                _.each(row, (property: any, key:string) => {                    

                    if (key == "id_Spis")
                        return;

                    if (property.indexOf(search) != -1) {
                        jeTam = true;
                    }
                });


                if (jeTam)
                    out.push(row);

                if (out.length >= 50)
                    return;
            });

            return out;
        }
    }
}
