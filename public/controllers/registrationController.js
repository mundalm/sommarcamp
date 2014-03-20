function registrationController($scope, $location, registrationFactory, MessageFactory, $log, $rootScope, $modal) {
	$scope.formData = {};
	$scope.availableActivities = [];
	$scope.participants = [];
	$scope.days = [01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
	$scope.months = [01,02,03,04,05,06,07,08,09,10,11,12];
	$scope.years = [1998,1999,2000,2001,2002,2003,2004,2005,2007];
	$scope.addFirstParticipant = false;
	$scope.activitiesLoaded = false;
	$scope.showStepOne = true;
	$scope.showStepTwo = false;
	
	// when loading controller, initialize Participant list from ParticipantFactory
	init();
	
	function init() {
		$scope.addFirstParticipant = true;
		registrationFactory.getActivities().then(function(data) {
			if(!$rootScope.RHE(data, true)) {
				$scope.availableActivities = data.data;
				$scope.activitiesLoaded = true;
				getActivyParticipantCountFromServer();
			} else {
				MessageFactory.prepareForBroadcast('Det oppstod en feil ved lasting av tilgjengelige aktiviteter. Prøv og oppdater siden for å gjøre et nytt forøk. Kontakt administrator på e-post marius@mundal.org dersom problemet vedvarer', 'alert alert-danger', 60);
			}
		});

		$scope.disableAddParticipant = true;
		$scope.disableRemoveParticipant = true;

		$rootScope.pageHeader = 'Deltagerbehandling';
	}

	//Clones activity list from scope. Use when adding new participant
	$scope.cloneActivities = function() {
		var newAct = [];
		for( var i=0; i < $scope.availableActivities.length; i++) {
			var act = $scope.availableActivities[i];
			newAct.push({title: act.title, shortTitle: act.shortTitle, eventCode: act.eventCode, maxAttending: act.maxAttending});
		}
		return newAct;
	}

	// Add participant to participant collection (max 4)
	$scope.addParticipant = function() {
		if( $scope.participants.length < 4 ) {
			$scope.participants.push({birthDay: null, birthMonth: null, birthYear: null, activityList: $scope.cloneActivities()});
			updateParticipanControls();
		} 

		checkAndToggleButtons();
	};

	$scope.test = function() {
		$log.info($scope.participants);
	};

	//Helper function for toggling participant buttons
	function checkAndToggleButtons() {
		if($scope.participants.length >= 4) {
			$scope.disableAddParticipant = true;
		} else {
			$scope.disableAddParticipant = false;
		}

		if($scope.participants.length <= 1) {
			$scope.disableRemoveParticipant = true;
		} else {
			$scope.disableRemoveParticipant = false;
		}
	}

	// Remove (pop) laset participant from collection
	$scope.removeLastParticipant = function() {
		if( $scope.participants.length > 0 ) {
			$scope.participants.pop();
		} 

		checkAndToggleButtons();
	};

	// reset edit form
	$scope.resetParticipantForm = function() {
		$scope.formData = {};
		$scope.showSaveButton = true;
		$scope.showUpdateButton = false;	
	};

	//Fires whenever activity check timer has elapsed
	$scope.$on('timer-stopped', function (event, data){
		if($scope.availableActivities.length > 0) { //Only query for updates if there are available activities.
			getActivyParticipantCountFromServer();
		} 

		$scope.startTimer();
    });

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
    
    //Starts timer countdown from scratch
    $scope.startTimer = function (){
		$scope.$broadcast('timer-start');
        $scope.timerRunning = true;
    };

    //Used to update LIVE map of particiapnt count for each activity
    function updateLiveActivityParticipantCount(actStatFromServer) {
    	$scope.liveActStatus = {};
    	for(var i=0; i<actStatFromServer.length; i++) {
    		$scope.liveActStatus[actStatFromServer[i]._id.eventCode] = actStatFromServer[i].nbParticipants;
    	}

    	updateParticipanControls();
    }

    //This method is fired from updateLiveActivityParticipantCount() each time there is a successfull LIVE data update on activities
    function updateParticipanControls() {
    	/*This is done here to ensure that activity count is returned before adding a participant to prevent false availability status on an event.
    	This will only execute once during init() of page.*/
    	if($scope.addFirstParticipant) {
    		$scope.addFirstParticipant = false;
    		$scope.disableAddParticipant = false;
    		$scope.addParticipant();
    	}

    	for(var i=0; i<$scope.participants.length; i++) {
    		var participantActivities = $scope.participants[i].activityList;

    		for(var j=0; j<participantActivities.length; j++) {
    			var currentPartAct = participantActivities[j];
    			if($scope.liveActStatus[currentPartAct.eventCode] >= currentPartAct.maxAttending ) {
    				currentPartAct.isFull = true;
    			} else {
    				currentPartAct.isFull = false;
    			}
    		}
    	}
    }

    //Navigates to registration step 2
    $scope.goToStep2 = function (){
    	if(validateParticipants()) {
			$scope.addParticipantsToServer();
			$scope.showStepOne = false;
			$scope.showStepTwo = true;
		} else {
			MessageFactory.prepareForBroadcast('Alle deltagere må ha fornavn, etternavn og fødselsdato registrert', 'alert alert-warning', 15);
		}
    };

    function validateParticipants() {
    	return true;
    	//Implement checks
    };

    // Create new participants on server using registrationFactory
	$scope.addParticipantsToServer = function() {
		$log.info($scope.participants);

		/*registrationFactory.addParticipant($scope.formData).then(function(data) {
			if(!$rootScope.RHE(data, true)) {
				$scope.projects.push(data. data);
				$scope.formData = {};

				$modalInstance.close('opprettet');
			} else {
				MessageFactory.prepareForBroadcast('Det oppstod en feil under oppretting av nytt prosjekt', 'label label-danger');
			}
		});*/	
			
	};

    /*$scope.go = function ( path ) {
	  	$location.path( path );
	};*/
	
	// Put project to edit in edit form
	/*$scope.editProject = function(index) {
		$scope.showSaveButton = false;
		$scope.showUpdateButton = true;
		$scope.projectEditedID = $scope.filteredProjects[index]._id;
		
		$scope.formData = {__v: $scope.filteredProjects[index].__v,
						   _id: $scope.filteredProjects[index]._id, 
						   title: $scope.filteredProjects[index].title,
						   idproject: $scope.filteredProjects[index].idproject,
						   _customer: $scope.filteredProjects[index]._customer,
						   _leader: $scope.filteredProjects[index]._leader }; 
		$scope.openProjectModal(); 
	};*/

	/*$scope.openProjectModal = function () {
	    var modalInstance = $modal.open({
	      	templateUrl: 'partials/projectModalPartial.html',
	      	controller: 'projectModalController',
	      	scope: $scope
	    });	

	    modalInstance.result.then(function (result) {
	    	MessageFactory.prepareForBroadcast('Prosjekt ' + result, 'label label-success');
	    });
  	};*/



	// Reset search field
	/*$scope.resetSearch = function() {
		$scope.searchParticipant = '';
	};*/

	// delete project using projectFactory
	/*$scope.deleteProject = function(id) {
		var promptOptions = {
			title: "Slett prosjekt",
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
						projectFactory.deleteProject(id).then(function(data) {
							if(!$rootScope.RHE(data, false)) {
								for (var i = 0; i < $scope.projects.length; i++) {
									if ($scope.projects[i]._id === id) {
										$scope.projects.splice(i, 1);
										break;
									}
								}

								MessageFactory.prepareForBroadcast('Prosjekt slettet', 'label label-success');
							} else {
								MessageFactory.prepareForBroadcast('Det oppstod en feil ved sletting av prosjekt', 'alert alert-danger');
							}
						});
					}
			    }
			};

		bootbox.confirm(promptOptions);	
	};*/	
}

