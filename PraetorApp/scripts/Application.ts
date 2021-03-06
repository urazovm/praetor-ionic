
module PraetorApp.Application {

    //#region Variables

    /**
     * The root Angular application module.
     */
    var ngModule: ng.IModule;

    /**
     * Indicates if the PIN entry dialog is currently being shown. This is used to determine
     * if the device_pause event should update the lastPausedAt timestamp (we don't want to
     * update the timestamp if the dialog is open because it will allow the user to pause
     * and then kill the app and bypass the PIN entry screen on next resume).
     */
    var isShowingPinPrompt: boolean;

    //#endregion

    /**
     * This is the main entry point for the application. It is used to setup Angular and
     * configure its controllers, services, etc.
     * 
     * It is invoked via the Main.js script included from the index.html page.
     */
    export function main(): void {
        var versionInfo: Interfaces.VersionInfo;

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



        ngModule.directive("prehledSpisu", function ($timeout) {
            return {
                restrict: 'E',
                scope: {
                    viewModel: '=',
                    onSpisClick: '&'
                },
                templateUrl: 'templates/directives/prehled-spisu.html',
                link: function (scope, element, attrs) {
                    scope.$watch('searchText', (newValue, oldValue) => {
                        if (newValue) {

                            var tempFilterText = '', filterTextTimeout;

                            scope.$watch('searchText', (val) => {

                                if (filterTextTimeout)
                                    $timeout.cancel(filterTextTimeout);

                                tempFilterText = val;

                                filterTextTimeout = $timeout(() => {
                                    (<any>scope).filterText = tempFilterText;
                                }, 1000); // delay 250 ms
                            })

                        }
                    }, true);
                },
            };
        });

        ngModule.directive("prehledSubjektu", function ($timeout) {
            return {
                restrict: 'E',
                scope: {
                    viewModel: '=',
                    onSubjektClick: '&'
                },
                templateUrl: 'templates/directives/prehled-subjektu.html',
                link: function (scope, element, attrs) {
                    scope.$watch('searchText', (newValue, oldValue) => {
                        if (newValue) {

                            var tempFilterText = '', filterTextTimeout;

                            scope.$watch('searchText', (val) => {

                                if (filterTextTimeout)
                                    $timeout.cancel(filterTextTimeout);

                                tempFilterText = val;

                                filterTextTimeout = $timeout(() => {
                                    (<any>scope).filterText = tempFilterText;
                                }, 1000); // delay 250 ms
                            })

                        }
                    }, true);
                },
            };
        });

        ngModule.directive("prehledCinnosti", function () {
            return {
                restrict: 'E',
                scope: {
                    viewModel: '=',
                    onCinnostClick: '&',
                    onAddClick: '&',
                    onLoadPreviousClick: '&'
                },
                templateUrl: 'templates/directives/prehled-cinnosti.html',
            };
        });

        window.addEventListener('native.showkeyboard', onkeyboardshow);

        window.addEventListener('native.hidekeyboard', onkeyboardhide);

        // Specify the initialize/run and configuration functions.
        ngModule.run(angular_initialize);
        ngModule.config(angular_configure);
    }

    function onkeyboardshow() {
        console.log("hiding tabs:" + new Date());
        if (document.getElementById('style_hidetabs')) {
            console.log('already hidden');
            return;
        }

        var style = document.createElement("style");
        style.appendChild(document.createTextNode("div.tabs.tab-nav {display: none !important } .has-tabs { bottom: 0 !important }"));
        style.id = 'style_hidetabs';
        document.head.appendChild(style);
    }

