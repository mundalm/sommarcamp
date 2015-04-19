var participantModalController = function ($scope, $modalInstance, registrationFactory, MessageFactory, $log, $rootScope) {
	$scope.grpColors = ["gul", "raud", "blaa", "gron", "lilla", "kvit"];
	// update participant using factory
	$scope.updateParticipant = function(id) {
		if( $scope.$$childTail.participantForm.$valid) {


			var totalAmount = 0;
			var numberOfDiscountActivities = 0; //A count of the numer of earned discount weeks for the participant.
			var totalDiscountAllowAttending = 0; //A count of the number of discountAllowed activities the participant is attending
			var minAttendingDiscountLimit = 2; //Must attend mor discountAllowed activities than this limit

			//This loop calculates the number of earned discount weeks for the participant.
			for(var j = 0; j < $scope.formData._activities.length; j++) {
				var partActivity = $scope.formData._activities[j];
				if( partActivity.attending /*&& partActivity.allowDiscount*/) {
					totalDiscountAllowAttending++;
					if(totalDiscountAllowAttending > minAttendingDiscountLimit) {
						numberOfDiscountActivities++;	
					}
				} 
			}

			for(var j = 0; j < $scope.formData._activities.length; j++) {
				var partActivity = $scope.formData._activities[j];

				if(partActivity.attending) {
					if( (numberOfDiscountActivities > 0) && partActivity.allowDiscount) { //Event egligable for discount and doiscounted activities available
						//$log.info("Discount given on " + partActivity.eventCode);
						if(numberOfDiscountActivities > 1 ) {
							totalAmount = totalAmount + ((partActivity.eventPrice*60)/100); // 40% discount if second discount activity
						} else {
							totalAmount = totalAmount + ((partActivity.eventPrice*80)/100); // 20% discount if first discount activity
						}
						numberOfDiscountActivities--;
					} else {
						totalAmount = totalAmount + partActivity.eventPrice; // No discount for current activity
					} 
				}
			}

			$scope.formData.totalAmount = totalAmount;


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