// Custom app and db prototype built around express and pgclient
var expressWrap = require ('./scriptapp');
var appDB = require ('./scriptdb');

// Set up app instance
var db = new appDB.PgClient();
var myApp = new expressWrap.App();
myApp.setViews('./views', 'ejs');
myApp.setDatabase(db);

// build content loader prototype to bring in html body partials
var ContentFormatter = function () {
	this.content = '';
	// by default expects html body content
	this.inBody = true;
};
ContentFormatter.prototype.addContent = function (content) {
	this.content = this.content + content;
}
ContentFormatter.prototype.setContent = function (content) {
	this.content = content;
}
ContentFormatter.prototype.makeList = function (a, ordered, lID, lClass) {
	// build a basic unordered or ordered list
	var listType = 'ul'
	var listClass = '';
	var listID = '';
	if (ordered !== undefined && ordered) listType = 'ol';
	if (lClass !== undefined) listClass = ' class = "'+lClass+'"';
	if (lID !== undefined) listID = ' id = "'+lID+'"';
	var output = '<'+listType+'>\n';
	for (i in a) {
		output = output + '<li>' + a[i] + '</li>'; 
	}
	var output = output + '</'+listType'>\n';
	this.addContent (output);
}


// set scaffolding template that we'll pass different "body" keys
myApp.setMainTemplate ('main');

// Example get/query/render using the Express app .get method
// - set template and templateVars for an endpoint
// - add "data" key on query end
myApp.app.get ('/', function (req, res) {
	myApp.templateVars = {
		body: 'default',
		content: '<p>Test content to insert into body!</p>'
	};
	db.query ('SELECT * FROM location', [], function (o) {
		myApp.templateVars.data = o.rows;
		res.render (myApp.mainTemplate, myApp.templateVars);
	});
});

// Example get and render page using our scriptapp .get method
//  - the method checks for undefined query and query string args
// 	- this version calls it for a simple render 
myApp.templateVars = {
	body: 'jessica',
	title: 'My List of Palm Oil Locations'
};
myApp.get ('/jessica/');

// Example get/query/render using our own scriptapp .get method
// 	- "data" key added to templateVars because passed in a query
myApp.templateVars = {
	body: 'body-list',
	title: 'Another List of Palm Oil Locations'
};
myApp.get ('/locationTest1/:name', 'SELECT * FROM location');

// same as above but pass in object to replace specific query vars
myApp.get ('/locationTest2/:name', {
	body: 'body-list',
	title: 'Another List of Palm Oil Locations'
}, 'SELECT * FROM location WHERE name=$1::text', {0:'San Fracaso'} );

// as above but test using query statement builder
var q = db.select('location').where({'id':2,'name':['Kyoto','Tokyo']}, 1);
myApp.get ('/locationTest3/:name', {
	body: 'body-list',
	title: 'Another List of Palm Oil Locations'
}, q, { 1:'San Fracaso' } );

// same as above but pass in integer list to reorder query params
myApp.get ('/location/:entryName/:index/', [1,0], 'SELECT * FROM location WHERE name=$1::text AND index=$2::int', true)

// Example getting data as js object
myApp.getJSON ('/JSON/', 'SELECT * FROM location');

// Example loading data from url params
myApp.getWithParams ('/locationTest2/:locName/', {
	body: 'body-list',
	title: 'Some Title'
}, 'SELECT * FROM location WHERE name=$1::text');

// Example callback - basic variant using the js framework .get
//myApp.setTemplate ('jessica', {title: 'XYZTestCallback'})
myApp.app.get ('/stringTest/locations/', function (req, res) {
	myApp.templateVars = { body: 'body-list', title: 'Locations' };
	db.query ('SELECT * FROM location', [], function (output) {
		myApp.templateVars.data = output.rows;
		res.render (myApp.mainTemplate, myApp.templateVars);
	});
});

// Example custom callback - variant parsing uri param and passing to query
myApp.app.get ('/qinterpolationTest/location/:locID/', function (req, res) {
	var id = req.params.locID;
	db.query ('SELECT * FROM location WHERE id=$1::int', [id], function (output) {
		myApp.templateVars.data = output.rows;
		res.render (myApp.mainTemplate, myApp.templateVars);
	});
});

// Example custom callback - variant writing to the database
myApp.get ('/insertTest/location/:newLocationEntry/', 'INSERT INTO location(name) values($1::text)', true);

// ?broken? - Example delete all from table
//myApp.setTemplate ('jessica', { title: 'Palm Oil Locations' });
myApp.get ('/location/wipe', 'DELETE * FROM location', false);

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
