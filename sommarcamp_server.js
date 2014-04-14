var application_root = __dirname;
var http = require("http");
var express = require("express");

var app = express();
var port     = process.env.PORT || 4042;
var httpServer = http.createServer(app);

var path = require("path");
var mongoose = require('mongoose');
var passport = require('passport');
var flash = require('connect-flash');

 
// MongoDB configuration ===============================================================
var configMongoDB = require('./config/mongodb.js');

require('./config/passport')(passport);

mongoose.connect(configMongoDB.url, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + configMongoDB.url + '. ' + err);
  } else {
    console.log ('Connected to: ' + configMongoDB.url);

    mongoose.connection.on('error', function(err) {
      console.error('CONNECTION ERROR OCURRED: ' + err);
    });
    
  }
});


// Config
app.configure(function () {
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));

  app.use(express.cookieParser()); // read cookies (needed for auth)
  //app.use(express.bodyParser()); // get information from html forms

  app.set('view engine', 'ejs'); // set up ejs for templating

  // required for passport
  app.use(express.session({ secret: 'ilovescotchscotchyscotchscotch' })); // session secret
  app.use(passport.initialize());
  app.use(passport.session()); // persistent login sessions
  app.use(flash()); // use connect-flash for flash messages stored in session

  app.use(app.router);
});

// routes ======================================================================
require('./routes')(app, passport);


// Launch server ===============================================================
//httpServer.listen(process.env.PORT); //Prod
httpServer.listen(port); //Dev


