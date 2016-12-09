// Custom app and db prototype built around express and pgclient
var expressWrap = require ('./scriptapp');
var appDB = require ('./scriptdb');

// Set up app instance
var db = new appDB.PgClient();
var myApp = new expressWrap.App();
myApp.setViews('./views', 'ejs');
myApp.setDatabase(db);


// Example querying and rendering page - "data" key added on query end
myApp.setTemplate ('main', { body: 'default', pageTitle: 'title to display in browser', title: 'Palm Oil Locations' });
myApp.app.get ('/', function (req, res) {
	myApp.template = 'main';
	myApp.templateVars = {
		body: 'jessica',
		title: 'Palm Oil locations',
		data: null
	};
	db.query ('SELECT * FROM location', [], function (o) {
		myApp.templateVars.data = o.rows;
		res.render (myApp.template, myApp.templateVars);
	});
});

// Example get and render page
// I included a "data" key because this template expects it.
// the .get method will insert that key if you include query param after route 
myApp.setTemplate ('jessica', { title: 'Palm Oil Locations', data: null });
myApp.get ('/jessica/');

// Example getting data as js object
myApp.getJSON ('/JSON/', 'SELECT * FROM location');

// Example loading data from url params
myApp.setTemplate ('jessica', { title: 'Palm Oil Locations' });
myApp.getWithParams ('/location/:locName/', 'SELECT * FROM location WHERE name=$1::text');

// Example custom callback - basic variant
myApp.setTemplate ('jessica', {title: 'XYZTestCallback'})
myApp.app.get ('/stringTest/locations/', function (req, res) {
	db.query ('SELECT * FROM location', [], function (output) {
		myApp.templateVars.data = output.rows;
		res.render (myApp.template, myApp.templateVars);
	});
});

// Example custom callback - variant parsing uri param and passing to query
myApp.setTemplate ('jessica', {title: 'XYZTestCallback'})
myApp.app.get ('/qinterpolationTest/location/:locID/', function (req, res) {
	var id = req.params.locID;
	db.query ('SELECT * FROM location WHERE id=$1::int', [id], function (output) {
		myApp.templateVars.data = output.rows;
		res.render (myApp.template, myApp.templateVars);
	});
});

// Example custom callback - variant writing to the database
myApp.app.get ('/insertTest/location/:newLocationEntry/', function (req, res) {
	var entry = req.params.newLocationEntry;
	db.query ('INSERT INTO location(name) values($1::text)', [entry], function (output) {
		res.end ("Successfully added " + entry + " to locations.");
	});
});

// ?broken? - Example delete all from table
myApp.setTemplate ('jessica', { title: 'Palm Oil Locations' });
myApp.get ('/location/wipe', 'DELETE * FROM location');

myApp.listen (8080);


// app.set('views', './views');
// app.set('view engine', 'ejs');

// app.get('/', function (req, res) {
// 	res.setHeader('Content-Type', 'text/plain');
// 	res.end('root');
// })

// .get('/jessica', function (req, res) {
// 	res.render('jessica', { title: 'Jessica'});
// })

// .get('/locations/', function (req, res) {
// 	// pass through client and query then handle output in callback
// 	getDatabaseOutput (db, 'SELECT * FROM location', [], function(output) {
// 		// reference data on callback
// 		var o = output.rows;
// 		// render page since db query is done and output parsed
// 		res.render('jessica', { title: 'Palm Oil Locations', data: o });
// 	});
// 	//res.end(o);

// 	//
// 	// /* Example Query Events */
// 	// 
// 	// query = db.query('SELECT * FROM location');
// 	// 
// 	// // do while emitting rows
// 	// query.on ('row', function (row, result) {
// 	// //	result.addRow(row);
// 	// //	o = o + row.name + '\n';
// 	// });
// 	//
// 	// // end after last row emitted
// 	// query.on ('end', function (error) {
// 	// 	o = JSON.stringify(output.rows, null, "  ");
// 	// 	db.end();
// 	//	res.render ('jessica', { title: o });
// 	// });
// })

// .get('/locations/JSON/', function (req, res){
// 	var o = null; 	// store output text for user

// 	getDatabaseOutput (db, 'SELECT * FROM location', [], function (output) {
// 		o = JSON.stringify (output.rows, null, "  ");
// 		res.end(o);
// 	});
// })

// .get('/locations/:location/', function (req, res) {
// 	// read a single location with request.params.variableName
// 	var q = 'SELECT * FROM location WHERE name=$1::text';
// 	getDatabaseOutput (db, q, [req.params.location], function (output) {
// 		var o = output.rows;
// 		res.render ('jessica', { title: 'Single Palm Oil Location', data: o });
// 	});
// })

// .get('/write/:location/', function (req,res){
// 	// create insert query
// 	var q = 'INSERT INTO location(name) values($1::text)';
// 	// run insert query and reference data on callback
// 	getDatabaseOutput (db, q, [req.params.location], function (output) {
// 		res.render ('jessica', { title: 'Location added!', data: output });
// 	});
// })

// .get('/wipe/:relation/', function (req, res){
// 	// CAREFUL - wipes the relation
// 	var q = 'DELETE FROM $1::text';
// 	// run insert query and reference data on callback
// 	getDatabaseOutput (db, q, [req.params.relation], function (output) {
// 		res.end ('Successfully wiped table!');
// 	});
// })

// .use(function(req,res,next){
// });

// app.listen(8080);

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
