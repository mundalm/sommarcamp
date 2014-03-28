var mongoose = require('mongoose');

// define the schema for child
var participantSchema = mongoose.Schema({
	bookedTime     		: { type: Date, default: Date.now },
	regCompletedTime    : Date,
    firstName       	: String,
    lastName			: String,
    birthDay			: Number,
    birthMonth			: Number,
    birthYear			: Number,
    birthDate			: String,
    partArrPos          : Number, 
    specialNeeds        : String,
    parentOneFirstName  : String,
    parentOneLastName   : String,
    parentOnePhone      : String,
    parentOneEmail      : String,
    parentOneAdr        : String,
    parentOnePostalCode : String,
    parentOneCity       : String,
    parentTwoFirstName  : String,
    parentTwoLastName   : String,
    parentTwoPhone      : String,
    parentTwoEmail      : String,
    parentTwoAdr        : String,
    parentTwoPostalCode : String,
    parentTwoCity       : String,
    canTakePictures     : Boolean,
    canUseTransport     : Boolean,
    canDoSwimming       : Boolean,
    _activities 		: [activitySchema]
});

// define the schema for event
var activitySchema = mongoose.Schema({
    eventCode       : String, 
    attending       : Boolean, 
    waiting         : Boolean,
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Participant', participantSchema);