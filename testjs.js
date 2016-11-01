// // postgres db connection
// var pg = require('pg');
// var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/orangutan';
// var db = new pg.Client(connectionString);
// db.connect();


// // simple server - run from terminal: node filename.js
// var http = require('http');
// var url = require('url');

// const host = '127.0.0.1';
// const port = 8080;

// // server headers and routes
// const server = http.createServer(function(req, res){
// 	res.statusCode = 200;
// 	res.setHeader('Content-Type', 'text/plain');
// 	res.writeHead(200, {"Content-Type": "text/plain"});
	
// 	// parse and use url
// 	var uri = url.parse(req.url).pathname;
// 	var txt = '';

// 	if (uri == '/') {
// 		// test passing in function
// 		getDatabaseOutput (db, 'SELECT * FROM location', function (data) {
// 			for (index in data.rows) {
// 				txt = txt + ' ' + data.rows[index].name;
// 			}
// 		});
// 	}
// 	res.write (txt);
// 	res.end();
// });

// server.listen(port, host, function() {
// 	console.log("Server running at http:\/\/"+host+":"+port+"\/");
// });

// // events
// server.on ('connect', function() {
// 	console.log ('Welcome!');
// });

// server.on ('close', function() {
// 	console.log ('Bye for now!');
// });



// // grab table data and run passed-in callback
// function getDatabaseOutput (client, query, callback) {
// 	/*
// 	 * 	@param {pg.Client} client 	 -  the database to query
// 	 *	@param {String}    query 	 -  the sql query to run
// 	 * 	@param {Function}  callback  -  the method to run on query end
// 	 */
 
// 	// run query then call your method
// 	client.query (query, function (error, output) {
		
// 		if (error) throw error;

// 		client.end (function (error) {
// 			if (error) throw error;
// 			client.end ();	
// 			callback (output);
// 		});
// 	});
// }


// // grab fake data and run passed-in callback
// function getOutput (callback) {
// 	// data to use in callback
// 	var dogs = {
// 		rows: [
// 			{
// 				name: 'Rar',
// 				type: 'fuzzy'
// 			},
// 			{
// 				name: 'Scars',
// 				type: 'floppy'
// 			},
// 			{
// 				name: 'Dubbins',
// 				type: 'dubbzy'
// 			}
// 		]
// 	};
// 	callback (dogs);			// run the user function
// }