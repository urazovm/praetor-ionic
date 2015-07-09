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

        public static FormatAsHourDurationFromMinutes(duration: number): string {
            return this.FormatAsHourDuration(moment.duration({ minutes: duration }));
        }

        public static FormatAsHourDuration(duration: moment.Duration): string {
            var hours = Math.floor(duration.asHours());
            var minutes = duration.minutes();

            return hours + ":" + (minutes < 10 ? "0" : "") + minutes;
        }
    }
}