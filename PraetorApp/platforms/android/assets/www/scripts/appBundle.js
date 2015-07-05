var PraetorApp;
(function (PraetorApp) {
    var Application;
    (function (Application) {
        //#region Variables
        /**
         * The root Angular application module.
         */
        var ngModule;
        /**
         * Indicates if the PIN entry dialog is currently being shown. This is used to determine
         * if the device_pause event should update the lastPausedAt timestamp (we don't want to
         * update the timestamp if the dialog is open because it will allow the user to pause
         * and then kill the app and bypass the PIN entry screen on next resume).
         */
        var isShowingPinPrompt;
        //#endregion
        /**
         * This is the main entry point for the application. It is used to setup Angular and
         * configure its controllers, services, etc.
         *
         * It is invoked via the Main.js script included from the index.html page.
         */
        function main() {
            var versionInfo;
            // Set the default error handler for all uncaught exceptions.
            window.onerror = window_onerror;
            versionInfo = {
                applicationName: "Praetor App",
                copyrightInfoUrl: "https://github.com/BohdanMaslowski/praetor-ionic/blob/master/LICENSE",
                websiteUrl: "http://www.praetoris.cz",
                githubUrl: "https://github.com/BohdanMaslowski/praetor-ionic",
                email: "support@praetoris.cz",
                majorVersion: window.buildVars.majorVersion,
                minorVersion: window.buildVars.minorVersion,
                buildVersion: window.buildVars.buildVersion,
                versionString: window.buildVars.majorVersion + "." + window.buildVars.minorVersion + "." + window.buildVars.buildVersion,
                buildTimestamp: window.buildVars.buildTimestamp
            };
            // Define the top level Angular module for the application.
            // Here we also specify the Angular modules this module depends upon.
            ngModule = angular.module("PraetorApp.Application", ["ui.router", "ionic", "ngMockE2E"]);
            // Define our constants.
            ngModule.constant("isRipple", !!(window.parent && window.parent.ripple));
            ngModule.constant("isCordova", typeof (cordova) !== "undefined");
            ngModule.constant("isDebug", window.buildVars.debug);
            ngModule.constant("isChromeExtension", typeof (chrome) !== "undefined" && typeof (chrome.runtime) !== "undefined" && typeof (chrome.runtime.id) !== "undefined");
            ngModule.constant("versionInfo", versionInfo);
            ngModule.constant("apiVersion", "1.0");
            // Register the services, directives, filters, and controllers with Angular.
            registerServices(ngModule);
            registerDirectives(ngModule);
            registerFilters(ngModule);
            registerControllers(ngModule);
            // Specify the initialize/run and configuration functions.
            ngModule.run(angular_initialize);
            ngModule.config(angular_configure);
        }
        Application.main = main;
        //#region Helpers
        /**
         * Used construct an instance of an object using the new operator with the given constructor
         * function and arguments.
         *
         * http://stackoverflow.com/a/1608546/4005811
         *
         * @param constructor The constructor function to invoke with the new keyword.
         * @param args The arguments to be passed into the constructor function.
         */
        function construct(constructor, args) {
            function F() {
                return constructor.apply(this, args);
            }
            ;
            F.prototype = constructor.prototype;
            return new F();
        }
        /**
         * Used to register each of the services that exist in the Service namespace
         * with the given Angular module.
         *
         * @param ngModule The Angular module with which to register.
         */
        function registerServices(ngModule) {
            // Register each of the services that exist in the Service namespace.
            _.each(PraetorApp.Services, function (Service) {
                // A static ID property is required to register a service.
                if (Service.ID) {
                    if (typeof (Service.getFactory) === "function") {
                        // If a static method named getFactory() is available we'll invoke it
                        // to get a factory function to register as a factory.
                        console.log("Registering factory " + Service.ID + "...");
                        ngModule.factory(Service.ID, Service.getFactory());
                    }
                    else {
                        console.log("Registering service " + Service.ID + "...");
                        ngModule.service(Service.ID, Service);
                    }
                }
            });
        }
        /**
         * Used to register each of the directives that exist in the Directives namespace
         * with the given Angular module.
         *
         * @param ngModule The Angular module with which to register.
         */
        function registerDirectives(ngModule) {
            _.each(PraetorApp.Directives, function (Directive) {
                if (Directive.ID) {
                    if (Directive.__BaseElementDirective) {
                        console.log("Registering element directive " + Directive.ID + "...");
                        ngModule.directive(Directive.ID, getElementDirectiveFactoryFunction(Directive));
                    }
                    else {
                        ngModule.directive(Directive.ID, getDirectiveFactoryParameters(Directive));
                    }
                }
            });
        }
        /**
         * Used to register each of the filters that exist in the Filters namespace
         * with the given Angular module.
         *
         * @param ngModule The Angular module with which to register.
         */
        function registerFilters(ngModule) {
            _.each(PraetorApp.Filters, function (Filter) {
                if (Filter.ID && typeof (Filter.filter) === "function") {
                    console.log("Registering filter " + Filter.ID + "...");
                    ngModule.filter(Filter.ID, getFilterFactoryFunction(Filter.filter));
                }
            });
        }
        /**
         * Used to register each of the controllers that exist in the Controller namespace
         * with the given Angular module.
         *
         * @param ngModule The Angular module with which to register.
         */
        function registerControllers(ngModule) {
            // Register each of the controllers that exist in the Controllers namespace.
            _.each(PraetorApp.Controllers, function (Controller) {
                if (Controller.ID) {
                    console.log("Registering controller " + Controller.ID + "...");
                    ngModule.controller(Controller.ID, Controller);
                }
            });
        }
        /**
         * Used to create a function that returns a data structure describing an Angular directive
         * for an element from one of our own classes implementing IElementDirective. It handles
         * creating an instance and invoked the render method when linking is invoked.
         *
         * @param Directive A class reference (not instance) to a element directive class that implements Directives.IElementDirective.
         * @returns A factory function that can be used by Angular to create an instance of the element directive.
         */
        function getElementDirectiveFactoryFunction(Directive) {
            var descriptor = {};
            /* tslint:disable:no-string-literal */
            // Here we set the options for the Angular directive descriptor object.
            // We get these values from the static fields on the class reference.
            descriptor.restrict = Directive["restrict"];
            descriptor.template = Directive["template"];
            descriptor.replace = Directive["replace"];
            descriptor.transclude = Directive["transclude"];
            descriptor.scope = Directive["scope"];
            /* tslint:enable:no-string-literal */
            if (descriptor.restrict !== "E") {
                console.warn("BaseElementDirectives are meant to restrict only to element types.");
            }
            // Here we define the link function that Angular invokes when it is linking the
            // directive to the element.
            descriptor.link = function (scope, instanceElement, instanceAttributes, controller, transclude) {
                // New up the instance of our directive class.
                var instance = new Directive(scope, instanceElement, instanceAttributes, controller, transclude);
                // Delegate to the render method.
                instance.render();
            };
            // Finally, return a function that returns this Angular directive descriptor object.
            return function () { return descriptor; };
        }
        /**
         * Used to create an array of injection property names followed by a function that will be
         * used by Angular to create an instance of the given directive.
         *
         * @param Directive A class reference (not instance) to a directive class.
         * @returns An array of injection property names followed by a factory function for use by Angular.
         */
        function getDirectiveFactoryParameters(Directive) {
            var params = [];
            /* tslint:disable:no-string-literal */
            // If the directive is annotated with an injection array, we'll add the injection
            // array's values to the list first.
            if (Directive["$inject"]) {
                params = params.concat(Directive["$inject"]);
            }
            /* tslint:enable:no-string-literal */
            // The last parameter in the array is the function that will be executed by Angular
            // when the directive is being used.
            params.push(function () {
                // Create a new instance of the directive, passing along the arguments (which
                // will be the values injected via the $inject annotation).
                return construct(Directive, arguments);
            });
            return params;
        }
        /**
         * Used to create a function that returns a function for use by a filter.
         *
         * @param fn The function that will provide the filter's logic.
         */
        function getFilterFactoryFunction(fn) {
            return function () { return fn; };
        }
        //#endregion
        //#region Platform Configuration
        /**
         * The main initialize/run function for Angular; fired once the AngularJs framework is done loading.
         */
        function angular_initialize($rootScope, $location, $ionicViewService, $ionicPlatform, Utilities, UiHelper, Preferences, MockHttpApis) {
            // Once AngularJs has loaded we'll wait for the Ionic platform's ready event.
            // This event will be fired once the device ready event fires via Cordova.
            $ionicPlatform.ready(function () {
                ionicPlatform_ready($rootScope, $location, $ionicViewService, $ionicPlatform, UiHelper, Utilities, Preferences);
            });
            // Mock up or allow HTTP responses.
            MockHttpApis.mockHttpCalls(Preferences.enableMockHttpCalls);
        }
        ;
        /**
         * Fired once the Ionic framework determines that the device is ready.
         *
         * Note that this will not fire in the Ripple emulator because it relies
         * on the Codrova device ready event.
         */
        function ionicPlatform_ready($rootScope, $location, $ionicViewService, $ionicPlatform, UiHelper, Utilities, Preferences) {
            // Subscribe to device events.
            document.addEventListener("pause", _.bind(device_pause, null, Preferences));
            document.addEventListener("resume", _.bind(device_resume, null, $location, $ionicViewService, Utilities, UiHelper, Preferences));
            document.addEventListener("menubutton", _.bind(device_menuButton, null, $rootScope));
            // Subscribe to Angular events.
            $rootScope.$on("$locationChangeStart", angular_locationChangeStart);
            // Now that the platform is ready, we'll delegate to the resume event.
            // We do this so the same code that fires on resume also fires when the
            // application is started for the first time.
            device_resume($location, $ionicViewService, Utilities, UiHelper, Preferences);
        }
        /**
         * Function that is used to configure AngularJs.
         */
        function angular_configure($stateProvider, $urlRouterProvider, $provide, $httpProvider, $compileProvider) {
            // Intercept the default Angular exception handler.
            $provide.decorator("$exceptionHandler", function ($delegate) {
                return function (exception, cause) {
                    // Delegate to our custom handler.
                    angular_exceptionHandler(exception, cause);
                    // Delegate to the default/base Angular behavior.
                    $delegate(exception, cause);
                };
            });
            // Whitelist several URI schemes to prevent Angular from marking them as un-safe.
            // http://stackoverflow.com/questions/19590818/angularjs-and-windows-8-route-error
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|mailto|file|ghttps?|ms-appx|x-wmapp0|chrome-extension):/);
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|ms-appx|x-wmapp0):|data:image\//);
            // Register our custom interceptor with the HTTP provider so we can hook into AJAX request events.
            $httpProvider.interceptors.push(PraetorApp.Services.HttpInterceptor.ID);
            // Setup all of the client side routes and their controllers and views.
            PraetorApp.RouteConfig.setupRoutes($stateProvider, $urlRouterProvider);
            // If mock API calls are enabled, then we'll add a random delay for all HTTP requests to simulate
            // network latency so we can see the spinners and loading bars. Useful for demo purposes.
            if (localStorage.getItem("ENABLE_MOCK_HTTP_CALLS") === "true") {
                PraetorApp.Services.MockHttpApis.setupMockHttpDelay($provide);
            }
        }
        ;
        //#endregion
        //#region Event Handlers
        /**
         * Fired when the OS decides to minimize or pause the application. This usually
         * occurs when the user presses the device's home button or switches applications.
         */
        function device_pause(Preferences) {
            if (!isShowingPinPrompt) {
                // Store the current date/time. This will be used to determine if we need to
                // show the PIN lock screen the next time the application is resumed.
                Preferences.lastPausedAt = moment();
            }
        }
        /**
         * Fired when the OS restores an application to the foreground. This usually occurs
         * when the user launches an app that is already open or uses the OS task manager
         * to switch back to the application.
         */
        function device_resume($location, $ionicViewService, Utilities, UiHelper, Preferences) {
            isShowingPinPrompt = true;
            // Potentially display the PIN screen.
            UiHelper.showPinEntryAfterResume().then(function () {
                isShowingPinPrompt = false;
                // If the user hasn't completed onboarding (eg new, first-time use of the app)
                // then we'll push them straight into the onboarding flow. Note that we do this
                // purposefully after the PIN screen for the case where the user may be upgrading
                // from a version of the application that doesn't have onboarding (we wouldn't
                // want them to be able to bypass the PIN entry in that case).
                if (!Preferences.hasCompletedOnboarding) {
                    // Tell Ionic to not animate and clear the history (hide the back button)
                    // for the next view that we'll be navigating to below.
                    $ionicViewService.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    // Navigate the user to the onboarding splash view.
                    $location.path("/app/onboarding/splash");
                    $location.replace();
                    return;
                }
                // If the user is still at the blank sreen, then push them to their default view.
                if ($location.url() === "/app/blank") {
                    // Tell Ionic to not animate and clear the history (hide the back button)
                    // for the next view that we'll be navigating to below.
                    $ionicViewService.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    // Navigate the user to their default view.
                    $location.path(Utilities.defaultCategory.href.substring(1));
                    $location.replace();
                }
            });
        }
        /**
         * Fired when the menu hard (or soft) key is pressed on the device (eg Android menu key).
         * This isn't used for iOS devices because they do not have a menu button key.
         */
        function device_menuButton($rootScope) {
            // Broadcast this event to all child scopes. This allows controllers for individual
            // views to handle this event and show a contextual menu etc.
            $rootScope.$broadcast("menubutton");
        }
        /**
         * Fired when Angular's route/location (eg URL hash) is changing.
         */
        function angular_locationChangeStart(event, newRoute, oldRoute) {
            console.log("Location change, old Route: " + oldRoute);
            console.log("Location change, new Route: " + newRoute);
        }
        ;
        /**
         * Fired when an unhandled JavaScript exception occurs outside of Angular.
         */
        function window_onerror(message, uri, lineNumber, columnNumber) {
            var UiHelper;
            console.error("Unhandled JS Exception", message, uri, lineNumber, columnNumber);
            try {
                UiHelper = angular.element(document.body).injector().get(PraetorApp.Services.UiHelper.ID);
                UiHelper.toast.showLongBottom("An error has occurred; please try again.");
                UiHelper.progressIndicator.hide();
            }
            catch (ex) {
                console.warn("There was a problem alerting the user to an Angular error; falling back to a standard alert().", ex);
                alert("An error has occurred; please try again.");
            }
        }
        /**
         * Fired when an exception occurs within Angular.
         *
         * This includes uncaught exceptions in ng-click methods for example.
         */
        function angular_exceptionHandler(exception, cause) {
            var message = exception.message, UiHelper;
            if (!cause) {
                cause = "[Unknown]";
            }
            console.error("AngularJS Exception", exception, cause);
            try {
                UiHelper = angular.element(document.body).injector().get(PraetorApp.Services.UiHelper.ID);
                UiHelper.toast.showLongBottom("An error has occurred; please try again.");
                UiHelper.progressIndicator.hide();
            }
            catch (ex) {
                console.warn("There was a problem alerting the user to an Angular error; falling back to a standard alert().", ex);
                alert("An error has occurred; please try again.");
            }
        }
    })(Application = PraetorApp.Application || (PraetorApp.Application = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    /**
     * Used to define all of the client-side routes for the application.
     * This maps routes to the controller/view that should be used.
     */
    var RouteConfig = (function () {
        function RouteConfig() {
        }
        RouteConfig.setupRoutes = function ($stateProvider, $urlRouterProvider) {
            // Setup an abstract state for the tabs directive.
            $stateProvider.state("app", {
                url: "/app",
                abstract: true,
                templateUrl: "templates/Menu.html",
                controller: PraetorApp.Controllers.MenuController.ID
            });
            // An blank view useful as a place holder etc.
            $stateProvider.state("app.blank", {
                url: "/blank",
                views: {
                    "menuContent": {
                        templateUrl: "templates/Blank.html"
                    }
                }
            });
            // A shared view used between categories, assigned a number via the route URL (categoryNumber).
            $stateProvider.state("app.category", {
                url: "/category/:categoryNumber",
                views: {
                    "menuContent": {
                        templateUrl: "templates/Category.html",
                        controller: PraetorApp.Controllers.CategoryController.ID
                    }
                }
            });
            //#region Onboarding
            $stateProvider.state("app.onboarding-splash", {
                url: "/onboarding/splash",
                views: {
                    "menuContent": {
                        templateUrl: "templates/Onboarding/Onboarding-Splash.html",
                        controller: PraetorApp.Controllers.OnboardingSplashController.ID
                    }
                }
            });
            $stateProvider.state("app.onboarding-register", {
                url: "/onboarding/register",
                views: {
                    "menuContent": {
                        templateUrl: "templates/Onboarding/Onboarding-Register.html",
                        controller: PraetorApp.Controllers.OnboardingRegisterController.ID
                    }
                }
            });
            $stateProvider.state("app.onboarding-share", {
                url: "/onboarding/share",
                views: {
                    "menuContent": {
                        templateUrl: "templates/Onboarding/Onboarding-Share.html",
                        controller: PraetorApp.Controllers.OnboardingShareController.ID
                    }
                }
            });
            //#endregion
            //#region Settings
            $stateProvider.state("app.settings-list", {
                url: "/settings/list",
                views: {
                    "menuContent": {
                        templateUrl: "templates/Settings/Settings-List.html",
                        controller: PraetorApp.Controllers.SettingsListController.ID
                    }
                }
            });
            $stateProvider.state("app.cloud-sync", {
                url: "/settings/cloud-sync",
                views: {
                    "menuContent": {
                        templateUrl: "templates/Settings/Cloud-Sync.html",
                        controller: PraetorApp.Controllers.CloudSyncController.ID
                    }
                }
            });
            $stateProvider.state("app.configure-pin", {
                url: "/settings/configure-pin",
                views: {
                    "menuContent": {
                        templateUrl: "templates/Settings/Configure-Pin.html",
                        controller: PraetorApp.Controllers.ConfigurePinController.ID
                    }
                }
            });
            $stateProvider.state("app.about", {
                url: "/settings/about",
                views: {
                    "menuContent": {
                        templateUrl: "templates/Settings/About.html",
                        controller: PraetorApp.Controllers.AboutController.ID
                    }
                }
            });
            //#endregion
            // If none of the above states are matched, use the blank route.
            $urlRouterProvider.otherwise("/app/blank");
        };
        return RouteConfig;
    })();
    PraetorApp.RouteConfig = RouteConfig;
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        /**
         * This is the base controller that all other controllers should utilize.
         *
         * It handles saving a reference to the Angular scope, newing up the given
         * model object type, and injecting the view model and controller onto the
         * scope object for use in views.
         *
         * T - The parameter type for the model.
         */
        var BaseController = (function () {
            function BaseController(scope, ModelType) {
                var _this = this;
                // Save a reference to Angular's scope object.
                this.scope = scope;
                // Create the view model.
                this.viewModel = new ModelType();
                /* tslint:disable:no-string-literal */
                // Push the view model onto the scope so it can be
                // referenced from the template/views.
                this.scope["viewModel"] = this.viewModel;
                // Push the controller onto the scope so it can be
                // used to reference events for controls etc.
                this.scope["controller"] = this;
                /* tslint:enable:no-string-literal */
                // Subscribe to various events.
                this.scope.$on("$ionicView.loaded", _.bind(this.view_loaded, this));
                this.scope.$on("$ionicView.enter", _.bind(this.view_enter, this));
                this.scope.$on("$ionicView.leave", _.bind(this.view_leave, this));
                this.scope.$on("$ionicView.beforeEnter", _.bind(this.view_beforeEnter, this));
                this.scope.$on("$ionicView.beforeLeave", _.bind(this.view_beforeLeave, this));
                this.scope.$on("$ionicView.afterEnter", _.bind(this.view_afterEnter, this));
                this.scope.$on("$ionicView.afterLeave", _.bind(this.view_afterLeave, this));
                this.scope.$on("$ionicView.unloaded", _.bind(this.view_unloaded, this));
                this.scope.$on("$destroy", _.bind(this.destroy, this));
                // Now that everything else is done, we can initialize.
                // We defer here so that the initialize event occurs after the constructor
                // of the child class has had a chance to execute.
                _.defer(function () {
                    _this.initialize();
                    _this.scope.$apply();
                });
            }
            /**
             * Fired after the constructor has completed. Used to setup the controller.
             *
             * Can be overridden by implementing controllers.
             */
            BaseController.prototype.initialize = function () {
                /* tslint:disable:no-empty */
                /* tslint:enable:no-empty */
            };
            /**
             * Ionic's view event: $ionicView.loaded
             *
             * Can be overridden by implementing controllers.
             */
            BaseController.prototype.view_loaded = function () {
                /* tslint:disable:no-empty */
                /* tslint:enable:no-empty */
            };
            /**
             * Ionic's view event: $ionicView.enter
             *
             * Can be overridden by implementing controllers.
             */
            BaseController.prototype.view_enter = function () {
                /* tslint:disable:no-empty */
                /* tslint:enable:no-empty */
            };
            /**
             * Ionic's view event: $ionicView.leave
             *
             * Can be overridden by implementing controllers.
             */
            BaseController.prototype.view_leave = function () {
                /* tslint:disable:no-empty */
                /* tslint:enable:no-empty */
            };
            /**
             * Ionic's view event: $ionicView.beforeEnter
             *
             * Can be overridden by implementing controllers.
             */
            BaseController.prototype.view_beforeEnter = function () {
                /* tslint:disable:no-empty */
                /* tslint:enable:no-empty */
            };
            /**
             * Ionic's view event: $ionicView.beforeLeave
             *
             * Can be overridden by implementing controllers.
             */
            BaseController.prototype.view_beforeLeave = function () {
                /* tslint:disable:no-empty */
                /* tslint:enable:no-empty */
            };
            /**
             * Ionic's view event: $ionicView.afterEnter
             *
             * Can be overridden by implementing controllers.
             */
            BaseController.prototype.view_afterEnter = function () {
                /* tslint:disable:no-empty */
                /* tslint:enable:no-empty */
            };
            /**
             * Ionic's view event: $ionicView.afterLeave
             *
             * Can be overridden by implementing controllers.
             */
            BaseController.prototype.view_afterLeave = function () {
                /* tslint:disable:no-empty */
                /* tslint:enable:no-empty */
            };
            /**
             * Ionic's view event: $ionicView.unloaded
             *
             * Can be overridden by implementing controllers.
             */
            BaseController.prototype.view_unloaded = function () {
                /* tslint:disable:no-empty */
                /* tslint:enable:no-empty */
            };
            /**
             * Fired when this controller is destroyed. Can be used for clean-up etc.
             *
             * Can be overridden by implementing controllers.
             */
            BaseController.prototype.destroy = function () {
                /* tslint:disable:no-empty */
                /* tslint:enable:no-empty */
            };
            return BaseController;
        })();
        Controllers.BaseController = BaseController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        /**
         * This is the base controller that all other controllers should utilize.
         *
         * It handles saving a reference to the Angular scope, newing up the given
         * model object type, and injecting the view model and controller onto the
         * scope object for use in views.
         *
         * V - The type of the view model that this controller will utilize.
         * D - The type of data object that will be passed in when this dialog is opened.
         * R - The type of the data object that will be returned when this dialog is closed.
         */
        var BaseDialogController = (function (_super) {
            __extends(BaseDialogController, _super);
            function BaseDialogController(scope, ViewModelType, dialogId) {
                _super.call(this, scope, ViewModelType);
                this.dialogId = dialogId;
                this.scope.$on("modal.shown", _.bind(this.modal_shown, this));
                this.scope.$on("modal.hidden", _.bind(this.modal_hidden, this));
            }
            //#region Events
            BaseDialogController.prototype.modal_shown = function (ngEvent, instance) {
                // Only respond to modal.shown events for this dialog.
                if (this.dialogId !== instance.dialogId) {
                    return;
                }
                // Save off a reference to the Ionic modal instance.
                this.modalInstance = instance;
                // Hold a reference to the data object that was passed in when opening the dialog.
                this.data = instance.dialogData;
                // Call the dialog shown event which descendants can override.
                this.dialog_shown();
            };
            BaseDialogController.prototype.modal_hidden = function (eventArgs, instance) {
                // Only respond to modal.hidden events for this dialog.
                if (this.dialogId !== instance.dialogId) {
                    return;
                }
                // Call the dialog hidden event which descendants can override.
                this.dialog_hidden();
            };
            //#endregion
            //#region Protected Methods
            /**
             * Used to get the data object that this was opened with.
             */
            BaseDialogController.prototype.getData = function () {
                return this.data;
            };
            /**
             * Used to close the dialog.
             *
             * @param result The return result value for this dialog.
             */
            BaseDialogController.prototype.close = function (result) {
                this.modalInstance.result = result;
                this.modalInstance.hide();
                this.modalInstance.remove();
            };
            //#endregion
            //#region Override-able Methods
            /**
             * Fired when this dialog is shown.
             *
             * Can be overridden by implementing controllers.
             */
            BaseDialogController.prototype.dialog_shown = function () {
                /* tslint:disable:no-empty */
                /* tslint:enable:no-empty */
            };
            /**
             * Fired when this dialog is hidden.
             *
             * Can be overridden by implementing controllers.
             */
            BaseDialogController.prototype.dialog_hidden = function () {
                /* tslint:disable:no-empty */
                /* tslint:enable:no-empty */
            };
            return BaseDialogController;
        })(Controllers.BaseController);
        Controllers.BaseDialogController = BaseDialogController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Directives;
    (function (Directives) {
        /**
         * This is the base directive that all other directives for elements should utilize.
         *
         * It handles saving references to the various objects in its constructor.
         *
         * T - The parameter type for the scope.
         */
        var BaseElementDirective = (function () {
            function BaseElementDirective(scope, element, attributes, controller, transclude) {
                this.scope = scope;
                this.element = element;
                this.attributes = attributes;
                this.controller = controller;
                this.transclude = transclude;
                this.initialize();
            }
            BaseElementDirective.prototype.initialize = function () {
                throw new Error("Directives that extend BaseElementDirective should implement their own initialize method.");
            };
            BaseElementDirective.prototype.render = function () {
                throw new Error("Directives that extend BaseElementDirective should implement their own render method.");
            };
            /**
             * A flag that can be used to identify element directives that use this
             * class as their base class.
             */
            BaseElementDirective.__BaseElementDirective = true;
            return BaseElementDirective;
        })();
        Directives.BaseElementDirective = BaseElementDirective;
    })(Directives = PraetorApp.Directives || (PraetorApp.Directives = {}));
})(PraetorApp || (PraetorApp = {}));
/**
 * This file exists to control the order in which compiled TypeScript files are concatenated
 * into the resulting appBundle.js file. While all *.ts files could be listed here, we don't
 * need to list them all since the tsc compiler will automatically traverse the directory tree.
 * Here we can list base components that are needed by other components (eg base classes) that
 * must be parsed before the dependent class.
 */
