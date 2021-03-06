function adminController($scope, $location, registrationFactory, MessageFactory, $log, $rootScope, $modal, $route, $window) {
	$scope.formData = {};
	$scope.liveActStatus = {};
	$scope.availableActivities = [];
	$scope.participants = [];
	$scope.waitingList = [];
	$scope.flatPartList = [];
	$scope.activitiesLoaded = false;
	$scope.participantsLoaded = false;
	$scope.waitingListLoaded = false;
	$scope.flatPartListLoaded = false;

	$scope.sexSort = false;

	$scope.currentPage = 0;
    $scope.pageSize = 300;	

    $scope.showSelect = true;

    $scope.activityFilter = "";
	
	// when loading controller, initialize Participant list from ParticipantFactory
	init();
	
	function init() {
		//Prevent ActivityTimer From running before participants has been loaded
		$scope.$broadcast('timer-stopped');
        $scope.activityTimerRunning = false;

		$scope.addFirstParticipant = true;
		registrationFactory.getActivities().then(function(data) {
			if(!$rootScope.RHE(data, true)) {
				$scope.availableActivities = data.data;
				$scope.activitiesLoaded = true;
				getActivyParticipantCountFromServer();
			} else {
				if(data === 401 ) {
					$scope.goToLogin();
				}
				MessageFactory.prepareForBroadcast('Det oppstod en feil ved lasting av tilgjengelige aktiviteter. Prøv og oppdater siden for å gjøre et nytt forøk. Kontakt administrator på e-post marius@mundal.org dersom problemet vedvarer', 'alert alert-danger', 60);
			}
		});

		registrationFactory.getParticipants().then(function(data) {
			if(!$rootScope.RHE(data, true)) {
				$scope.participants = data.data;
				$scope.participantsLoaded = true;
			} else {
				if(data === 401 ) {
					$scope.goToLogin();
				}
				MessageFactory.prepareForBroadcast('Det oppstod en feil ved lasting av deltakarar. Prøv og oppdater siden for å gjøre et nytt forøk. Kontakt administrator på e-post marius@mundal.org dersom problemet vedvarer', 'alert alert-danger', 60);
			}
		});

		registrationFactory.getWaitingList().then(function(data) {
			if(!$rootScope.RHE(data, true)) {
				$scope.waitingList = data.data;
				$scope.waitingListLoaded = true;
			} else {
				if(data === 401 ) {
					$scope.goToLogin();
				}
				MessageFactory.prepareForBroadcast('Det oppstod en feil ved lasting av venteliste. Prøv og oppdater siden for å gjøre et nytt forøk. Kontakt administrator på e-post marius@mundal.org dersom problemet vedvarer', 'alert alert-danger', 60);
			}
		});

		registrationFactory.getParticipantsFlatList().then(function(data) {
			if(!$rootScope.RHE(data, true)) {
				$scope.flatPartList = data.data;
				$scope.flatPartListLoaded = true;
			} else {
				if(data === 401 ) {
					$scope.goToLogin();
				}
				MessageFactory.prepareForBroadcast('Det oppstod en feil ved lasting av deltakarar. Prøv og oppdater siden for å gjøre et nytt forøk. Kontakt administrator på e-post marius@mundal.org dersom problemet vedvarer', 'alert alert-danger', 60);
			}
		});

		$rootScope.pageHeader = 'Administrasjon';
	}

	//Clones activity list from scope. Use when adding new participant
	$scope.cloneActivities = function() {
		var newAct = [];
		for( var i=0; i < $scope.availableActivities.length; i++) {
			var act = $scope.availableActivities[i];
			newAct.push({title 			: act.title, 
						 shortTitle		: act.shortTitle, 
						 eventCode 		: act.eventCode, 
						 maxAttending 	: act.maxAttending, 
						 minBirthYear	: act.minBirthYear,
						 blockEventCode	: act.blockEventCode,
						 eventPrice		: act.eventPrice,
						 allowDiscount	: act.allowDiscount});
		}
		return newAct;
	}

	//Helper to convert til "ja"/"nei" based on property
    $scope.convertYesNo = function(prop) {
    	if(prop) {
    		return "Ja";
    	} else {
    		return "Nei";
    	}
    }

    $scope.filterActs = function (actual, expected) {
    return angular.equals(expected, actual);
}


    //Helper to convert til "ja"/"nei" based on property
    $scope.setActivityFilter = function(filter) {
    	$scope.activityFilter = filter;
    	$log.info($scope.activityFilter);
    }

	//Starts activity check timer countdown from scratch
    $scope.startActivityCheckTimer = function (){
		$scope.$broadcast('timer-start');
        $scope.activityTimerRunning = true;
    };

	//Fires whenever activity check timer has elapsed
	$scope.$on('timer-stopped', function (event, data){
		if($scope.availableActivities.length > 0) { //Only query for updates if there are available activities.
			getActivyParticipantCountFromServer();
		} 

		$scope.startActivityCheckTimer();
    });

    $scope.numberOfPages=function(){
        return Math.ceil($scope.filteredParticipants.length/$scope.pageSize);                
    }

    $scope.changePage=function(add){
        if(!add) {
        	if($scope.currentPage>0)
        		$scope.currentPage = $scope.currentPage-1;
        } else {
        	if($scope.currentPage<$scope.numberOfPages()-1) {
        		$scope.currentPage = $scope.currentPage+1;
        	}
        }       
    }

    // Reset search field
	$scope.resetSearch = function() {
		$scope.searchParticipants = '';
	};

	$scope.goToLogin = function ( ) {
	  	//$location.path( "login" );
	  	$window.location.href = "/login"
	};


	//Fetches participant count for all activities from server. 
    function getActivyParticipantCountFromServer() {
    	registrationFactory.getAvailableActivitesStatus().then(function(data) {
			if(!$rootScope.RHE(data, true)) {
				updateLiveActivityParticipantCount(data.data);
			} else {
				MessageFactory.prepareForBroadcast('Det oppstod en feil ved lasting av aktivitetstatus', 'alert alert-danger');
			}
		});
    }
    
    function getFewLeftLimitForEvent(eventCode) {
    	for(var i = 0; i < $scope.availableActivities.length; i++ ) {
    		if($scope.availableActivities[i].eventCode === eventCode) {
    			return {limit: ($scope.availableActivities[i].maxAttending-(($scope.availableActivities[i].maxAttending*15)/100)), obj: $scope.availableActivities[i]};
    		}
    	}
    }

    //Used to update LIVE map of particiapnt count for each activity
    function updateLiveActivityParticipantCount(actStatFromServer) {
    	$scope.liveActStatus = {};
    	for(var i=0; i<actStatFromServer.length; i++) {
    		$scope.liveActStatus[actStatFromServer[i]._id] = actStatFromServer[i].nbParticipants;

    		var limitObject = getFewLeftLimitForEvent(actStatFromServer[i]._id);
    		if(($scope.liveActStatus[actStatFromServer[i]._id] > limitObject.limit) && !($scope.liveActStatus[actStatFromServer[i]._id] >= limitObject.obj.maxAttending)) {
				limitObject.obj.fewLeft = true;
			} else {
				limitObject.obj.fewLeft = false;
			}
			//$log.info(limitObject.obj.fewLeft + " - " + limitObject.limit);
    	}
    	//$log.info($scope.liveActStatus);
    	
    	 $scope.startActivityCheckTimer();
    	//updateParticipanControls();
    }

    // delete leader using leaderFactory
	$scope.deleteParticipant = function(id) {
		var promptOptions = {
			title: "Slett deltakar",
			message: "Er du sikker på at du vil slette?",
			buttons: {
				confirm: {
					label: "Ja",
					className: "btn-danger",
				},
				cancel: {
			    	label: "Nei",
			    	className: "btn-primary",
			    }
			  },
			  callback: function(result) {                
			      	if(result) {
						registrationFactory.deleteParticipant(id).then(function(data) {
							if(!$rootScope.RHE(data, false)) {
								for (var i = 0; i < $scope.participants.length; i++) {
									if ($scope.participants[i]._id === id) {
										$scope.participants.splice(i, 1);
										break;
									}
								}

								MessageFactory.prepareForBroadcast('Deltakar sletta', 'alert alert-success');
							} else {
								MessageFactory.prepareForBroadcast('Det oppstod en feil ved sletting av deltakar', 'alert alert-danger');
							}
						});
					}
			    }
			};

		bootbox.confirm(promptOptions);	
	};

	// Register payment on participant
	$scope.registerPayment = function(id, firstName, lastName) {
		var promptOptions = {
			title: "Godkjenning av betaling",
			message: "Er betalinga på deltakar " + firstName + " " + lastName + " motteken?",
			buttons: {
				confirm: {
					label: "Ja",
					className: "btn-danger",
				},
				cancel: {
			    	label: "Nei",
			    	className: "btn-primary",
			    }
			  },
			  callback: function(result) {                
			      	if(result) {
						registrationFactory.registerPayment(id).then(function(data) {
							if(!$rootScope.RHE(data, false)) {
								for (var i = 0; i < $scope.participants.length; i++) {
									if ($scope.participants[i]._id === id) {
										$scope.participants[i] = data.data;
										break;
									}
							}

								MessageFactory.prepareForBroadcast('Betaling registrert for deltakar', 'alert alert-success');
							} else {
								MessageFactory.prepareForBroadcast('Det oppstod en feil ved registrering av betaling', 'alert alert-danger');
							}
						});
					}
			    }
			};

		bootbox.confirm(promptOptions);	
	};		

	// Register payment on participant
	$scope.sendReminder = function(id, firstName, lastName) {
		var promptOptions = {
			title: "Sende purring",
			message: "Skal det sendast purring på betaling for deltakar " + firstName + " " + lastName,
			buttons: {
				confirm: {
					label: "Ja",
					className: "btn-danger",
				},
				cancel: {
			    	label: "Nei",
			    	className: "btn-primary",
			    }
			  },
			  callback: function(result) {                
			      	if(result) {
						registrationFactory.sendReminder(id).then(function(data) {
							if(!$rootScope.RHE(data, false)) {
								for (var i = 0; i < $scope.participants.length; i++) {
									if ($scope.participants[i]._id === id) {
										$scope.participants[i] = data.data;
										break;
									}
							}

								MessageFactory.prepareForBroadcast('Purring sendt for deltakar', 'alert alert-success');
							} else {
								MessageFactory.prepareForBroadcast('Det oppstod en feil ved sending av purring', 'alert alert-danger');
							}
						});
					}
			    }
			};

		bootbox.confirm(promptOptions);	
	};		

	// Put project to edit in edit form
	$scope.editParticipant = function(index) {
		$scope.showUpdateButton = true;
		$scope.CancelButton = true;
		$scope.participantEditedID = $scope.filteredParticipants[index]._id;
		
		$scope.formData = {	__v: $scope.filteredParticipants[index].__v,
						   	_id: $scope.filteredParticipants[index]._id, 
						   	firstName: $scope.filteredParticipants[index].firstName,
						   	lastName: $scope.filteredParticipants[index].lastName,
						   	sex: $scope.filteredParticipants[index].sex,
						   	birthDate: $scope.filteredParticipants[index].birthDate,
							parentOneFirstName: $scope.filteredParticipants[index].parentOneFirstName,
							parentOneLastName: $scope.filteredParticipants[index].parentOneLastName,
							parentOnePhone: $scope.filteredParticipants[index].parentOnePhone,
							parentOneEmail: $scope.filteredParticipants[index].parentOneEmail,
							parentTwoFirstName: $scope.filteredParticipants[index].parentTwoFirstName,
							parentTwoLastName: $scope.filteredParticipants[index].parentTwoLastName,
							parentTwoPhone: $scope.filteredParticipants[index].parentTwoPhone,
							specialNeeds: $scope.filteredParticipants[index].specialNeeds,
							comments: $scope.filteredParticipants[index].comments,
							canTakePictures: $scope.filteredParticipants[index].canTakePictures,
							canTakeVideo: $scope.filteredParticipants[index].canTakeVideo,
							canUseTransport: $scope.filteredParticipants[index].canUseTransport,
							canDoSwimming: $scope.filteredParticipants[index].canDoSwimming,
							_activities: $scope.populateActivityEditForm($scope.filteredParticipants[index]._activities)
							}
		$log.info($scope.formData);
		$scope.openParticipantModal(); 
	};

	$scope.populateActivityEditForm = function(partActs) {
		var populatedActivities = $scope.cloneActivities();

		for (var i = 0; i < populatedActivities.length; i++) {
			for (var j = 0; j < partActs.length; j++) {
				if (populatedActivities[i].eventCode === partActs[j].eventCode) {
					populatedActivities[i].attending = partActs[j].attending;							
					populatedActivities[i].waiting = partActs[j].waiting;							
					populatedActivities[i].grpColor = partActs[j].grpColor;
				}
			}
		}

		return populatedActivities;
	}

	$scope.openParticipantModal = function () {
	    var modalInstance = $modal.open({
	      	templateUrl: 'partials/participantModalPartial.html',
	      	controller: 'participantModalController',
	      	scope: $scope
	    });	

	    modalInstance.result.then(function (result) {
	    	MessageFactory.prepareForBroadcast('Deltakar ' + result, 'alert alert-success');
	    });
  	};

}

