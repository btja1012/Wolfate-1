var express = require('express'),
	app = express(), // Web framework to handle routing requests
	cons = require('consolidate'), // Templating library adapter for Express
	MongoClient = require('mongodb').MongoClient, // Driver for connecting to MongoDB
	routes = require('./routes'); // Routes for our application

MongoClient.connect('mongodb://localhost:27017/wolfate', function(err, db) {
	"use strict";
	if(err) throw err;

	// Register our templating engine
	app.set('view engine', 'jade');
	app.set('views', __dirname + '/views');
	app.use(express.static(__dirname + '/public/themes'));

	// Express middleware to populate 'req.cookies' so we can access cookies
	app.use(express.cookieParser());

	// Express middleware to populate 'req.body' so we can access POST variables
	app.use(express.bodyParser());

	// Application routes
	routes(app, db);

	app.listen(4000);
	console.log('Express server listening on port 4000');
});
