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
		.when('/admPartFilterList',
			{
				controller: 'adminController',
				templateUrl: 'partials/adminPartListFilterPartial.html'
			})
		.when('/admWaitingList',
			{
				controller: 'adminController',
				templateUrl: 'partials/adminWaitingListPartial.html'
			})
		//.otherwise({redirectTo: '/'});
});