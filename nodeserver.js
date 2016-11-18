// our custom app and db prototype wrapped around express and pgclient
var expressHugger = require ('./scriptapp');
var appDB = require ('./scriptdb');

// test setting up app instance
var db = new appDB.PgClient();
var myApp = new expressHugger.App();
myApp.setViews('./views', 'ejs');
myApp.setDatabase(db);

// test simple get
myApp.setTemplate ('jessica', { title: 'Palm Oil Locations', data: null });
myApp.get ('/');

// test database query load to page - "data" key added from query in getWithData
myApp.setTemplate ('jessica', { title: 'Palm Oil Locations' });
myApp.getData ('/jessica/', 'SELECT * FROM location');

// test get data as js object
myApp.getJSON ('SELECT * FROM location');

// test load data from url params
myApp.setTemplate ('jessica', { title: 'Palm Oil Locations' });
myApp.getDataWithParams ('/location/:locName/', 'SELECT * FROM location WHERE name=$1::text');

// test simple get that gives me a chance to callback for render, params
myApp.setTemplate ('jessica', {title: 'XYZTestCallback', data:null})
myApp.getWithCallback ('/cbtest/', function (req, res) {
	res.render (myApp.template, myApp.templateVars);
});


// test write
//myApp.setTemplate ('jessica', { title: 'Palm Oil Locations' });
//myApp.getDataWithParams ('/write/:relation', 'INSERT INTO $1::text(name) values($2::text)');

// test delete
//myApp.setTemplate ('jessica', { title: 'Palm Oil Locations' });
//myApp.getDataWithParams ('/wipe/:relation', 'DELETE * FROM location');

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
