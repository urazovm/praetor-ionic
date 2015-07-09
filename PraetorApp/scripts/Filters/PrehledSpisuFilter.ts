module PraetorApp.Filters {

    /**
     * Formats numbers greater than one thousand to include the K suffix.
     * 
     * Numbers greater than 10,000 will not show decimal places, while numbers
     * between 1,000 and 9,999 will show decimal places unless the number is
     * a multiple of one thousand.
     * 
     * For example:
     *      200   -> 200
     *      2000  -> 2K
     *      1321  -> 1.3K
     *      10700 -> 10K
     */
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

                if (out.length >= 20)
                    return;
            });

            return out;
        }
    }
}
