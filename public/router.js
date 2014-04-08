sommarcampApp.config(function($routeProvider) {
	$routeProvider
		.when('/',
			{
				controller: 'registrationController',
				templateUrl: 'partials/registrationPartial.html'
			})
		.when('/raller',
			{
				controller: '',
				templateUrl: 'partials/lol.html'
			})
		.otherwise({redirectTo: '/'});
});