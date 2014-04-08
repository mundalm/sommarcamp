// load up the participant model
var Participant = require('../app/models/participant.js');
var AvailableActivity = require('../app/models/availableActivity.js');
var mandrill = require('node-mandrill')('9fpTjC4TRNvpxej2vOEv1g');

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
											    totalAmount			: req.body.totalAmount 
											});

		newParticipant.save(function (err) {
			if(!QueryHasErrors(err, res)) {
		  		//console.log('Inserted Participant: ' + JSON.stringify(newParticipant));
		  		ReturnResults(res, newParticipant, 201);
		  	}
		});
	});

	//============================================================ Update participant
	app.put('/api/participants/:id', function (req, res){
		var query = { _id: req.params.id };
		console.log(query);

		var update = { 	specialNeeds       	: req.body.specialNeeds,
						parentOneFirstName	: req.body.parentOneFirstName, 
						parentOneLastName	: req.body.parentOneLastName, 
						parentOnePhone		: req.body.parentOnePhone,
						parentOneEmail		: req.body.parentOneEmail,
						parentTwoFirstName	: req.body.parentTwoFirstName, 
						parentTwoLastName	: req.body.parentTwoLastName, 
						parentTwoPhone		: req.body.parentTwoPhone,
						//parentTwoEmail		: req.body.parentTwoEmail,
						canTakePictures     : req.body.canTakePictures,
						canTakeVideo     	: req.body.canTakeVideo,
					    canUseTransport     : req.body.canUseTransport,
					    canDoSwimming       : req.body.canDoSwimming,
					    comments			: req.body.comments,
					    regCompletedTime	: new Date()
					  }
		Participant.findOneAndUpdate(query, update, null, function(err, result) {
			if(!QueryHasErrors(err, res)) {
				//console.log('Updated Participant: ' + JSON.stringify(result));

				if(req.body.isFinalRegStep) {
					sendConfirmationEmail(req.body.parentOneEmail, req.body.parentOneFirstName + " " + req.body.parentOneLastName, result);	
				}
				
		  		ReturnResults(res, result, 201);	
		  	}
		});
	});

	function sendConfirmationEmail(toEmail, toName, resultFromDB) {
		var mainText = "Hei\n\nVi har registrert påmeldinga di.";
		mainText += "\n\n" + resultFromDB.firstName + " " + resultFromDB.lastName + " deltek på følgjande aktivitetar:\n\n";
		for(var j = 0; j < resultFromDB._activities.length; j++) {
			if(resultFromDB._activities[j].attending) {
				mainText += " - " + resultFromDB._activities[j].title + "\n";
			} else {
				mainText += " - Venteliste " + resultFromDB._activities[j].title + "\n";
			}
			
		}	

		mainText += "\n\nBetalingsinformasjon:\nTotalpris for " + resultFromDB.firstName + " " + resultFromDB.lastName + ": kr " + resultFromDB.totalAmount + ",-";
		mainText += "\n\nVennlegst innbetal deltakaravgifta til konto 3705.19.76429 tilhøyrande Klenkarberget Sommarcamp v/Haugen Idrettslag innan 15. mai 2014. Vi ber om at innbetalinga vert merka med namn på deltakar(ar).";
		mainText += "\n\nEndeleg reservert plass blir stadfesta pr e-post når betaling er motteken. Dersom innbetaling ikkje er motteken innan betalingsfristen, vil plassen kunne gå til ein annan.";
		mainText += "\n\nFølgjande informasjon er registrert:";
		mainText += "\n\nNavn på deltakar: " + resultFromDB.firstName + " " + resultFromDB.lastName;
		mainText += "\nFødselsdato: " + resultFromDB.birthDate;
		mainText += "\nSpesielle omsyn: " + (isNullOrUndefined(resultFromDB.specialNeeds) ? "Ingen" : resultFromDB.specialNeeds);
		mainText += "\nKan delta på badeaktivitetar: " + convertYesNo(resultFromDB.canDoSwimming);
		mainText += "\nKan takast bilete av: " + convertYesNo(resultFromDB.canTakePictures);
		mainText += "\nKan takast video av: " + convertYesNo(resultFromDB.canTakeVideo);
		mainText += "\nKan nytte transport (buss/bil): " + convertYesNo(resultFromDB.canUseTransport);
		mainText += "\nPrimærkontakt: " + resultFromDB.parentOneFirstName + " " + resultFromDB.parentOneLastName;
		mainText += "\nMobilnr primærkontakt: " + resultFromDB.parentOnePhone;
		mainText += "\nE-post primærkontakt: " + resultFromDB.parentOneEmail;
		mainText += "\nSekundærkontakt: " + resultFromDB.parentTwoFirstName + " " + resultFromDB.parentTwoLastName;
		mainText += "\nMobilnr sekundærkontakt: " + resultFromDB.parentTwoPhone;
		mainText += "\nØvrige opplysningar: " + (isNullOrUndefined(resultFromDB.comments) ? "Ingen" : resultFromDB.comments);

		mainText += "\n\nVi ser fram til kjekke og minnerike dagar på Klenkarberget Sommarcamp 2014!";
		mainText += "\n\nMed vennleg helsing";
		mainText += "\n\nKlenkarberget Sommarcamp";

		mandrill('/messages/send', {
		    message: {
		        to: [{email: toEmail, name: toName}, {email: 'registrering@sommarcamp.no', name: 'registrering'}],
		        from_email	: 'post@sommarcamp.no',
		        from_name	: "Klenkarberget Sommarcamp",
		        subject		: "Registrering Sommarcamp 2014 - " + resultFromDB.firstName + " " + resultFromDB.lastName,
		        text		: mainText
		    }
		}, function(error, response) {
		    if (error) {
		    	console.log( JSON.stringify(error) );
		    } else {
		    	//console.log(response);
		    }
		});
	}

	//Helper to convert til "ja"/"nei" based on property
    function convertYesNo(prop) {
    	if(prop) {
    		return "Ja";
    	} else {
    		return "Nei";
    	}
    }

    //Helper to detect null or undefined properties
    function isNullOrUndefined(prop) {
    	if(prop == undefined || prop == null) {
    		return true;
    	} else {
    		return false;
    	}
    }

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
		var newActivity = new AvailableActivity ({	eventCode       : "U27CA",
											    title				: "Camp Adventures veke 27",
											    shortTitle			: "Camp Adv. veke 27",
											    maxAttending		: 40,
											    minBirthYear		: 2004,
											    blockEventCode		: "U27",
											    eventPrice			: 1500,
											    allowDiscount		: false, 
											});

		newActivity.save(function (err) {
			if(!QueryHasErrors(err, res)) {
		  		//console.log('Inserted Activity: ' + JSON.stringify(newActivity));
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

	app.get('/api/testmail', function (req, res){
		mandrill('/messages/send', {
		    message: {
		        to: [{email: 'marius@mundal.org', name: 'Marius Mundal'}],
		        from_email: 'post@sommarcamp.no',
		        subject: "Mandrill test mail",
		        text: "Mail fra sommarcamp API"
		    }
		}, function(error, response) {
		    if (error) {
		    	console.log( JSON.stringify(error) );
		    } else {
		    	console.log(response);
		    }
		});
	});

	/*app.get('/api/initpart', function (req, res){
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
	});*/
};