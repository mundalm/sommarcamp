module.exports = function(app, pool) {
	// Helper Methods ==============================================================
	function ConnectionErrorCheck(err, response) {
		if(err) {
			console.log(err);	
			ReturnResults(response, err, 503);
			return true;
		} else {
			return false;
		}
	} 


	function QueryHasErrors(err, response) {
		if(!err) {
			return false;
		} else {
			console.log(err);	
		    ReturnResults(response, err, 500);
		    return true;		
		}	    
	}

	function ReturnResults(response, resultToReturn, code){
		response.writeHead(code, { 'Content-Type': 'application/json'});
	    response.end(JSON.stringify(resultToReturn));
	}

	require('./main')(app, pool);
	require('./participants')(app, pool, ConnectionErrorCheck, QueryHasErrors, ReturnResults);

};
