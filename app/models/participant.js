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
    parentTwoFirstName  : String,
    parentTwoLastName   : String,
    parentTwoPhone      : String,
    parentTwoEmail      : String,
    canTakePictures     : Boolean,
    canUseTransport     : Boolean,
    canDoSwimming       : Boolean,
    comments            : String,
    totalAmount         : Number,
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