var projectModalController = function ($scope, $modalInstance, projectFactory, MessageFactory, $log, $rootScope) {
	// Create new project using projectFactory
	$scope.createProject = function() {
		if( $scope.$$childTail.projectForm.$valid) {
			projectFactory.addProject($scope.formData).then(function(data) {
				if(!$rootScope.RHE(data, true)) {
					$scope.projects.push(data. data);
					$scope.formData = {};

					$modalInstance.close('opprettet');
				} else {
					MessageFactory.prepareForBroadcast('Det oppstod en feil under oppretting av nytt prosjekt', 'label label-danger');
				}
			});	
		} else {
			MessageFactory.prepareForBroadcast('Kontroller felter med rød -', 'label label-warning');	
		}
	};

	// Create new project using projectFactory
	$scope.updateProject = function(id) {
		if( $scope.$$childTail.projectForm.$valid) {
			projectFactory.updateProject($scope.formData, id).then(function(data) {
				if(!$rootScope.RHE(data, true)) {
					for (var i = 0; i < $scope.projects.length; i++) {
						if ($scope.projects[i]._id === id) {
							$scope.projects[i] = data.data;
							break;
						}
					}
					$scope.showSaveButton = true;
					$scope.showUpdateButton = false;	
					$scope.formData = {};

					$modalInstance.close('oppdatert');
				} else {
					MessageFactory.prepareForBroadcast('Det oppstod en feil under oppdatering av prosjekt', 'label label-danger');
				}
			});	
		} else {
			MessageFactory.prepareForBroadcast('Kontroller felter med rød -', 'label label-warning');	
		}
	};

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};