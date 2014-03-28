// load up the participant model
var Participant = require('../app/models/participant.js');
var AvailableActivity = require('../app/models/availableActivity.js');

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
											   	_activities 		: req.body._activities,
											    _parents 			: null,
											    partArrPos			: req.body.partArrPos, 
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
		/*var update = { 	firstName       	: req.body.firstName,
					    lastName			: req.body.lastName,
					    birthDay			: req.body.birthDay,
					    birthMonth			: req.body.birthMonth,
					    birthYear			: req.body.birthYear,
					    birthDate			: req.body.birthDay + '/' + req.body.birthMonth + '/' + req.body.birthYear,
					    _events 			: req.body._events,
					    _parents 			: req.body._parents 
					};*/
		var update = { 	specialNeeds       	: req.body.specialNeeds,
						parentOneFirstName	: req.body.parentOneFirstName, 
						parentOneLastName	: req.body.parentOneLastName, 
						parentOnePhone		: req.body.parentOnePhone,
						parentOneEmail		: req.body.parentOneEmail,
						parentTwoFirstName	: req.body.parentTwoFirstName, 
						parentTwoLastName	: req.body.parentTwoLastName, 
						parentTwoPhone		: req.body.parentTwoPhone,
						parentTwoEmail		: req.body.parentTwoEmail,
						canTakePictures     : req.body.canTakePictures,
					    canUseTransport     : req.body.canUseTransport,
					    canDoSwimming       : req.body.canDoSwimming,
					    comments			: req.body.comments
					  }
		Participant.findOneAndUpdate(query, update, null, function(err, result) {
			if(!QueryHasErrors(err, res)) {
				console.log('Updated Participant: ' + JSON.stringify(result));
		  		ReturnResults(res, result, 201);
		  	}
		});
	});

	//============================================================ Get status for available activities
	app.get('/api/availactstat', function (req, res){
		Participant.aggregate([{ $project : {
									_id: 0,
							        firstName : 1 ,
							        _activities : 1}},
							     {$unwind: "$_activities"}, 
							     {$match: {'_activities.attending': true}},
							     {$group: {_id: "$_activities.eventCode", nbParticipants: { $sum: 1 }}}], 
							     function(err, activities) {
			if(!QueryHasErrors(err, res)) {
				//console.log(activities);
				ReturnResults(res, activities, 201);
			}
		});
	});

	//============================================================ List all activities
	app.get('/api/activities', function (req, res){
		AvailableActivity.find({}).exec(function(err, result) {
			if(!QueryHasErrors(err, res)) {
		  		ReturnResults(res, result, 201);
		  	}
		});
	});

	app.get('/api/initact', function (req, res){
		var newActivity = new AvailableActivity ({	eventCode       : "U28",
											    title				: "Sommarcamp veke 27",
											    shortTitle			: "Veke 27",
											    maxAttending		: 5,
											    minBirthYear		: 2014,
											    blockEventCode		: "U27CA"
											});

		newActivity.save(function (err) {
			if(!QueryHasErrors(err, res)) {
		  		console.log('Inserted Activity: ' + JSON.stringify(newActivity));
		  		ReturnResults(res, newActivity, 201);
		  	}
		});
	});

	app.get('/api/killacts', function (req, res){
		AvailableActivity.remove(function (err) {
			if(!QueryHasErrors(err, res)) {
		  		console.log('Deleted collection AvailableActivity');
		  	}
		});
	});

	app.get('/api/killparts', function (req, res){
		Participant.remove(function (err) {
			if(!QueryHasErrors(err, res)) {
		  		console.log('Deleted collection Participant');
		  	}
		});
	});

	app.get('/api/initpart', function (req, res){
		var newParticipant = new Participant ({	firstName       	: "Loke 5",
											    lastName			: "Test loke",
											    birthDay			: 10,
											    birthMonth			: 11,
											    birthYear			: 2003,
											    //birthDate			: req.body.birthDay + '/' + req.body.birthMonth + '/' + req.body.birthYear,
											    _activities 		: [{eventCode: "U26"}],
											    _parents 			: null
											});

		newParticipant.save(function (err) {
			if(!QueryHasErrors(err, res)) {
		  		console.log('Inserted Participant: ' + JSON.stringify(newParticipant));
		  		ReturnResults(res, newParticipant, 201);
		  	}
		});
	});
};