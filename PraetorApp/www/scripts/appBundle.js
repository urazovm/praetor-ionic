var PraetorApp;
(function (PraetorApp) {
    var Application;
    (function (Application) {
        var ngModule;
        var isShowingPinPrompt;
        function main() {
            var versionInfo;
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
            ngModule = angular.module("PraetorApp.Application", ["ui.router", "ionic", "ngMockE2E"]);
            ngModule.constant("isRipple", !!(window.parent && window.parent.ripple));
            ngModule.constant("isCordova", typeof (cordova) !== "undefined");
            ngModule.constant("isDebug", window.buildVars.debug);
            ngModule.constant("isChromeExtension", typeof (chrome) !== "undefined" && typeof (chrome.runtime) !== "undefined" && typeof (chrome.runtime.id) !== "undefined");
            ngModule.constant("versionInfo", versionInfo);
            ngModule.constant("apiVersion", "1.0");
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
                        scope.$watch('searchText', function (newValue, oldValue) {
                            if (newValue) {
                                var tempFilterText = '', filterTextTimeout;
                                scope.$watch('searchText', function (val) {
                                    if (filterTextTimeout)
                                        $timeout.cancel(filterTextTimeout);
                                    tempFilterText = val;
                                    filterTextTimeout = $timeout(function () {
                                        scope.filterText = tempFilterText;
                                    }, 1000);
                                });
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
            ngModule.run(angular_initialize);
            ngModule.config(angular_configure);
        }
        Application.main = main;
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
            if (el)
                el.parentNode.removeChild(el);
        }
        function construct(constructor, args) {
            function F() {
                return constructor.apply(this, args);
            }
            ;
            F.prototype = constructor.prototype;
            return new F();
        }
        function registerServices(ngModule) {
            _.each(PraetorApp.Services, function (Service) {
                if (Service.ID) {
                    if (typeof (Service.getFactory) === "function") {
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
        function registerFilters(ngModule) {
            _.each(PraetorApp.Filters, function (Filter) {
                if (Filter.ID && typeof (Filter.filter) === "function") {
                    console.log("Registering filter " + Filter.ID + "...");
                    ngModule.filter(Filter.ID, getFilterFactoryFunction(Filter.filter));
                }
            });
        }
        function registerControllers(ngModule) {
            _.each(PraetorApp.Controllers, function (Controller) {
                if (Controller.ID) {
                    console.log("Registering controller " + Controller.ID + "...");
                    ngModule.controller(Controller.ID, Controller);
                }
            });
        }
        function getElementDirectiveFactoryFunction(Directive) {
            var descriptor = {};
            descriptor.restrict = Directive["restrict"];
            descriptor.template = Directive["template"];
            descriptor.replace = Directive["replace"];
            descriptor.transclude = Directive["transclude"];
            descriptor.scope = Directive["scope"];
            if (descriptor.restrict !== "E") {
                console.warn("BaseElementDirectives are meant to restrict only to element types.");
            }
            descriptor.link = function (scope, instanceElement, instanceAttributes, controller, transclude) {
                var instance = new Directive(scope, instanceElement, instanceAttributes, controller, transclude);
                instance.render();
            };
            return function () { return descriptor; };
        }
        function getDirectiveFactoryParameters(Directive) {
            var params = [];
            if (Directive["$inject"]) {
                params = params.concat(Directive["$inject"]);
            }
            params.push(function () {
                return construct(Directive, arguments);
            });
            return params;
        }
        function getFilterFactoryFunction(fn) {
            return function () { return fn; };
        }
        function angular_initialize($rootScope, $location, $ionicViewService, $ionicPlatform, Utilities, UiHelper, Preferences, MockHttpApis, $state) {
            $ionicPlatform.ready(function () {
                ionicPlatform_ready($rootScope, $location, $ionicViewService, $ionicPlatform, UiHelper, Utilities, Preferences, $state);
            });
            MockHttpApis.mockHttpCalls(Preferences.enableMockHttpCalls);
        }
        ;
        function ionicPlatform_ready($rootScope, $location, $ionicViewService, $ionicPlatform, UiHelper, Utilities, Preferences, $state) {
            if (navigator.splashscreen)
                navigator.splashscreen.hide();
            if (window.StatusBar)
                window.StatusBar.overlaysWebView(false);
            var deregister = $ionicPlatform.registerBackButtonAction(function () {
                var nameRoute = $state.current.name;
                if (nameRoute.indexOf("app.spis.") === 0) {
                    $state.go('app.home');
                }
                else if (nameRoute.indexOf("app.home.cinnosti") === 0) {
                    $state.go('app.home.spisy');
                }
                else if (nameRoute.indexOf("app.home.nastaveni") === 0) {
                    $state.go('app.home.spisy');
                }
                else if (nameRoute.indexOf("app.home.spisy") === 0) {
                    var nav = navigator;
                    if (nav.app) {
                        nav.app.exitApp();
                    }
                    else if (nav.device) {
                        nav.device.exitApp();
                    }
                }
            }, 501);
            $rootScope.$on('$destroy', deregister);
            document.addEventListener("pause", _.bind(device_pause, null, Preferences));
            document.addEventListener("resume", _.bind(device_resume, null, $location, $ionicViewService, Utilities, UiHelper, Preferences));
            $rootScope.$on("$locationChangeStart", angular_locationChangeStart);
            device_resume($location, $ionicViewService, Utilities, UiHelper, Preferences);
        }
        function angular_configure($stateProvider, $urlRouterProvider, $provide, $httpProvider, $compileProvider, $ionicConfigProvider) {
            $ionicConfigProvider.tabs.position("bottom");
            $ionicConfigProvider.tabs.style("standard");
            $ionicConfigProvider.views.maxCache(0);
            $provide.decorator("$exceptionHandler", function ($delegate) {
                return function (exception, cause) {
                    angular_exceptionHandler(exception, cause);
                    $delegate(exception, cause);
                };
            });
            $compileProvider.aHrefSanitizationWhitelist(/^\s*(https?|ftp|tel|mailto|file|ghttps?|ms-appx|x-wmapp0|chrome-extension):/);
            $compileProvider.imgSrcSanitizationWhitelist(/^\s*(https?|ftp|file|ms-appx|x-wmapp0):|data:image\//);
            PraetorApp.RouteConfig.setupRoutes($stateProvider, $urlRouterProvider);
            if (localStorage.getItem("ENABLE_MOCK_HTTP_CALLS") === "true") {
                PraetorApp.Services.MockHttpApis.setupMockHttpDelay($provide);
            }
        }
        ;
        function device_pause(Preferences) {
            if (!isShowingPinPrompt) {
                Preferences.lastPausedAt = moment();
            }
        }
        function device_resume($location, $ionicViewService, Utilities, UiHelper, Preferences) {
            return;
        }
        function device_menuButton($rootScope) {
            $rootScope.$broadcast("menubutton");
        }
        function angular_locationChangeStart(event, newRoute, oldRoute, $route) {
            console.log("Location change, old Route: " + oldRoute);
            console.log("Location change, new Route: " + newRoute);
        }
        ;
        function window_onerror(message, uri, lineNumber, columnNumber) {
            var UiHelper;
            console.error("Unhandled JS Exception", message, uri, lineNumber, columnNumber);
            window['lastError'] = message;
            try {
                UiHelper = angular.element(document.body).injector().get(PraetorApp.Services.UiHelper.ID);
                UiHelper.toast.showLongBottom("Error0: " + message);
                UiHelper.progressIndicator.hide();
            }
            catch (ex) {
                console.warn("There was a problem alerting the user to an Angular error; falling back to a standard alert().", ex);
                UiHelper.toast.showLongBottom("Error1: " + message);
            }
        }
        function angular_exceptionHandler(exception, cause) {
            var message = exception.message, UiHelper;
            if (!cause) {
                cause = "[Unknown]";
            }
            console.error("AngularJS Exception", exception, cause);
            try {
                UiHelper = angular.element(document.body).injector().get(PraetorApp.Services.UiHelper.ID);
                UiHelper.toast.showLongBottom("Exception:" + exception + "," + cause);
                UiHelper.progressIndicator.hide();
            }
            catch (ex) {
                console.warn("There was a problem alerting the user to an Angular error; falling back to a standard alert().", ex);
                UiHelper.toast.showLongBottom("Error2: " + exception + ", " + cause);
            }
        }
    })(Application = PraetorApp.Application || (PraetorApp.Application = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var RouteConfig = (function () {
        function RouteConfig() {
        }
        RouteConfig.setupRoutes = function ($stateProvider, $urlRouterProvider) {
            $stateProvider.state("app", {
                url: "/app",
                abstract: true,
                templateUrl: "templates/app.html",
                controller: PraetorApp.Controllers.AppController.ID
            });
            $stateProvider.state("app.login", {
                url: "/login",
                views: {
                    "appContent": {
                        templateUrl: "templates/settings/login.html",
                        controller: PraetorApp.Controllers.LoginController.ID
                    }
                }
            });
            $stateProvider.state("app.home", {
                url: "/home",
                views: {
                    "appContent": {
                        templateUrl: "templates/home.html",
                        controller: PraetorApp.Controllers.HomeController.ID
                    }
                }
            });
            $stateProvider.state('app.home.spisy', {
                url: "/spisy",
                views: {
                    'tab-spisy': {
                        templateUrl: "templates/home/spisy.html",
                        controller: PraetorApp.Controllers.HomeSpisyController.ID
                    }
                }
            });
            $stateProvider.state('app.home.cinnosti', {
                url: "/cinnosti",
                views: {
                    'tab-cinnosti': {
                        templateUrl: "templates/home/cinnosti.html",
                        controller: PraetorApp.Controllers.HomeCinnostiController.ID
                    }
                }
            });
            $stateProvider.state('app.home.nastaveni', {
                url: "/nastaveni",
                views: {
                    'tab-nastaveni': {
                        templateUrl: "templates/home/nastaveni.html",
                        controller: PraetorApp.Controllers.HomeNastaveniController.ID
                    }
                }
            });
            $stateProvider.state("app.spis", {
                url: "/spis/{id}",
                views: {
                    "appContent": {
                        templateUrl: "templates/spis.html",
                        controller: PraetorApp.Controllers.SpisController.ID
                    }
                }
            });
            $stateProvider.state('app.spis.zakladniudaje', {
                url: "/zakladniudaje",
                views: {
                    'tab-zakladni-udaje': {
                        templateUrl: "templates/spis/zakladniudaje.html",
                    }
                }
            });
            $stateProvider.state('app.spis.dokumenty', {
                url: "/dokumenty",
                views: {
                    'tab-dokumenty': {
                        templateUrl: "templates/spis/dokumenty.html",
                    }
                }
            });
            $stateProvider.state('app.spis.subjekty', {
                url: "/subjekty",
                views: {
                    'tab-subjekty': {
                        templateUrl: "templates/spis/subjekty.html",
                    }
                }
            });
            $stateProvider.state("app.about", {
                url: "/settings/about",
                views: {
                    "appContent": {
                        templateUrl: "templates/settings/About.html",
                        controller: PraetorApp.Controllers.AboutController.ID
                    }
                }
            });
            if (!localStorage.getItem("PASSWORD"))
                $urlRouterProvider.otherwise('/app/login');
            else
                $urlRouterProvider.otherwise('/app/home');
        };
        return RouteConfig;
    })();
    PraetorApp.RouteConfig = RouteConfig;
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var BaseController = (function () {
            function BaseController(scope, ModelType) {
                var _this = this;
                this.scope = scope;
                this.viewModel = new ModelType();
                this.loadingCallCounter = 0;
                this.scope["isLoading"] = false;
                this.scope["showLoadingButton"] = true;
                this.scope["viewModel"] = this.viewModel;
                this.scope["controller"] = this;
                this.scope.$on("$ionicView.loaded", _.bind(this.view_loaded, this));
                this.scope.$on("$ionicView.enter", _.bind(this.view_enter, this));
                this.scope.$on("$ionicView.leave", _.bind(this.view_leave, this));
                this.scope.$on("$ionicView.beforeEnter", _.bind(this.view_beforeEnter, this));
                this.scope.$on("$ionicView.beforeLeave", _.bind(this.view_beforeLeave, this));
                this.scope.$on("$ionicView.afterEnter", _.bind(this.view_afterEnter, this));
                this.scope.$on("$ionicView.afterLeave", _.bind(this.view_afterLeave, this));
                this.scope.$on("$ionicView.unloaded", _.bind(this.view_unloaded, this));
                this.scope.$on("$destroy", _.bind(this.destroy, this));
                _.defer(function () {
                    _this.initialize();
                    _this.scope.$apply();
                });
            }
            BaseController.prototype.onBeforeLoading = function () {
                this.scope["isLoading"] = true;
                this.loadingCallCounter++;
            };
            BaseController.prototype.onAftterLoading = function () {
                this.loadingCallCounter--;
                if (this.loadingCallCounter <= 0) {
                    this.loadingCallCounter = 0;
                    this.scope["isLoading"] = false;
                }
            };
            BaseController.prototype.initialize = function () {
            };
            BaseController.prototype.view_loaded = function () {
            };
            BaseController.prototype.view_enter = function () {
            };
            BaseController.prototype.view_leave = function () {
            };
            BaseController.prototype.view_beforeEnter = function () {
            };
            BaseController.prototype.view_beforeLeave = function () {
            };
            BaseController.prototype.view_afterEnter = function () {
            };
            BaseController.prototype.view_afterLeave = function () {
            };
            BaseController.prototype.view_unloaded = function () {
            };
            BaseController.prototype.destroy = function () {
            };
            return BaseController;
        })();
        Controllers.BaseController = BaseController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var __extends = (this && this.__extends) || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
};
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var BaseDialogController = (function (_super) {
            __extends(BaseDialogController, _super);
            function BaseDialogController(scope, ViewModelType, dialogId) {
                _super.call(this, scope, ViewModelType);
                this.dialogId = dialogId;
                this.scope.$on("modal.shown", _.bind(this.modal_shown, this));
                this.scope.$on("modal.hidden", _.bind(this.modal_hidden, this));
            }
            BaseDialogController.prototype.modal_shown = function (ngEvent, instance) {
                if (this.dialogId !== instance.dialogId) {
                    return;
                }
                this.modalInstance = instance;
                this.data = instance.dialogData;
                this.dialog_shown();
            };
            BaseDialogController.prototype.modal_hidden = function (eventArgs, instance) {
                if (this.dialogId !== instance.dialogId) {
                    return;
                }
                this.dialog_hidden();
            };
            BaseDialogController.prototype.getData = function () {
                return this.data;
            };
            BaseDialogController.prototype.close = function (result) {
                this.modalInstance.result = result;
                this.modalInstance.hide();
                this.modalInstance.remove();
            };
            BaseDialogController.prototype.dialog_shown = function () {
            };
            BaseDialogController.prototype.dialog_hidden = function () {
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
        var AppController = (function (_super) {
            __extends(AppController, _super);
            function AppController($scope, $location, $http, Utilities, UiHelper, Preferences) {
                _super.call(this, $scope, PraetorApp.ViewModels.AppViewModel);
                this.$location = $location;
                this.$http = $http;
                this.Utilities = Utilities;
                this.UiHelper = UiHelper;
                this.Preferences = Preferences;
            }
            Object.defineProperty(AppController, "$inject", {
                get: function () {
                    return ["$scope", "$location", "$http", PraetorApp.Services.Utilities.ID, PraetorApp.Services.UiHelper.ID, PraetorApp.Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            AppController.ID = "AppController";
            return AppController;
        })(Controllers.BaseController);
        Controllers.AppController = AppController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var DateTools = (function () {
            function DateTools() {
            }
            DateTools.GetDateInJsonFormat = function (date) {
                return moment(date).format("YYYY-MM-DD");
            };
            DateTools.GetDateTimeInJsonFormat = function (date) {
                return moment(date).format("YYYY-MM-DDTHH:mm:ss");
            };
            DateTools.GetDateTimeFromJsonFormat = function (date) {
                return moment(date).toDate();
            };
            DateTools.FormatAsHourDurationFromMinutes = function (duration) {
                return this.FormatAsHourDuration(moment.duration({ minutes: duration }));
            };
            DateTools.FormatAsHourDuration = function (duration) {
                var hours = Math.floor(duration.asHours());
                var minutes = duration.minutes();
                return hours + ":" + (minutes < 10 ? "0" : "") + minutes;
            };
            return DateTools;
        })();
        Controllers.DateTools = DateTools;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var HomeController = (function (_super) {
            __extends(HomeController, _super);
            function HomeController($scope, $location, $http, Utilities, UiHelper, Preferences, SpisyUtilities) {
                _super.call(this, $scope, PraetorApp.ViewModels.AppViewModel);
                this.$location = $location;
                this.$http = $http;
                this.Utilities = Utilities;
                this.UiHelper = UiHelper;
                this.Preferences = Preferences;
                this.SpisyUtilities = SpisyUtilities;
                this.SpisyUtilities.Synchronize();
            }
            Object.defineProperty(HomeController, "$inject", {
                get: function () {
                    return ["$scope", "$location", "$http", PraetorApp.Services.Utilities.ID, PraetorApp.Services.UiHelper.ID, PraetorApp.Services.Preferences.ID, PraetorApp.Services.SpisyUtilities.ID];
                },
                enumerable: true,
                configurable: true
            });
            HomeController.ID = "HomeController";
            return HomeController;
        })(Controllers.BaseController);
        Controllers.HomeController = HomeController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var LoginController = (function (_super) {
            __extends(LoginController, _super);
            function LoginController($scope, $location, $http, Utilities, UiHelper, Preferences, Praetor, Hash) {
                _super.call(this, $scope, PraetorApp.ViewModels.LoginViewModel);
                this.$location = $location;
                this.$http = $http;
                this.Utilities = Utilities;
                this.UiHelper = UiHelper;
                this.Preferences = Preferences;
                this.Praetor = Praetor;
                this.Hash = Hash;
                this.viewModel.server = Preferences.serverUrl;
                this.viewModel.username = Preferences.username;
                $scope.$on("http.unauthorized", _.bind(this.http_unauthorized, this));
                $scope.$on("http.forbidden", _.bind(this.http_forbidden, this));
                $scope.$on("http.notFound", _.bind(this.http_notFound, this));
            }
            Object.defineProperty(LoginController, "$inject", {
                get: function () {
                    return ["$scope", "$location", "$http", PraetorApp.Services.Utilities.ID, PraetorApp.Services.UiHelper.ID, PraetorApp.Services.Preferences.ID, PraetorApp.Services.PraetorService.ID, PraetorApp.Services.HashUtilities.ID];
                },
                enumerable: true,
                configurable: true
            });
            LoginController.prototype.http_unauthorized = function () {
                this.Preferences.username = null;
                this.Preferences.sessionId = null;
                this.UiHelper.toast.showLongBottom("You do not have a token (401); please login.");
            };
            LoginController.prototype.http_forbidden = function () {
                this.Preferences.username = null;
                this.Preferences.sessionId = null;
                this.UiHelper.toast.showLongBottom("Your token has expired (403); please login again.");
            };
            LoginController.prototype.http_notFound = function () {
                this.UiHelper.toast.showLongBottom("Server not available (404); please contact your administrator.");
            };
            LoginController.prototype.login = function () {
                var _this = this;
                if (!this.viewModel.server) {
                    this.UiHelper.alert("Zadejte adresu serveru");
                    return;
                }
                if (!this.viewModel.username) {
                    this.UiHelper.alert("Zadejte přihlašovací jméno");
                    return;
                }
                if (!this.viewModel.password) {
                    this.UiHelper.alert("Zadejte heslo");
                    return;
                }
                this.Praetor.login(this.viewModel.server, this.viewModel.username, this.Hash.md5(this.viewModel.password)).then(function (data) {
                    if (data.success) {
                        _this.Preferences.serverUrl = _this.viewModel.server;
                        _this.Preferences.username = _this.viewModel.username;
                        _this.Preferences.password = _this.Hash.md5(_this.viewModel.password);
                        _this.Preferences.sessionId = data.sessionId;
                        _this.$location.path("/app/home");
                        _this.$location.replace();
                    }
                    else {
                        _this.UiHelper.alert(data.message);
                    }
                })['finally'](function () {
                });
            };
            LoginController.ID = "LoginController";
            return LoginController;
        })(Controllers.BaseController);
        Controllers.LoginController = LoginController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var SpisController = (function (_super) {
            __extends(SpisController, _super);
            function SpisController($scope, $location, $http, $state, $stateParams, Utilities, UiHelper, Preferences, PraetorService, FileService) {
                _super.call(this, $scope, PraetorApp.ViewModels.SpisViewModel);
                this.$location = $location;
                this.$http = $http;
                this.Utilities = Utilities;
                this.UiHelper = UiHelper;
                this.Preferences = Preferences;
                this.PraetorService = PraetorService;
                this.FileService = FileService;
                this.viewModel.id_spis = $stateParams.id;
                this.$state = $state;
                this.reloadData();
            }
            Object.defineProperty(SpisController, "$inject", {
                get: function () {
                    return ["$scope", "$location", "$http", "$state", "$stateParams", PraetorApp.Services.Utilities.ID, PraetorApp.Services.UiHelper.ID, PraetorApp.Services.Preferences.ID, PraetorApp.Services.PraetorService.ID, PraetorApp.Services.FileUtilities.ID];
                },
                enumerable: true,
                configurable: true
            });
            SpisController.prototype.loadSpis = function () {
                var _this = this;
                this.onBeforeLoading();
                var request = {};
                request.id_Spis = this.viewModel.id_spis;
                this.PraetorService.loadSpisZakladniUdaje(request).then(function (response) {
                    _this.viewModel.spis = response.spis;
                    _this.viewModel.subjekty = response.subjekty;
                    _this.onAftterLoading();
                });
            };
            SpisController.prototype.loadDokumenty = function () {
                var _this = this;
                this.onBeforeLoading();
                var request = {};
                request.id_Spis = this.viewModel.id_spis;
                this.PraetorService.loadSpisDokumenty(request).then(function (response) {
                    _this.viewModel.dokumenty = response.dokumenty;
                    _this.onAftterLoading();
                });
            };
            SpisController.prototype.openDokument = function (dokument) {
                var _this = this;
                var request = {};
                request.id_file = dokument.id;
                this.PraetorService.getFileToken(request).then(function (response) {
                    _this.FileService.openFile(response.token, dokument.nazev + '.' + dokument.pripona);
                });
            };
            SpisController.prototype.CreateCinnost = function () {
                var _this = this;
                var id_Spis = this.viewModel.id_spis;
                var params = new Controllers.CinnostParams(id_Spis);
                var options = new PraetorApp.Models.DialogOptions(params);
                this.UiHelper.showDialog(this.UiHelper.DialogIds.Cinnost, options).then(function (result) {
                    if (result && result.Success)
                        _this.UiHelper.toast.show("Činnost byla uložena.", "short", "center");
                }, function (ex) {
                    _this.UiHelper.alert("Činnost se nepodařilo uložit.");
                });
            };
            SpisController.prototype.reloadData = function () {
                this.loadSpis();
                this.loadDokumenty();
            };
            SpisController.ID = "SpisController";
            return SpisController;
        })(Controllers.BaseController);
        Controllers.SpisController = SpisController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var Void = (function () {
            function Void() {
            }
            return Void;
        })();
        Controllers.Void = Void;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var CinnostController = (function (_super) {
            __extends(CinnostController, _super);
            function CinnostController($scope, PraetorService, Utilities, Preferences, UiHelper) {
                _super.call(this, $scope, PraetorApp.ViewModels.Ekonomika.CinnostViewModel, UiHelper.DialogIds.Cinnost);
                this.PraetorService = PraetorService;
                this.Utilities = Utilities;
                this.Preferences = Preferences;
                this.UiHelper = UiHelper;
                this.scope.$on("modal.shown", _.bind(this.Shown, this));
            }
            Object.defineProperty(CinnostController, "$inject", {
                get: function () {
                    return ["$scope", PraetorApp.Services.PraetorService.ID, PraetorApp.Services.Utilities.ID, PraetorApp.Services.Preferences.ID, PraetorApp.Services.UiHelper.ID];
                },
                enumerable: true,
                configurable: true
            });
            CinnostController.prototype.LoadData = function () {
                var _this = this;
                var request = {};
                var params = this.getData();
                request.id_Spis = params.Id_Spis;
                this.PraetorService.loadCinnost(request).then(function (response) {
                    _this.viewModel.Data = response.cinnost;
                    _this.viewModel.Aktivity = _.sortBy(response.aktivity, function (x) { return x.ord; });
                    if (params.Date)
                        _this.viewModel.Datum = params.Date;
                    else
                        _this.viewModel.Datum = Controllers.DateTools.GetDateTimeFromJsonFormat(response.cinnost.datum);
                    _this.viewModel.Aktivita = _.find(response.aktivity, function (x) { return x.id_Aktivita == response.cinnost.id_Aktivita; });
                    _this.AktivitaChanged();
                }, function (ex) {
                    _this.close(new Controllers.CinnostResult(false));
                });
            };
            CinnostController.prototype.SaveData = function () {
                var _this = this;
                var request = {};
                this.viewModel.Data.datum = Controllers.DateTools.GetDateInJsonFormat(this.viewModel.Datum);
                this.viewModel.Data.id_Aktivita = this.viewModel.Aktivita.id_Aktivita;
                request.cinnost = this.viewModel.Data;
                this.PraetorService.SaveCinnost(request).then(function (response) {
                    _this.close(new Controllers.CinnostResult(true));
                });
            };
            CinnostController.prototype.AktivitaChanged = function () {
                var aktivita = this.viewModel.Aktivita;
                var popis = this.viewModel.Data.popis;
                if (!popis || _.any(this.viewModel.Aktivity, function (x) { return x.popis == popis; }))
                    this.viewModel.Data.popis = aktivita.popis;
            };
            CinnostController.prototype.Cancel = function () {
                this.close(new Controllers.CinnostResult(false));
            };
            CinnostController.prototype.Shown = function () {
                this.LoadData();
            };
            CinnostController.ID = "CinnostController";
            return CinnostController;
        })(Controllers.BaseDialogController);
        Controllers.CinnostController = CinnostController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var CinnostParams = (function () {
            function CinnostParams(id_Spis, date) {
                this.Id_Spis = id_Spis;
                this.Date = date;
            }
            return CinnostParams;
        })();
        Controllers.CinnostParams = CinnostParams;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var CinnostResult = (function () {
            function CinnostResult(success) {
                this.Success = success;
            }
            return CinnostResult;
        })();
        Controllers.CinnostResult = CinnostResult;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var HomeCinnostiController = (function (_super) {
            __extends(HomeCinnostiController, _super);
            function HomeCinnostiController($scope, praetorService, uiHelper) {
                _super.call(this, $scope, PraetorApp.ViewModels.Home.CinnostiViewModel);
                this.PraetorService = praetorService;
                this.UiHelper = uiHelper;
                var now = new Date();
                this.DateSince = this.AddDays(this.GetDate(now), 1);
                this.DateUntil = this.DateSince;
                var request = {};
                request.cinnostiUntil = Controllers.DateTools.GetDateInJsonFormat(this.DateUntil);
                request.cinnostiSince = Controllers.DateTools.GetDateInJsonFormat(this.AddDays(this.DateSince, -7));
                this.viewModel.PrehledCinnosti = new PraetorApp.ViewModels.PrehledCinnostiViewModel();
                this.Cinnosti = [];
                this.LoadData(request);
            }
            Object.defineProperty(HomeCinnostiController, "$inject", {
                get: function () {
                    return ["$scope", PraetorApp.Services.PraetorService.ID, PraetorApp.Services.UiHelper.ID];
                },
                enumerable: true,
                configurable: true
            });
            HomeCinnostiController.prototype.AddDays = function (date, number) {
                return new Date(date.getFullYear(), date.getMonth(), date.getDate() + number, date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds());
            };
            HomeCinnostiController.prototype.GetDate = function (date) {
                return new Date(date.getFullYear(), date.getMonth(), date.getDate());
            };
            HomeCinnostiController.prototype.reloadData = function () {
                var request = {};
                request.cinnostiUntil = Controllers.DateTools.GetDateInJsonFormat(this.DateUntil);
                request.cinnostiSince = Controllers.DateTools.GetDateInJsonFormat(this.DateSince);
                this.Cinnosti = [];
                this.LoadData(request);
            };
            HomeCinnostiController.prototype.RebuildList = function () {
                var list = new Array();
                var dateUntil = moment(this.DateUntil);
                var dateSince = dateUntil.clone().add(-1, "days");
                while (dateSince >= moment(this.DateSince)) {
                    var datumEntry = new PraetorApp.ViewModels.Ekonomika.CinnostDateGroup();
                    datumEntry.datum = dateSince.clone().toDate();
                    datumEntry.datumString = dateSince.format("dddd D. M. YYYY");
                    datumEntry.cinnosti = _.select(this.Cinnosti, function (x) { return moment(x.datum) >= dateSince && moment(x.datum) < dateUntil; });
                    datumEntry.cas = _.sum(datumEntry.cinnosti, function (x) { return x.cas; });
                    datumEntry.casString = Controllers.DateTools.FormatAsHourDurationFromMinutes(datumEntry.cas);
                    list.push(datumEntry);
                    dateUntil = dateSince.clone();
                    dateSince = dateSince.add(-1, "days");
                }
                this.viewModel.PrehledCinnosti.Cinnosti = list;
            };
            HomeCinnostiController.prototype.LoadData = function (request) {
                var _this = this;
                this.onBeforeLoading();
                this.PraetorService.loadCinnosti(request).then(function (response) {
                    _this.Cinnosti = _this.Cinnosti.concat(_.map(response.cinnosti, function (x) {
                        var result = new PraetorApp.ViewModels.Ekonomika.CinnostPrehledEntry();
                        result.cas = x.cas;
                        result.casString = Controllers.DateTools.FormatAsHourDurationFromMinutes(x.cas);
                        result.datum = Controllers.DateTools.GetDateTimeFromJsonFormat(x.datum);
                        result.id_TimeSheet = x.id_Cinnost;
                        result.popis = x.popis;
                        result.predmetSpisu = x.predmetSpisu;
                        result.spisovaZnacka = x.spisovaZnacka;
                        result.hlavniKlient = x.hlavniKlient;
                        return result;
                    }));
                    var requestSince = Controllers.DateTools.GetDateTimeFromJsonFormat(request.cinnostiSince);
                    if (requestSince < _this.DateSince)
                        _this.DateSince = requestSince;
                    var requestUntil = Controllers.DateTools.GetDateTimeFromJsonFormat(request.cinnostiUntil);
                    if (requestUntil > _this.DateUntil)
                        _this.DateUntil = requestUntil;
                    _this.RebuildList();
                    _this.onAftterLoading();
                });
            };
            HomeCinnostiController.prototype.LoadPreviousWeek = function () {
                var request = {};
                request.cinnostiUntil = Controllers.DateTools.GetDateInJsonFormat(this.DateSince);
                request.cinnostiSince = Controllers.DateTools.GetDateInJsonFormat(this.AddDays(this.DateSince, -7));
                this.LoadData(request);
            };
            HomeCinnostiController.prototype.OpenCinnost = function (cinnost) {
            };
            HomeCinnostiController.prototype.CreateDatedCinnost = function (date) {
                var _this = this;
                this.UiHelper.showDialog(this.UiHelper.DialogIds.VyberSpisu, new PraetorApp.Models.DialogOptions()).then(function (result) {
                    if (!result || !result.Success)
                        return;
                    var id_Spis = result.Id_Spis;
                    var params = new Controllers.CinnostParams(id_Spis, date);
                    var options = new PraetorApp.Models.DialogOptions(params);
                    _this.UiHelper.showDialog(_this.UiHelper.DialogIds.Cinnost, options).then(function (result) {
                        if (result && result.Success)
                            _this.UiHelper.toast.show("Činnost byla uložena.", "short", "center");
                        _this.reloadData();
                    }, function (ex) {
                        _this.UiHelper.alert("Činnost se nepodařilo uložit.");
                    });
                });
            };
            HomeCinnostiController.prototype.CreateCinnost = function () {
                var _this = this;
                this.UiHelper.showDialog(this.UiHelper.DialogIds.VyberSpisu, new PraetorApp.Models.DialogOptions()).then(function (result) {
                    if (!result || !result.Success)
                        return;
                    var id_Spis = result.Id_Spis;
                    var params = new Controllers.CinnostParams(id_Spis);
                    var options = new PraetorApp.Models.DialogOptions(params);
                    _this.UiHelper.showDialog(_this.UiHelper.DialogIds.Cinnost, options).then(function (result) {
                        if (result && result.Success)
                            _this.UiHelper.toast.show("Činnost byla uložena.", "short", "center");
                        _this.reloadData();
                    }, function (ex) {
                        _this.UiHelper.alert("Činnost se nepodařilo uložit.");
                    });
                });
            };
            HomeCinnostiController.ID = "HomeCinnostiController";
            return HomeCinnostiController;
        })(Controllers.BaseController);
        Controllers.HomeCinnostiController = HomeCinnostiController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var HomeNastaveniController = (function (_super) {
            __extends(HomeNastaveniController, _super);
            function HomeNastaveniController($scope, $state, Preferences) {
                _super.call(this, $scope, PraetorApp.ViewModels.Home.NastaveniViewModel);
                this.$state = $state;
                this.Preferences = Preferences;
            }
            Object.defineProperty(HomeNastaveniController, "$inject", {
                get: function () {
                    return ["$scope", "$state", PraetorApp.Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            HomeNastaveniController.prototype.logout = function () {
                this.Preferences.password = null;
                this.$state.go("app.login");
            };
            HomeNastaveniController.ID = "HomeNastaveniController";
            return HomeNastaveniController;
        })(Controllers.BaseController);
        Controllers.HomeNastaveniController = HomeNastaveniController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var HomeSpisyController = (function (_super) {
            __extends(HomeSpisyController, _super);
            function HomeSpisyController($scope, $location, $http, $state, $timeout, Utilities, UiHelper, Preferences, SpisyUtilities, PraetorService) {
                _super.call(this, $scope, PraetorApp.ViewModels.Home.SpisyViewModel);
                this.$location = $location;
                this.$http = $http;
                this.Utilities = Utilities;
                this.UiHelper = UiHelper;
                this.Preferences = Preferences;
                this.$state = $state;
                this.SpisyUtilities = SpisyUtilities;
                this.SpisyUtilities.register(this);
                this.PraetorService = PraetorService;
                this.viewModel.PrehledSpisu = new PraetorApp.ViewModels.PrehledSpisuViewModel();
                this.LoadPosledniSpisy();
                this.viewModel.PrehledSpisu.vsechnySpisy = this.SpisyUtilities.Spisy;
            }
            Object.defineProperty(HomeSpisyController, "$inject", {
                get: function () {
                    return ["$scope", "$location", "$http", "$state", "$timeout", PraetorApp.Services.Utilities.ID, PraetorApp.Services.UiHelper.ID, PraetorApp.Services.Preferences.ID, PraetorApp.Services.SpisyUtilities.ID, PraetorApp.Services.PraetorService.ID];
                },
                enumerable: true,
                configurable: true
            });
            HomeSpisyController.prototype.LoadPosledniSpisy = function () {
                var _this = this;
                this.onBeforeLoading();
                var request = {};
                request.pocet = 20;
                this.PraetorService.LoadPosledniSpisy(request).then(function (response) {
                    _this.viewModel.PrehledSpisu.posledniSpisy = response.posledniSpisy;
                    _this.onAftterLoading();
                });
            };
            HomeSpisyController.prototype.openSpis = function (spis) {
                var _this = this;
                setTimeout(function () {
                    _this.$state.go('app.spis.zakladniudaje', { id: spis.id_Spis });
                    _this.scope.$apply();
                }, 100);
            };
            HomeSpisyController.prototype.changeDataSource = function () {
                this.viewModel.PrehledSpisu.vsechnySpisy = this.SpisyUtilities.Spisy;
                this.onAftterLoading();
            };
            HomeSpisyController.prototype.reloadData = function () {
                this.onBeforeLoading();
                this.SpisyUtilities.Synchronize();
            };
            HomeSpisyController.ID = "HomeSpisyController";
            return HomeSpisyController;
        })(Controllers.BaseController);
        Controllers.HomeSpisyController = HomeSpisyController;
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
            AboutController.prototype.view_beforeEnter = function () {
                _super.prototype.view_beforeEnter.call(this);
                this.viewModel.logoClickCount = 0;
                this.viewModel.applicationName = this.versionInfo.applicationName;
                this.viewModel.versionString = this.Utilities.format("{0}.{1}.{2}", this.versionInfo.majorVersion, this.versionInfo.minorVersion, this.versionInfo.buildVersion);
                this.viewModel.timestamp = this.versionInfo.buildTimestamp;
            };
            AboutController.prototype.logo_click = function () {
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
        var VyberSpisuController = (function (_super) {
            __extends(VyberSpisuController, _super);
            function VyberSpisuController($scope, PraetorService, Utilities, Preferences, UiHelper, SpisyUtilities) {
                _super.call(this, $scope, PraetorApp.ViewModels.Spis.VyberSpisuViewModel, UiHelper.DialogIds.VyberSpisu);
                this.PraetorService = PraetorService;
                this.Utilities = Utilities;
                this.Preferences = Preferences;
                this.UiHelper = UiHelper;
                this.scope.$on("modal.shown", _.bind(this.Shown, this));
                this.SpisyUtilities = SpisyUtilities;
                this.SpisyUtilities.register(this);
                this.viewModel.PrehledSpisu = new PraetorApp.ViewModels.PrehledSpisuViewModel();
                this.LoadPosledniSpisy();
                this.viewModel.PrehledSpisu.vsechnySpisy = this.SpisyUtilities.Spisy;
            }
            Object.defineProperty(VyberSpisuController, "$inject", {
                get: function () {
                    return ["$scope", PraetorApp.Services.PraetorService.ID, PraetorApp.Services.Utilities.ID, PraetorApp.Services.Preferences.ID, PraetorApp.Services.UiHelper.ID, PraetorApp.Services.SpisyUtilities.ID];
                },
                enumerable: true,
                configurable: true
            });
            VyberSpisuController.prototype.LoadPosledniSpisy = function () {
                var _this = this;
                var request = {};
                request.pocet = 20;
                this.PraetorService.LoadPosledniSpisy(request).then(function (response) {
                    _this.viewModel.PrehledSpisu.posledniSpisy = response.posledniSpisy;
                });
            };
            VyberSpisuController.prototype.SelectSpis = function (spis) {
                this.close(new Controllers.VyberSpisuResult(true, spis.id_Spis));
            };
            VyberSpisuController.prototype.Cancel = function () {
                this.close(new Controllers.VyberSpisuResult(false, undefined));
            };
            VyberSpisuController.prototype.Shown = function () {
            };
            VyberSpisuController.prototype.changeDataSource = function () {
                this.viewModel.PrehledSpisu.vsechnySpisy = this.SpisyUtilities.Spisy;
            };
            VyberSpisuController.ID = "VyberSpisuController";
            return VyberSpisuController;
        })(Controllers.BaseDialogController);
        Controllers.VyberSpisuController = VyberSpisuController;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Controllers;
    (function (Controllers) {
        var VyberSpisuResult = (function () {
            function VyberSpisuResult(success, id_Spis) {
                this.Success = success;
                this.Id_Spis = id_Spis;
            }
            return VyberSpisuResult;
        })();
        Controllers.VyberSpisuResult = VyberSpisuResult;
    })(Controllers = PraetorApp.Controllers || (PraetorApp.Controllers = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Directives;
    (function (Directives) {
        var IconPanelDirective = (function (_super) {
            __extends(IconPanelDirective, _super);
            function IconPanelDirective() {
                _super.apply(this, arguments);
            }
            IconPanelDirective.prototype.initialize = function () {
                var _this = this;
                this._rootElement = this.element[0];
                this.scope.$watch(function () { return _this.scope.icon; }, _.bind(this.icon_listener, this));
                this.scope.$watch(function () { return _this.scope.iconSize; }, _.bind(this.iconSize_listener, this));
                this.scope.$watch(function () { return _this.scope.text; }, _.bind(this.text_listener, this));
                if (this.scope.name) {
                    this.scope.$emit("icon-panel." + this.scope.name + ".created", this);
                }
                else {
                    this.scope.$emit("icon-panel.created", this);
                }
            };
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
            IconPanelDirective.prototype.getName = function () {
                return this.scope.name;
            };
            IconPanelDirective.prototype.getIcon = function () {
                return this._currentIcon;
            };
            IconPanelDirective.prototype.setIcon = function (icon) {
                if (this._currentIcon) {
                    this._iconElement.removeClass(this._currentIcon);
                }
                this._currentIcon = icon;
                this._iconElement.addClass(icon);
            };
            IconPanelDirective.prototype.getIconSize = function () {
                return parseInt(this.scope.iconSize, 10);
            };
            IconPanelDirective.prototype.setIconSize = function (size) {
                this.scope.iconSize = (size ? size + "" : "0");
                this._iconElement.css("font-size", this.scope.iconSize + "pt");
            };
            IconPanelDirective.prototype.getText = function () {
                return this.scope.text;
            };
            IconPanelDirective.prototype.setText = function (text) {
                this._textContainer.text(text);
            };
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
        var OnLoadDirective = (function () {
            function OnLoadDirective($parse) {
                this.restrict = "A";
                this.$parse = $parse;
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
                var fn = this.$parse(attributes["onLoad"]);
                element.on("load", function (event) {
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
        var HighLightFilter = (function () {
            function HighLightFilter() {
            }
            HighLightFilter.filter = function (input, termsToHighlight) {
                if (!input)
                    return input;
                var reg = new RegExp(termsToHighlight, 'gi');
                var ret = input.replace(reg, function (str) { return '<span class="highlight">' + str + '</span>'; });
                return ret;
            };
            HighLightFilter.ID = "HighLightFilter";
            return HighLightFilter;
        })();
        Filters.HighLightFilter = HighLightFilter;
    })(Filters = PraetorApp.Filters || (PraetorApp.Filters = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Filters;
    (function (Filters) {
        var PrehledSpisuFilter = (function () {
            function PrehledSpisuFilter() {
            }
            PrehledSpisuFilter.filter = function (input, search) {
                if (input == null) {
                    return [];
                }
                if (search == null || search == "") {
                    return [];
                }
                var out = [];
                input.filter(function (value, index, array) {
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
            };
            PrehledSpisuFilter.ID = "PrehledSpisuFilter";
            return PrehledSpisuFilter;
        })();
        Filters.PrehledSpisuFilter = PrehledSpisuFilter;
    })(Filters = PraetorApp.Filters || (PraetorApp.Filters = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Filters;
    (function (Filters) {
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
            function FileUtilities($q, Utilities, Preferences) {
                this.$q = $q;
                this.Utilities = Utilities;
                this.Preferences = Preferences;
            }
            Object.defineProperty(FileUtilities, "$inject", {
                get: function () {
                    return ["$q", Services.Utilities.ID, Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            FileUtilities.prototype.openFile = function (token, name) {
                return this.openUrl('http://' + this.Preferences.serverUrl + '/praetorapi/getFile/' + token + '/' + encodeURIComponent(name));
            };
            FileUtilities.prototype.openUrl = function (path) {
                console.log("opening document: " + path);
                var q = this.$q.defer();
                window.handleDocumentWithURL(function () {
                    console.log('success');
                    q.resolve(true);
                }, function (error) {
                    console.log('failure');
                    if (error == 53) {
                        console.log('No app that handles this file type.');
                    }
                    q.resolve(false);
                }, path);
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
                return window.hex_md5("Praetor_salt" + data);
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
            HttpInterceptor.getFactory = function () {
                var factory;
                factory = function ($rootScope, $injector, $q, Preferences, Utilities, UiHelper, apiVersion) {
                    var instance = new HttpInterceptor($rootScope, $injector, $q, apiVersion);
                    return {
                        request: _.bind(instance.request, instance),
                        response: _.bind(instance.response, instance),
                        requestError: _.bind(instance.requestError, instance),
                        responseError: _.bind(instance.responseError, instance)
                    };
                };
                factory.$inject = ["$rootScope", "$injector", "$q", "apiVersion"];
                return factory;
            };
            HttpInterceptor.prototype.request = function (config) {
                var baseUrl;
                if (this.Utilities.endsWith(config.url, ".html")) {
                    return config;
                }
                console.log("HttpInterceptor.request: " + config.url, [config]);
                this.handleRequestStart(config);
                if (this.Utilities.startsWith(config.url, "~")) {
                    config.headers["X-API-Version"] = this.apiVersion;
                    config.headers["Content-Type"] = "application/json";
                    config.headers["Accept"] = "application/json";
                    if (this.Preferences.username && this.Preferences.sessionId) {
                        config.headers["Authorization"] = this.getAuthorizationHeader(this.Preferences.username, this.Preferences.sessionId);
                    }
                    if (this.Preferences.apiUrl && this.Preferences.apiUrl) {
                        baseUrl = this.Preferences.apiUrl;
                        config.url = config.url.substring(1);
                        if (this.Utilities.endsWith(baseUrl, "/") && this.Utilities.startsWith(config.url, "/")) {
                            config.url = config.url.substr(1, config.url.length - 1);
                        }
                        if (!this.Utilities.endsWith(baseUrl, "/") && !this.Utilities.startsWith(config.url, "/")) {
                            config.url = "/" + config.url;
                        }
                        config.url = baseUrl + config.url;
                    }
                    else {
                        throw new Error("An HTTP call cannot be made because a data source was not selected.");
                    }
                }
                return config;
            };
            HttpInterceptor.prototype.response = function (httpResponse) {
                var config;
                config = httpResponse.config;
                if (this.Utilities.endsWith(config.url, ".html")) {
                    return httpResponse;
                }
                console.log("HttpInterceptor.response: " + httpResponse.config.url, [httpResponse]);
                this.handleResponseEnd(config);
                return httpResponse;
            };
            HttpInterceptor.prototype.requestError = function (rejection) {
                var httpResponse, exception, config;
                console.error("HttpInterceptor.requestError", [rejection]);
                if (rejection instanceof Error) {
                    exception = rejection;
                    this.handleFatalError();
                }
                else {
                    httpResponse = rejection;
                    config = httpResponse.config;
                    if (config) {
                        this.handleResponseEnd(config);
                    }
                }
                return this.$q.reject(rejection);
            };
            HttpInterceptor.prototype.responseError = function (responseOrError) {
                var httpResponse, exception, config;
                console.log("HttpInterceptor.responseError", [httpResponse]);
                if (responseOrError instanceof Error) {
                    exception = responseOrError;
                    this.handleFatalError();
                }
                else {
                    httpResponse = responseOrError;
                    config = httpResponse.config;
                    if (this.Utilities.endsWith(config.url, ".html")) {
                        return this.$q.reject(responseOrError);
                    }
                    this.handleResponseEnd(config);
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
            HttpInterceptor.prototype.handleRequestStart = function (config) {
                if (typeof (config.blocking) === "undefined") {
                    config.blocking = true;
                }
                if (typeof (config.showSpinner) === "undefined") {
                    config.showSpinner = true;
                }
                this.requestsInProgress += 1;
                if (config.blocking) {
                    this.blockingRequestsInProgress += 1;
                    if (this.blockingRequestsInProgress > 1) {
                        this.UiHelper.progressIndicator.hide();
                    }
                    if (config.blockingText) {
                        this.UiHelper.progressIndicator.showSimpleWithLabel(true, config.blockingText);
                    }
                    else {
                        this.UiHelper.progressIndicator.showSimple(true);
                    }
                }
                if (config.showSpinner) {
                    this.spinnerRequestsInProgress += 1;
                    if (!NProgress.isStarted()) {
                        NProgress.start();
                    }
                }
            };
            HttpInterceptor.prototype.handleFatalError = function () {
                this.requestsInProgress = 0;
                this.blockingRequestsInProgress = 0;
                this.spinnerRequestsInProgress = 0;
                NProgress.done();
                this.UiHelper.progressIndicator.hide();
            };
            HttpInterceptor.prototype.handleResponseEnd = function (config) {
                this.requestsInProgress -= 1;
                if (config.blocking) {
                    this.blockingRequestsInProgress -= 1;
                }
                if (config.showSpinner) {
                    this.spinnerRequestsInProgress -= 1;
                }
                if (config.blocking && this.blockingRequestsInProgress === 0) {
                    this.UiHelper.progressIndicator.hide();
                }
                if (config.showSpinner && this.spinnerRequestsInProgress === 0) {
                    NProgress.done();
                }
                else {
                    NProgress.inc();
                }
            };
            HttpInterceptor.prototype.getAuthorizationHeader = function (userName, password) {
                var headerValue;
                headerValue = this.Utilities.format("{0}:{1}", userName, password);
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
            MockHttpApis.setupMockHttpDelay = function ($provide) {
                var maxDelay = 3000, minDelay = 1000;
                $provide.decorator("$httpBackend", function ($delegate) {
                    var proxy = function (method, url, data, callback, headers) {
                        var interceptor = function () {
                            var _this = this, _arguments = arguments, delay;
                            if (url.indexOf(".html") > -1) {
                                callback.apply(_this, _arguments);
                            }
                            else {
                                delay = Math.floor(Math.random() * (maxDelay - minDelay + 1) + minDelay);
                                setTimeout(function () {
                                    callback.apply(_this, _arguments);
                                }, delay);
                            }
                        };
                        return $delegate.call(this, method, url, data, interceptor, headers);
                    };
                    for (var key in $delegate) {
                        proxy[key] = $delegate[key];
                    }
                    return proxy;
                });
            };
            MockHttpApis.prototype.mockHttpCalls = function (mock) {
                this.$httpBackend.whenGET(/.*\.html/).passThrough();
                if (mock) {
                }
                else {
                    this.$httpBackend.whenDELETE(/.*/).passThrough();
                    this.$httpBackend.whenGET(/.*/).passThrough();
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
            MockPlatformApis.prototype.clipboard_copy = function (text, onSuccess, onFail) {
                var confirmed = confirm("The following text was requested for copy to the clipboard:\n\n" + text);
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
                    document["oncopy"] = function (event) {
                        event.clipboardData.setData("Text", text);
                        event.preventDefault();
                    };
                    document.execCommand("Copy");
                    document["oncopy"] = undefined;
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
            MockPlatformApis.prototype.notification_alert = function (message, alertCallback, title, buttonName) {
                var buttons = [];
                title = title || "Alert";
                buttonName = buttonName || "OK";
                buttons.push({ text: buttonName });
                message = message.replace(/\n/g, "<br/>");
                this.$ionicPopup.show({ title: title, template: message, buttons: buttons }).then(function () {
                    if (alertCallback) {
                        alertCallback();
                    }
                });
            };
            MockPlatformApis.prototype.notification_confirm = function (message, confirmCallback, title, buttonLabels) {
                var buttons = [];
                title = title || "Confirm";
                buttonLabels = buttonLabels || ["Yes", "No"];
                buttonLabels.forEach(function (value, index) {
                    buttons.push({
                        text: value,
                        onTap: function (e) {
                            return index + 1;
                        }
                    });
                });
                message = message.replace(/\n/g, "<br/>");
                this.$ionicPopup.show({ title: title, template: message, buttons: buttons }).then(function (result) {
                    if (confirmCallback) {
                        confirmCallback(result);
                    }
                });
            };
            MockPlatformApis.prototype.notification_prompt = function (message, promptCallback, title, buttonLabels, defaultText) {
                var buttons = [], template;
                message = message.replace(/\n/g, "<br/>");
                template = this.Utilities.format("<p>{0}</p><input type='text' id='notification_prompt_input' style='border: solid 1px #3e3e3e;'/>", message);
                title = title || "Prompt";
                buttonLabels = buttonLabels || ["OK", "Cancel"];
                buttonLabels.forEach(function (value, index) {
                    buttons.push({
                        text: value,
                        onTap: function (e) {
                            var result, input;
                            input = document.getElementById("notification_prompt_input");
                            result = {
                                buttonIndex: index + 1,
                                input1: input.value
                            };
                            return result;
                        }
                    });
                });
                if (defaultText) {
                    _.defer(function () {
                        var input;
                        input = document.getElementById("notification_prompt_input");
                        input.value = defaultText;
                    });
                }
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
            MockPlatformApis.prototype.progressIndicator_hide = function () {
                var _this = this;
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
        var PraetorService = (function () {
            function PraetorService($q, Utilities, $http, $location, $ionicLoading, Preferences, UiHelper) {
                this.$q = $q;
                this.$http = $http;
                this.Utilities = Utilities;
                this.Preferences = Preferences;
                this.$location = $location;
                this.UiHelper = UiHelper;
                this.$ionicLoading = $ionicLoading;
            }
            Object.defineProperty(PraetorService, "$inject", {
                get: function () {
                    return ["$q", Services.Utilities.ID, "$http", "$location", "$ionicLoading", Services.Preferences.ID, Services.UiHelper.ID];
                },
                enumerable: true,
                configurable: true
            });
            PraetorService.prototype.loadHome = function (request) {
                var q = this.$q.defer();
                return q.promise;
            };
            PraetorService.prototype.login = function (server, username, password) {
                var _this = this;
                var q = this.$q.defer();
                var data = { username: username, password: password };
                var configure = {};
                configure.timeout = 4000;
                configure.headers = { 'Content-Type': 'application/json' };
                this.$ionicLoading.show({
                    template: '<i class="icon ion-load-c"></i>'
                });
                this.$http.post('http://' + server + '/praetorapi/login', data, configure)
                    .then(function (response) {
                    _this.$ionicLoading.hide();
                    q.resolve(response.data);
                })['catch'](function (e) {
                    _this.$ionicLoading.hide();
                    if (e.status == 0) {
                        q.resolve({ success: false, message: "Nepodařilo se připojit k serveru: " + server, sessionId: "" });
                    }
                    else {
                        q.resolve({ success: false, message: "Error " + e.status + "|" + e.message, sessionId: "" });
                    }
                });
                return q.promise;
            };
            PraetorService.prototype.getData = function (action, data, options) {
                var _this = this;
                if (!options) {
                    options = new GetDataOptions();
                    options.ShowMessage = true;
                    options.ShowProgress = false;
                }
                if (options.ShowProgress) {
                    this.$ionicLoading.show({
                        template: '<i class="icon ion-load-c"></i>'
                    });
                }
                var q = this.$q.defer();
                var server = this.Preferences.serverUrl;
                data.username = this.Preferences.username;
                data.password = this.Preferences.password;
                data.sessionId = this.Preferences.sessionId;
                if (data.username == undefined || data.password == undefined || server == undefined) {
                    this.$location.path("/app/login");
                    this.$location.replace();
                }
                var configure = {};
                configure.timeout = 10000;
                configure.headers = { 'Content-Type': 'application/json' };
                var promise = this.$http.post('http://' + server + '/praetorapi/' + action, data, configure)
                    .then(function (response) {
                    if (options.ShowProgress) {
                        _this.$ionicLoading.hide();
                    }
                    var responseData = response.data;
                    if (responseData.success) {
                        q.resolve(response.data);
                    }
                    else {
                        if (options.ShowMessage)
                            _this.UiHelper.alert(responseData.message);
                        q.reject(responseData);
                    }
                }, function (e) {
                    if (options.ShowProgress)
                        _this.$ionicLoading.hide();
                    window.lastError = e;
                    var qReturn = _this.$q.when();
                    console.log(e.status + " " + e.statusText);
                    qReturn.then(function () {
                        q.reject(e);
                    });
                });
                return q.promise;
            };
            PraetorService.prototype.loadCinnosti = function (request) {
                return this.getData("LoadCinnosti", request);
            };
            PraetorService.prototype.loadCinnost = function (request) {
                return this.getData("LoadCinnost", request);
            };
            PraetorService.prototype.SaveCinnost = function (request) {
                return this.getData("SaveCinnost", request);
            };
            PraetorService.prototype.LoadPosledniSpisy = function (request) {
                return this.getData("LoadPosledniSpisy", request);
            };
            PraetorService.prototype.getFileToken = function (request) {
                return this.getData("getfiletoken", request);
            };
            PraetorService.prototype.loadSpisDokumenty = function (request) {
                return this.getData("loadspisdokumenty", request);
            };
            PraetorService.prototype.loadSpisZakladniUdaje = function (request) {
                return this.getData("loadspiszakladniudaje", request);
            };
            PraetorService.ID = "PraetorService";
            return PraetorService;
        })();
        Services.PraetorService = PraetorService;
        var GetDataOptions = (function () {
            function GetDataOptions() {
            }
            return GetDataOptions;
        })();
    })(Services = PraetorApp.Services || (PraetorApp.Services = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Services;
    (function (Services) {
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
            Object.defineProperty(Preferences.prototype, "apiUrl", {
                get: function () {
                    return "sample-app.justin-credible.net/api";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "spisy", {
                get: function () {
                    var jsonData = localStorage.getItem(Preferences.SPISY_LOCAL_STORAGE);
                    if (jsonData == undefined)
                        return null;
                    return JSON.parse(jsonData);
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.SPISY_LOCAL_STORAGE);
                    }
                    else {
                        var jsonData = JSON.stringify(value);
                        localStorage.setItem(Preferences.SPISY_LOCAL_STORAGE, jsonData);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "serverUrl", {
                get: function () {
                    return localStorage.getItem(Preferences.SERVER_URL);
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.SERVER_URL);
                    }
                    else {
                        localStorage.setItem(Preferences.SERVER_URL, value);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "password", {
                get: function () {
                    return localStorage.getItem(Preferences.PASSWORD);
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.PASSWORD);
                    }
                    else {
                        localStorage.setItem(Preferences.PASSWORD, value);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "username", {
                get: function () {
                    return localStorage.getItem(Preferences.USERNAME);
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.USERNAME);
                    }
                    else {
                        localStorage.setItem(Preferences.USERNAME, value);
                    }
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Preferences.prototype, "sessionId", {
                get: function () {
                    return localStorage.getItem(Preferences.SESSION_ID);
                },
                set: function (value) {
                    if (value == null) {
                        localStorage.removeItem(Preferences.SESSION_ID);
                    }
                    else {
                        localStorage.setItem(Preferences.SESSION_ID, value);
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
            Preferences.ID = "Preferences";
            Preferences.USERNAME = "USER_ID";
            Preferences.PASSWORD = "PASSWORD";
            Preferences.SERVER_URL = "SERVER_URL";
            Preferences.SESSION_ID = "SESSION_ID";
            Preferences.SPISY_LOCAL_STORAGE = "SPISY_LOCAL_STORAGE";
            Preferences.REQUIRE_PIN_THRESHOLD = "REQUIRE_PIN_THRESHOLD";
            Preferences.LAST_PAUSED_AT = "LAST_PAUSED_AT";
            Preferences.HAS_COMPLETED_ONBOARDING = "HAS_COMPLETED_ONBOARDING";
            Preferences.PIN = "PIN";
            Preferences.ENABLE_MOCK_HTTP_CALLS = "ENABLE_MOCK_HTTP_CALLS";
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
        var SpisyUtilities = (function () {
            function SpisyUtilities($q, $timeout, Utilities, praetorService, Preferences) {
                this.$q = $q;
                this.Utilities = Utilities;
                this._spisy = null;
                this.$timeout = $timeout;
                this.praetorService = praetorService;
                this.Preferences = Preferences;
                this.registerController = [];
            }
            Object.defineProperty(SpisyUtilities, "$inject", {
                get: function () {
                    return ["$q", "$timeout", Services.Utilities.ID, Services.PraetorService.ID, Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(SpisyUtilities.prototype, "Spisy", {
                get: function () {
                    return this._spisy;
                },
                set: function (value) {
                    this._spisy = value;
                },
                enumerable: true,
                configurable: true
            });
            SpisyUtilities.prototype.Synchronize = function () {
                var self = this;
                this.Preferences.spisy = null;
                if (this.Preferences.spisy != null) {
                    this.Spisy = this.Preferences.spisy;
                    self.onChangedDataSource();
                }
                if (this.Preferences.spisy == null) {
                    this.loadSpisy();
                }
            };
            SpisyUtilities.prototype.loadSpisy = function () {
                var self = this;
                var request = {};
                this.praetorService.getData("LoadChangedSpisy", request).then(function (response) {
                    if (response.success) {
                        self.Preferences.spisy = response.changedSpisy;
                        self.Spisy = response.changedSpisy;
                        self.onChangedDataSource();
                    }
                });
            };
            SpisyUtilities.prototype.onChangedDataSource = function () {
                _.each(this.registerController, function (controller) {
                    controller.changeDataSource.apply(controller);
                });
            };
            SpisyUtilities.prototype.register = function (controller) {
                this.registerController.push(controller);
            };
            SpisyUtilities.ID = "SpisyUtilities";
            return SpisyUtilities;
        })();
        Services.SpisyUtilities = SpisyUtilities;
    })(Services = PraetorApp.Services || (PraetorApp.Services = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var Services;
    (function (Services) {
        var UiHelper = (function () {
            function UiHelper($rootScope, $q, $http, $ionicModal, MockPlatformApis, Utilities, Preferences) {
                this.DialogIds = {
                    Cinnost: "CINNOST_DIALOG",
                    VyberSpisu: "VYBER_SPISU_DIALOG"
                };
                this.isPinEntryOpen = false;
                this.$rootScope = $rootScope;
                this.$q = $q;
                this.$http = $http;
                this.$ionicModal = $ionicModal;
                this.Utilities = Utilities;
                this.Preferences = Preferences;
                this.MockPlatformApis = MockPlatformApis;
            }
            Object.defineProperty(UiHelper, "$inject", {
                get: function () {
                    return ["$rootScope", "$q", "$http", "$ionicModal", Services.MockPlatformApis.ID, Services.Utilities.ID, Services.Preferences.ID];
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(UiHelper.prototype, "toast", {
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
            UiHelper.prototype.alert = function (message, title, buttonName) {
                var q = this.$q.defer(), callback, notificationPlugin;
                title = title || "Alert";
                buttonName = buttonName || "OK";
                callback = function () {
                    q.resolve();
                };
                if (navigator.notification) {
                    notificationPlugin = navigator.notification;
                }
                else {
                    notificationPlugin = this.MockPlatformApis.getNotificationPlugin();
                }
                notificationPlugin.alert(message, callback, title, buttonName);
                return q.promise;
            };
            UiHelper.prototype.confirm = function (message, title, buttonLabels) {
                var q = this.$q.defer(), callback, notificationPlugin;
                title = title || "Confirm";
                buttonLabels = buttonLabels || ["Yes", "No"];
                callback = function (choice) {
                    var buttonText;
                    buttonText = buttonLabels[choice - 1];
                    q.resolve(buttonText);
                };
                if (navigator.notification) {
                    notificationPlugin = navigator.notification;
                }
                else {
                    notificationPlugin = this.MockPlatformApis.getNotificationPlugin();
                }
                notificationPlugin.confirm(message, callback, title, buttonLabels);
                return q.promise;
            };
            UiHelper.prototype.prompt = function (message, title, buttonLabels, defaultText) {
                var q = this.$q.defer(), callback, notificationPlugin;
                title = title || "Prompt";
                buttonLabels = buttonLabels || ["OK", "Cancel"];
                callback = function (promptResult) {
                    var promiseResult, buttonText;
                    buttonText = buttonLabels[promptResult.buttonIndex - 1];
                    promiseResult = new PraetorApp.Models.KeyValuePair(buttonText, promptResult.input1);
                    q.resolve(promiseResult);
                };
                if (navigator.notification) {
                    notificationPlugin = navigator.notification;
                }
                else {
                    notificationPlugin = this.MockPlatformApis.getNotificationPlugin();
                }
                notificationPlugin.prompt(message, callback, title, buttonLabels, defaultText);
                return q.promise;
            };
            UiHelper.prototype.showDialog = function (dialogId, options) {
                var q = this.$q.defer(), template, creationArgs, creationPromise;
                if (!options) {
                    options = new PraetorApp.Models.DialogOptions();
                }
                if (UiHelper.openDialogIds == null) {
                    UiHelper.openDialogIds = [];
                }
                if (_.contains(UiHelper.openDialogIds, dialogId)) {
                    this.$q.reject(UiHelper.DIALOG_ALREADY_OPEN);
                    return q.promise;
                }
                template = UiHelper.dialogTemplateMap[dialogId];
                if (!template) {
                    this.$q.reject(UiHelper.DIALOG_ID_NOT_REGISTERED);
                    console.warn(this.Utilities.format("A call was made to openDialog with dialogId '{0}', but a template is not registered with that ID in the dialogTemplateMap.", dialogId));
                    return q.promise;
                }
                UiHelper.openDialogIds.push(dialogId);
                creationArgs = {
                    dialogId: dialogId,
                    dialogData: options.dialogData,
                    backdropClickToClose: options.backdropClickToClose,
                    hardwareBackButtonClose: options.hardwareBackButtonClose
                };
                creationPromise = this.$ionicModal.fromTemplateUrl(template, creationArgs);
                creationPromise.then(function (modal) {
                    var backdrop;
                    modal.show();
                    if (!options.showBackground) {
                        backdrop = document.querySelector("div.modal-backdrop");
                        backdrop.style.backgroundColor = "rgba(0, 0, 0, 1)";
                    }
                    modal.scope.$on("modal.hidden", function (eventArgs, instance) {
                        if (dialogId !== instance.dialogId) {
                            return;
                        }
                        if (!options.showBackground) {
                            backdrop.style.backgroundColor = "";
                        }
                        UiHelper.openDialogIds = _.without(UiHelper.openDialogIds, dialogId);
                        q.resolve(modal.result);
                    });
                });
                return q.promise;
            };
            UiHelper.ID = "UiHelper";
            UiHelper.DIALOG_ALREADY_OPEN = "DIALOG_ALREADY_OPEN";
            UiHelper.DIALOG_ID_NOT_REGISTERED = "DIALOG_ID_NOT_REGISTERED";
            UiHelper.dialogTemplateMap = {
                "CINNOST_DIALOG": "templates/ekonomika/cinnost.html",
                "VYBER_SPISU_DIALOG": "templates/spis/vyber-spisu.html"
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
                get: function () {
                    return this._isRipple;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Utilities.prototype, "isCordova", {
                get: function () {
                    return this._isCordova;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Utilities.prototype, "isDebugMode", {
                get: function () {
                    return this._isDebug;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Utilities.prototype, "isChromeExtension", {
                get: function () {
                    return this._isChromeExtension;
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Utilities.prototype, "isAndroid", {
                get: function () {
                    return typeof (device) !== "undefined" && device.platform === "Android";
                },
                enumerable: true,
                configurable: true
            });
            Object.defineProperty(Utilities.prototype, "isIos", {
                get: function () {
                    return typeof (device) !== "undefined" && device.platform === "iOS";
                },
                enumerable: true,
                configurable: true
            });
            Utilities.prototype.isWindowsPhone8 = function () {
                return typeof (device) !== "undefined" && device.platform === "WP8";
            };
            Utilities.prototype.isWindows8 = function () {
                return typeof (device) !== "undefined" && device.platform === "Windows8";
            };
            Utilities.prototype.platform = function () {
                if (typeof (device) === "undefined") {
                    return typeof (window.ripple) !== "undefined" ? "Ripple" : "Unknown";
                }
                else {
                    return device.platform;
                }
            };
            Utilities.prototype.endsWith = function (str, suffix) {
                if (str == null || str === "") {
                    return false;
                }
                if (suffix == null || suffix === "") {
                    return true;
                }
                return (str.substr(str.length - suffix.length) === suffix);
            };
            Utilities.prototype.startsWith = function (str, prefix) {
                if (str == null || str === "") {
                    return false;
                }
                if (prefix == null || prefix === "") {
                    return true;
                }
                return (str.substr(0, prefix.length) === prefix);
            };
            Utilities.prototype.toTitleCase = function (str) {
                if (!str) {
                    return "";
                }
                return str.replace(/\w\S*/g, function (txt) { return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase(); });
            };
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
            Utilities.prototype.getValue = function (object, propertyString) {
                var properties, property, i;
                if (!object) {
                    return null;
                }
                if (!propertyString) {
                    return null;
                }
                if (object[propertyString]) {
                    return object[propertyString];
                }
                properties = propertyString.split(".");
                for (i = 0; i < properties.length; i += 1) {
                    property = properties[i];
                    object = object[property];
                    if (object == null) {
                        return null;
                    }
                }
                return object;
            };
            Utilities.prototype.setValue = function (object, propertyString, value, instantiateObjects) {
                var properties, property, i;
                if (!object) {
                    return;
                }
                if (!propertyString) {
                    return;
                }
                if (typeof (instantiateObjects) === "undefined") {
                    instantiateObjects = true;
                }
                properties = propertyString.split(".");
                for (i = 0; i < properties.length; i += 1) {
                    property = properties[i];
                    if (properties.length - 1 === i) {
                        object[property] = value;
                    }
                    else {
                        if (object[property]) {
                            object = object[property];
                        }
                        else if (instantiateObjects) {
                            object[property] = {};
                            object = object[property];
                        }
                        else {
                            return;
                        }
                    }
                }
            };
            Utilities.prototype.getFunction = function (scopeOrPropertyString, propertyString, inferContext) {
                var scope, fn, contextPropertyString, context;
                if (inferContext == null) {
                    inferContext = true;
                }
                if (typeof (scopeOrPropertyString) === "string") {
                    scope = window;
                    propertyString = scopeOrPropertyString;
                }
                else {
                    scope = scopeOrPropertyString;
                }
                fn = this.getValue(scope, propertyString);
                if (!fn) {
                    return null;
                }
                if (inferContext) {
                    if (propertyString.indexOf(".") > -1) {
                        contextPropertyString = propertyString.substr(0, propertyString.lastIndexOf("."));
                        context = this.getValue(scope, contextPropertyString);
                    }
                    else {
                        context = scope;
                    }
                    fn = _.bind(fn, context);
                }
                return fn;
            };
            Utilities.prototype.getRandomNumber = function (min, max) {
                return Math.floor(Math.random() * (max - min + 1) + min);
            };
            Utilities.prototype.generateGuid = function () {
                var guid, hexDigit, j;
                guid = "";
                for (j = 0; j < 32; j++) {
                    if (j === 8 || j === 12 || j === 16 || j === 20) {
                        guid = guid + "-";
                    }
                    hexDigit = Math.floor(Math.random() * 16).toString(16).toUpperCase();
                    guid = guid + hexDigit;
                }
                return guid;
            };
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
        var AppViewModel = (function () {
            function AppViewModel() {
            }
            return AppViewModel;
        })();
        ViewModels.AppViewModel = AppViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
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
        var HomeViewModel = (function () {
            function HomeViewModel() {
            }
            return HomeViewModel;
        })();
        ViewModels.HomeViewModel = HomeViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var LoginViewModel = (function () {
            function LoginViewModel() {
            }
            return LoginViewModel;
        })();
        ViewModels.LoginViewModel = LoginViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var PrehledCinnostiViewModel = (function () {
            function PrehledCinnostiViewModel() {
            }
            return PrehledCinnostiViewModel;
        })();
        ViewModels.PrehledCinnostiViewModel = PrehledCinnostiViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var PrehledSpisuViewModel = (function () {
            function PrehledSpisuViewModel() {
            }
            return PrehledSpisuViewModel;
        })();
        ViewModels.PrehledSpisuViewModel = PrehledSpisuViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var SpisViewModel = (function () {
            function SpisViewModel() {
            }
            return SpisViewModel;
        })();
        ViewModels.SpisViewModel = SpisViewModel;
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var Ekonomika;
        (function (Ekonomika) {
            var CinnostDateGroup = (function () {
                function CinnostDateGroup() {
                }
                return CinnostDateGroup;
            })();
            Ekonomika.CinnostDateGroup = CinnostDateGroup;
        })(Ekonomika = ViewModels.Ekonomika || (ViewModels.Ekonomika = {}));
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var Ekonomika;
        (function (Ekonomika) {
            var CinnostPrehledEntry = (function () {
                function CinnostPrehledEntry() {
                }
                return CinnostPrehledEntry;
            })();
            Ekonomika.CinnostPrehledEntry = CinnostPrehledEntry;
        })(Ekonomika = ViewModels.Ekonomika || (ViewModels.Ekonomika = {}));
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var Ekonomika;
        (function (Ekonomika) {
            var CinnostViewModel = (function () {
                function CinnostViewModel() {
                }
                return CinnostViewModel;
            })();
            Ekonomika.CinnostViewModel = CinnostViewModel;
        })(Ekonomika = ViewModels.Ekonomika || (ViewModels.Ekonomika = {}));
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var Home;
        (function (Home) {
            var CinnostiViewModel = (function () {
                function CinnostiViewModel() {
                }
                return CinnostiViewModel;
            })();
            Home.CinnostiViewModel = CinnostiViewModel;
        })(Home = ViewModels.Home || (ViewModels.Home = {}));
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var Home;
        (function (Home) {
            var NastaveniViewModel = (function () {
                function NastaveniViewModel() {
                }
                return NastaveniViewModel;
            })();
            Home.NastaveniViewModel = NastaveniViewModel;
        })(Home = ViewModels.Home || (ViewModels.Home = {}));
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var Home;
        (function (Home) {
            var SpisyViewModel = (function () {
                function SpisyViewModel() {
                }
                return SpisyViewModel;
            })();
            Home.SpisyViewModel = SpisyViewModel;
        })(Home = ViewModels.Home || (ViewModels.Home = {}));
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
        var Spis;
        (function (Spis) {
            var DokumentyViewModel = (function () {
                function DokumentyViewModel() {
                }
                return DokumentyViewModel;
            })();
            Spis.DokumentyViewModel = DokumentyViewModel;
        })(Spis = ViewModels.Spis || (ViewModels.Spis = {}));
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var Spis;
        (function (Spis) {
            var VyberSpisuViewModel = (function () {
                function VyberSpisuViewModel() {
                }
                return VyberSpisuViewModel;
            })();
            Spis.VyberSpisuViewModel = VyberSpisuViewModel;
        })(Spis = ViewModels.Spis || (ViewModels.Spis = {}));
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
var PraetorApp;
(function (PraetorApp) {
    var ViewModels;
    (function (ViewModels) {
        var Spis;
        (function (Spis) {
            var ZakladniUdajeViewModel = (function () {
                function ZakladniUdajeViewModel() {
                }
                return ZakladniUdajeViewModel;
            })();
            Spis.ZakladniUdajeViewModel = ZakladniUdajeViewModel;
        })(Spis = ViewModels.Spis || (ViewModels.Spis = {}));
    })(ViewModels = PraetorApp.ViewModels || (PraetorApp.ViewModels = {}));
})(PraetorApp || (PraetorApp = {}));
//# sourceMappingURL=appBundle.js.map