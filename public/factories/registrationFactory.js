function registrationFactory($http, $log) {
	factory = {};
	var registrations = [];
	
	return{
		getParticipants:function() {
	    	var promise = $http({
	        	method: 'GET',
	            url: '/api/participants',
	            timeout: 20000
	        }).then(function(response) {
	        	//$log.info('Retrieved data: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("Request Failed: ", reason);
	        	return reason.status;
	     	});
		 
	     	return promise;
	    },

	    getWaitingList:function() {
	    	var promise = $http({
	        	method: 'GET',
	            url: '/api/waitingStatus',
	            timeout: 20000
	        }).then(function(response) {
	        	//$log.info('Retrieved data: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("Request Failed: ", reason);
	        	return reason.status;
	     	});
		 
	     	return promise;
	    },

	    getParticipantsFlatList:function() {
	    	var promise = $http({
	        	method: 'GET',
	            url: '/api/partflatlist',
	            timeout: 20000	
	        }).then(function(response) {
	        	//$log.info('Retrieved data: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("Request Failed: ", reason);
	        	return reason.status;
	     	});
		 
	     	return promise;
	    },


	    getNotCompletedParticipants:function() {
	    	var promise = $http({
	        	method: 'GET',
	            url: '/api/participantsnc',
	            timeout: 20000
	        }).then(function(response) {
	        	//$log.info('Retrieved data: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("Request Failed: ", reason);
	     	});
		 
	     	return promise;
	    },

	    getActivities:function() {
	    	var promise = $http({
	        	method: 'GET',
	            url: '/api/activities',
	            timeout: 20000
	        }).then(function(response) {
	        	//$log.info('Retrieved data: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("Request Failed: ", reason);
	        	return reason.status;
	     	});
		 
	     	return promise;
	    },  

	    getAvailableActivitesStatus:function() {
	    	var promise = $http({
	        	method: 'GET',
	        	data: {aSe: 191079},
	            url: '/api/availactstat',
	            timeout: 20000
	        }).then(function(response) {
	        	//$log.info('Retrieved data: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("Request Failed: ", reason);
	     	});
		 
	     	return promise;
	    }, 
	    
	    updateParticipant:function(participant_data, id) {
	    	participant_data.aSe = 191079;

	    	var promise = $http({
	        	method: 'PUT',
	            url: '/api/participants/' + id,
	            data: participant_data,
	            timeout: 20000
	        }).then(function(response) {
	        	//$log.info('Retrieved data after update: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("PUT request Failed: ", reason);
	     	});
		 
	     	return promise;
	    },

	    registerPayment:function(id) {
	    	var promise = $http({
	        	method: 'GET',
	            url: '/api/regpayment/' + id,
	            data: null,
	            timeout: 20000
	        }).then(function(response) {
	        	//$log.info('Retrieved data after update: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("Register payment Failed: ", reason);
	     	});
		 
	     	return promise;
	    },

	    addParticipant:function(participant) {
	    	participant.aSe = 191079;

	    	var promise = $http({
	        	method: 'POST',
	            url: '/api/participants',
	            data: participant,
	            timeout: 20000
	        }).then(function(response) {
	        	//$log.info('Retrieved data after instert: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("POST request Failed: ", reason);
	     	});
		 
	     	return promise;
	    },
	    
	    deleteParticipant:function(id) {
	    	var promise = $http({
	        	method: 'DELETE',
	            url: '/api/participants/'+ id,
	            timeout: 20000
	        }).then(function(response) {
	        	//$log.info('Retrieved data after delete: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("DELETE request Failed: ", reason);
	     	});
		 
	     	return promise;
	    } 
	};
}
	      