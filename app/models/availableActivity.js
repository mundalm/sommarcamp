var mongoose = require('mongoose');

// define the schema for event
var availableActivitySchema = mongoose.Schema({
    eventCode       : String, 
    title       	: String,
    shortTitle		: String,
    maxAttending	: Number,  
    attending       : Number,
    minBirthYear    : Number,
    fewLeft         : { type: Boolean, default: false } 
});

// create the model for users and expose it to our app
module.exports = mongoose.model('AvailableActivity', availableActivitySchema);