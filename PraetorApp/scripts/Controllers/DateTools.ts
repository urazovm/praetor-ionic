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

        private static daysOfWeek: string[] = ["neděle", "pondělí", "úterý", "středa", "čtvrtek", "pátek", "sobota"];
        private static months: string[] = ["ledna", "února", "března", "dubna", "května", "června", "července", "srpna", "září", "října", "listopadu", "prosince"];

        public static GetDayString(date: moment.Moment): string {
            return this.daysOfWeek[date.day()];
        }

        public static GetMonthString(date: moment.Moment): string {
            return this.months[date.month()];
        }

        public static FormatDate(date: moment.Moment): string {
            return this.GetDayString(date) + " " + date.date() + ". " + this.GetMonthString(date);
        }
    }
}