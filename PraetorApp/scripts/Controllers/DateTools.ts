module PraetorApp.Controllers {
    export class DateTools {
        public static GetDateInJsonFormat(date: Date): Date {
            return <any>moment(date).format("YYYY-MM-DD");
        }

        public static GetDateTimeInJsonFormat(date: Date): Date {
            return <any>moment(date).format("YYYY-MM-DDTHH:mm:ss");
        }

        public static GetDateTimeFromJsonFormat(date: Date): Date {
            return moment(date).toDate();
        }
    }
}