var application_root = __dirname,
	http = require("http"),
    express = require("express"),
    path = require("path"),
    //mysql = require('mysql');
    mongoose = require('mongoose');
 
// MongoDB configuration ===============================================================
var configMongoDB = require('./config/mongodb.js');

mongoose.connect(configMongoDB.url, function (err, res) {
  if (err) {
    console.log ('ERROR connecting to: ' + configMongoDB.url + '. ' + err);
  } else {
    console.log ('Connected to: ' + configMongoDB.url);

    mongoose.connection.on('error', function(err) {
      console.error('connection error: ' + err);
    });
    
  }
});

var app = express();
var httpServer = http.createServer(app);

// Database

/*var pool  = mysql.createPool({
  host     : '127.0.0.1',
  user     : 'root',
  password : 'develop79!',
  database : 'pman'
});*/

// Config
app.configure(function () {
  app.use(express.json());
  app.use(express.urlencoded());
  app.use(express.methodOverride());
  app.use(app.router);
  app.use(express.static(path.join(application_root, "public")));
  app.use(express.errorHandler({ dumpExceptions: true, showStack: true }));
});

// routes ======================================================================
require('./routes')(app, null /*pool*/);


// Launch server ===============================================================
httpServer.listen(4242);


