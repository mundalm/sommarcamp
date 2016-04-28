// load up the participant model
var Participant = require('../app/models/participant.js');
var AvailableActivity = require('../app/models/availableActivity.js');
//var mandrill = require('node-mandrill')('9fpTjC4TRNvpxej2vOEv1g');
var api_key = 'key-6bbced76001e8c51c39e205cc52bda56';
var domain = 'mundal.org';
var Mailgun_module = require('mailgun-js');
var mailgun = new Mailgun_module({apiKey: api_key, domain: domain});



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
											    sex					: req.body.sex, 
											    hasPaid				: false, 
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

	//============================================================ Update paymentRegistration
	app.get('/api/sendreminder/:id', isLoggedInSendUnauth, function (req, res){
		var query = { _id: req.params.id };

		var update = { };
		
		Participant.findOne(query, function(err, result) {
			if(!QueryHasErrors(err, res)) {
				sendReminderEmail(result.parentOneEmail, result.parentOneFirstName + " " + result.parentOneLastName, result);	

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
			} else if(resultFromDB._activities[j].waiting) {
				mainText += " - Venteliste " + resultFromDB._activities[j].title + "\n";
			}
			
		}	

		mainText += "\n\nBetalingsinformasjon:\nTotalpris for " + resultFromDB.firstName + " " + resultFromDB.lastName + ": kr " + resultFromDB.totalAmount + ",-";
		mainText += "\n\nVennlegst innbetal deltakaravgifta til konto 3705.19.76429 tilhøyrande Klenkarberget Sommarcamp v/Haugen Idrettslag innan 15. mai 2016. Vi ber om at innbetalinga vert merka med namn på deltakar(ar).";
		mainText += "\n\nEndeleg reservert plass blir stadfesta pr e-post når betaling er motteken. Dersom innbetaling ikkje er motteken innan betalingsfristen, vil plassen kunne gå til ein annan. Det vert ikkje refundert deltakaravgift dersom ein ønskjer å seie frå seg plassen etter at plassen er stadfesta og innbetalt.";
		mainText += "\n\nFølgjande informasjon er registrert:";
		mainText += "\n\nNavn på deltakar: " + resultFromDB.firstName + " " + resultFromDB.lastName;
		mainText += "\nFødselsdato: " + resultFromDB.birthDate;
		mainText += "\nKjønn: " + resultFromDB.sex;
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

		mainText += "\n\nVi ser fram til kjekke og minnerike dagar på Klenkarberget Sommarcamp 2016!";
		mainText += "\n\nMed venleg helsing";
		mainText += "\n\nKlenkarberget Sommarcamp";

		/*mandrill('/messages/send', {
		    message: {
		        to: [{email: toEmail, name: toName}, {email: 'registrering@sommarcamp.no', name: 'registrering', type: 'bcc'}],
		        from_email	: 'post@sommarcamp.no',
		        from_name	: "Klenkarberget Sommarcamp",
		        subject		: "Registrering Sommarcamp 2016 - " + resultFromDB.firstName + " " + resultFromDB.lastName,
		        text		: mainText
		    }
		}, function(error, response) {
		    if (error) {
		    	console.log( JSON.stringify(error) );
		    } else {
		    	//console.log(response);
		    }
		});*/

		var data = {
		  from:  'Klenkarberget Sommarcamp <post@sommarcamp.no>',
		  to: toEmail,
		  subject: 'Registrering Sommarcamp 2016 - ' + resultFromDB.firstName + ' ' + resultFromDB.lastName,
		  text: mainText
		};

		mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
		
		
	}

	function sendPaymentReceivedEmail(toEmail, toName, resultFromDB) {
		var mainText = "Hei\n\nVi har motteke innbetaling for deltaking på Klenkarberget Sommarcamp 2016, og kan med dette stadfeste plass for " + resultFromDB.firstName + " " + resultFromDB.lastName + " på følgjande aktivitet(ar):\n\n";
		for(var j = 0; j < resultFromDB._activities.length; j++) {
			if(resultFromDB._activities[j].attending) {
				mainText += " - " + resultFromDB._activities[j].title + "\n";
			} /*else if(resultFromDB._activities[j].waiting) {
				mainText += " - Venteliste " + resultFromDB._activities[j].title + "\n";
			}*/
			
		}

		mainText += "\n\nKlenkarberget Sommarcamp:";
		mainText += "\nKlenkarberget Sommarcamp er open frå kl. 07.30 til kl. 16.30. Basen for Sommarcamp er på Klenkarberget på Hauane. Levering kl. 07.30-09.00. Henting kl. 15.00-16.30.";				
		mainText += "\n\nBarna på Klenkarberget Sommarcamp må ha med seg kle og sko etter værforholda (også skifteklede), handkle, ryggsekk, redningsvest (dersom barnet ikkje har kan dette lånast. Send ein mail til post@sommarcamp.no), drikkeflaske, badeklede (for dei som vil bade) og solkrem."; 
		mainText += "\n\nBarna vil få eigen garderobeplass, der ein kan henge frå seg kle frå dag til dag. Fint om de sjekkar plassen kvar dag, for våte kle og liknande. MERK ALLE EIGENDELAR!";
		mainText += "\n\nCamp Adventures:";
		mainText += "\nCamp Adventures er open frå kl. 07.30 til kl. 16.00. Basen for Cam Aventures er på Harpefossen fjellstove i Hjelmelandsdalen. Levering kl. 07.30-09.00. Henting kl. 15.30-16.00.";
		mainText += "\n\nBarna på Camp Adventures må ha med seg kle og sko etter vêrforholda (også skiftekle), badekle, eventuelt sandalar for bruk i vatn, ryggsekk, drikkeflaske, handkle, sykkel og sykkelhjelm, fiskestang (for dei som vil), kniv, litt dopapir, solkrem og myggspray."; 
		mainText += "\n\nSyklane og noko av utstyret kan setjast igjen på Harpefossen, der det vil bli låst kvar dag."; 
		mainText += "\n\nGjeld alle:";
		mainText += "\n\nDet er viktig at ein registrerer barna når ein kjem om morgonen og at barna blir registrert ut ved henting. Om det er noko spesielt som gjer at ein kjem seinare på morgonen, eller skal bli henta tidlegare på ettermiddagen er det viktig at ein avtalar dette på førehand. ";
		mainText += "\n\nBarna vil få utdelt t-skjorte første dagen og vi presiserer at desse skal brukast kvar dag. Dersom det er kaldt, tek ein t-skjorta utanpå genser/jakke.";
		mainText += "\n\nBarna vil få servert eit næringsrikt måltid til lunsj og eit fruktmåltid på ettermiddagen.";
		mainText += "\n\nVi ber om at ein legg igjen godteri og teknologiske duppeditter heime. Har ein med seg telefon, skal denne ligge i sekken og berre brukast etter avtale med aktivitetsleiar. Alle personlege eigendeler blir tatt med på eige ansvar.";
		mainText += "\n\nCamp Family:";
		mainText += "\nFredag 1. juli kl. 17.00 – laurdag 2. juli kl. 10.00. Vi inviterer heile familien på overnatting i telt og lavvo, og det blir aktivitetar til langt på kveld. Dei eldste barna vil få tilbod om ein lengre tur i lag med Rogier van Oorschot med overnatting på fjellet. Påmelding til post@sommarcamp.no innan tysdag 28.juni (Avgrensa med plassar!) Merk påmeldinga md «Overnatting» og få med namn og alder på dei som meldast på. Prisen er kr. 300 for eitt barn og kr. 500 for ein familie (barn med søsken og foreldre). Kveldsmat  og frukost er inkludert.";
		mainText += "\n\nVi gler oss til å bli betre kjend og vi skal finne på mange kjekke aktivitetar desse dagane.";
		mainText += "\n\nHar de spørsmål så ta kontakt med Henning Haugen på telefon 918 67 977 eller send oss ein e-post på post@sommarcamp.no. Sjekk også heimesida vår www.sommarcamp.no. Vi ønskjer hjarteleg velkomen til Klenkarberget Sommarcamp 2016!";
		mainText += "\n\nMed vennleg helsing";
		mainText += "\nKlenkarberget Sommarcamp";
		
		/*mandrill('/messages/send', {
		    message: {
		        to: [{email: toEmail, name: toName}, {email: 'registrering@sommarcamp.no', name: 'registrering', type: 'bcc'}],
		        from_email	: 'post@sommarcamp.no',
		        from_name	: "Klenkarberget Sommarcamp",
		        subject		: "Betalingsbekreftelse Sommarcamp 2016 - " + resultFromDB.firstName + " " + resultFromDB.lastName,
		        text		: mainText
		    }
		}, function(error, response) {
		    if (error) {
		    	console.log( JSON.stringify(error) );
		    } else {
		    	//console.log(response);
		    }
		});*/

		var data = {
		  from:  'Klenkarberget Sommarcamp <post@sommarcamp.no>',
		  to: toEmail,
		  subject: 'Betalingsbekreftelse Sommarcamp 2016 - ' + resultFromDB.firstName + ' ' + resultFromDB.lastName,
		  text: mainText
		};

		mailgun.messages().send(data, function (error, body) {
		  console.log(body);
		});
	}

	function sendReminderEmail(toEmail, toName, resultFromDB) {
		var mainText = "Hei\n\nVi kan ikkje sjå at vi har motteke innbetaling for deltaking på Klenkarberget Sommarcamp 2016. Vi viser til tidlegare oversendt mail der innbetalingsfristen var sett til 15. mai 2016.";
		mainText += "\n\nVi ber om snarleg tilbakemelding på om barnet ditt fortsatt ønskjer å delta på årets Sommarcamp. Dette kan stadfestast ved å innbetale deltakaravgifta. Vi gjer merksam på at ved manglande innbetaling kan vi tildele plassen til andre.";		
		mainText += "\n\nDersom innbetaling er foretatt siste døgnet så ber vi om at de ser vekk frå denne påminninga."; 
		mainText += "\n\nTa gjerne kontakt med oss om det skulle vere spørsmål.";
		mainText += "\n\nMed vennleg helsing";
		mainText += "\nKlenkarberget Sommarcamp";
		
		/*mandrill('/messages/send', {
		    message: {
		        to: [{email: toEmail, name: toName}, {email: 'registrering@sommarcamp.no', name: 'registrering', type: 'bcc'}],
		        from_email	: 'post@sommarcamp.no',
		        from_name	: "Klenkarberget Sommarcamp",
		        subject		: "Betalingspåminning Klenkarberget Sommarcamp 2016 - " + resultFromDB.firstName + " " + resultFromDB.lastName,
		        text		: mainText
		    }
		}, function(error, response) {
		    if (error) {
		    	console.log( JSON.stringify(error) );
		    } else {
		    	//console.log(response);
		    }
		});*/
		var data = {
		  from:  'Klenkarberget Sommarcamp <post@sommarcamp.no>',
		  to: toEmail,
		  subject: 'Betalingspåminning Klenkarberget Sommarcamp 2016 - ' + resultFromDB.firstName + ' ' + resultFromDB.lastName,
		  text: mainText
		};

		mailgun.messages().send(data, function (error, body) {
		  console.log(body);
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
							        parentOneEmail : 1,
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
		var query = { _id: '5342dc2b57283e6d31d471f3' };

		var update = {	fewleft		: 5};

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