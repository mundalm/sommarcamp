// load up the participant model
var Participant = require('../app/models/participant.js');

module.exports = function(app, pool, ConnectionErrorCheck, QueryHasErrors, ReturnResults) {

	//============================================================ List all participants
	app.get('/api/participants', function (req, res){
		Participant.find({}).exec(function(err, result) {
			if(!QueryHasErrors(err, res)) {
		  		ReturnResults(res, result, 201);
		  	}
		});
	});

	//============================================================ Get Spesific participant
	app.get('/api/participants/:id', function (req, res){
		var query = { _id: req.params.id }
		Participant.findOne(query, function(err, result) {
			if(!QueryHasErrors(err, res)) {
		  		ReturnResults(res, result, 201);
		  	}
		});		
	});

	//============================================================ Delete participant
	app.delete('/api/participants/:id', function (req, res){
		var query = {_id:req.params.id};
		Participant.findOneAndRemove(query, function(err, doc) {
        	if(!QueryHasErrors(err, res)) {
		  		console.log('Deleted Participant with ID = ' + req.params.id);
		  		ReturnResults(res, null, 204);
		  	}
      	});
	});

	//============================================================ Insert new participant
	app.post('/api/participants', function (req, res){
		var newParticipant = new Participant ({	firstName       	: req.body.firstName,
											    lastName			: req.body.lastName,
											    birthDay			: req.body.birthDay,
											    birthMonth			: req.body.birthMonth,
											    birthYear			: req.body.birthYear,
											    birthDate			: req.body.birthDay + '/' + req.body.birthMonth + '/' + req.body.birthYear,
											    _events 			: req.body._events,
											    _parents 			: req.body._parents
											});

		newParticipant.save(function (err) {
			if(!QueryHasErrors(err, res)) {
		  		console.log('Inserted Participant: ' + JSON.stringify(newParticipant));
		  		ReturnResults(res, newParticipant, 201);
		  	}
		});
	});

	//============================================================ Update participant
	app.put('/api/participants/:id', function (req, res){
		var query = { _id: req.params.id };
		var update = { 	firstName       	: req.body.firstName,
					    lastName			: req.body.lastName,
					    birthDay			: req.body.birthDay,
					    birthMonth			: req.body.birthMonth,
					    birthYear			: req.body.birthYear,
					    birthDate			: req.body.birthDay + '/' + req.body.birthMonth + '/' + req.body.birthYear,
					    _events 			: req.body._events,
					    _parents 			: req.body._parents 
					};
		Participant.findOneAndUpdate(query, update, null, function(err, result) {
			if(!QueryHasErrors(err, res)) {
				console.log('Updated Participant: ' + JSON.stringify(result));
		  		ReturnResults(res, result, 201);
		  	}
		});
	});
};