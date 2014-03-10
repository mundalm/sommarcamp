function headerController($scope, $location, $modal, $log, $rootScope) 
{ 
	// when loading controller, initialize customer list from customerFactory
	init();
	
	function init() {
		$scope.projectSelected = "false";
		setUpProjectWatch();
	}

	function setUpProjectWatch(idproject) {
		$rootScope.$watch('selectedProjectID', function () {
	    	if($scope.selectedProjectID) {
	    		$scope.projectSelected = "true";
	    	}
	    });
	}

    $scope.isActive = function (viewLocation) { 
        return viewLocation === $location.path();
    };

    $scope.openProjectSelectModal = function () {
	    var modalInstance = $modal.open({
	      	templateUrl: 'partials/projectSelectModalPartial.html',
	      	controller: 'projectSelectModalController',
	      	scope: $scope
	    });	

	    modalInstance.result.then(function (result) {
	    	$scope.projectSelected = "true";
	    	$rootScope.selectedProjectID = result.id;
	    	$rootScope.selectedProjectTitle = result.title;
	    	$rootScope.selectedProject_id = result._id;
	    	$location.path( '/projectCalculations' );
	    });
  	};
}