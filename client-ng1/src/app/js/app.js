(function () {

  'use strict';
  /*global componentHandler */

  angular.module('cesar-utils', ['ngSanitize']);
  angular.module('cesar-articles', ['cesar-templates']);
  angular.module('cesar-menu', ['cesar-templates']);
  angular.module('cesar-home', ['cesar-templates']);
  angular.module('cesar-members', ['cesar-templates']);
  angular.module('cesar-sessions', ['cesar-templates']);
  angular.module('cesar-services', []);
  angular.module('cesar-security', ['ngCookies']);

  angular.module('cesar', [
    'ui.router',
    'ngSanitize',
    'ngCookies',
    'cesar-templates',
    'cesar-articles',
    'cesar-menu',
    'cesar-home',
    'cesar-members',
    'cesar-sessions',
    'cesar-services',
    'cesar-utils',
    'hc.marked',
    'cesar-security',
    'pascalprecht.translate'
  ]);

  angular.module('cesar').constant('LANGUAGES', {
    fr: 'fr_FR',
    us: 'us_US'
  });

  angular.module('cesar').config(function ($stateProvider, $urlRouterProvider, $locationProvider, $translateProvider, USER_ROLES, LANGUAGES) {

    // Initialize angular-translate
    $translateProvider.useStaticFilesLoader({
      prefix: 'i18n/',
      suffix: '.json'
    });

    $translateProvider.preferredLanguage(LANGUAGES.fr);
    $translateProvider.useCookieStorage();
    $translateProvider.useSanitizeValueStrategy('sanitize');

    $locationProvider.html5Mode(true);

    $urlRouterProvider.otherwise('/home');

    // State use to list members
    function stateMember(url, type) {
      return {
        url: '/' + url,
        authorizedRoles: [USER_ROLES.all],
        resolve: {
          members: function (MemberService) {
            return MemberService.getAll(type).then(function (response) {
              return response.data;
            });
          }
        },
        views: {
          main: {
            templateUrl: 'views/members/' + url + '.html',
            controller: 'MembersCtrl',
            controllerAs: 'ctrl'
          }
        }
      };
    }

    // State use to list sessions
    function stateSessions(url) {
      return {
        url: '/' + url,
        authorizedRoles: [USER_ROLES.all],
        views: {
          main: {
            templateUrl: 'views/sessions/' + url + '.html',
            controller: 'SessionsCtrl',
            controllerAs: 'ctrl'
          }
        },
        data: {
          type: url
        }
      };
    }

    // State old editions
    function stateOldEdition(url, year) {
      return {
        url: '/' + url,
        authorizedRoles: [USER_ROLES.all],
        views: {
          main: {
            templateUrl: 'views/sessions/talks.html',
            controller: 'SessionsClosedCtrl',
            controllerAs: 'ctrl'
          }
        },
        data: {
          year: year
        }
      };
    }

    function stateSimplePage(url, template, roles, ctrlName) {
      var state = {
        url: '/' + url,
        authorizedRoles: roles ? roles : [USER_ROLES.all],
        views: {
          main: {
            templateUrl: template
          }
        }
      };
      if (ctrlName) {
        state.views.main.controller = ctrlName;
        state.views.main.controllerAs = 'ctrl';
      }
      return state;
    }

    //Router definition
    $stateProvider
      .state('error', {
        url: '/error',
        params: {
          error: {}
        },
        views: {
          main: {
            templateUrl: 'views/error.html',
            controller: function ($scope, $stateParams) {
              $scope.error = $stateParams.error;
            }
          }
        }
      })

      //Home Page
      .state('home', stateSimplePage('home', 'views/home.html'))

      //News
      .state('news', {
        url: '/article/:id',
        resolve: {
          articles: function (ArticleService) {
            return ArticleService.getAll().then(function (response) {
              return response.data;
            });
          }
        },
        views: {
          main: {
            templateUrl: 'views/info/news.html',
            controller: 'ArticleCtrl',
            controllerAs: 'ctrl'
          }
        }
      })
      //News
      .state('articles', {
        url: '/articles',
        authorizedRoles: [USER_ROLES.all],
        resolve: {
          articles: function (ArticleService) {
            return ArticleService.getAll().then(function (response) {
              return response.data;
            });
          }
        },
        views: {
          main: {
            templateUrl: 'views/info/articles.html',
            controller: function(articles){
              var ctrl = this;
              ctrl.articles = articles;
            },
            controllerAs: 'ctrl'
          }
        }
      })

      //Program
      .state('planning', stateSimplePage('planning', 'views/sessions/planning.html'))
      .state('talks', stateSessions('talks', 'talk'))
      .state('lightningtalks', stateSessions('lightningtalks', 'lightningtalks'))
      .state('session', {
        url: '/session/:type/:id',
        authorizedRoles: [USER_ROLES.all],
        resolve: {
          session: function (SessionService, $stateParams) {
            return SessionService.getById($stateParams.id).then(function (response) {
              return response.data;
            });
          }
        },
        views: {
          main: {
            templateUrl: 'views/sessions/session.html',
            controller: 'SessionCtrl',
            controllerAs: 'ctrl'
          }
        }
      })

      //Participants
      .state('speakers', stateMember('speakers', 'speaker'))
      .state('sponsors', stateMember('sponsors', 'sponsor'))
      .state('staff', stateMember('staff', 'staff'))
      .state('member', {
        url: '/member/:type/:id',
        authorizedRoles: [USER_ROLES.all],
        resolve: {
          member: function (MemberService, $stateParams) {
            return MemberService.getById($stateParams.id).then(function (response) {
              return response.data;
            });
          }
        },
        views: {
          main: {
            templateUrl: 'views/members/member.html',
            controller: 'MemberCtrl',
            controllerAs: 'ctrl'
          }
        }
      })

      //Infos
      .state('multimedia', stateSimplePage('multimedia', 'views/info/multimedia.html'))
      .state('conduite', stateSimplePage('conduite', 'views/info/conduite.html'))
      .state('faq', stateSimplePage('faq', 'views/info/faq.html'))
      .state('venir', stateSimplePage('venir', 'views/info/venir.html'))
      .state('mixit15', stateOldEdition('mixit15', 2015))
      .state('mixit14', stateOldEdition('mixit15', 2014))
      .state('mixit13', stateOldEdition('mixit15', 2013))
      .state('mixit12', stateOldEdition('mixit15', 2012))

      //Connected
      .state('favoris', stateSimplePage('favoris', 'views/user/favoris.html', [USER_ROLES.member, USER_ROLES.admin, USER_ROLES.speaker]))
      .state('account', stateSimplePage('account', 'views/user/account.html', [USER_ROLES.member, USER_ROLES.admin, USER_ROLES.speaker]))
      .state('createuseraccount', stateSimplePage('createuseraccount', 'views/user/create-user_account.html', [USER_ROLES.all], 'SecurityCtrl'))
      .state('logout', stateSimplePage('home', 'views/home.html'))
      .state('authent', stateSimplePage('authent', 'views/user/login.html', [USER_ROLES.all], 'SecurityCtrl'));
  });

  /**
   * Event handlers for errors (internal, security...)
   */
  angular.module('cesar').run(function ($rootScope, $state, $location, $timeout, AuthenticationService) {

    //Error are catched to redirect user on error page
    $rootScope.$on('$cesarError', function (event, response) {
      $state.go('error', {error: response});
    });

    //When a ui-router state change we watch if user is authorized
    $rootScope.$on('$stateChangeStart', function (event, next) {
      if (next.name === 'logout' || next.name === 'createuseraccount') {
        AuthenticationService.logout();
      }
      else {
        AuthenticationService.valid(next.authorizedRoles, next.name === 'createaccount' || next.name === 'account');
      }
    });

    // Call when the the client is confirmed
    $rootScope.$on('event:auth-loginConfirmed', function (event, next) {
      if (!$rootScope.userConnected || (next && next.oauthId !== $rootScope.userConnected.oauthId)) {
        $rootScope.userConnected = next;
      }

      if ($location.path() === '/authent') {
        var search = $location.search();
        if (search.redirect !== undefined) {
          $location.path(search.redirect).search('redirect', null).replace();
        }
        else {
          $location.path('/').replace();
        }
      }
    });

    //// Call when the 401 response is returned by the server
    $rootScope.$on('event:auth-loginRequired', function (event, next) {
      if ($location.path() !== '/authent') {
        var redirect = $location.path();
        $location.path('/authent').search('redirect', redirect).replace();
      }
      else {
        if (next && next.data && next.data.type) {
          switch (next.data.type) {
            case 'BAD_CREDENTIALS':
              $rootScope.errorMessage = 'Le mot de passe est incorrect';
              break;
            case   'REQUIRED_ARGS':
              $rootScope.errorMessage = 'Le login et le mot de passe son obligatoires';
              break;
            case   'USER_NOT_FOUND':
              $rootScope.errorMessage = 'Ce login n\'existe pas. Veuillez créer un compte pour vous connecter';
              break;
            default:
              $rootScope.errorMessage = 'Erreur lors de l\authentification';
          }

        }
      }
    });

    // Call when the user logs out
    $rootScope.$on('event:auth-loginCancelled', function () {
      delete  $rootScope.userConnected;
    });


    //Refresh material design lite
    $rootScope.$on('$viewContentLoaded', function () {
      $timeout(function () {
        componentHandler.upgradeAllRegistered();
      });
    });

  });

})();
