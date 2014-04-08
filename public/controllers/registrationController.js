function registrationController($scope, $location, registrationFactory, MessageFactory, $log, $rootScope, $modal, $route) {
	$scope.formData = {};
	$scope.availableActivities = [];
	$scope.participants = [];
	$scope.participantCommonFields = { canTakePictures: true, canUseTransport: true, canDoSwimming: true, canTakeVideo: true};
	$scope.days = [01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
	$scope.months = [01,02,03,04,05,06,07,08,09,10,11,12];
	$scope.years = [1998,1999,2000,2001,2002,2003,2004,2005,2006,2007];
	$scope.addFirstParticipant = false;
	$scope.activitiesLoaded = false;
	$scope.showStepOne = true;
	$scope.showStepTwo = false;
	$scope.showStepThree = false
	var blockedEvents = [];
	
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
				MessageFactory.prepareForBroadcast('Det oppstod en feil ved lasting av tilgjengelige aktiviteter. Prøv og oppdater siden for å gjøre et nytt forøk. Kontakt administrator på e-post marius@mundal.org dersom problemet vedvarer', 'alert alert-danger', 60);
			}
		});

		$scope.disableAddParticipant = true;
		$scope.disableRemoveParticipant = true;

		$rootScope.pageHeader = 'Påmelding';
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

	// Add participant to participant collection (max 4)
	$scope.addParticipant = function() {
		if( $scope.participants.length < 4 ) {
			$scope.participants.push({birthDay: null, birthMonth: null, birthYear: null, activityList: $scope.cloneActivities()});
			updateParticipanControls();
		} 

		checkAndToggleButtons();
	};

	// reset participant form
	$scope.resetParticipantForm = function() {
		$scope.formData = {};
		$scope.showSaveButton = true;
		$scope.showUpdateButton = false;	
	};

	// Remove (pop) laset participant from collection
	$scope.removeLastParticipant = function() {
		if( $scope.participants.length > 0 ) {
			$scope.participants.pop();
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

	//Method used to deactivate events that has a required birthYear equal to or higher than the participant birth year
	$scope.isParticipantOldEnough = function (partBirthYear, actMinYear) {
		if(isNullOrUndefined(partBirthYear) || isNullOrUndefined(actMinYear) ) {
			return true;
		} else {
			if(partBirthYear <= actMinYear) {
				return true;	
			} else {
				return false;
			}
		}

		$log.info(index);			
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

    $scope.isBlocked = function (eventCode, index) {
    	if(blockedEvents[eventCode+index]) {
    		return true;
    	} else {
    		return false;
    	}
    }

    $scope.evaluateEventBlock = function (actualState,eventToBlock, index) {
    	if(actualState) {
    		blockedEvents[eventToBlock+index] = true;
    	} else {
    		blockedEvents[eventToBlock+index] = false;
    	}
    }

    $scope.validateYear = function (index) {
    	for(var i = 0; i < $scope.participants[index].activityList.length; i++) {
    		$log.info($scope.isParticipantOldEnough($scope.participants[index].birthYear, $scope.participants[index].activityList[i].minBirthYear));
    		if(!$scope.isParticipantOldEnough($scope.participants[index].birthYear, $scope.participants[index].activityList[i].minBirthYear)) {
    			$scope.participants[index].activityList[i].isAttending = false;
    			$scope.participants[index].activityList[i].isWaiting = false;
    			$scope.evaluateEventBlock(false, $scope.participants[index].activityList[i].blockEventCode, index);
    		}
    	}	
    }


	//Fetches participant count for all activities from server. 
    function getActivyParticipantCountFromServer() {
    	if(!$scope.showStepOne) {
    		return;
    		$log.info("Aborting activity update because user has reserved places!");
    	}
    	registrationFactory.getAvailableActivitesStatus().then(function(data) {
			if(!$rootScope.RHE(data, true)) {
				updateLiveActivityParticipantCount(data.data);
				//$log.info(data.data);
			} else {
				MessageFactory.prepareForBroadcast('Det oppstod en feil ved lasting av aktivitetstatus', 'alert alert-danger');
			}
		});
    }
    
    function getFewLeftLimitForEvent(eventCode) {
    	for(var i = 0; i < $scope.availableActivities.length; i++ ) {
    		if($scope.availableActivities[i].eventCode === eventCode) {
    			return {limit: ($scope.availableActivities[i].maxAttending-(($scope.availableActivities[i].maxAttending*20)/100)), obj: $scope.availableActivities[i]};
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
    			//$log.info($scope.liveActStatus[currentPartAct.eventCode] + " - " + currentPartAct.maxAttending);
    			if($scope.liveActStatus[currentPartAct.eventCode] >= currentPartAct.maxAttending ) {
    				if(currentPartAct.isAttending && $scope.showStepOne) {
    					currentPartAct.isWaiting = true;
    					currentPartAct.isAttending = false;
    					MessageFactory.prepareForBroadcast('Aktiviteten ' + currentPartAct.title + ' er no full! Venteliste er automatisk valgt for dei deltakarane som var valgt inn på aktiviteten.', 'alert alert-warning', 20);
    				}
    				currentPartAct.isFull = true;
    			} else {
    				currentPartAct.isFull = false;
    			}
    		}
    	}
    }

    //Confirm registration. Update data on server if form is valid.
    $scope.confirmRegistration = function () {
    	if(validateParents()) {
    		$scope.updateParticipantsInfoOnServer(true);
    		MessageFactory.clearAndHide();
			/*$scope.showStepOne = false;
			$scope.showStepTwo = false;
			$scope.showStepThree = true;*/
		}
    }

    //Main participant validation method
    function validateParents() {
    	var returnResult = true;
    	$log.info($scope.participantCommonFields);
    		
		var participantProperties = {parentOneFirstName: $scope.participantCommonFields.parentOneFirstName, 
			parentOneLastName: $scope.participantCommonFields.parentOneLastName, 
			parentOnePhone: $scope.participantCommonFields.parentOnePhone,
			parentOneEmail: $scope.participantCommonFields.parentOneEmail,
			parentTwoFirstName: $scope.participantCommonFields.parentTwoFirstName, 
			parentTwoLastName: $scope.participantCommonFields.parentTwoLastName, 
			parentTwoPhone: $scope.participantCommonFields.parentTwoPhone,
			//parentTwoEmail: $scope.participantCommonFields.parentTwoEmail,
		}

		if(!validateParticipantFields(participantProperties)) {
			MessageFactory.prepareForBroadcast('Informasjon om primærkontakt og sekundærkontak for føresette må fyllast ut komplett', 'alert alert-warning', 'alert alert-warning', 15);
			returnResult = false;
		}

    	return returnResult;
    	//return true; //Remove this when finished coding app
    };

    //Navigates to registration step 2 (Details registration)
    $scope.goToStep2 = function (){
    	if(validateParticipants()) {

    		var promptOptions = {
				title: "Er registrerte opplysningar korrekte?",
				message: "Du kan ikkje gå tilbake og endre opplysningar i dette biletet seinare dersom du samtykker. Skulle du ha ynskje om endringar på opplysningar om deltakarane dine etter å ha samtykka må du fullføre registreringa og ta kontakt med oss på post@sommarcamp.no. Hugs at du kan melde på inntil 4 deltakarar på ein gong!",
				buttons: {
					confirm: {
						label: "Ja",
						className: "btn-success",
					},
					cancel: {
				    	label: "Nei",
				    	className: "btn-standard",
				    }
			  },
			  callback: function(result) {                
			      	if(result) {
						$scope.addParticipantsToServer();
						$scope.showStepOne = false;
						$scope.showStepTwo = true;
						$scope.showStepThree = false;
					}
			    }
			};

			bootbox.confirm(promptOptions);	
		}
    };

    //Redirects page to "/" so that the registration process i canceled.
    $scope.restartReg = function () {
    	var promptOptions = {
				title: "Vil du verkeleg avbryte?",
				message: "Om du avbryt påmeldinga mistar du plassane du har tinga.",
				buttons: {
					confirm: {
						label: "Ja",
						className: "btn-success",
					},
					cancel: {
				    	label: "Nei",
				    	className: "btn-standard",
				    }
			  },
			  callback: function(result) {                
			      	if(result) {
						MessageFactory.prepareForBroadcast('Påmelding er avbrutt! Ingen deltakarar er påmeldt.', 'alert alert-warning', 15);
	  					$route.reload();
					}
			    }
			};

			bootbox.confirm(promptOptions);	
	};

    //Main participant validation method
    function validateParticipants() {
    	var returnResult = true;

    	for(var i = 0; i<$scope.participants.length; i++) {
    		var participant = $scope.participants[i];
    		

    		if(!validateMinimumOneEvent(participant)) {
    			MessageFactory.prepareForBroadcast('Alle deltakarar må delta på minst 1 aktivitet', 'alert alert-warning', 15);
    			//$scope.scrollToMessage();
    			returnResult = false;
    			break;
    		}

    		var participantProperties = {firstName: participant.firstName, 
    			lastName: participant.lastName, 
    			birthDay: participant.birthDay,
    			birthMonth: participant.birthMonth,
    			birthYear: participant.birthYear,
    		}

    		if(!validateParticipantFields(participantProperties)) {
    			MessageFactory.prepareForBroadcast('Alle deltakarar må ha fornavn, etternavn og fødselsdato registrert', 'alert alert-warning', 15);
    			returnResult = false;
    			break;
    		}
    	}

    	return returnResult;
    };

    //Method validates that a participant has at least one event selected
    function validateMinimumOneEvent(participant, participantProperties) {
    	var numberAttendingEvents = 0;

		for(var j = 0; j < participant.activityList.length; j++) {
			var act = participant.activityList[j];
			var eval = (!isNullOrUndefined(act.isAttending) && act.isAttending) || (!isNullOrUndefined(act.isWaiting) && act.isWaiting);

			if(eval) {
				numberAttendingEvents++;
			} 
		}

		if(numberAttendingEvents <= 0) {
			return false;
		} else {
			return true;
		}
    }

    //Method ensure that all relevant participant fields are filled
    function validateParticipantFields(participantProperties) {
    	var returnResult = true;
    		
		for(var key in participantProperties) {
			if(isNullOrUndefined(participantProperties[key])) {
				var returnResult = false;
				break;
			}
		}

		return returnResult; 
    }

    //Helper to detect null or undefined properties
    function isNullOrUndefined(prop) {
    	if(prop == undefined || prop == null) {
    		return true;
    	} else {
    		return false;
    	}
    }

    // Create new participants on server using registrationFactory
	$scope.addParticipantsToServer = function() {
		for(var i = 0; i<$scope.participants.length; i++) {
			var participant = $scope.participants[i];
			var newParticipantForServer = {
				firstName       	: participant.firstName,
			    lastName			: participant.lastName,
			    birthDay			: participant.birthDay,
			    birthMonth			: participant.birthMonth,
			    birthYear			: participant.birthYear,
			    partArrPos			: i,
			    _activities			: []
			};

			var totalAmount = 0;
			var numberOfDiscountActivities = 0; //A count of the numer of earned discount weeks for the participant.
			var totalDiscountAllowAttending = 0; //A count of the number of discountAllowed activities the participant is attending
			var minAttendingDiscountLimit = 2; //Must attend mor discountAllowed activities than this limit

			//This loop calculates the number of earned discount weeks for the participant.
			for(var j = 0; j < participant.activityList.length; j++) {
				var partActivity = participant.activityList[j];
				if( partActivity.isAttending /*&& partActivity.allowDiscount*/) {
					totalDiscountAllowAttending++;
					if(totalDiscountAllowAttending > minAttendingDiscountLimit) {
						numberOfDiscountActivities++;	
					}
				} 
			}
			

			$log.info("Number of discount acts = " + numberOfDiscountActivities)

			for(var j = 0; j < participant.activityList.length; j++) {
				var partActivity = participant.activityList[j];
				if(partActivity.isAttending || partActivity.isWaiting) {
					newParticipantForServer._activities.push({
						title			: partActivity.title,
						eventCode       : partActivity.eventCode, 
					    attending 		: partActivity.isAttending,
					    waiting 		: partActivity.isWaiting
					});
				}

				if(partActivity.isAttending) {
					if( (numberOfDiscountActivities > 0) && partActivity.allowDiscount) { //Event egligable for discount and doiscounted activities available
						$log.info("Discount given on " + partActivity.eventCode);
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
				$log.info("Totalamount after calcpart " + totalAmount);
				newParticipantForServer.totalAmount = totalAmount;
			}

			registrationFactory.addParticipant(newParticipantForServer).then(function(data) {
				if(!$rootScope.RHE(data, true)) {
					$scope.participants[data.data.partArrPos]._id = data.data._id;
					MessageFactory.prepareForBroadcast('Steg 1 er utført utan feil. Du må fylle inn felta nedanfor og bekrefte påmeldinga før plassen blir endeleg reservert!', 'alert alert-success', 20);
				} else {
					essageFactory.prepareForBroadcast('Det oppstod en feil ved lagring av deltakarar. Kontakt administrator på e-post marius@mundal.org.', 'alert alert-danger', 60);
				}
			});	

			$log.info(newParticipantForServer);
		}	
	};

	// Create new participants on server using registrationFactory
	$scope.updateParticipantsInfoOnServer = function(finalRegStep) {
		for(var i = 0; i<$scope.participants.length; i++) {
			var participant = $scope.participants[i];
			var participantDataToUpdate = {
				specialNeeds       	: isNullOrUndefined(participant.specialNeeds) ? null : participant.specialNeeds,
				parentOneFirstName	: $scope.participantCommonFields.parentOneFirstName, 
				parentOneLastName	: $scope.participantCommonFields.parentOneLastName, 
				parentOnePhone		: $scope.participantCommonFields.parentOnePhone,
				parentOneEmail		: $scope.participantCommonFields.parentOneEmail,
				parentTwoFirstName	: $scope.participantCommonFields.parentTwoFirstName, 
				parentTwoLastName	: $scope.participantCommonFields.parentTwoLastName, 
				parentTwoPhone		: $scope.participantCommonFields.parentTwoPhone,
				parentTwoEmail		: $scope.participantCommonFields.parentTwoEmail,
				canTakePictures     : $scope.participantCommonFields.canTakePictures,
				canTakeVideo     	: $scope.participantCommonFields.canTakeVideo,
			    canUseTransport     : $scope.participantCommonFields.canUseTransport,
			    canDoSwimming       : $scope.participantCommonFields.canDoSwimming,
			    comments			: isNullOrUndefined($scope.participantCommonFields.comments) ? null : $scope.participantCommonFields.comments,
			    isFinalRegStep		: isNullOrUndefined(finalRegStep) ? false : finalRegStep
			};

			registrationFactory.updateParticipant(participantDataToUpdate, participant._id).then(function(data) {
				if(!$rootScope.RHE(data, true)) {
					$scope.showStepOne = false;
					$scope.showStepTwo = false;
					$scope.showStepThree = true;
					$log.info(data.data);
				} else {
					MessageFactory.prepareForBroadcast('Det oppstod en feil lagring av deltakarar. Kontakt administrator på e-post marius@mundal.org.', 'alert alert-danger', 60);
				}
			});	
		}	
	};
}

