sommarcampApp.config(function($routeProvider) {
	$routeProvider
		.when('/',
			{
				controller: 'registrationController',
				templateUrl: 'partials/registrationPartial.html'
			})
		
		.otherwise({redirectTo: '/'});
});