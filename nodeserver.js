// import our js functions
var testmodule = require('./testmodule');

// routing and templating
var expressApp = require('express');
var app = expressApp();

// postgres db connection
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/orangutan';
var db = new pg.Client(connectionString);
db.connect();


// abstract out db connection and query scaffolding
function getDatabaseOutput (client, query, callback) {
	/*
	 * 	:client 	pg.Client 	the database to query
	 *	:query 		string 	 	the exact psql query to run
	 * 	:callback 	function 	the method to run on query end
	 */
 
	client.query (query, function (error, output) {
		
		if (error) throw error;

		client.end (function (error) {
			if (error) throw error;
			client.end ();	
			callback (output);
		});
	});
}


app.set('views', './views');
app.set('view engine', 'ejs');

app.get('/', function(req, res) {
	res.setHeader('Content-Type', 'text/plain');
	var txt = testmodule.init();
	res.end(txt);
})

.get('/jessica', function(req,res){
	res.render('jessica', { title: 'Jessica'});
})

.get('/subdir/:variableName/', function(req,res){
	res.setHeader('Content-Type', 'text/plain');
	res.end('Your variable is ' + req.params.variableName);
})

.get('/locations/', function(req,res){
	var o = null;

	// pass through client and query then handle output in callback
	getDatabaseOutput (db, 'SELECT * FROM location', function(output) {
		// iterate through data on callback
		if (o === null) o = '';
		for (index in output.rows) {
			o = o + output.rows[index].name;
		}
		// render page since db query is done and output parsed
		res.render('jessica', { title: o });
	});
	res.end(o);

	//
	// /* Example Query Events */
	// 
	// query = db.query('SELECT * FROM location');
	// 
	// // do while emitting rows
	// query.on ('row', function (row, result) {
	// //	result.addRow(row);
	// //	o = o + row.name + '\n';
	// });
	//
	// // end after last row emitted
	// query.on ('end', function (error) {
	// 	o = JSON.stringify(output.rows, null, "  ");
	// 	db.end();
	//	res.render ('jessica', { title: o });
	// });
})

.get('/locations/JSON/', function(req, res){
	res.setHeader('Content-Type', 'text/plain');
	var o = null; 	// store output text for user

	getDatabaseOutput (db, 'SELECT * FROM location', function (output) {
		if (o === null) o = JSON.stringify (output.rows, null, "  ");
		res.end(o);
	});
})

.get('/locations/:location/', function(req,res){
	o = 'output text';
	q = 'SELECT * FROM location WHERE name=$1::text';
	// read a single location
	db.query(q, [req.params.location], function (error, result) {
		if (error) throw error; 	// error while emanating rows
		o = result.rows[0];			// store output
		db.end(function(error){if (error) throw error;});	// error on close
	});
	res.render ('jessica', { title: o });
})

.get('/write/:locationName/', function(request,res){
	/*
	 * 	Test writing to db
	 */
	// see that you can access url variable
	console.log (locationName);

	// execute query queue
	var txt = 'Writing to database.';

	// // TODO interpolate locationName string var on this line
	// db.query("INSERT INTO location(name) values('someplace')");
	
	// read table data to verify insertion
	var query = db.query("SELECT * FROM location");
	// cycle through all rows
	query.on('row', function(row) { console.log(row.name); });
	// end after last row emitted
	query.on('end', function() { db.end(); });

	// display text in browser
	res.end(txt);
})

.get('/wipe/', function(request, result){
	// CAREFUL - wipes the relation
	var q = db.query("DELETE FROM location");
	q.on('row', function(r) { console.log(r.name); });
	q.on('end', function() { db.end(); });
	result.end('Successfully wiped table.');
})

.use(function(req,res,next){
});

app.listen(8080);

/*

https://openclassrooms.com/courses/ultra-fast-applications-using-node-js/node-js-modules-and-npm

http://cwbuecheler.com/web/tutorials/2013/node-express-mongo/

*/

/*

// simple server - run from terminal: node nodeserver.js
var http = require('http');
var url = require('url');

const host = '127.0.0.1';
const port = 8080;

const server = http.createServer(function(req, res){
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');

	testmodule.init();

	res.writeHead(200, {"Content-Type": "text/plain"});
	// parse and use url
	var uri = url.parse(req.url).pathname;
	if (uri == '/') {
		pageTxt = 'Homepage\n';
	} else if (uri == '/subdir') {
		pageTxt = 'One level down';
	}
	res.write (pageTxt);
	res.end('Hello World\n');
});

server.listen(port, host, function() {
	console.log("Server running at http:\/\/"+host+":"+port+"\/");
});

// events
server.on ('connect', function() {
	console.log ('Welcome!');
});

server.on ('close', function() {
	console.log ('Bye for now!');
});

*/
