var participantModalController = function ($scope, $modalInstance, registrationFactory, MessageFactory, $log, $rootScope) {
	// update participant using factory
	$scope.updateParticipant = function(id) {
		if( $scope.$$childTail.participantForm.$valid) {
			$scope.formData.isFinalRegStep = false;
			registrationFactory.updateParticipant($scope.formData, id).then(function(data) {
				if(!$rootScope.RHE(data, true)) {
					for (var i = 0; i < $scope.participants.length; i++) {
						if ($scope.participants[i]._id === id) {
							$scope.participants[i] = data.data;
							break;
						}
					}
					$scope.showSaveButton = true;
					$scope.showUpdateButton = false;	
					$scope.formData = {};

					$modalInstance.close('oppdatert');
				} else {
					MessageFactory.prepareForBroadcast('Det oppstod en feil under oppdatering av deltakar', 'alert alert-danger');
				}
			});	
		} else {
			MessageFactory.prepareForBroadcast('Kontroller felter med rød -', 'alert alert-warning');	
		}
	};

    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
};