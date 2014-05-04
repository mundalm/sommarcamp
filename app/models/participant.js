var mongoose = require('mongoose');

// define the schema for child
var participantSchema = mongoose.Schema({
	bookedTime     		: Date,
	regCompletedTime    : Date,
    firstName       	: String,
    lastName			: String,
    birthDay			: Number,
    birthMonth			: Number,
    birthYear			: Number,
    birthDate			: String,
    sex                 : String,
    partArrPos          : Number, 
    specialNeeds        : String,
    parentOneFirstName  : String,
    parentOneLastName   : String,
    parentOnePhone      : String,
    parentOneEmail      : String,
    parentTwoFirstName  : String,
    parentTwoLastName   : String,
    parentTwoPhone      : String,
    hasPaid             : Boolean,
    //parentTwoEmail      : String,
    canTakePictures     : Boolean,
    canTakeVideo        : Boolean,
    canUseTransport     : Boolean,
    canDoSwimming       : Boolean,
    comments            : String,
    totalAmount         : Number,
    regCompleted        : {type: Boolean, default: false},
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