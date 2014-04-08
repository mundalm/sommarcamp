sommarcampApp.config(function($routeProvider) {
	$routeProvider
		.when('/',
			{
				controller: 'registrationController',
				templateUrl: 'partials/registrationPartial.html'
			})
		.when('/admOverview',
			{
				controller: 'adminController',
				templateUrl: 'partials/adminOverviewPartial.html'
			})
		.when('/admPartList',
			{
				controller: 'adminController',
				templateUrl: 'partials/adminPartListPartial.html'
			})
		.otherwise({redirectTo: '/'});
});