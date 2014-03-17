function registrationController($scope, $location, registrationFactory, MessageFactory, $log, $rootScope, $modal) {
	$scope.formData = {};
	$scope.availableActivities = [];
	$scope.participants = [];
	$scope.days = [01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31];
	$scope.months = [01,02,03,04,05,06,07,08,09,10,11,12];
	$scope.years = [1998,1999,2000,2001,2002,2003,2004,2005,2007];
	
	// when loading controller, initialize Participant list from ParticipantFactory
	init();
	
	function init() {
		registrationFactory.getActivities().then(function(data) {
			if(!$rootScope.RHE(data, true)) {
				$scope.availableActivities = data.data;
				$scope.addParticipant();
			} else {
				MessageFactory.prepareForBroadcast('Det oppstod en feil ved lasting av tilgjengelige aktiviteter', 'label label-danger');
			}
		});

		$scope.disableAddParticipant = false;
		$scope.disableRemoveParticipant = true;

		$rootScope.pageHeader = 'Deltagerbehandling';

		/*$scope.currentPage = 0; 
    	$scope.pageSize = 10;*/
	}

	/*$scope.changePage=function(add){
        if(!add) {
        	if($scope.currentPage>0)
        		$scope.currentPage = $scope.currentPage-1;
        } else {
        	if($scope.currentPage<$scope.numberOfPages()-1) {
        		$scope.currentPage = $scope.currentPage+1;
        	}
        }       
    }*/
	
	/*$scope.numberOfPages=function(){
        return Math.ceil($scope.filteredParticipants.length/$scope.pageSize);                
    }*/

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

	// Add participant
	$scope.addParticipant = function() {
		if( $scope.participants.length < 4 ) {
			$scope.participants.push({birthDay: null, birthMonth: null, birthYear: null, activityList: $scope.availableActivities});
		} 

		checkAndToggleButtons();
	};

	$scope.test = function() {
		$log.info($scope.participants);
	};

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

		// Add participant
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
								MessageFactory.prepareForBroadcast('Det oppstod en feil ved sletting av prosjekt', 'label label-danger');
							}
						});
					}
			    }
			};

		bootbox.confirm(promptOptions);	
	};*/	
}

