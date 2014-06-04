// load up the participant model
var Participant = require('../app/models/participant.js');
var AvailableActivity = require('../app/models/availableActivity.js');
var mandrill = require('node-mandrill')('9fpTjC4TRNvpxej2vOEv1g');
var moment = require('moment-timezone');

module.exports = function(app, passport, ConnectionErrorCheck, QueryHasErrors, ReturnResults) {

	// route middleware to make sure a user is logged in
	function isLoggedIn(req, res, next) {
		// if user is authenticated in the session, carry on
		if (req.isAuthenticated())
			return next();

		// if they aren't redirect them to the home page
		res.redirect('/login');
	};

	// route middleware to protext REST API. Sending 401 UNAUTHORIZED on response.
	function isLoggedInSendUnauth(req, res, next) {
		// if user is authenticated in the session, carry on
		if (req.isAuthenticated())
			return next();

		// if they aren't send unauthorized message
		res.send(401, "Unauthorized"); 
	};

	// route middleware to prevent spamming on nonsecure api routes
	function containsPubKey(req, res, next) {
		// if user is authenticated in the session, carry on
		if (req.body.aSe === 191079)
			return next();

		// if they aren't send unauthorized message
		res.send(401, "Unauthorized"); 
	};

	//============================================================ List all participants
	app.get('/api/participants', isLoggedInSendUnauth, function (req, res){
		Participant.find({}).sort('regCompletedTime').exec(function(err, result) {
			if(!QueryHasErrors(err, res)) {
		  		ReturnResults(res, result, 201);
		  	}
		});
	});

	//============================================================ Get Spesific participant
	app.get('/api/participants/:id', isLoggedInSendUnauth, function (req, res){
		var query = { _id: req.params.id }
		Participant.findOne(query, function(err, result) {
			if(!QueryHasErrors(err, res)) {
		  		ReturnResults(res, result, 201);
		  	}
		});		
	});


	//============================================================ Delete participant
	app.delete('/api/participants/:id', isLoggedInSendUnauth, function (req, res){
		var query = {_id:req.params.id};
		Participant.findOneAndRemove(query, function(err, doc) {
        	if(!QueryHasErrors(err, res)) {
		  		console.log('Deleted Participant with ID = ' + req.params.id);
		  		ReturnResults(res, null, 204);
		  	}
      	});
	});

	//============================================================ Insert new participant
	app.post('/api/participants', containsPubKey, function (req, res){
		var newParticipant = new Participant ({	firstName       	: req.body.firstName,
											    lastName			: req.body.lastName,
											    birthDay			: req.body.birthDay,
											    birthMonth			: req.body.birthMonth,
											    birthYear			: req.body.birthYear,
											    birthDate			: req.body.birthDay + '/' + req.body.birthMonth + '/' + req.body.birthYear,
											   	_activities 		: req.body._activities,
											    _parents 			: null,
											    partArrPos			: req.body.partArrPos,
											    totalAmount			: req.body.totalAmount, 
											    hasPaid			: false, 
											    bookedTime			: moment().tz('Europe/Berlin').format()
											});

		newParticipant.save(function (err) {
			if(!QueryHasErrors(err, res)) {
		  		//console.log('Inserted Participant: ' + JSON.stringify(newParticipant));
		  		//console.log(req.body.bookedTime);
		  		ReturnResults(res, newParticipant, 201);
		  	}
		});
	});

	//============================================================ Update participant
	app.put('/api/participants/:id', containsPubKey, function (req, res){
		var query = { _id: req.params.id };
		//console.log(query);

		if(req.body.isFinalRegStep) {
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
						    regCompletedTime	: moment().tz('Europe/Berlin').format(),
						    regCompleted 		: true
						  }
		} else {
			var dateArr = req.body.birthDate.split("/");
			
			var update = { 	firstName       	: req.body.firstName,
							lastName       		: req.body.lastName,
							sex       			: req.body.sex,
							birthDate			: req.body.birthDate,
							birthDay 			: dateArr[0],
							birthMonth 			: dateArr[1],
							birthYear 			: dateArr[2],
							parentOneFirstName	: req.body.parentOneFirstName,
							parentOneLastName	: req.body.parentOneLastName,
							parentOnePhone		: req.body.parentOnePhone,
							parentOneEmail		: req.body.parentOneEmail,
							parentTwoFirstName	: req.body.parentTwoFirstName,
							parentTwoLastName	: req.body.parentTwoLastName,
							parentTwoPhone		: req.body.parentTwoPhone,
							specialNeeds		: req.body.specialNeeds,
							comments			: req.body.comments,
							canTakePictures     : req.body.canTakePictures,
							canTakeVideo     	: req.body.canTakeVideo,
						    canUseTransport     : req.body.canUseTransport,
						    canDoSwimming       : req.body.canDoSwimming,
						    totalAmount			: req.body.totalAmount, 
						    _activities			: req.body._activities
				
			  }
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

	//============================================================ Update paymentRegistration
	app.get('/api/regpayment/:id', isLoggedInSendUnauth, function (req, res){
		var query = { _id: req.params.id };

		var update = { 	hasPaid : true };
		
		Participant.findOneAndUpdate(query, update, null, function(err, result) {
			if(!QueryHasErrors(err, res)) {
				sendPaymentReceivedEmail(result.parentOneEmail, result.parentOneFirstName + " " + result.parentOneLastName, result);	

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
		mainText += "\n\nVennlegst innbetal deltakaravgifta til konto 3705.19.76429 tilhøyrande Klenkarberget Sommarcamp v/Haugen Idrettslag snarast og seinast i løpet av ei veke. Vi ber om at innbetalinga vert merka med namn på deltakar(ar).";
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
		        to: [{email: toEmail, name: toName}, {email: 'registrering@sommarcamp.no', name: 'registrering', type: 'bcc'}],
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

	function sendPaymentReceivedEmail(toEmail, toName, resultFromDB) {
		var mainText = "Hei\n\nVi har motteke innbetaling for deltaking på Klenkarberget Sommarcamp 2014, og kan med dette stadfeste plass for " + resultFromDB.firstName + " " + resultFromDB.lastName + " på følgjande aktivitet(ar):\n\n";
		for(var j = 0; j < resultFromDB._activities.length; j++) {
			if(resultFromDB._activities[j].attending) {
				mainText += " - " + resultFromDB._activities[j].title + "\n";
			} else {
				mainText += " - Venteliste " + resultFromDB._activities[j].title + "\n";
			}
			
		}

		mainText += "\n\nSOMMARCAMP & CAMP ADVENTURES";
		mainText += "\nKlenkarberget Sommarcamp er open frå kl 07.30 til kl 16.30. Basen for Sommarcamp er på Klenkarberget på Hauane, og Camp Adventures vil ha base i Hjemelandsdalen. Kvar dag skal barna registrerast inn mellom kl 07.30 og kl 09.00, og registrerast ut mellom kl 15.00 og kl 16.30. Det er viktig at barna kjem og reiser mellom desse tidspunkta slik at vi kan få gjennomført turar. Er det noko spesielt enkelte dagar som gjer at ein må avtale andre tidspunkt for henting og levering, så ordnar vi sjølvsagt dette.";
		mainText += "\n\nDeltakarar for Camp Adventures vil få eigen mail når det nærmar seg oppstart med meir informasjon om oppmøteplass og praktiske opplysningar.";
		mainText += "\n\nBarna må ha med seg kle og sko etter veirforholda, samt handkle, redningsvest og solkrem. Dersom de ikkje har redningsvest så kan dette lånast, men gje oss då ei tilbakemelding på post@sommarcamp.no.";
		mainText += "\n\nBarna vil få utdelt t-skjorte, caps og drikkeflaske på årets Sommarcamp. Vi presiserar at barna skal bruke både t-skjorte og caps kvar dag. Dersom det er kaldt i veiret så tek ein t-skjorta utanpå tjukkare gensar/jakke.";
		mainText += "\n\nBarna vil få servert lunsj av våre Fiskeriket-kokkar, men dersom barnet ditt treng ekstra mat i løpet av dagen eller ikkje vil ha den maten vi tilbyr, så ber vi om at dei tek med eigen matpakke.";
		mainText += "\n\nOVERNATTINGSTUR";
		mainText += "\nOgså i år vil vi gjenta suksessen med overnattingstur! Alle som deltek på Sommarcamp eller Camp Adventures kan vere med på turen, og i tillegg må gjerne foreldre, søsken og/eller besteforeldre vere med. Dette er ei oppleving for både store og små! :-)";
		mainText += "\n\nOvernattingsturen vil i år bli gjennomført frå fredag 11. juli til laurdag 12. juli. Vi vil sende ut meir informasjon og påmeldingsinformasjon om dette når det nærmar seg - men set av datoen allereie no! Vi gjer merksam på at deltakarprisen for overnattingsturen kjem i tillegg til deltakarprisen for Sommarcamp og Camp Adventures.";
		mainText += "\n\nVi gler oss til å bli betre kjent, og vi skal finne på mange kjekke aktivitetar i lag desse dagane.";
		mainText += "\nREGLANE VÅRE ER ENKLE - VI SKAL ALLTID GÅ SAMLA, VI SKAL ALLTID GÅ FINT OG VI SKAL ALLTID HØYRE PÅ DEI VAKSNE.";
		mainText += "\n\nHar de spørsmål så ta kontakt med Henning Haugen på telefon 918 67 977 eller send oss ein e-post på post@sommarcamp.no. Vi ønskjer hjarteleg velkomen til Klenkarberget Sommarcamp 2014!";
		mainText += "\n\nMed sommarleg helsing";
		mainText += "\nKlenkarberget Sommarcamp 2014";
		mainText += "\nwww.sommarcamp.no";
		mandrill('/messages/send', {
		    message: {
		        to: [{email: toEmail, name: toName}, {email: 'registrering@sommarcamp.no', name: 'registrering', type: 'bcc'}],
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

	//============================================================ Get participants waiting list status
	app.get('/api/waitingStatus', isLoggedInSendUnauth, function (req, res){
		Participant.aggregate([{ $project : {
									_id: 0,
							        firstName : 1 ,
							        lastName : 1 ,
							        regCompleted : 1,
							        regCompletedTime : 1,
							        _activities : 1}},
							     {$unwind: "$_activities"}, 
							     {$match: {'_activities.waiting': true}},
							     {$sort : { regCompletedTime : 1 } }//,
							     /*{$group: {_id: "$_activities.eventCode", nbParticipants: { $sum: 1 }}}*/], 
							     function(err, activities) {
			if(!QueryHasErrors(err, res)) {
				//console.log(activities);
				ReturnResults(res, activities, 201);
			}
		});
	});

	//============================================================ Get flat list of particpants pr. week. Used for filtering in client.
	app.get('/api/partflatlist'/*, isLoggedInSendUnauth*/, function (req, res){
		Participant.aggregate([{ $project : {
									_id: 0,
							        firstName : 1 ,
							        lastName : 1 ,
							        sex	: 1,
							        birthDate : 1,
							        birthDay : 1,
							        birthMonth : 1,
							        birthYear : 1,
							        parentOnePhone : 1,
							        parentTwoPhone: 1,
							        canTakePictures : 1,
							        canTakeVideo : 1,
							        canUseTransport : 1,
							        canDoSwimming : 1,
							        specialNeeds : 1,
							        comments : 1,
							        _activities : 1}},
							     {$unwind: "$_activities"}, 
							     {$match: {'_activities.attending': true}},
							     {$sort : { lastName : 1 } }//,
							     /*{$group: {_id: "$_activities.eventCode", nbParticipants: { $sum: 1 }}}*/], 
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

	/*app.get('/api/updateact', function (req, res){
		var query = { _id: '53441d6034e70727861043df' };

		var update = {	maxAttending		: 80};

		AvailableActivity.findOneAndUpdate(query, update, null, function(err, result) {
			if(!QueryHasErrors(err, res)) {
		  		ReturnResults(res, result, 201);	
		  	}
		});
	});*/

	/*app.get('/api/killacts', function (req, res){
		AvailableActivity.remove(function (err) {
			if(!QueryHasErrors(err, res)) {
		  		console.log('Deleted collection AvailableActivity');
		  	}
		});
	});*/

	/*app.get('/api/killparts', function (req, res){
		Participant.remove(function (err) {
			if(!QueryHasErrors(err, res)) {
		  		console.log('Deleted collection Participant');
		  	}
		});
	});*/

	app.get('/api/testmail', isLoggedInSendUnauth, function (req, res){
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


	// =====================================
	// LOGIN ===============================
	// =====================================
	// show the login form
	app.get('/login', function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('login.ejs', { message: req.flash('loginMessage') }); 
	});

	// process the login form
	app.post('/login', passport.authenticate('local-login', {
		successRedirect : '/#admOverview', // redirect to the secure profile section
		failureRedirect : '/login', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// SIGNUP ==============================
	// =====================================
	// show the signup form
	app.get('/signup', isLoggedInSendUnauth, function(req, res) {

		// render the page and pass in any flash data if it exists
		res.render('signup.ejs', { message: req.flash('signupMessage') });
	});

	// process the signup form
	app.post('/signup', passport.authenticate('local-signup', {
		successRedirect : '/#admOverview', // redirect to the secure profile section
		failureRedirect : '/signup', // redirect back to the signup page if there is an error
		failureFlash : true // allow flash messages
	}));

	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	/*app.get('/profile', isLoggedIn, function(req, res) {
		res.render('profile.ejs', {
			user : req.user // get the user out of session and pass to template
		});
	});*/

	// =====================================
	// LOGOUT ==============================
	// =====================================
	app.get('/logout', function(req, res) {
		req.logout();
		res.redirect('/login');
	});

	// =====================================
	// PROFILE SECTION =====================
	// =====================================
	// we will want this protected so you have to be logged in to visit
	// we will use route middleware to verify this (the isLoggedIn function)
	app.get('/admin', isLoggedIn, function(req, res) {
		res.redirect('/#admOverview');
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