module PraetorApp.Services {

    /**
     * Provides a way to easily get/set user preferences.
     * 
     * The current backing store is local storage and/or session storage:
     * https://cordova.apache.org/docs/en/3.0.0/cordova_storage_storage.md.html#localStorage
     */
    export class Preferences {

        public static ID = "Preferences";

        public static get $inject(): string[] {
            return [];
        }

        private static USERNAME = "USER_ID";
        private static PASSWORD = "PASSWORD";
        private static SERVER_NAME = "SERVER_NAME";
        private static SERVER_URL = "SERVER_URL";
        private static SESSION_ID = "SESSION_ID";
        private static SPISY_LOCAL_STORAGE = "SPISY_LOCAL_STORAGE";
        private static REQUIRE_PIN_THRESHOLD = "REQUIRE_PIN_THRESHOLD";
        private static LAST_PAUSED_AT = "LAST_PAUSED_AT";
        private static HAS_COMPLETED_ONBOARDING = "HAS_COMPLETED_ONBOARDING";
        private static PIN = "PIN";
        private static ENABLE_MOCK_HTTP_CALLS = "ENABLE_MOCK_HTTP_CALLS";

        // Default setting is 10 minutes.
        private static REQUIRE_PIN_THRESHOLD_DEFAULT = 10;

        get enableMockHttpCalls(): boolean {
            return localStorage.getItem(Preferences.ENABLE_MOCK_HTTP_CALLS) === "true";
        }

        set enableMockHttpCalls(value: boolean) {
            if (value == null) {
                localStorage.removeItem(Preferences.ENABLE_MOCK_HTTP_CALLS);
            }
            else {
                localStorage.setItem(Preferences.ENABLE_MOCK_HTTP_CALLS, value.toString());
            }
        }

        get hasCompletedOnboarding(): boolean {
            return localStorage.getItem(Preferences.HAS_COMPLETED_ONBOARDING) === "true";
        }

        set hasCompletedOnboarding(value: boolean) {
            if (value == null) {
                localStorage.removeItem(Preferences.HAS_COMPLETED_ONBOARDING);
            }
            else {
                localStorage.setItem(Preferences.HAS_COMPLETED_ONBOARDING, value.toString());
            }
        }

        get apiUrl(): string {
            //return localStorage.getItem(Preferences.API_URL);
            return "sample-app.justin-credible.net/api";
        }

        get spisy(): PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[] {
            var jsonData = localStorage.getItem(Preferences.SPISY_LOCAL_STORAGE);

            if (jsonData == undefined)
                return null;

            return JSON.parse(jsonData);
        }

        set spisy(value: PraetorServer.Service.WebServer.Messages.Dto.SpisPrehledEntry[]) {
            if (value == null) {
                localStorage.removeItem(Preferences.SPISY_LOCAL_STORAGE);
            }
            else {
                var jsonData = JSON.stringify(value);
                localStorage.setItem(Preferences.SPISY_LOCAL_STORAGE, jsonData);
            }
        }

        get serverName(): string {
            return localStorage.getItem(Preferences.SERVER_NAME);
        }

        set serverName(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.SERVER_NAME);
            }
            else {
                localStorage.setItem(Preferences.SERVER_NAME, value);
            }
        }

        get serverUrl(): string {
            return localStorage.getItem(Preferences.SERVER_URL);
        }

        set serverUrl(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.SERVER_URL);
            }
            else {
                localStorage.setItem(Preferences.SERVER_URL, value);
            }
        }

        get password(): string {
            return localStorage.getItem(Preferences.PASSWORD);
        }

        set password(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.PASSWORD);
            }
            else {
                localStorage.setItem(Preferences.PASSWORD, value);
            }
        }

        get username(): string {
            return localStorage.getItem(Preferences.USERNAME);
        }

        set username(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.USERNAME);
            }
            else {
                localStorage.setItem(Preferences.USERNAME, value);
            }
        }

        get sessionId(): string {
            return localStorage.getItem(Preferences.SESSION_ID);
        }

        set sessionId(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.SESSION_ID);
            }
            else {
                localStorage.setItem(Preferences.SESSION_ID, value);
            }
        }

        get requirePinThreshold(): number {
            var value = localStorage.getItem(Preferences.REQUIRE_PIN_THRESHOLD);
            return value == null ? Preferences.REQUIRE_PIN_THRESHOLD_DEFAULT : parseInt(value, 10);
        }

        set requirePinThreshold(value: number) {
            if (value == null) {
                localStorage.removeItem(Preferences.REQUIRE_PIN_THRESHOLD);
            }
            else {
                localStorage.setItem(Preferences.REQUIRE_PIN_THRESHOLD, value.toString());
            }
        }

        set lastPausedAt(value: moment.Moment) {
            if (value == null) {
                localStorage.removeItem(Preferences.LAST_PAUSED_AT);
            }
            else {
                localStorage.setItem(Preferences.LAST_PAUSED_AT, moment(value).format());
            }
        }

        get lastPausedAt(): moment.Moment {
            var lastPausedAt: string;

            lastPausedAt = localStorage.getItem(Preferences.LAST_PAUSED_AT);

            return moment(lastPausedAt).isValid() ? moment(lastPausedAt) : null;
        }

        get pin(): string {
            return localStorage.getItem(Preferences.PIN);
        }

        set pin(value: string) {
            if (value == null) {
                localStorage.removeItem(Preferences.PIN);
            }
            else {
                localStorage.setItem(Preferences.PIN, value);
            }
        }
    }
}
