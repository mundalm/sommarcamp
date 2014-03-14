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
    birthDate			: Date,
    _activities 		: [activitySchema],
    _parents 			: [parentSchema]
});

// define the schema for parent
var parentSchema = mongoose.Schema({
    firstName       : String,
    lastName		: String,
    phone			: String,
    email			: String
});

// define the schema for event
var activitySchema = mongoose.Schema({
    eventCode       : String, 
    title       	: String,
    shortTitle		: String,
});

// create the model for users and expose it to our app
module.exports = mongoose.model('Participant', participantSchema);