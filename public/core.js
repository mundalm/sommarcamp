//Define module
var sommarcampApp = angular.module('sommarcampApp', ['ngRoute', 'timer', 'ui.bootstrap', 'placeholderShim']).run(
	function($rootScope){
		$rootScope.RHE = function(data, expectsObject) {
			if(data === undefined || ( data.data === undefined && expectsObject)) {				
				return true;
			} else {
				return false;
			}
		};	
	});

sommarcampApp.filter('startFrom', function() {
    return function(input, start) {
        start = +start; //parse to int
        return input.slice(start);
    }
});

//Inject factory in module
sommarcampApp.factory('MessageFactory', MessageFactory);
sommarcampApp.factory('registrationFactory',registrationFactory);

//Inject core controllers to "always visible" parts of app
sommarcampApp.controller('headerController', headerController);
sommarcampApp.controller('MessageController', MessageController);

//Inject needed "modules" to controllers
MessageController.$inject = ['$scope', 'MessageFactory', '$log', '$timeout', '$location', '$anchorScroll'];
headerController.$inject = ['$scope', '$location', '$modal', '$log', '$rootScope'];

registrationController.$inject = ['$scope', '$location', 'registrationFactory', 'MessageFactory', '$log', '$rootScope', '$modal', '$route'];
participantModalController.$inject = ['$scope', '$modalInstance','registrationFactory', 'MessageFactory', '$log', '$rootScope'];
adminController.$inject = ['$scope', '$location', 'registrationFactory', 'MessageFactory', '$log', '$rootScope', '$modal', '$route', '$window'];