    function onkeyboardhide() {
        console.log("showing tabs:" + new Date());
        var el = document.getElementById('style_hidetabs');
        if (el) el.parentNode.removeChild(el);
    }

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
        function F(): void {
            return constructor.apply(this, args);
        };
        F.prototype = constructor.prototype;
        return new F();
    }

    /**
     * Used to register each of the services that exist in the Service namespace
     * with the given Angular module.
     * 
     * @param ngModule The Angular module with which to register.
     */
    function registerServices(ngModule: ng.IModule): void {
        // Register each of the services that exist in the Service namespace.
        _.each(Services, (Service: any) => {
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
    function registerDirectives(ngModule: ng.IModule): void {

        _.each(Directives, (Directive: any) => {
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
    function registerFilters(ngModule: ng.IModule): void {

        _.each(Filters, (Filter: any) => {
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
    function registerControllers(ngModule: ng.IModule): void {

        // Register each of the controllers that exist in the Controllers namespace.
        _.each(Controllers, (Controller: any) => {
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
    function getElementDirectiveFactoryFunction(Directive: Directives.IElementDirectiveClass): () => ng.IDirective {
        var descriptor: ng.IDirective = {};

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
        descriptor.link = (scope: ng.IScope, instanceElement: ng.IAugmentedJQuery, instanceAttributes: ng.IAttributes, controller: any, transclude: ng.ITranscludeFunction): void => {

            // New up the instance of our directive class.
            var instance = <Directives.IElementDirective>new Directive(scope, instanceElement, instanceAttributes, controller, transclude);

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
    function getDirectiveFactoryParameters(Directive: ng.IDirective): any[] {

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
    function getFilterFactoryFunction(fn: Function): () => Function {
        return function () { return fn; };
    }

    //#endregion

    //#region Platform Configuration

    /**
     * The main initialize/run function for Angular; fired once the AngularJs framework is done loading.
     */
    function angular_initialize($rootScope: ng.IScope, $location: ng.ILocationService, $ionicViewService: any, $ionicPlatform: Ionic.IPlatform, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences, MockHttpApis: Services.MockHttpApis, $state: ng.ui.IStateService): void {

        // Once AngularJs has loaded we'll wait for the Ionic platform's ready event.
        // This event will be fired once the device ready event fires via Cordova.
        $ionicPlatform.ready(function () {
            ionicPlatform_ready($rootScope, $location, $ionicViewService, $ionicPlatform, UiHelper, Utilities, Preferences, $state);
        });   
        
        // Mock up or allow HTTP responses.
        MockHttpApis.mockHttpCalls(Preferences.enableMockHttpCalls);
    };

    /**
     * Fired once the Ionic framework determines that the device is ready.
     * 
     * Note that this will not fire in the Ripple emulator because it relies
     * on the Codrova device ready event.
     */
    function ionicPlatform_ready($rootScope: ng.IScope, $location: ng.ILocationService, $ionicViewService: any, $ionicPlatform: Ionic.IPlatform, UiHelper: Services.UiHelper, Utilities: Services.Utilities, Preferences: Services.Preferences, $state: ng.ui.IStateService): void {

        if (navigator.splashscreen)
            navigator.splashscreen.hide();

        if (window.StatusBar)
            window.StatusBar.overlaysWebView(false);

        var deregister = (<any>$ionicPlatform).registerBackButtonAction(() => {
            var nameRoute = $state.current.name;
            if (Services.UiHelper.closeTopDialog())
                return;
            else if (nameRoute.indexOf("app.spis.") === 0) {
                $state.go('app.home');
            }
            else if (nameRoute.indexOf("app.home.subjekty") === 0) {
                $state.go('app.home.spisy');
            }
            else if (nameRoute.indexOf("app.home.cinnosti") === 0) {
                $state.go('app.home.spisy');
            }
            else if (nameRoute.indexOf("app.home.nastaveni") === 0) {
                $state.go('app.home.spisy');
            }
            else if (nameRoute.indexOf("app.home.spisy") === 0) {

                var nav = <any>navigator;
                if (nav.app) {
                    nav.app.exitApp();
                } else if (nav.device) {
                    nav.device.exitApp();
                }
            }

        }, 501);

        $rootScope.$on('$destroy', deregister);

        // Subscribe to device events.
        document.addEventListener("pause", _.bind(device_pause, null, Preferences));
        document.addEventListener("resume", _.bind(device_resume, null, $location, $ionicViewService, Utilities, UiHelper, Preferences));
        //document.addEventListener("backbutton", _.bind(device_back_button, null, $location));
        //document.addEventListener("menubutton", _.bind(device_menuButton, null, $rootScope));

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
    function angular_configure($stateProvider: ng.ui.IStateProvider, $urlRouterProvider: ng.ui.IUrlRouterProvider, $provide: ng.auto.IProvideService, $httpProvider: ng.IHttpProvider, $compileProvider: ng.ICompileProvider, $ionicConfigProvider: any): void {

        $ionicConfigProvider.tabs.position("bottom");
        $ionicConfigProvider.tabs.style("standard");
        $ionicConfigProvider.views.maxCache(0);

        // Intercept the default Angular exception handler.
        $provide.decorator("$exceptionHandler", function ($delegate: ng.IExceptionHandlerService) {
            return function (exception, cause) {
                // Delegate to our custom handler.
                angular_exceptionHandler(exception, cause);

                // Delegate to the default/base Angular behavior.
                $delegate(exception, cause);
            };
        });

        // Whitelist several URI schemes to prevent Angular from marking them as un-safe.
        // http://stackoverflow.com/questions/19590818/angularjs-and-windows-8-route-error
        $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|tel|mailto|file|ghttps?|ms-appx|x-wmapp0|chrome-extension):/);
        $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|ms-appx|x-wmapp0):|data:image\//);

        // Register our custom interceptor with the HTTP provider so we can hook into AJAX request events.
        //$httpProvider.interceptors.push(Services.HttpInterceptor.ID);

        // Setup all of the client side routes and their controllers and views.
        RouteConfig.setupRoutes($stateProvider, $urlRouterProvider);

        // If mock API calls are enabled, then we'll add a random delay for all HTTP requests to simulate
        // network latency so we can see the spinners and loading bars. Useful for demo purposes.
        if (localStorage.getItem("ENABLE_MOCK_HTTP_CALLS") === "true") {
            Services.MockHttpApis.setupMockHttpDelay($provide);
        }
    };

    //#endregion

    //#region Event Handlers

    /**
     * Fired when the OS decides to minimize or pause the application. This usually
     * occurs when the user presses the device's home button or switches applications.
     */
    function device_pause(Preferences: Services.Preferences): void {

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
    function device_resume($location: ng.ILocationService, $ionicViewService: any, Utilities: Services.Utilities, UiHelper: Services.UiHelper, Preferences: Services.Preferences): void {
        return;
    }

    /**
     * Fired when the menu hard (or soft) key is pressed on the device (eg Android menu key).
     * This isn't used for iOS devices because they do not have a menu button key.
     */
    function device_menuButton($rootScope: ng.IScope): void {
        // Broadcast this event to all child scopes. This allows controllers for individual
        // views to handle this event and show a contextual menu etc.
        $rootScope.$broadcast("menubutton");
    }

    /**
     * Fired when Angular's route/location (eg URL hash) is changing.
     */
    function angular_locationChangeStart(event: ng.IAngularEvent, newRoute: string, oldRoute: string, $route: any): void {
        console.log("Location change, old Route: " + oldRoute);
        console.log("Location change, new Route: " + newRoute);
    };

    /**
     * Fired when an unhandled JavaScript exception occurs outside of Angular.
     */
    function window_onerror(message: any, uri: string, lineNumber: number, columnNumber?: number): void {
        var UiHelper: Services.UiHelper;
        console.error("Unhandled JS Exception", message, uri, lineNumber, columnNumber);

        window['lastError'] = message;
        try {
            UiHelper = angular.element(document.body).injector().get(Services.UiHelper.ID);
            UiHelper.toast.showLongBottom("Error0: " + message);
            UiHelper.progressIndicator.hide();
        }
        catch (ex) {
            console.warn("There was a problem alerting the user to an Angular error; falling back to a standard alert().", ex);
            UiHelper.toast.showLongBottom("Error1: " + message);
        }
    }

    /**
     * Fired when an exception occurs within Angular.
     * 
     * This includes uncaught exceptions in ng-click methods for example.
     */
    function angular_exceptionHandler(exception: Error, cause: string): void {
        var message = exception.message,
            UiHelper: Services.UiHelper;

        if (!cause) {
            cause = "[Unknown]";
        }

        console.error("AngularJS Exception", exception, cause);

        try {
            UiHelper = angular.element(document.body).injector().get(Services.UiHelper.ID);
            UiHelper.toast.showLongBottom("Exception:" + exception + "," + cause);
            UiHelper.progressIndicator.hide();
        }
        catch (ex) {
            console.warn("There was a problem alerting the user to an Angular error; falling back to a standard alert().", ex);
            UiHelper.toast.showLongBottom("Error2: " + exception + ", " + cause);
        }
    }

    //#endregion
}