/// <reference path="Controllers/BaseController.ts" />
/// <reference path="Controllers/Dialogs/BaseDialogController.ts" />
/// <reference path="Directives/BaseElementDirective.ts" />
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var CategoryController = (function (_super) {
            __extends(CategoryController, _super);
            function CategoryController($scope, $stateParams) {
                _super.call(this, $scope, PraetorApp.ViewModels.CategoryViewModel);
                this.$stateParams = $stateParams;
            }
            Object.defineProperty(CategoryController, "$inject", {
                get: function () {
                    return ["$scope", "$stateParams"];
                },
                enumerable: true,
                configurable: true
            });
            //#region BaseController Events
            CategoryController.prototype.view_beforeEnter = function () {
                _super.prototype.view_beforeEnter.call(this);
                // Set the category number into the view model using the value as provided
                // in the view route (via the $stateParameters).
                this.viewModel.categoryNumber = this.$stateParams.categoryNumber;
            };
            CategoryController.ID = "CategoryController";
            return CategoryController;
        })(Controllers.BaseController);
        Controllers.CategoryController = CategoryController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var MenuController = (function (_super) {
            __extends(MenuController, _super);
            function MenuController($scope, $location, $http, Utilities, UiHelper, Preferences) {
                _super.call(this, $scope, PraetorApp.ViewModels.MenuViewModel);
                this.$location = $location;
                this.$http = $http;
                this.Utilities = Utilities;
                this.UiHelper = UiHelper;
                this.Preferences = Preferences;
                this.viewModel.categories = this.Utilities.categories;
                $scope.$on("http.unauthorized", _.bind(this.http_unauthorized, this));
                $scope.$on("http.forbidden", _.bind(this.http_forbidden, this));
                $scope.$on("http.notFound", _.bind(this.http_notFound, this));
            }
            Object.defineProperty(MenuController, "$inject", {
                get: function () {
                    return ["$scope", "$location", "$http", PraetorApp.Services.Utilities.ID, PraetorApp.Services.UiHelper.ID, PraetorApp.Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            //#region Event Handlers
            MenuController.prototype.http_unauthorized = function () {
                // Unauthorized should mean that a token wasn't sent, but we'll null these out anyways.
                this.Preferences.userId = null;
                this.Preferences.token = null;
                this.UiHelper.toast.showLongBottom("You do not have a token (401); please login.");
            };
            MenuController.prototype.http_forbidden = function () {
                // A token was sent, but was no longer valid. Null out the invalid token.
                this.Preferences.userId = null;
                this.Preferences.token = null;
                this.UiHelper.toast.showLongBottom("Your token has expired (403); please login again.");
            };
            MenuController.prototype.http_notFound = function () {
                // The restful API services are down maybe?
                this.UiHelper.toast.showLongBottom("Server not available (404); please contact your administrator.");
            };
            //#endregion
            //#region Controller Methods
            MenuController.prototype.reorder_click = function () {
                var _this = this;
                this.UiHelper.showDialog(this.UiHelper.DialogIds.ReorderCategories).then(function () {
                    // After the re-order dialog is closed, re-populate the category
                    // items since they may have been re-ordered.
                    _this.viewModel.categories = _this.Utilities.categories;
                });
            };
            MenuController.ID = "MenuController";
            return MenuController;
        })(Controllers.BaseController);
        Controllers.MenuController = MenuController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var PinEntryController = (function (_super) {
            __extends(PinEntryController, _super);
            function PinEntryController($scope, Utilities, Preferences, UiHelper) {
                _super.call(this, $scope, PraetorApp.ViewModels.PinEntryViewModel, UiHelper.DialogIds.PinEntry);
                this.Utilities = Utilities;
                this.Preferences = Preferences;
                this.UiHelper = UiHelper;
            }
            Object.defineProperty(PinEntryController, "$inject", {
                get: function () {
                    return ["$scope", PraetorApp.Services.Utilities.ID, PraetorApp.Services.Preferences.ID, PraetorApp.Services.UiHelper.ID];
                },
                enumerable: true,
                configurable: true
            });
            //#region BaseDialogController Overrides
            PinEntryController.prototype.dialog_shown = function () {
                _super.prototype.dialog_shown.call(this);
                this.viewModel.pin = "";
                this.viewModel.showBackButton = !!this.getData().showBackButton;
                this.viewModel.promptText = this.getData().promptText;
                this.viewModel.pinToMatch = this.getData().pinToMatch;
            };
            //#endregion
            //#region Private Methods
            PinEntryController.prototype.validatePin = function () {
                if (this.viewModel.pinToMatch) {
                    // If there is a PIN to match, then we'll see if it matches. This is
                    // for the case when we are validating a user entered PIN against one
                    // that is already configured.
                    if (this.viewModel.pin === this.viewModel.pinToMatch) {
                        // If the PIN values match, then close this dialog instance.
                        this.close(new PraetorApp.Models.PinEntryDialogResultModel(true, false, this.viewModel.pin));
                    }
                    else {
                        // If the PIN values do not match, then clear the fields and remain
                        // open so the user can try again.
                        this.viewModel.pin = "";
                        this.UiHelper.toast.showShortTop("Invalid pin; please try again.");
                        this.scope.$apply();
                    }
                }
                else {
                    // If we aren't attempting to match a PIN, then this must be a prompt
                    // for a new PIN value. In this case we can just set the result and
                    // close this modal instance.
                    this.close(new PraetorApp.Models.PinEntryDialogResultModel(null, false, this.viewModel.pin));
                }
            };
            //#endregion
            //#region Controller Methods
            PinEntryController.prototype.number_click = function (value) {
                if (this.viewModel.pin.length < 4) {
                    this.viewModel.pin += value;
                    // If all four digits have been entered then we need to take action.
                    // We wait a fraction of a second so that the user can see the last
                    // digit in the PIN appear in the UI.
                    if (this.viewModel.pin.length === 4) {
                        _.delay(_.bind(this.validatePin, this), 700);
                    }
                }
            };
            PinEntryController.prototype.clear_click = function () {
                this.viewModel.pin = "";
            };
            PinEntryController.prototype.back_click = function () {
                this.close(new PraetorApp.Models.PinEntryDialogResultModel(null, true, null));
            };
            PinEntryController.ID = "PinEntryController";
            return PinEntryController;
        })(Controllers.BaseDialogController);
        Controllers.PinEntryController = PinEntryController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var ReorderCategoriesController = (function (_super) {
            __extends(ReorderCategoriesController, _super);
            function ReorderCategoriesController($scope, Utilities, Preferences, UiHelper) {
                _super.call(this, $scope, PraetorApp.ViewModels.ReorderCategoriesViewModel, UiHelper.DialogIds.ReorderCategories);
                this.Utilities = Utilities;
                this.Preferences = Preferences;
            }
            Object.defineProperty(ReorderCategoriesController, "$inject", {
                get: function () {
                    return ["$scope", PraetorApp.Services.Utilities.ID, PraetorApp.Services.Preferences.ID, PraetorApp.Services.UiHelper.ID];
                },
                enumerable: true,
                configurable: true
            });
            //#region BaseDialogController Overrides
            ReorderCategoriesController.prototype.dialog_shown = function () {
                _super.prototype.dialog_shown.call(this);
                // Grab the available categories.
                this.viewModel.categories = this.Utilities.categories;
            };
            //#endregion
            //#region Controller Methods
            ReorderCategoriesController.prototype.item_reorder = function (item, fromIndex, toIndex) {
                this.viewModel.categories.splice(fromIndex, 1);
                this.viewModel.categories.splice(toIndex, 0, item);
            };
            ReorderCategoriesController.prototype.done_click = function () {
                var categoryOrder = [];
                this.viewModel.categories.forEach(function (categoryItem) {
                    categoryOrder.push(categoryItem.name);
                });
                this.Preferences.categoryOrder = categoryOrder;
                this.close();
            };
            ReorderCategoriesController.ID = "ReorderCategoriesController";
            return ReorderCategoriesController;
        })(Controllers.BaseDialogController);
        Controllers.ReorderCategoriesController = ReorderCategoriesController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var OnboardingRegisterController = (function (_super) {
            __extends(OnboardingRegisterController, _super);
            function OnboardingRegisterController($scope, $location, $ionicViewService, Utilities, UiHelper, Preferences) {
                _super.call(this, $scope, PraetorApp.ViewModels.OnboardingRegisterViewModel);
                this.$location = $location;
                this.$ionicViewService = $ionicViewService;
                this.Utilities = Utilities;
                this.UiHelper = UiHelper;
                this.Preferences = Preferences;
            }
            Object.defineProperty(OnboardingRegisterController, "$inject", {
                get: function () {
                    return ["$scope", "$location", "$ionicViewService", PraetorApp.Services.Utilities.ID, PraetorApp.Services.UiHelper.ID, PraetorApp.Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            //#region BaseController Events
            OnboardingRegisterController.prototype.view_beforeEnter = function () {
                _super.prototype.view_beforeEnter.call(this);
                this.viewModel.showSignIn = false;
            };
            //#endregion
            //#region UI Events
            OnboardingRegisterController.prototype.createAccount_click = function () {
                var _this = this;
                if (!this.viewModel.email) {
                    this.UiHelper.alert("Please enter an e-mail address.");
                    return;
                }
                if (!this.viewModel.password || !this.viewModel.confirmPassword) {
                    this.UiHelper.alert("Please fill in both password fields.");
                    return;
                }
                if (this.viewModel.password !== this.viewModel.confirmPassword) {
                    this.UiHelper.alert("The passwords do not match; please try again.");
                    this.viewModel.password = "";
                    this.viewModel.confirmPassword = "";
                    return;
                }
                this.UiHelper.progressIndicator.showSimpleWithLabel(true, "Creating Account...");
                // Simulate a wait period for an HTTP request.
                // This is where you'd use a service to interact with your API.
                setTimeout(function () {
                    _this.UiHelper.progressIndicator.hide();
                    // Tell Ionic to not animate and clear the history (hide the back button)
                    // for the next view that we'll be navigating to below.
                    _this.$ionicViewService.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    // Navigate the user to the next onboarding view.
                    _this.$location.path("/app/onboarding/share");
                    _this.$location.replace();
                }, 3000);
            };
            OnboardingRegisterController.prototype.signIn_click = function () {
                var _this = this;
                if (!this.viewModel.email) {
                    this.UiHelper.alert("Please enter an e-mail address.");
                    return;
                }
                if (!this.viewModel.password) {
                    this.UiHelper.alert("Please enter a password.");
                    return;
                }
                this.UiHelper.progressIndicator.showSimpleWithLabel(true, "Signing in...");
                // Simulate a wait period for an HTTP request.
                // This is where you'd use a service to interact with your API.
                setTimeout(function () {
                    _this.UiHelper.progressIndicator.hide();
                    // Tell Ionic to not animate and clear the history (hide the back button)
                    // for the next view that we'll be navigating to below.
                    _this.$ionicViewService.nextViewOptions({
                        disableAnimate: true,
                        disableBack: true
                    });
                    // Navigate the user to the next onboarding view.
                    _this.$location.path("/app/onboarding/share");
                    _this.$location.replace();
                }, 3000);
            };
            OnboardingRegisterController.prototype.needToCreateAccount_click = function () {
                this.viewModel.password = "";
                this.viewModel.confirmPassword = "";
                this.viewModel.showSignIn = false;
            };
            OnboardingRegisterController.prototype.alreadyHaveAccount_click = function () {
                this.viewModel.confirmPassword = "";
                this.viewModel.showSignIn = true;
            };
            OnboardingRegisterController.prototype.skip_click = function () {
                // Set the preference value so onboarding doesn't occur again.
                this.Preferences.hasCompletedOnboarding = true;
                // Tell Ionic to not animate and clear the history (hide the back button)
                // for the next view that we'll be navigating to below.
                this.$ionicViewService.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                // Navigate the user to their default view.
                this.$location.path(this.Utilities.defaultCategory.href.substring(1));
                this.$location.replace();
            };
            OnboardingRegisterController.ID = "OnboardingRegisterController";
            return OnboardingRegisterController;
        })(Controllers.BaseController);
        Controllers.OnboardingRegisterController = OnboardingRegisterController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var OnboardingShareController = (function (_super) {
            __extends(OnboardingShareController, _super);
            function OnboardingShareController($scope, $location, $ionicViewService, Utilities, UiHelper, Preferences) {
                _super.call(this, $scope, PraetorApp.ViewModels.EmptyViewModel);
                this.$location = $location;
                this.$ionicViewService = $ionicViewService;
                this.Utilities = Utilities;
                this.UiHelper = UiHelper;
                this.Preferences = Preferences;
            }
            Object.defineProperty(OnboardingShareController, "$inject", {
                get: function () {
                    return ["$scope", "$location", "$ionicViewService", PraetorApp.Services.Utilities.ID, PraetorApp.Services.UiHelper.ID, PraetorApp.Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            //#region UI Events
            OnboardingShareController.prototype.share_click = function (platformName) {
                this.UiHelper.toast.showShortCenter("Share for " + platformName);
            };
            OnboardingShareController.prototype.done_click = function () {
                // Set the preference value so onboarding doesn't occur again.
                this.Preferences.hasCompletedOnboarding = true;
                // Tell Ionic to not animate and clear the history (hide the back button)
                // for the next view that we'll be navigating to below.
                this.$ionicViewService.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                // Navigate the user to their default view.
                this.$location.path(this.Utilities.defaultCategory.href.substring(1));
                this.$location.replace();
            };
            OnboardingShareController.ID = "OnboardingShareController";
            return OnboardingShareController;
        })(Controllers.BaseController);
        Controllers.OnboardingShareController = OnboardingShareController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var OnboardingSplashController = (function (_super) {
            __extends(OnboardingSplashController, _super);
            function OnboardingSplashController($scope, $location, $ionicViewService, Utilities, Preferences) {
                _super.call(this, $scope, PraetorApp.ViewModels.EmptyViewModel);
                this.$location = $location;
                this.$ionicViewService = $ionicViewService;
                this.Utilities = Utilities;
                this.Preferences = Preferences;
            }
            Object.defineProperty(OnboardingSplashController, "$inject", {
                get: function () {
                    return ["$scope", "$location", "$ionicViewService", PraetorApp.Services.Utilities.ID, PraetorApp.Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            //#region UI Events
            OnboardingSplashController.prototype.skip_click = function () {
                // Set the preference value so onboarding doesn't occur again.
                this.Preferences.hasCompletedOnboarding = true;
                // Tell Ionic to not animate and clear the history (hide the back button)
                // for the next view that we'll be navigating to below.
                this.$ionicViewService.nextViewOptions({
                    disableAnimate: true,
                    disableBack: true
                });
                // Navigate the user to their default view.
                this.$location.path(this.Utilities.defaultCategory.href.substring(1));
                this.$location.replace();
            };
            OnboardingSplashController.ID = "OnboardingSplashController";
            return OnboardingSplashController;
        })(Controllers.BaseController);
        Controllers.OnboardingSplashController = OnboardingSplashController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var AboutController = (function (_super) {
            __extends(AboutController, _super);
            function AboutController($scope, $location, Utilities, Preferences, UiHelper, versionInfo) {
                _super.call(this, $scope, PraetorApp.ViewModels.AboutViewModel);
                this.$location = $location;
                this.Utilities = Utilities;
                this.Preferences = Preferences;
                this.UiHelper = UiHelper;
                this.versionInfo = versionInfo;
            }
            Object.defineProperty(AboutController, "$inject", {
                get: function () {
                    return ["$scope", "$location", PraetorApp.Services.Utilities.ID, PraetorApp.Services.Preferences.ID, PraetorApp.Services.UiHelper.ID, "versionInfo"];
                },
                enumerable: true,
                configurable: true
            });
            //#region BaseController Overrides
            AboutController.prototype.view_beforeEnter = function () {
                _super.prototype.view_beforeEnter.call(this);
                this.viewModel.logoClickCount = 0;
                this.viewModel.applicationName = this.versionInfo.applicationName;
                this.viewModel.versionString = this.Utilities.format("{0}.{1}.{2}", this.versionInfo.majorVersion, this.versionInfo.minorVersion, this.versionInfo.buildVersion);
                this.viewModel.timestamp = this.versionInfo.buildTimestamp;
            };
            //#endregion
            //#region Controller Methods
            AboutController.prototype.logo_click = function () {
                if (this.Preferences.enableDeveloperTools) {
                    return;
                }
                this.viewModel.logoClickCount += 1;
                // If they've clicked the logo 10 times, then enable development tools
                // and push them back to the settings page.
                if (this.viewModel.logoClickCount > 9) {
                    this.Preferences.enableDeveloperTools = true;
                    this.UiHelper.toast.showShortBottom("Development Tools Enabled!");
                    this.$location.path("/app/settings");
                }
            };
            AboutController.prototype.copyrightInfo_click = function () {
                window.open(this.versionInfo.copyrightInfoUrl, "_system");
            };
            AboutController.prototype.website_click = function () {
                window.open(this.versionInfo.websiteUrl, "_system");
            };
            AboutController.prototype.gitHubRepo_click = function () {
                window.open(this.versionInfo.githubUrl, "_system");
            };
            AboutController.ID = "AboutController";
            return AboutController;
        })(Controllers.BaseController);
        Controllers.AboutController = AboutController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var CloudSyncController = (function (_super) {
            __extends(CloudSyncController, _super);
            function CloudSyncController($scope, $ionicViewService) {
                _super.call(this, $scope, PraetorApp.ViewModels.CloudSyncViewModel);
                this.$ionicViewService = $ionicViewService;
                // Subscribe to the icon-panel's created event by name ("cloud-icon-panel").
                this.scope.$on("icon-panel.cloud-icon-panel.created", _.bind(this.iconPanel_created, this));
            }
            Object.defineProperty(CloudSyncController, "$inject", {
                get: function () {
                    return ["$scope", "$ionicViewService"];
                },
                enumerable: true,
                configurable: true
            });
            //#region BaseController Overrides
            CloudSyncController.prototype.view_beforeEnter = function () {
                _super.prototype.view_beforeEnter.call(this);
                // Setup the view model.
                this.viewModel.showButton = true;
                this.viewModel.showUserCount = true;
                this.viewModel.icon = "ion-ios-cloud-upload-outline";
                this.viewModel.userCount = 2344;
            };
            CloudSyncController.prototype.view_leave = function () {
                _super.prototype.view_leave.call(this);
                // Stop the toggleIcon function from firing.
                clearInterval(this.updateInterval);
            };
            CloudSyncController.prototype.iconPanel_created = function (event, instance) {
                // Store a reference to the instance of this icon-panel so we can use it later.
                this.cloudIconPanel = instance;
                // Register the toggleIcon function to fire every second to swap the cloud icon.
                this.updateInterval = setInterval(_.bind(this.toggleIcon, this), 1000);
            };
            //#endregion
            //#region Private Methods
            CloudSyncController.prototype.toggleIcon = function () {
                // Simply switch the icon depending on which icon is currently set.
                if (this.cloudIconPanel.getIcon() === "ion-ios-cloud-upload-outline") {
                    this.cloudIconPanel.setIcon("ion-ios-cloud-download-outline");
                }
                else {
                    this.cloudIconPanel.setIcon("ion-ios-cloud-upload-outline");
                }
                // We have to notify Angular that we want an update manually since the
                // setInterval causes this function to be executed outside of an Angular
                // digest cycle.
                this.scope.$apply();
            };
            //#endregion
            //#region Controller Methods
            CloudSyncController.prototype.setup_click = function () {
                // Stop the auto icon swapping.
                clearInterval(this.updateInterval);
                // Change the text on the icon panel using the instance directly.
                this.cloudIconPanel.setText("Unable to contact the cloud!");
                // Can change the icon via a setIcon call on the directive instance
                // or by changing the view model property that it is bound to.
                //this.iconPanel.setIcon("ion-ios-rainy"); // Change via directly the instance.
                this.viewModel.icon = "ion-ios-rainy"; // Change via view model binding.
                // Hide the button and user count text.
                this.viewModel.showButton = false;
                this.viewModel.showUserCount = false;
            };
            CloudSyncController.ID = "CloudSyncController";
            return CloudSyncController;
        })(Controllers.BaseController);
        Controllers.CloudSyncController = CloudSyncController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var ConfigurePinController = (function (_super) {
            __extends(ConfigurePinController, _super);
            function ConfigurePinController($scope, UiHelper, Preferences) {
                _super.call(this, $scope, PraetorApp.ViewModels.ConfigurePinViewModel);
                this.UiHelper = UiHelper;
                this.Preferences = Preferences;
            }
            Object.defineProperty(ConfigurePinController, "$inject", {
                get: function () {
                    return ["$scope", PraetorApp.Services.UiHelper.ID, PraetorApp.Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            //#region BaseController Overrides
            ConfigurePinController.prototype.view_beforeEnter = function () {
                _super.prototype.view_beforeEnter.call(this);
                this.viewModel.isPinSet = this.Preferences.pin !== null;
            };
            //#endregion
            //#region Controller Methods
            ConfigurePinController.prototype.setPin_click = function () {
                var _this = this;
                var options, model;
                model = new PraetorApp.Models.PinEntryDialogModel("Enter a value for your new PIN", null, true);
                options = new PraetorApp.Models.DialogOptions(model);
                // Show the PIN entry dialog.
                this.UiHelper.showDialog(this.UiHelper.DialogIds.PinEntry, options).then(function (result1) {
                    // If there was a PIN returned, they didn't cancel.
                    if (result1.pin) {
                        // Show a second prompt to make sure they enter the same PIN twice.
                        // We pass in the first PIN value because we want them to be able to match it.
                        model.promptText = "Confirm your new PIN";
                        model.pinToMatch = result1.pin;
                        options.dialogData = model;
                        _this.UiHelper.showDialog(_this.UiHelper.DialogIds.PinEntry, options).then(function (result2) {
                            // If the second PIN entered matched the first one, then use it.
                            if (result2.matches) {
                                _this.Preferences.pin = result2.pin;
                                _this.viewModel.isPinSet = true;
                                _this.UiHelper.toast.showShortBottom("Your PIN has been configured.");
                            }
                        });
                    }
                });
            };
            ConfigurePinController.prototype.changePin_click = function () {
                var _this = this;
                var options, model;
                model = new PraetorApp.Models.PinEntryDialogModel("Enter your current PIN", this.Preferences.pin, true);
                options = new PraetorApp.Models.DialogOptions(model);
                // Show the PIN entry dialog; pass the existing PIN which they need to match.
                this.UiHelper.showDialog(this.UiHelper.DialogIds.PinEntry, options).then(function (result1) {
                    // If the PIN matched, then we can continue.
                    if (result1.matches) {
                        // Prompt for a new PIN.
                        model.promptText = "Enter your new PIN";
                        model.pinToMatch = null;
                        options.dialogData = model;
                        _this.UiHelper.showDialog(_this.UiHelper.DialogIds.PinEntry, options).then(function (result2) {
                            // Show a second prompt to make sure they enter the same PIN twice.
                            // We pass in the first PIN value because we want them to be able to match it.
                            model.promptText = "Confirm your new PIN";
                            model.pinToMatch = result2.pin;
                            options.dialogData = model;
                            _this.UiHelper.showDialog(_this.UiHelper.DialogIds.PinEntry, options).then(function (result3) {
                                // If the second new PIN entered matched the new first one, then use it.
                                if (result3.matches) {
                                    _this.Preferences.pin = result3.pin;
                                    _this.viewModel.isPinSet = true;
                                    _this.UiHelper.toast.showShortBottom("Your PIN has been configured.");
                                }
                            });
                        });
                    }
                });
            };
            ConfigurePinController.prototype.removePin_click = function () {
                var _this = this;
                var options, model;
                model = new PraetorApp.Models.PinEntryDialogModel("Enter your current PIN", this.Preferences.pin, true);
                options = new PraetorApp.Models.DialogOptions(model);
                // Show the PIN entry dialog; pass the existing PIN which they need to match.
                this.UiHelper.showDialog(this.UiHelper.DialogIds.PinEntry, options).then(function (result) {
                    // If the PIN entered matched, then we can remove it.
                    if (result.matches) {
                        _this.Preferences.pin = null;
                        _this.viewModel.isPinSet = false;
                        _this.UiHelper.toast.showShortBottom("The PIN has been removed.");
                    }
                });
            };
            ConfigurePinController.ID = "ConfigurePinController";
            return ConfigurePinController;
        })(Controllers.BaseController);
        Controllers.ConfigurePinController = ConfigurePinController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var SettingsListController = (function (_super) {
            __extends(SettingsListController, _super);
            function SettingsListController($scope, Utilities, Preferences) {
                _super.call(this, $scope, PraetorApp.ViewModels.SettingsListViewModel);
                this.Utilities = Utilities;
                this.Preferences = Preferences;
            }
            Object.defineProperty(SettingsListController, "$inject", {
                get: function () {
                    return ["$scope", PraetorApp.Services.Utilities.ID, PraetorApp.Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            //#region BaseController Overrides
            SettingsListController.prototype.view_beforeEnter = function () {
                _super.prototype.view_beforeEnter.call(this);
                this.viewModel.isDebugMode = this.Utilities.isDebugMode;
                this.viewModel.isDeveloperMode = this.Preferences.enableDeveloperTools;
            };
            SettingsListController.ID = "SettingsListController";
            return SettingsListController;
        })(Controllers.BaseController);
        Controllers.SettingsListController = SettingsListController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Directives;
    (function (Directives) {
        //#endregion
        /**
         * A simple element for showing a large icon centered, with optional text below it.
         */
        var IconPanelDirective = (function (_super) {
            __extends(IconPanelDirective, _super);
            function IconPanelDirective() {
                _super.apply(this, arguments);
            }
            IconPanelDirective.prototype.initialize = function () {
                var _this = this;
                // Grab a reference to the root div element.
                this._rootElement = this.element[0];
                // Watch for the changing of the value attributes.
                this.scope.$watch(function () { return _this.scope.icon; }, _.bind(this.icon_listener, this));
                this.scope.$watch(function () { return _this.scope.iconSize; }, _.bind(this.iconSize_listener, this));
                this.scope.$watch(function () { return _this.scope.text; }, _.bind(this.text_listener, this));
                // Fire a created event sending along this directive instance.
                // Parent scopes can listen for this so they can obtain a reference
                // to the instance so they can call getters/setters etc.
                if (this.scope.name) {
                    this.scope.$emit("icon-panel." + this.scope.name + ".created", this);
                }
                else {
                    this.scope.$emit("icon-panel.created", this);
                }
            };
            /**
             * Used to render the icon panel.
             */
            IconPanelDirective.prototype.render = function () {
                this._root = angular.element(this._rootElement);
                this._root.addClass("icon-panel");
                this._iconContainer = angular.element("<p></p>");
                this._iconContainer.addClass("icon-container");
                this._root.append(this._iconContainer);
                this._iconElement = angular.element("<i></i>");
                this._iconElement.addClass("icon");
                this._iconContainer.append(this._iconElement);
                this._textContainer = angular.element("<p></p>");
                this._root.append(this._textContainer);
            };
            /**
             * Returns the name of this instance.
             */
            IconPanelDirective.prototype.getName = function () {
                return this.scope.name;
            };
            /**
             * Returns the icon for this instance.
             */
            IconPanelDirective.prototype.getIcon = function () {
                return this._currentIcon;
            };
            /**
             * Sets the icon class for this instance.
             *
             * This should be one of the Ionic icon class names (eg ion-ios-bell-outline).
             */
            IconPanelDirective.prototype.setIcon = function (icon) {
                if (this._currentIcon) {
                    this._iconElement.removeClass(this._currentIcon);
                }
                this._currentIcon = icon;
                this._iconElement.addClass(icon);
            };
            /**
             * Returns the font size in points used for the icon.
             */
            IconPanelDirective.prototype.getIconSize = function () {
                return parseInt(this.scope.iconSize, 10);
            };
            /**
             * Sets the font size in points used for the icon.
             */
            IconPanelDirective.prototype.setIconSize = function (size) {
                this.scope.iconSize = (size ? size + "" : "0");
                this._iconElement.css("font-size", this.scope.iconSize + "pt");
            };
            /**
             * Returns the display text for this instance.
             */
            IconPanelDirective.prototype.getText = function () {
                return this.scope.text;
            };
            /**
             * Sets the display text for this instance.
             */
            IconPanelDirective.prototype.setText = function (text) {
                this._textContainer.text(text);
            };
            //#region Listeners
            IconPanelDirective.prototype.icon_listener = function (newValue, oldValue, scope) {
                this._currentIcon = newValue;
                if (this._iconElement != null) {
                    this._iconElement.removeClass(oldValue);
                    this._iconElement.addClass(newValue);
                }
            };
            IconPanelDirective.prototype.iconSize_listener = function (newValue, oldValue, scope) {
                if (this._iconElement != null) {
                    this._iconElement.css("font-size", newValue + "pt");
                }
            };
            IconPanelDirective.prototype.text_listener = function (newValue, oldValue, scope) {
                if (this._textContainer != null) {
                    this._textContainer.text(newValue);
                }
            };
            IconPanelDirective.ID = "iconPanel";
            //#region Angular Directive Options
            IconPanelDirective.restrict = "E";
            IconPanelDirective.template = "<div></div>";
            IconPanelDirective.replace = true;
            IconPanelDirective.scope = {
                name: "@",
                icon: "@",
                iconSize: "@",
                text: "@"
            };
            return IconPanelDirective;
        })(Directives.BaseElementDirective);
        Directives.IconPanelDirective = IconPanelDirective;
    })(Directives = PraetorApp.Directives || (PraetorApp.Directives = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Directives;
    (function (Directives) {
        /**
         * A directive for handling an element's onload event (eg an image tag).
         *
         * http://stackoverflow.com/questions/11868393/angularjs-inputtext-ngchange-fires-while-the-value-is-changing
         */
        var OnLoadDirective = (function () {
            function OnLoadDirective($parse) {
                this.restrict = "A";
                this.$parse = $parse;
                // Ensure that the link function is bound to this instance so we can
                // access instance variables like $parse. AngularJs normally executes
                // the link function in the context of the global scope.
                this.link = _.bind(this.link, this);
            }
            Object.defineProperty(OnLoadDirective, "$inject", {
                get: function () {
                    return ["$parse"];
                },
                enumerable: true,
                configurable: true
            });
            OnLoadDirective.prototype.link = function (scope, element, attributes, controller, transclude) {
                // Parse the value of the on-load property; this will be a function
                // that the user has set on the element for example: <img on-load="load()"/>
                /* tslint:disable:no-string-literal */
                var fn = this.$parse(attributes["onLoad"]);
                /* tslint:enable:no-string-literal */
                // Subscribe to the load event of the image element.
                element.on("load", function (event) {
                    // When the load event occurs, execute the user defined load function.
                    scope.$apply(function () {
                        fn(scope, { $event: event });
                    });
                });
            };
            OnLoadDirective.ID = "onLoad";
            return OnLoadDirective;
        })();
        Directives.OnLoadDirective = OnLoadDirective;
    })(Directives = PraetorApp.Directives || (PraetorApp.Directives = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Filters;
    (function (Filters) {
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
        var ThousandsFilter = (function () {
            function ThousandsFilter() {
            }
            ThousandsFilter.filter = function (input) {
                if (input == null) {
                    return "";
                }
                if (input > 9999) {
                    if (input % 10 === 0) {
                        return (input / 1000) + "K";
                    }
                    else {
                        return (input / 1000).toFixed(0) + "K";
                    }
                }
                else if (input > 999) {
                    if (input % 10 === 0) {
                        return (input / 1000) + "K";
                    }
                    else {
                        return (input / 1000).toFixed(1) + "K";
                    }
                }
                else {
                    return input + "";
                }
            };
            ThousandsFilter.ID = "Thousands";
            return ThousandsFilter;
        })();
        Filters.ThousandsFilter = ThousandsFilter;
    })(Filters = PraetorApp.Filters || (PraetorApp.Filters = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Models;
    (function (Models) {
        /**
         * A simple class that can be used to define a key/value pair of objects.
         */
        var KeyValuePair = (function () {
            function KeyValuePair(key, value) {
                this.key = key;
                this.value = value;
            }
            return KeyValuePair;
        })();
        Models.KeyValuePair = KeyValuePair;
    })(Models = PraetorApp.Models || (PraetorApp.Models = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Models;
    (function (Models) {
        /**
         * Used to specify options for a dialog.
         * For use with UiHelper.openDialog().
         */
        var DialogOptions = (function () {
            function DialogOptions(dialogData) {
                this.dialogData = dialogData;
                this.backdropClickToClose = true;
                this.hardwareBackButtonClose = true;
                this.showBackground = true;
            }
            return DialogOptions;
        })();
        Models.DialogOptions = DialogOptions;
    })(Models = PraetorApp.Models || (PraetorApp.Models = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Models;
    (function (Models) {
        var PinEntryDialogModel = (function () {
            function PinEntryDialogModel(promptText, pinToMatch, showBackButton) {
                this.promptText = promptText;
                this.pinToMatch = pinToMatch;
                this.showBackButton = showBackButton;
            }
            return PinEntryDialogModel;
        })();
        Models.PinEntryDialogModel = PinEntryDialogModel;
    })(Models = PraetorApp.Models || (PraetorApp.Models = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Models;
    (function (Models) {
        var PinEntryDialogResultModel = (function () {
            function PinEntryDialogResultModel(matches, cancelled, pin) {
                this.matches = matches;
                this.cancelled = cancelled;
                this.pin = pin;
            }
            return PinEntryDialogResultModel;
        })();
        Models.PinEntryDialogResultModel = PinEntryDialogResultModel;
    })(Models = PraetorApp.Models || (PraetorApp.Models = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Models;
    (function (Models) {
        var LogEntry = (function () {
            function LogEntry() {
            }
            return LogEntry;
        })();
        Models.LogEntry = LogEntry;
    })(Models = PraetorApp.Models || (PraetorApp.Models = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Services;
    (function (Services) {
        var FileUtilities = (function () {
            function FileUtilities($q, Utilities) {
                this.$q = $q;
                this.Utilities = Utilities;
            }
            Object.defineProperty(FileUtilities, "$inject", {
                get: function () {
                    return ["$q", Services.Utilities.ID];
                },
                enumerable: true,
                configurable: true
            });
            FileUtilities.prototype.openFile = function (path) {
                var q = this.$q.defer();
                window.handleDocumentWithURL(function () { console.log('success'); q.resolve(true); }, function (error) {
                    console.log('failure');
                    if (error == 53) {
                        console.log('No app that handles this file type.');
                    }
                    q.resolve(true);
                }, 'http://www.example.com/path/to/document.pdf');
                return q.promise;
            };
            FileUtilities.ID = "FileUtilities";
            return FileUtilities;
        })();
        Services.FileUtilities = FileUtilities;
    })(Services = PraetorApp.Services || (PraetorApp.Services = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Services;
    (function (Services) {
        var HashUtilities = (function () {
            function HashUtilities($q, Utilities) {
                this.$q = $q;
                this.Utilities = Utilities;
            }
            Object.defineProperty(HashUtilities, "$inject", {
                get: function () {
                    return ["$q", Services.Utilities.ID];
                },
                enumerable: true,
                configurable: true
            });
            HashUtilities.prototype.md5 = function (data) {
                return window.hex_md5(data);
            };
            HashUtilities.ID = "HashUtilities";
            return HashUtilities;
        })();
        Services.HashUtilities = HashUtilities;
    })(Services = PraetorApp.Services || (PraetorApp.Services = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Services;
    (function (Services) {
        /**
         * This is a custom interceptor for Angular's $httpProvider.
         *
         * It allows us to inject the token into the header, log request and responses,
         * and handle the showing and hiding of the user blocking UI elements, progress
         * bar and spinner.
         *
         * Note: The $injector service is used to obtain most of the other services that
         * this service depends on so we can avoid circular dependency references on startup.
         */
        var HttpInterceptor = (function () {
            function HttpInterceptor($rootScope, $injector, $q, apiVersion) {
                this.$rootScope = $rootScope;
                this.$injector = $injector;
                this.$q = $q;
                this.apiVersion = apiVersion;
                this.requestsInProgress = 0;
                this.blockingRequestsInProgress = 0;
                this.spinnerRequestsInProgress = 0;
            }
            Object.defineProperty(HttpInterceptor.prototype, "Utilities", {
                get: function () {
                    return this.$injector.get(Services.Utilities.ID);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(HttpInterceptor.prototype, "UiHelper", {
                get: function () {
                    return this.$injector.get(Services.UiHelper.ID);
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(HttpInterceptor.prototype, "Preferences", {
                get: function () {
                    return this.$injector.get(Services.Preferences.ID);
                },
                enumerable: true,
                configurable: true
            });
            /**
             * This function can be used to return a factory function that Angular can consume
             * when defining an Angular factory. It is basically a wrapper for the HttpInterceptor
             * service so we can do dependency injection and have everything called in the correct
             * context at runtime.
             *
             * @returns A factory that can be used like this: ngModule.factory(HttpInterceptor.getFactory());
             */
            HttpInterceptor.getFactory = function () {
                var factory;
                // Angular expects the factory function to return the object that is used
                // for the factory when it is injected into other objects.
                factory = function ($rootScope, $injector, $q, Preferences, Utilities, UiHelper, apiVersion) {
                    // Create an instance our strongly-typed service.
                    var instance = new HttpInterceptor($rootScope, $injector, $q, apiVersion);
                    // Return an object that exposes the functions that we want to be exposed.
                    // We use bind here so that the correct context is used (Angular normally
                    // would just use the context of the window when invoking the functions).
                    return {
                        request: _.bind(instance.request, instance),
                        response: _.bind(instance.response, instance),
                        requestError: _.bind(instance.requestError, instance),
                        responseError: _.bind(instance.responseError, instance)
                    };
                };
                // Annotate the factory function with the things that should be injected.
                factory.$inject = ["$rootScope", "$injector", "$q", "apiVersion"];
                return factory;
            };
            //#region HttpInterceptor specific methods
            /**
             * Fired when an HTTP request is being made. This is where the configuration
             * object (eg URL, HTTP headers, etc) can be modified before the request goes
             * out.
             */
            HttpInterceptor.prototype.request = function (config) {
                var baseUrl;
                // Do nothing for Angular's template requests.
                if (this.Utilities.endsWith(config.url, ".html")) {
                    return config;
                }
                console.log("HttpInterceptor.request: " + config.url, [config]);
                // Keep track of how many requests are in progress and show spinners etc.
                this.handleRequestStart(config);
                // If the URL starts with a tilde, we know this is a URL for one of our own restful API
                // endpoints. In this case, we'll add our required headers, authorization token, and the
                // base URL for the current data source.
                if (this.Utilities.startsWith(config.url, "~")) {
                    /* tslint:disable:no-string-literal */
                    // Specify the version of the API we can consume.
                    config.headers["X-API-Version"] = this.apiVersion;
                    // Specify the content type we are sending and the payload type that we want to receive.
                    config.headers["Content-Type"] = "application/json";
                    config.headers["Accept"] = "application/json";
                    // If we currently have a user ID and token, then include it in the authorization header.
                    if (this.Preferences.userId && this.Preferences.token) {
                        config.headers["Authorization"] = this.getAuthorizationHeader(this.Preferences.userId, this.Preferences.token);
                    }
                    /* tslint:enable:no-string-literal */
                    if (this.Preferences.apiUrl && this.Preferences.apiUrl) {
                        // Grab the base data source URL.
                        baseUrl = this.Preferences.apiUrl;
                        // Remove the leading tilde character.
                        config.url = config.url.substring(1);
                        // If the root path ends with a forward slash and the path
                        // starts with a forward slash, we don't need two slashes in
                        // a row, so remove the leading slash from the path.
                        if (this.Utilities.endsWith(baseUrl, "/") && this.Utilities.startsWith(config.url, "/")) {
                            config.url = config.url.substr(1, config.url.length - 1);
                        }
                        // If the root path doesn't end with a forward slash AND the path
                        // doesn't end with a forward slash, we need to make sure there is
                        // a forward slash in-between the two before we concatenate them.
                        if (!this.Utilities.endsWith(baseUrl, "/") && !this.Utilities.startsWith(config.url, "/")) {
                            config.url = "/" + config.url;
                        }
                        // Prepend the base data source URL.
                        config.url = baseUrl + config.url;
                    }
                    else {
                        throw new Error("An HTTP call cannot be made because a data source was not selected.");
                    }
                }
                return config;
            };
            /**
             * Fired when an HTTP request completes with a status code in the 200 range.
             */
            HttpInterceptor.prototype.response = function (httpResponse) {
                var config;
                // Cast to our custom type which includes some extra flags.
                config = httpResponse.config;
                // Do nothing for Angular's template requests.
                if (this.Utilities.endsWith(config.url, ".html")) {
                    return httpResponse;
                }
                console.log("HttpInterceptor.response: " + httpResponse.config.url, [httpResponse]);
                // Keep track of how many requests are still in progress and hide spinners etc.
                this.handleResponseEnd(config);
                return httpResponse;
            };
            /**
             * Fired when there is an unhandled exception (eg JavaScript error) in the HttpInterceptor.request
             * OR when there are problems with the request going out.
             */
            HttpInterceptor.prototype.requestError = function (rejection) {
                var httpResponse, exception, config;
                console.error("HttpInterceptor.requestError", [rejection]);
                if (rejection instanceof Error) {
                    // Occurs for any uncaught exceptions that occur in other interceptors.
                    exception = rejection;
                    this.handleFatalError();
                }
                else {
                    // Occurs if any other interceptors reject the request.
                    httpResponse = rejection;
                    // Cast to our custom type which includes some extra flags.
                    config = httpResponse.config;
                    // Keep track of how many requests are still in progress and hide spinners etc.
                    if (config) {
                        this.handleResponseEnd(config);
                    }
                }
                return this.$q.reject(rejection);
            };
            /**
             * Fired when a response completes with a non-200 level status code.
             *
             * Additionally, this can fire when there are uncaught exceptions (eg JavaScript errors)
             * in the HttpInterceptfor response method.
             */
            HttpInterceptor.prototype.responseError = function (responseOrError) {
                var httpResponse, exception, config;
                console.log("HttpInterceptor.responseError", [httpResponse]);
                if (responseOrError instanceof Error) {
                    exception = responseOrError;
                    this.handleFatalError();
                }
                else {
                    httpResponse = responseOrError;
                    // Cast to our custom type which includes some extra flags.
                    config = httpResponse.config;
                    // Do nothing for Angular's template requests.
                    if (this.Utilities.endsWith(config.url, ".html")) {
                        return this.$q.reject(responseOrError);
                    }
                    // Always log error responses.
                    // Keep track of how many requests are still in progress and hide spinners etc.
                    this.handleResponseEnd(config);
                    // For certain response codes, we'll broadcast an event to the rest of the app
                    // so that it can handle the event in whatever way is appropriate.
                    if (httpResponse.status === 401) {
                        this.$rootScope.$broadcast("http.unauthorized");
                    }
                    else if (httpResponse.status === 403) {
                        this.$rootScope.$broadcast("http.forbidden");
                    }
                    else if (httpResponse.status === 404) {
                        this.$rootScope.$broadcast("http.notFound");
                    }
                }
                return this.$q.reject(responseOrError);
            };
            //#endregion
            //#region Private Helpers
            /**
             * Handles keeping track of the number of requests that are currently in progress as well
             * as shows any UI blocking or animated spinners.
             */
            HttpInterceptor.prototype.handleRequestStart = function (config) {
                // Default the blocking flag if it isn't present.
                if (typeof (config.blocking) === "undefined") {
                    config.blocking = true;
                }
                // Default the show spinner flag if it isn't present.
                if (typeof (config.showSpinner) === "undefined") {
                    config.showSpinner = true;
                }
                // Increment the total number of HTTP requests that are in progress.
                this.requestsInProgress += 1;
                // If this request should block the UI, then we have extra work to do.
                if (config.blocking) {
                    // Increment the total number of HTTP requests that are in progress that
                    // are also currently blocking the UI.
                    this.blockingRequestsInProgress += 1;
                    // If this wasn't the first blocking HTTP request, we need to hide the previous
                    // blocking progress indicator before we show the new one.
                    if (this.blockingRequestsInProgress > 1) {
                        this.UiHelper.progressIndicator.hide();
                    }
                    // Show the blocking progress indicator with or without text.
                    if (config.blockingText) {
                        this.UiHelper.progressIndicator.showSimpleWithLabel(true, config.blockingText);
                    }
                    else {
                        this.UiHelper.progressIndicator.showSimple(true);
                    }
                }
                // If this request should show the spinner, then we have extra work to do.
                if (config.showSpinner) {
                    // Increment the total number of HTTP requests that are in progress that
                    // are also currently showing the spinner.
                    this.spinnerRequestsInProgress += 1;
                    // If the spinner isn't already visible, then show it.
                    if (!NProgress.isStarted()) {
                        NProgress.start();
                    }
                }
            };
            /**
             * This method should be called when there is a fatal error during one of our interceptor
             * methods. It ensures that all of the progress bars and overlays are removed from the
             * screen so we don't block the user.
             */
            HttpInterceptor.prototype.handleFatalError = function () {
                this.requestsInProgress = 0;
                this.blockingRequestsInProgress = 0;
                this.spinnerRequestsInProgress = 0;
                NProgress.done();
                this.UiHelper.progressIndicator.hide();
            };
            /**
             * Handles keeping track of the number of requests that are currently in progress as well
             * as hides any UI blocking or animated spinners.
             */
            HttpInterceptor.prototype.handleResponseEnd = function (config) {
                // Decrement the total number of HTTP requests that are in progress.
                this.requestsInProgress -= 1;
                // If this was a blocking request, also decrement the blocking counter.
                if (config.blocking) {
                    this.blockingRequestsInProgress -= 1;
                }
                // If this was a spinner request, also decrement the spinner counter.
                if (config.showSpinner) {
                    this.spinnerRequestsInProgress -= 1;
                }
                // If there are no more blocking requests in progress, then hide the blocker.
                if (config.blocking && this.blockingRequestsInProgress === 0) {
                    this.UiHelper.progressIndicator.hide();
                }
                if (config.showSpinner && this.spinnerRequestsInProgress === 0) {
                    // If there are no more spinner requests in progress, then hide the spinner.
                    NProgress.done();
                }
                else {
                    // If there are still spinner requests in progress, then kick up the progress
                    // bar a little bit to show some of the work has completed.
                    NProgress.inc();
                }
            };
            /**
             * Used to create a header value for use with the basic Authorization HTTP header using
             * the given user name and password value.
             *
             * http://en.wikipedia.org/wiki/Basic_access_authentication
             *
             * @param The user name to use.
             * @param The password to use.
             * @returns A value to use for the HTTP Authorization header.
             */
            HttpInterceptor.prototype.getAuthorizationHeader = function (userName, password) {
                var headerValue;
                // Concatenate the user name and password with a colon.
                headerValue = this.Utilities.format("{0}:{1}", userName, password);
                // Base64 encode the user name and password and prepend "Basic".
                return "Basic " + btoa(headerValue);
            };
            HttpInterceptor.ID = "HttpInterceptor";
            return HttpInterceptor;
        })();
        Services.HttpInterceptor = HttpInterceptor;
    })(Services = PraetorApp.Services || (PraetorApp.Services = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Services;
    (function (Services) {
        /**
         * Provides mock responses for HTTP requests.
         *
         * This can be useful for unit testing or demoing or developing applications
         * without a live internet connection or access to the HTTP APIs.
         */
        var MockHttpApis = (function () {
            function MockHttpApis($httpBackend) {
                this.$httpBackend = $httpBackend;
            }
            Object.defineProperty(MockHttpApis, "$inject", {
                get: function () {
                    return ["$httpBackend"];
                },
                enumerable: true,
                configurable: true
            });
            //#region Public API
            /**
             * Used to setup a random delay time for mock HTTP requests.
             *
             * @param $provide The provider service which will be used to obtain and decorate the httpBackend service.
             */
            MockHttpApis.setupMockHttpDelay = function ($provide) {
                var maxDelay = 3000, minDelay = 1000;
                // Example taken from the following blog post:
                // http://endlessindirection.wordpress.com/2013/05/18/angularjs-delay-response-from-httpbackend/
                $provide.decorator("$httpBackend", function ($delegate) {
                    var proxy = function (method, url, data, callback, headers) {
                        var interceptor = function () {
                            var _this = this, _arguments = arguments, delay;
                            if (url.indexOf(".html") > -1) {
                                // Don't apply a delay for templates.
                                callback.apply(_this, _arguments);
                            }
                            else {
                                // http://jsfiddle.net/alanwsmith/GfAhy/
                                delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
                                setTimeout(function () {
                                    callback.apply(_this, _arguments);
                                }, delay);
                            }
                        };
                        return $delegate.call(this, method, url, data, interceptor, headers);
                    };
                    /* tslint:disable:forin */
                    for (var key in $delegate) {
                        proxy[key] = $delegate[key];
                    }
                    /* tslint:enable:forin */
                    return proxy;
                });
            };
            /**
             * Used to mock the responses for the $http service. Useful when debugging
             * or demo scenarios when a backend is not available.
             *
             * This can only be called once per page (ie on page load). Subsequent calls
             * will not remove existing mock rules.
             *
             * @param mock True to mock API calls, false to let them pass through normally.
             */
            MockHttpApis.prototype.mockHttpCalls = function (mock) {
                // Always allow all requests for templates to go through.
                this.$httpBackend.whenGET(/.*\.html/).passThrough();
                if (mock) {
                }
                else {
                    // Allow ALL HTTP requests to go through.
                    this.$httpBackend.whenDELETE(/.*/).passThrough();
                    this.$httpBackend.whenGET(/.*/).passThrough();
                    //this.$httpBackend.whenHEAD(/.*/).passThrough(); //TODO The ts.d includes whenHEAD but this version of Angular doesn't?
                    this.$httpBackend.whenJSONP(/.*/).passThrough();
                    this.$httpBackend.whenPATCH(/.*/).passThrough();
                    this.$httpBackend.whenPOST(/.*/).passThrough();
                    this.$httpBackend.whenPUT(/.*/).passThrough();
                }
            };
            MockHttpApis.ID = "MockHttpApis";
            return MockHttpApis;
        })();
        Services.MockHttpApis = MockHttpApis;
    })(Services = PraetorApp.Services || (PraetorApp.Services = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Services;
    (function (Services) {
        /**
         * Provides mock implementation APIs that may not be available on all platforms.
         */
        var MockPlatformApis = (function () {
            function MockPlatformApis($q, $ionicPopup, $ionicLoading, Utilities) {
                this.$q = $q;
                this.Utilities = Utilities;
                this.$ionicPopup = $ionicPopup;
                this.$ionicLoading = $ionicLoading;
                this.isProgressIndicatorShown = false;
            }
            Object.defineProperty(MockPlatformApis, "$inject", {
                get: function () {
                    return ["$q", "$ionicPopup", "$ionicLoading", Services.Utilities.ID];
                },
                enumerable: true,
                configurable: true
            });
            //#region Public API
            MockPlatformApis.prototype.getToastPlugin = function () {
                return {
                    show: _.bind(this.toast, this),
                    showLongBottom: _.bind(this.toast, this),
                    showLongCenter: _.bind(this.toast, this),
                    showLongTop: _.bind(this.toast, this),
                    showShortBottom: _.bind(this.toast, this),
                    showShortCenter: _.bind(this.toast, this),
                    showShortTop: _.bind(this.toast, this)
                };
            };
            MockPlatformApis.prototype.getPushNotificationPlugin = function () {
                return {
                    register: _.bind(this.pushNotification_register, this),
                    unregister: _.bind(this.pushNotification_unregister, this),
                    setApplicationIconBadgeNumber: _.bind(this.pushNotification_setApplicationIconBadgeNumber, this)
                };
            };
            MockPlatformApis.prototype.getClipboardPlugin = function () {
                return {
                    copy: _.bind(this.clipboard_copy, this),
                    paste: _.bind(this.clipboard_paste, this)
                };
            };
            MockPlatformApis.prototype.getClipboardPluginForChromeExtension = function () {
                return {
                    copy: _.bind(this.clipboard_chromeExtension_copy, this),
                    paste: _.bind(this.clipboard_chromeExtension_paste, this)
                };
            };
            MockPlatformApis.prototype.getNotificationPlugin = function () {
                return {
                    alert: _.bind(this.notification_alert, this),
                    confirm: _.bind(this.notification_confirm, this),
                    prompt: _.bind(this.notification_prompt, this),
                    beep: _.bind(this.notification_beep, this),
                    vibrate: _.bind(this.notification_vibrate, this),
                    vibrateWithPattern: _.bind(this.notification_vibrateWithPattern, this),
                    cancelVibration: _.bind(this.notification_cancelVibration, this)
                };
            };
            MockPlatformApis.prototype.getProgressIndicatorPlugin = function () {
                return {
                    hide: _.bind(this.progressIndicator_hide, this),
                    showSimple: _.bind(this.progressIndicator_show, this),
                    showSimpleWithLabel: _.bind(this.progressIndicator_show, this),
                    showSimpleWithLabelDetail: _.bind(this.progressIndicator_show, this),
                    showDeterminate: _.bind(this.progressIndicator_show, this),
                    showDeterminateWithLabel: _.bind(this.progressIndicator_show, this),
                    showAnnular: _.bind(this.progressIndicator_show, this),
                    showAnnularWithLabel: _.bind(this.progressIndicator_show, this),
                    showBar: _.bind(this.progressIndicator_show, this),
                    showBarWithLabel: _.bind(this.progressIndicator_show, this),
                    showSuccess: _.bind(this.progressIndicator_show, this),
                    showText: _.bind(this.progressIndicator_show, this)
                };
            };
            //#endregion
            //#region Toast
            MockPlatformApis.prototype.toast = function (message) {
                var div, existingToasts;
                existingToasts = document.querySelectorAll(".mockToast").length;
                div = document.createElement("div");
                div.className = "mockToast";
                div.style.position = "absolute";
                div.style.bottom = (existingToasts === 0 ? 0 : (35 * existingToasts)) + "px";
                div.style.width = "100%";
                div.style.backgroundColor = "#444444";
                div.style.opacity = "0.8";
                div.style.textAlign = "center";
                div.style.color = "#fff";
                div.style.padding = "10px";
                div.style.zIndex = "9000";
                div.innerText = message;
                document.body.appendChild(div);
                setTimeout(function () {
                    document.body.removeChild(div);
                }, 3000);
            };
            //#endregion
            //#region Push Notifications
            MockPlatformApis.prototype.pushNotification_register = function (successCallback, errorCallback, registrationOptions) {
                console.warn("window.pushNotification.register()", registrationOptions);
                setTimeout(function () {
                    errorCallback(new Error("Not implemented in MockPlatformApis.ts"));
                }, 0);
            };
            MockPlatformApis.prototype.pushNotification_unregister = function (successCallback, errorCallback) {
                console.warn("window.pushNotification.unregister()");
                setTimeout(function () {
                    errorCallback(new Error("Not implemented in MockPlatformApis.ts"));
                }, 0);
            };
            MockPlatformApis.prototype.pushNotification_setApplicationIconBadgeNumber = function (successCallback, errorCallback, badgeCount) {
                console.warn("window.pushNotification.setApplicationIconBadgeNumber()", badgeCount);
                setTimeout(function () {
                    errorCallback(new Error("Not implemented in MockPlatformApis.ts"));
                }, 0);
            };
            //#endregion
            //#region Clipboard
            MockPlatformApis.prototype.clipboard_copy = function (text, onSuccess, onFail) {
                var confirmed = confirm("The following text was requested for copy to the clipboard:\n\n" + text);
                // Simulate the asynchronous operation with defer.
                if (confirmed) {
                    _.defer(function () {
                        if (onSuccess) {
                            onSuccess();
                        }
                    });
                }
                else {
                    _.defer(function () {
                        if (onFail) {
                            onFail(new Error("The operation was cancelled."));
                        }
                    });
                }
            };
            MockPlatformApis.prototype.clipboard_chromeExtension_copy = function (text, onSuccess, onFail) {
                // The following is based on http://stackoverflow.com/a/12693636
                try {
                    /* tslint:disable:no-string-literal */
                    // First, subscribe to the oncopy event. Normally executing the copy command for
                    // the current document will copy the currently selected text block. In this case
                    // we use our handler to override this and use the text that was passed into this
                    // method instead.
                    document["oncopy"] = function (event) {
                        event.clipboardData.setData("Text", text);
                        event.preventDefault();
                    };
                    // Execute the copy command for the document, which will fire our oncopy handler.
                    document.execCommand("Copy");
                    // Finally, remove our copy handler.
                    document["oncopy"] = undefined;
                    /* tslint:enable:no-string-literal */
                    _.defer(function () {
                        onSuccess();
                    });
                }
                catch (error) {
                    _.defer(function () {
                        onFail(error);
                    });
                }
            };
            MockPlatformApis.prototype.clipboard_paste = function (onSuccess, onFail) {
                var result = prompt("A paste from clipboard was requested; enter text for the paste operation:");
                // Simulate the asynchronous operation with defer.
                if (result === null) {
                    _.defer(function () {
                        if (onFail) {
                            onFail(new Error("The operation was cancelled."));
                        }
                    });
                }
                else {
                    _.defer(function () {
                        if (onSuccess) {
                            onSuccess(result);
                        }
                    });
                }
            };
            MockPlatformApis.prototype.clipboard_chromeExtension_paste = function (onSuccess, onFail) {
                _.defer(function () {
                    onFail(new Error("The paste operation is not currently implemented for Chrome extensions."));
                });
            };
            //#endregion
            //#region Notifications
            MockPlatformApis.prototype.notification_alert = function (message, alertCallback, title, buttonName) {
                var buttons = [];
                // Default the title.
                title = title || "Alert";
                // Default the button label text.
                buttonName = buttonName || "OK";
                // Build each of the buttons.
                buttons.push({ text: buttonName });
                // The Ionic pop-up uses HTML to display content, so for line breaks (\n) to render
                // we need to replace them with actual line break takes.
                message = message.replace(/\n/g, "<br/>");
                // Delegate to Ionic's pop-up framework.
                this.$ionicPopup.show({ title: title, template: message, buttons: buttons }).then(function () {
                    if (alertCallback) {
                        alertCallback();
                    }
                });
            };
            MockPlatformApis.prototype.notification_confirm = function (message, confirmCallback, title, buttonLabels) {
                var buttons = [];
                // Default the title.
                title = title || "Confirm";
                // Default the buttons array.
                buttonLabels = buttonLabels || ["Yes", "No"];
                // Build each of the buttons.
                buttonLabels.forEach(function (value, index) {
                    buttons.push({
                        text: value,
                        onTap: function (e) {
                            // The native confirm API uses a 1 based button index (not zero based!).
                            return index + 1;
                        }
                    });
                });
                // The Ionic pop-up uses HTML to display content, so for line breaks (\n) to render
                // we need to replace them with actual line break takes.
                message = message.replace(/\n/g, "<br/>");
                // Delegate to Ionic's pop-up framework.
                this.$ionicPopup.show({ title: title, template: message, buttons: buttons }).then(function (result) {
                    if (confirmCallback) {
                        confirmCallback(result);
                    }
                });
            };
            MockPlatformApis.prototype.notification_prompt = function (message, promptCallback, title, buttonLabels, defaultText) {
                var buttons = [], template;
                // The Ionic pop-up uses HTML to display content, so for line breaks (\n) to render
                // we need to replace them with actual line break takes.
                message = message.replace(/\n/g, "<br/>");
                // Here we manually build the HTML template for the prompt dialog.
                template = this.Utilities.format("<p>{0}</p><input type='text' id='notification_prompt_input' style='border: solid 1px #3e3e3e;'/>", message);
                // Default the title.
                title = title || "Prompt";
                // Default the buttons array.
                buttonLabels = buttonLabels || ["OK", "Cancel"];
                // Build each of the buttons.
                buttonLabels.forEach(function (value, index) {
                    buttons.push({
                        text: value,
                        onTap: function (e) {
                            var result, input;
                            input = document.getElementById("notification_prompt_input");
                            result = {
                                // The native confirm API uses a 1 based button index (not zero based!).
                                buttonIndex: index + 1,
                                input1: input.value
                            };
                            return result;
                        }
                    });
                });
                // Handle defaulting the value.
                if (defaultText) {
                    _.defer(function () {
                        var input;
                        input = document.getElementById("notification_prompt_input");
                        input.value = defaultText;
                    });
                }
                // Delegate to Ionic's pop-up framework.
                this.$ionicPopup.show({ title: title, template: template, buttons: buttons }).then(function (result) {
                    if (promptCallback) {
                        promptCallback(result);
                    }
                });
            };
            MockPlatformApis.prototype.notification_beep = function (times) {
                this.$ionicPopup.alert({ title: "Beep", template: "Beep count: " + times });
            };
            MockPlatformApis.prototype.notification_vibrate = function (time) {
                this.$ionicPopup.alert({ title: "Vibrate", template: "Vibrate time: " + time });
            };
            MockPlatformApis.prototype.notification_vibrateWithPattern = function (pattern, repeat) {
                this.$ionicPopup.alert({ title: "Vibrate with Pattern", template: "Pattern: " + pattern + "\nRepeat: " + repeat });
            };
            MockPlatformApis.prototype.notification_cancelVibration = function () {
                this.$ionicPopup.alert({ title: "Cancel Vibration", template: "cancel" });
            };
            //#endregion
            //#region ProgressIndicator
            MockPlatformApis.prototype.progressIndicator_hide = function () {
                var _this = this;
                // There seems to be a bug in the Ionic framework when you close the loading panel
                // very quickly (before it has fully been shown) that the backdrop will remain visible
                // and the user won't be able to click anything. Here we ensure that all calls to hide
                // happen after at least waiting one second.
                setTimeout(function () {
                    _this.$ionicLoading.hide();
                    _this.isProgressIndicatorShown = false;
                }, 1000);
            };
            MockPlatformApis.prototype.progressIndicator_show = function (dimBackground, labelOrTimeout, labelOrPosition) {
                var _this = this;
                var label, timeout;
                if (this.isProgressIndicatorShown) {
                    return;
                }
                this.isProgressIndicatorShown = true;
                if (typeof (labelOrTimeout) === "string") {
                    label = labelOrTimeout;
                }
                if (typeof (labelOrTimeout) === "number") {
                    timeout = labelOrTimeout;
                }
                if (!label) {
                    label = "Please Wait...";
                }
                this.$ionicLoading.show({
                    template: label
                });
                if (timeout) {
                    setTimeout(function () {
                        _this.isProgressIndicatorShown = false;
                        _this.$ionicLoading.hide();
                    }, timeout);
                }
            };
            MockPlatformApis.ID = "MockPlatformApis";
            return MockPlatformApis;
        })();
        Services.MockPlatformApis = MockPlatformApis;
    })(Services = PraetorApp.Services || (PraetorApp.Services = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Services;
    (function (Services) {
        /**
         * Provides a way to easily get/set user preferences.
         *
         * The current backing store is local storage and/or session storage:
         * https://cordova.apache.org/docs/en/3.0.0/cordova_storage_storage.md.html#localStorage
         */
        var Preferences = (function () {
            function Preferences() {
            }
            Object.defineProperty(Preferences, "$inject", {
                get: function () {
                    return [];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "apiUrl", {
                get: function () {
                    //return localStorage.getItem(Preferences.API_URL);
                    return "sample-app.justin-credible.net/api";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "userId", {
                get: function () {
                    return localStorage.getItem(Preferences.USER_ID);
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.USER_ID);
                    }
                    else {
                        localStorage.setItem(Preferences.USER_ID, value);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "token", {
                get: function () {
                    return localStorage.getItem(Preferences.TOKEN);
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.TOKEN);
                    }
                    else {
                        localStorage.setItem(Preferences.TOKEN, value);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "enableDeveloperTools", {
                get: function () {
                    return sessionStorage.getItem(Preferences.ENABLE_DEVELOPER_TOOLS) === "true";
                },
                set: function (value) {
                    if (value == null) {
                        sessionStorage.removeItem(Preferences.ENABLE_DEVELOPER_TOOLS);
                    }
                    else {
                        sessionStorage.setItem(Preferences.ENABLE_DEVELOPER_TOOLS, value.toString());
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "enableFullHttpLogging", {
                get: function () {
                    return localStorage.getItem(Preferences.ENABLE_FULL_HTTP_LOGGING) === "true";
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.ENABLE_FULL_HTTP_LOGGING);
                    }
                    else {
                        localStorage.setItem(Preferences.ENABLE_FULL_HTTP_LOGGING, value.toString());
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "enableMockHttpCalls", {
                get: function () {
                    return localStorage.getItem(Preferences.ENABLE_MOCK_HTTP_CALLS) === "true";
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.ENABLE_MOCK_HTTP_CALLS);
                    }
                    else {
                        localStorage.setItem(Preferences.ENABLE_MOCK_HTTP_CALLS, value.toString());
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "requirePinThreshold", {
                get: function () {
                    var value = localStorage.getItem(Preferences.REQUIRE_PIN_THRESHOLD);
                    return value == null ? Preferences.REQUIRE_PIN_THRESHOLD_DEFAULT : parseInt(value, 10);
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.REQUIRE_PIN_THRESHOLD);
                    }
                    else {
                        localStorage.setItem(Preferences.REQUIRE_PIN_THRESHOLD, value.toString());
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "lastPausedAt", {
                get: function () {
                    var lastPausedAt;
                    lastPausedAt = localStorage.getItem(Preferences.LAST_PAUSED_AT);
                    return moment(lastPausedAt).isValid() ? moment(lastPausedAt) : null;
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.LAST_PAUSED_AT);
                    }
                    else {
                        localStorage.setItem(Preferences.LAST_PAUSED_AT, moment(value).format());
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "pin", {
                get: function () {
                    return localStorage.getItem(Preferences.PIN);
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.PIN);
                    }
                    else {
                        localStorage.setItem(Preferences.PIN, value);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "categoryOrder", {
                get: function () {
                    var categoryOrder = localStorage.getItem(Preferences.CATEGORY_ORDER);
                    if (categoryOrder == null) {
                        return null;
                    }
                    else {
                        return JSON.parse(categoryOrder);
                    }
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.CATEGORY_ORDER);
                    }
                    else {
                        localStorage.setItem(Preferences.CATEGORY_ORDER, JSON.stringify(value));
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "hasCompletedOnboarding", {
                get: function () {
                    return localStorage.getItem(Preferences.HAS_COMPLETED_ONBOARDING) === "true";
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.HAS_COMPLETED_ONBOARDING);
                    }
                    else {
                        localStorage.setItem(Preferences.HAS_COMPLETED_ONBOARDING, value.toString());
                    }
                },
                enumerable: true,
                configurable: true
            });
            Preferences.ID = "Preferences";
            Preferences.USER_ID = "USER_ID";
            Preferences.TOKEN = "TOKEN";
            Preferences.ENABLE_DEVELOPER_TOOLS = "ENABLE_DEVELOPER_TOOLS";
            Preferences.ENABLE_FULL_HTTP_LOGGING = "ENABLE_FULL_HTTP_LOGGING";
            Preferences.ENABLE_MOCK_HTTP_CALLS = "ENABLE_MOCK_HTTP_CALLS";
            Preferences.REQUIRE_PIN_THRESHOLD = "REQUIRE_PIN_THRESHOLD";
            Preferences.LAST_PAUSED_AT = "LAST_PAUSED_AT";
            Preferences.PIN = "PIN";
            Preferences.CATEGORY_ORDER = "CATEGORY_ORDER";
            Preferences.HAS_COMPLETED_ONBOARDING = "HAS_COMPLETED_ONBOARDING";
            // Default setting is 10 minutes.
            Preferences.REQUIRE_PIN_THRESHOLD_DEFAULT = 10;
            return Preferences;
        })();
        Services.Preferences = Preferences;
    })(Services = PraetorApp.Services || (PraetorApp.Services = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Services;
    (function (Services) {
        /**
         * Provides a common set of helper methods for working with the UI.
         */
        var UiHelper = (function () {
            function UiHelper($rootScope, $q, $http, $ionicModal, MockPlatformApis, Utilities, Preferences) {
                /**
                 * Constant IDs for the dialogs. For use with the showDialog helper method.
                 */
                this.DialogIds = {
                    ReorderCategories: "REORDER_CATEGORIES_DIALOG",
                    PinEntry: "PIN_ENTRY_DIALOG"
                };
                this.isPinEntryOpen = false;
                this.$rootScope = $rootScope;
                this.$q = $q;
                this.$http = $http;
                this.$ionicModal = $ionicModal;
                this.MockPlatformApis = MockPlatformApis;
                this.Utilities = Utilities;
                this.Preferences = Preferences;
            }
            Object.defineProperty(UiHelper, "$inject", {
                //#endregion
                get: function () {
                    return ["$rootScope", "$q", "$http", "$ionicModal", Services.MockPlatformApis.ID, Services.Utilities.ID, Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(UiHelper.prototype, "toast", {
                //#region Plug-in Accessors
                /**
                 * Exposes an API for showing toast messages.
                 */
                get: function () {
                    if (window.plugins && window.plugins.toast) {
                        return window.plugins.toast;
                    }
                    else {
                        return this.MockPlatformApis.getToastPlugin();
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(UiHelper.prototype, "progressIndicator", {
                /**
                 * Exposes an API for working with progress indicators.
                 */
                get: function () {
                    if (window.ProgressIndicator && !this.Utilities.isAndroid) {
                        return window.ProgressIndicator;
                    }
                    else {
                        return this.MockPlatformApis.getProgressIndicatorPlugin();
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(UiHelper.prototype, "clipboard", {
                /**
                 * Exposes an API for working with the operating system's clipboard.
                 */
                get: function () {
                    if (typeof (cordova) !== "undefined" && cordova.plugins && cordova.plugins.clipboard) {
                        return cordova.plugins.clipboard;
                    }
                    else if (this.Utilities.isChromeExtension) {
                        return this.MockPlatformApis.getClipboardPluginForChromeExtension();
                    }
                    else {
                        return this.MockPlatformApis.getClipboardPlugin();
                    }
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Shows a native alert dialog.
             *
             * @param message The message text to display.
             * @param title The title of the dialog, defaults to "Alert".
             * @param buttonName The label for the button, defaults to "OK".
             *
             * @returns A promise of void which will be resolved when the alert is closed.
             */
            UiHelper.prototype.alert = function (message, title, buttonName) {
                var q = this.$q.defer(), callback, notificationPlugin;
                // Default the title.
                title = title || "Alert";
                // Default the button name.
                buttonName = buttonName || "OK";
                // Define the callback that is executed when the dialog is closed.
                callback = function () {
                    q.resolve();
                };
                // Obtain the notification plugin implementation.
                if (navigator.notification) {
                    notificationPlugin = navigator.notification;
                }
                else {
                    notificationPlugin = this.MockPlatformApis.getNotificationPlugin();
                }
                // Show the alert dialog.
                notificationPlugin.alert(message, callback, title, buttonName);
                return q.promise;
            };
            /**
             * Displays a native confirm dialog.
             *
             * @param message The message text to display.
             * @param title The title of the dialog, defaults to "Confirm".
             * @param buttonLabels An array of strings for specifying button labels, defaults to "Yes" and "No".
             *
             * @returns A promise of type string which will be resolved when the confirm is closed with the button that was clicked.
             */
            UiHelper.prototype.confirm = function (message, title, buttonLabels) {
                var q = this.$q.defer(), callback, notificationPlugin;
                // Default the title.
                title = title || "Confirm";
                // Default the buttons array.
                buttonLabels = buttonLabels || ["Yes", "No"];
                // Define the callback that is executed when the dialog is closed.
                callback = function (choice) {
                    var buttonText;
                    // Get the button text for the button that was clicked; the callback
                    // gives us a button index that is 1 based (not zero based!).
                    buttonText = buttonLabels[choice - 1];
                    q.resolve(buttonText);
                };
                // Obtain the notification plugin implementation.
                if (navigator.notification) {
                    notificationPlugin = navigator.notification;
                }
                else {
                    notificationPlugin = this.MockPlatformApis.getNotificationPlugin();
                }
                // Show the confirm dialog.
                notificationPlugin.confirm(message, callback, title, buttonLabels);
                return q.promise;
            };
            /**
             * Shows a native prompt dialog.
             *
             * @param message The message text to display.
             * @param title The title of the dialog, defaults to "Prompt".
             * @param buttonLabels An array of strings for specifying button labels, defaults to "OK" and "Cancel".
             * @param defaultText Default text box input value, default is an empty string.
             *
             * @returns A promise of key/value pair of strings; the key is the button that was clicked and the value is the value of the text box.
             */
            UiHelper.prototype.prompt = function (message, title, buttonLabels, defaultText) {
                var q = this.$q.defer(), callback, notificationPlugin;
                // Default the title
                title = title || "Prompt";
                // Default the buttons array.
                buttonLabels = buttonLabels || ["OK", "Cancel"];
                // Define the callback that is executed when the dialog is closed.
                callback = function (promptResult) {
                    var promiseResult, buttonText;
                    // Get the button text for the button that was clicked; the callback
                    // gives us a button index that is 1 based (not zero based!).
                    buttonText = buttonLabels[promptResult.buttonIndex - 1];
                    // Define the result object that we'll use the resolve the promise.
                    // This contains the button that was selected as well as the contents
                    // of the text box.
                    promiseResult = new PraetorApp.Models.KeyValuePair(buttonText, promptResult.input1);
                    q.resolve(promiseResult);
                };
                // Obtain the notification plugin implementation.
                if (navigator.notification) {
                    notificationPlugin = navigator.notification;
                }
                else {
                    notificationPlugin = this.MockPlatformApis.getNotificationPlugin();
                }
                // Show the prompt dialog.
                notificationPlugin.prompt(message, callback, title, buttonLabels, defaultText);
                return q.promise;
            };
            /**
             * Used to open the modal dialog with the given dialog ID.
             * Dialog IDs and templates can be set via UiHelper.DialogIds.
             *
             * If a dialog with the given ID is already open, another will not be opened
             * and the promise will be rejected with UiHelper.DIALOG_ALREADY_OPEN.
             *
             * @param dialogId The ID of the dialog to show/open.
             * @param options The options to use when opening the dialog.
             * @returns A promise that will be resolved when the dialog is closed with the dialog's return type.
             */
            UiHelper.prototype.showDialog = function (dialogId, options) {
                var q = this.$q.defer(), template, creationArgs, creationPromise;
                // Ensure the options object is present.
                if (!options) {
                    options = new PraetorApp.Models.DialogOptions();
                }
                // Ensure the array is initialized.
                if (UiHelper.openDialogIds == null) {
                    UiHelper.openDialogIds = [];
                }
                // If a dialog with this ID is already open, we can reject immediately.
                // This ensures that only a single dialog with a given ID can be open
                // at one time.
                if (_.contains(UiHelper.openDialogIds, dialogId)) {
                    this.$q.reject(UiHelper.DIALOG_ALREADY_OPEN);
                    return q.promise;
                }
                // Lookup the template to use for this dialog based on the dialog ID.
                template = UiHelper.dialogTemplateMap[dialogId];
                // If we were unable to find a dialog ID in the template map then we
                // can bail out here as there is nothing to do.
                if (!template) {
                    this.$q.reject(UiHelper.DIALOG_ID_NOT_REGISTERED);
                    console.warn(this.Utilities.format("A call was made to openDialog with dialogId '{0}', but a template is not registered with that ID in the dialogTemplateMap.", dialogId));
                    return q.promise;
                }
                // Add the ID of this dialog to the list of dialogs that are open.
                UiHelper.openDialogIds.push(dialogId);
                // Define the arguments that will be used to create the modal instance.
                creationArgs = {
                    // Include the dialog ID so we can identify the dialog later on.
                    dialogId: dialogId,
                    // Include the dialog data object so the BaseDialogController can
                    // get the dialog for the dialog.
                    dialogData: options.dialogData,
                    // Include Ionic modal options.
                    backdropClickToClose: options.backdropClickToClose,
                    hardwareBackButtonClose: options.hardwareBackButtonClose
                };
                // Schedule the modal instance to be created.
                creationPromise = this.$ionicModal.fromTemplateUrl(template, creationArgs);
                // Once the modal instance has been created...
                creationPromise.then(function (modal) {
                    var backdrop;
                    // Show it.
                    modal.show();
                    if (!options.showBackground) {
                        // HACK: Here we adjust the background color's alpha value so the user can't
                        // see through the overlay. At some point we should update this to use a blur
                        // effect similar to this: http://ionicframework.com/demos/frosted-glass/
                        backdrop = document.querySelector("div.modal-backdrop");
                        backdrop.style.backgroundColor = "rgba(0, 0, 0, 1)";
                    }
                    // Subscribe to the close event.
                    modal.scope.$on("modal.hidden", function (eventArgs, instance) {
                        // Only handle events for the relevant dialog.
                        if (dialogId !== instance.dialogId) {
                            return;
                        }
                        // If we were blocking out the background, we need to revert that now that
                        // we are closing this instance.
                        if (!options.showBackground) {
                            // HACK: Restore the backdrop's background color value.
                            backdrop.style.backgroundColor = "";
                        }
                        // Remove this dialog's ID from the list of ones that are open.
                        UiHelper.openDialogIds = _.without(UiHelper.openDialogIds, dialogId);
                        // Once the dialog is closed, resolve the original promise
                        // using the result data object from the dialog (if any).
                        q.resolve(modal.result);
                    });
                });
                return q.promise;
            };
            //#endregion
            //#region Helpers for the device_resume event
            UiHelper.prototype.showPinEntryAfterResume = function () {
                var q = this.$q.defer(), resumedAt, options, model;
                // If the PIN entry dialog then there is nothing to do.
                if (this.isPinEntryOpen) {
                    q.reject(UiHelper.DIALOG_ALREADY_OPEN);
                    return q.promise;
                }
                // If there is a PIN set and a last paused time then we need to determine if we
                // need to show the lock screen.
                if (this.Preferences.pin && this.Preferences.lastPausedAt != null && this.Preferences.lastPausedAt.isValid()) {
                    // Get the current time.
                    resumedAt = moment();
                    // If the time elapsed since the last pause event is greater than the threshold,
                    // then we need to show the lock screen.
                    if (resumedAt.diff(this.Preferences.lastPausedAt, "minutes") > this.Preferences.requirePinThreshold) {
                        model = new PraetorApp.Models.PinEntryDialogModel("PIN Required", this.Preferences.pin, false);
                        options = new PraetorApp.Models.DialogOptions(model);
                        options.backdropClickToClose = false;
                        options.hardwareBackButtonClose = false;
                        options.showBackground = false;
                        this.showDialog(this.DialogIds.PinEntry, options).then(function (result) {
                            // Once a matching PIN is entered, then we can resolve.
                            q.resolve();
                        });
                    }
                    else {
                        // If we don't need to show the PIN screen, then immediately resolve.
                        q.resolve();
                    }
                }
                else {
                    // If we don't need to show the PIN screen, then immediately resolve.
                    q.resolve();
                }
                return q.promise;
            };
            UiHelper.ID = "UiHelper";
            //#region Dialog Stuff
            /**
             * Value for rejection of a promise when opening a dialog using the showDialog
             * helper method. This value will be used when showDialog was called with a dialog
             * ID of a dialog that is already open.
             */
            UiHelper.DIALOG_ALREADY_OPEN = "DIALOG_ALREADY_OPEN";
            /**
             * Value for rejection of a promise when opening a dialog using the showDialog
             * helper method. This value will be used when showDialog was called with a dialog
             * ID who is not registered in the dialogTemplateMap map.
             */
            UiHelper.DIALOG_ID_NOT_REGISTERED = "DIALOG_ID_NOT_REGISTERED";
            /**
             * A map of dialog IDs to the templates that they use. Used by the showDialog helper method.
             *
             * The template's root element should have a controller that extends BaseDialogController.
             */
            UiHelper.dialogTemplateMap = {
                "REORDER_CATEGORIES_DIALOG": "templates/Dialogs/Reorder-Categories.html",
                "PIN_ENTRY_DIALOG": "templates/Dialogs/Pin-Entry.html"
            };
            return UiHelper;
        })();
        Services.UiHelper = UiHelper;
    })(Services = PraetorApp.Services || (PraetorApp.Services = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Services;
    (function (Services) {
        /**
         * Provides a common set of helper/utility methods.
         */
        var Utilities = (function () {
            function Utilities(isRipple, isCordova, isDebug, isChromeExtension, Preferences) {
                this._isRipple = isRipple;
                this._isCordova = isCordova;
                this._isDebug = isDebug;
                this._isChromeExtension = isChromeExtension;
                this.Preferences = Preferences;
            }
            Object.defineProperty(Utilities, "$inject", {
                get: function () {
                    return ["isRipple", "isCordova", "isDebug", "isChromeExtension", Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Utilities.prototype, "isRipple", {
                //#region Platforms
                /**
                 * Can be used to determine if this application is being run in the Apache
                 * Ripple Emulator, which runs in a desktop browser, and not Cordova.
                 *
                 * @returns True if the application is running in the Ripple emulator, false otherwise.
                 */
                get: function () {
                    return this._isRipple;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Utilities.prototype, "isCordova", {
                /**
                 * Can be used to determine if this application is being run in the Apache
                 * Cordova runtime.
                 *
                 * @returns True if the application is running in the Apache Cordova runtime, false otherwise.
                 */
                get: function () {
                    return this._isCordova;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Utilities.prototype, "isDebugMode", {
                /**
                 * Can be used to determine if the application is in debug or release mode.
                 *
                 * @returns True if the application is in debug mode, false otherwise.
                 */
                get: function () {
                    return this._isDebug;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Utilities.prototype, "isChromeExtension", {
                /**
                 * Can be used to determine if the application is running as a Chrome browser Extension.
                 *
                 * @returns True if the application is running as a Chrome Extension, false otherwise.
                 */
                get: function () {
                    return this._isChromeExtension;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Utilities.prototype, "isAndroid", {
                /**
                 * Used to check if the current platform is Android.
                 */
                get: function () {
                    return typeof (device) !== "undefined" && device.platform === "Android";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Utilities.prototype, "isIos", {
                /**
                 * Used to check if the current platform is iOS.
                 */
                get: function () {
                    return typeof (device) !== "undefined" && device.platform === "iOS";
                },
                enumerable: true,
                configurable: true
            });
            /**
             * Used to check if the current platform is Windows Phone 8.x.
             */
            Utilities.prototype.isWindowsPhone8 = function () {
                return typeof (device) !== "undefined" && device.platform === "WP8";
            };
            /**
             * Used to check if the current platform is Windows 8 (desktop OS).
             */
            Utilities.prototype.isWindows8 = function () {
                return typeof (device) !== "undefined" && device.platform === "Windows8";
            };
            /**
            * Used to return the name of the platform as specified via Cordova.
            */
            Utilities.prototype.platform = function () {
                if (typeof (device) === "undefined") {
                    return typeof (window.ripple) !== "undefined" ? "Ripple" : "Unknown";
                }
                else {
                    return device.platform;
                }
            };
            //#endregion
            //#region String Manipulation
            /**
             * Used to determine if a string ends with a specified string.
             *
             * @param str The string to check.
             * @param suffix The value to check for.
             * @returns True if str ends with the gtiven suffix, false otherwise.
             */
            Utilities.prototype.endsWith = function (str, suffix) {
                if (str == null || str === "") {
                    return false;
                }
                if (suffix == null || suffix === "") {
                    return true;
                }
                return (str.substr(str.length - suffix.length) === suffix);
            };
            /**
             * Used to determine if a string starts with a specified string.
             *
             * @param str The string to check.
             * @param prefix The value to check for.
             * @returns True if str starts with the given prefix, false otherwise.
             */
            Utilities.prototype.startsWith = function (str, prefix) {
                if (str == null || str === "") {
                    return false;
                }
                if (prefix == null || prefix === "") {
                    return true;
                }
                return (str.substr(0, prefix.length) === prefix);
            };
            /**
             * Used to morph a string to title-case; that is, any character that
             * is proceeded by a space will be capitalized.
             *
             * @param str The string to convert to title-case.
             * @returns The title-case version of the string.
             */
            Utilities.prototype.toTitleCase = function (str) {
                if (!str) {
                    return "";
                }
                // http://stackoverflow.com/questions/196972/convert-string-to-title-case-with-javascript
                return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            };
            /**
             * Used to format a string by replacing values with the given arguments.
             * Arguments should be provided in the format of {x} where x is the index
             * of the argument to be replaced corresponding to the arguments given.
             *
             * For example, the string t = "Hello there {0}, it is {1} to meet you!"
             * used like this: Utilities.format(t, "dude", "nice") would result in:
             * "Hello there dude, it is nice to meet you!".
             *
             * @param str The string value to use for formatting.
             * @param ... args The values to inject into the format string.
             */
            Utilities.prototype.format = function (formatString) {
                var args = [];
                for (var _i = 1; _i < arguments.length; _i++) {
                    args[_i - 1] = arguments[_i];
                }
                var i, reg;
                i = 0;
                for (i = 0; i < arguments.length - 1; i += 1) {
                    reg = new RegExp("\\{" + i + "\\}", "gm");
                    formatString = formatString.replace(reg, arguments[i + 1]);
                }
                return formatString;
            };
            //#endregion
            //#region Object Getter/Setter (reflection)
            /**
             * Used to get a value from an object with the given property name.
             *
             * @param object The object to obtain the value from.
             * @param propertyString A dotted notation string of properties to use to obtain the value.
             * @returns The value specified by the property string from the given object.
             */
            Utilities.prototype.getValue = function (object, propertyString) {
                var properties, property, i;
                if (!object) {
                    return null;
                }
                if (!propertyString) {
                    return null;
                }
                // This handles the simplest case (a property string without a dotted notation)
                // as well as an edge case (a property whose name contains dots).
                if (object[propertyString]) {
                    return object[propertyString];
                }
                // Break the property string down into individual properties.
                properties = propertyString.split(".");
                // Dig down into the object hierarchy using the properties.
                for (i = 0; i < properties.length; i += 1) {
                    // Grab the property for this index.
                    property = properties[i];
                    // Grab the object with this property name.
                    object = object[property];
                    // If we've hit a null, then we can bail out early.
                    if (object == null) {
                        return null;
                    }
                }
                // Finally, return the object that we've obtained.
                return object;
            };
            /**
             * Sets the value of a property with the specified propertyString on the supplied model object.
             *
             * @param object The object on which to set the value.
             * @param propertyString A dotted notation string of properties to use to set the value.
             * @param value The value to set.
             * @param instantiateObjects True to create objects in the hierarchy that do not yet exist; defaults to true.
             */
            Utilities.prototype.setValue = function (object, propertyString, value, instantiateObjects) {
                var properties, property, i;
                if (!object) {
                    return;
                }
                if (!propertyString) {
                    return;
                }
                // Default the flag to true if it is not specified.
                if (typeof (instantiateObjects) === "undefined") {
                    instantiateObjects = true;
                }
                // Break the property string down into individual properties.
                properties = propertyString.split(".");
                // Dig down into the object hierarchy using the properties.
                for (i = 0; i < properties.length; i += 1) {
                    // Grab the property for this index.
                    property = properties[i];
                    if (properties.length - 1 === i) {
                        // If this is the last property, then set the value.
                        object[property] = value;
                    }
                    else {
                        // If this is not the last property, then we need to traverse.
                        // Grab the object with this property name.
                        if (object[property]) {
                            // We encountered a non-null object! Grab it and traverse.
                            object = object[property];
                        }
                        else if (instantiateObjects) {
                            // If we've hit a null, and the flag is true create a new
                            // empty object and continue traversal.
                            object[property] = {};
                            object = object[property];
                        }
                        else {
                            // If we've hit a null, and the flag is false, then bail out.
                            return;
                        }
                    }
                }
            };
            /**
             * Used to obtain a function from the given scope using the dotted notation property string.
             *
             * If inferContext is true, then the method will attempt to determine which context the function should be executed in.
             * For example, given the string "something.else.theFunction" where "theFunction" is a function reference, the context
             * would be "something.else". In this case the function returned will be wrapped in a function that will invoke the original
             * function in the correct context. This is most useful for client event strings as passed from the server. Defaults to true.
             *
             * @param scopeOrPropertyString The scope to being the search at OR a property string (which assumes the scope is window).
             * @param propertyString The dotted notation property string used to obtain the function reference from the scope.
             * @param inferContext Indicates that we should attempt determine the context in which the function should be called.
             */
            Utilities.prototype.getFunction = function (scopeOrPropertyString, propertyString, inferContext) {
                var scope, fn, contextPropertyString, context;
                // Default the inferContext variable to true.
                if (inferContext == null) {
                    inferContext = true;
                }
                if (typeof (scopeOrPropertyString) === "string") {
                    // If the first parameter was a string, then we know they used the string only overload.
                    // In that case default the scope to be the window object.
                    scope = window;
                    propertyString = scopeOrPropertyString;
                }
                else {
                    // Otherwise, treat the first parameter as the scope object.
                    scope = scopeOrPropertyString;
                }
                // Delegate to the getValue() function to do the work.
                fn = this.getValue(scope, propertyString);
                if (!fn) {
                    return null;
                }
                if (inferContext) {
                    // Now that we've obtained a function reference, lets see if we can find the context to use
                    // to invoke the function in.
                    if (propertyString.indexOf(".") > -1) {
                        // Use the property string all the way up to the last segment.
                        // For example, if property string was: something.else.theFunction
                        // then the context string would be: something.else
                        contextPropertyString = propertyString.substr(0, propertyString.lastIndexOf("."));
                        // Now delegate to the getValue() function to do the work.
                        context = this.getValue(scope, contextPropertyString);
                    }
                    else {
                        // If the property string is not a dotted notation string, then use
                        // the scope itself as the context object.
                        context = scope;
                    }
                    // Now that we have a context object, we'll use this underscore helper to wrap the original
                    // function in a function that will call said function with the given context.
                    fn = _.bind(fn, context);
                }
                // Return the newly created wrapper function.
                return fn;
            };
            //#endregion
            //#region Misc
            /**
             * Returns a random number between the given minimum and maximum values.
             */
            Utilities.prototype.getRandomNumber = function (min, max) {
                // http://jsfiddle.net/alanwsmith/GfAhy/
                return Math.floor(Math.random() * (max - min + 1) + min);
            };
            /**
             * Used to generate a globally unique identifier in the standard GUID string format.
             * For example: D99A5596-5478-4BAA-9A42-3BC352DC9D56
             *
             * @returns A GUID in string format.
             */
            Utilities.prototype.generateGuid = function () {
                var 
                // Will hold the GUID string as we build it.
                guid, 
                // Used to hold the generated hex digit as they are generated.
                hexDigit, 
                // Used to keep track of our location in the generated string.
                j;
                // Start out with an empty string.
                guid = "";
                // Now loop 35 times to generate 35 characters.
                for (j = 0; j < 32; j++) {
                    // Characters at these indexes are always hyphens.
                    if (j === 8 || j === 12 || j === 16 || j === 20) {
                        guid = guid + "-";
                    }
                    // Get a random number between 0 and 16 and convert it to its hexadecimal value.
                    hexDigit = Math.floor(Math.random() * 16).toString(16).toUpperCase();
                    // Add the digit onto the string.
                    guid = guid + hexDigit;
                }
                return guid;
            };
            Object.defineProperty(Utilities.prototype, "categories", {
                /**
                 * Returns the categories for the application in their default sort order.
                 */
                get: function () {
                    // Define the default set of categories.
                    var categories = [
                        new PraetorApp.ViewModels.CategoryItemViewModel("Category 1", "#/app/category/1", "ios-pricetags-outline", 0),
                        new PraetorApp.ViewModels.CategoryItemViewModel("Category 2", "#/app/category/2", "ios-pricetags-outline", 1),
                        new PraetorApp.ViewModels.CategoryItemViewModel("Category 3", "#/app/category/3", "ios-pricetags-outline", 2),
                        new PraetorApp.ViewModels.CategoryItemViewModel("Category 4", "#/app/category/4", "ios-pricetags-outline", 3)
                    ];
                    // If the user has ordering preferences, then apply their custom ordering.
                    if (this.Preferences.categoryOrder) {
                        this.Preferences.categoryOrder.forEach(function (categoryName, index) {
                            var categoryItem = _.where(categories, { name: categoryName })[0];
                            if (categoryItem) {
                                categoryItem.order = index;
                            }
                        });
                    }
                    // Ensure the list is sorted by the order.
                    categories = _.sortBy(categories, "order");
                    return categories;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Utilities.prototype, "defaultCategory", {
                /**
                 * Returns the view that is set as the default.
                 *
                 * Currently, this is the category that is set in the first position.
                 */
                get: function () {
                    return this.categories[0];
                },
                enumerable: true,
                configurable: true
            });
            Utilities.ID = "Utilities";
            return Utilities;
        })();
        Services.Utilities = Utilities;
    })(Services = PraetorApp.Services || (PraetorApp.Services = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var CategoryItemViewModel = (function () {
            function CategoryItemViewModel(name, href, icon, order) {
                this.name = name;
                this.href = href;
                this.icon = icon;
                this.order = order;
            }
            return CategoryItemViewModel;
        })();
        ViewModels.CategoryItemViewModel = CategoryItemViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var CategoryViewModel = (function () {
            function CategoryViewModel() {
            }
            return CategoryViewModel;
        })();
        ViewModels.CategoryViewModel = CategoryViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        /**
         * A ViewModel that has no properties. Useful for controllers that
         * do not have any view model properties, but need to pass something
         * to the BaseController constructor.
         */
        var EmptyViewModel = (function () {
            function EmptyViewModel() {
            }
            return EmptyViewModel;
        })();
        ViewModels.EmptyViewModel = EmptyViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var MenuViewModel = (function () {
            function MenuViewModel() {
            }
            return MenuViewModel;
        })();
        ViewModels.MenuViewModel = MenuViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var PinEntryViewModel = (function () {
            function PinEntryViewModel() {
            }
            return PinEntryViewModel;
        })();
        ViewModels.PinEntryViewModel = PinEntryViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var ReorderCategoriesViewModel = (function () {
            function ReorderCategoriesViewModel() {
            }
            return ReorderCategoriesViewModel;
        })();
        ViewModels.ReorderCategoriesViewModel = ReorderCategoriesViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var OnboardingRegisterViewModel = (function () {
            function OnboardingRegisterViewModel() {
            }
            return OnboardingRegisterViewModel;
        })();
        ViewModels.OnboardingRegisterViewModel = OnboardingRegisterViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var AboutViewModel = (function () {
            function AboutViewModel() {
            }
            return AboutViewModel;
        })();
        ViewModels.AboutViewModel = AboutViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var CloudSyncViewModel = (function () {
            function CloudSyncViewModel() {
            }
            return CloudSyncViewModel;
        })();
        ViewModels.CloudSyncViewModel = CloudSyncViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var ConfigurePinViewModel = (function () {
            function ConfigurePinViewModel() {
            }
            return ConfigurePinViewModel;
        })();
        ViewModels.ConfigurePinViewModel = ConfigurePinViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var DeveloperViewModel = (function () {
            function DeveloperViewModel() {
            }
            return DeveloperViewModel;
        })();
        ViewModels.DeveloperViewModel = DeveloperViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var LogsViewModel = (function () {
            function LogsViewModel() {
                this.logs = {};
            }
            return LogsViewModel;
        })();
        ViewModels.LogsViewModel = LogsViewModel;
        var LogEntryViewModel = (function (_super) {
            __extends(LogEntryViewModel, _super);
            function LogEntryViewModel() {
                _super.apply(this, arguments);
            }
            return LogEntryViewModel;
        })(PraetorApp.Models.LogEntry);
        ViewModels.LogEntryViewModel = LogEntryViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var SettingsListViewModel = (function () {
            function SettingsListViewModel() {
            }
            return SettingsListViewModel;
        })();
        ViewModels.SettingsListViewModel = SettingsListViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
//# sourceMappingURL=appBundle.js.map