function registrationFactory($http, $log) {
	factory = {};
	var registrations = [];
	
	return{
		getParticipants:function() {
	    	var promise = $http({
	        	method: 'GET',
	            url: '/api/participants',
	            timeout: 10000
	        }).then(function(response) {
	        	$log.info('Retrieved data: ',response);
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
	            timeout: 10000
	        }).then(function(response) {
	        	$log.info('Retrieved data: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("Request Failed: ", reason);
	     	});
		 
	     	return promise;
	    },  

	    getAvailableActivitesStatus:function() {
	    	var promise = $http({
	        	method: 'GET',
	            url: '/api/availactstat',
	            timeout: 10000
	        }).then(function(response) {
	        	$log.info('Retrieved data: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("Request Failed: ", reason);
	     	});
		 
	     	return promise;
	    }, 
	    
	    updateParticipant:function(formData, id) {
	    	var promise = $http({
	        	method: 'PUT',
	            url: '/api/participants/' + id,
	            data: formData,
	            timeout: 10000
	        }).then(function(response) {
	        	$log.info('Retrieved data after update: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("PUT request Failed: ", reason);
	     	});
		 
	     	return promise;
	    },

	    addParticipant:function(formData) {
	    	var promise = $http({
	        	method: 'POST',
	            url: '/api/participants',
	            data: formData,
	            timeout: 10000
	        }).then(function(response) {
	        	$log.info('Retrieved data after instert: ',response);
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
	            timeout: 10000
	        }).then(function(response) {
	        	$log.info('Retrieved data after delete: ',response);
	           	return response;  
	        },  function(reason) {
	        	$log.error("DELETE request Failed: ", reason);
	     	});
		 
	     	return promise;
	    } 
	};
}
	      