// routing and templating
var expressApp = require('express');
var app = expressApp();

// postgres db connection
var pg = require('pg');
var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/orangutan';
var db = new pg.Client(connectionString);
db.connect();



// TEST! build prototype to handle app functionality
var App = function (client, viewDirectory, viewEngine) {
	/*
	 * 	@param {pg.Clent} client 		- the database to query for models
	 * 	@param {String} viewDirectory 	- where to look for views templates
	 * 	@param {String} viewEngine 		- view engine to use when rendering 
	 */
	this.client = client;
	this.views = viewDirectory;
	this.viewEngine = viewEngine;
	console.log ("Created app instance!");
}
App.prototype.setViews = function () {
	app.set ('views', this.views);
	app.set ('view engine', this.viewEngine);
}
App.prototype.getDatabaseOutput = function (query, queryArgs) {
	// query client db with this query and optional string interpolation array
	getDatabaseOutput (this.client, query, queryArgs, function (o) {
		return o;
	});
}
App.prototype.get = function (route, template, viewVars) {
	// simple get using rendered template and passed in template variables object
	app.get (route, function (req, res) {
		res.setHeader ('Content-Type', 'text/plain');
		res.render (template, viewVars);
	});
}
App.prototype.getWithData = function (route, query, queryArgs, template, viewVars) {
	/*
	 * 	Define endpoint, query to run and template to render
	 * 	template - a template for this object's viewEngine
	 *  viewVars - object notation where keys are var names from template
	 *			   and values are 
	 */
	app.get(route, function (req, res) {
		res.setHeader('Content-Type', 'text/plain');
		getDatabaseOutput (this.client, query, queryArgs, function (output) {
			// reference data on callback
			var o = output.rows;
			// add data to template variables
			viewVars[data] = o;
			// render page since db query is done and output parsed
			res.render (template, viewVars);
		});
	})
}
App.prototype.getJSON = function (route, query, qArgs) {
	/*
	 * 	Define endpoint and query for JSON
	 */
	app.get (route, function (req, res) {
		res.setHeader ('Content-Type', 'text/plain');
		getDatabaseOutput (this.clent, query, qArgs, function (output) {
			o = JSON.stringify (output.rows, null, "  ");
			res.end (o);
		})
	});
}
var myApp = new App (db, './views', 'ejs');
myApp.get('/test/', 'SELECT * FROM location', [], 'jessica', {title: 'xyz'});
// END TEST


// abstract out db connection and query scaffolding
function getDatabaseOutput (client, query, qStrArgs, callback) {
	/*
	 * 	@param {pg.Client} client 	 -  the database to query
	 *	@param {String}    query 	 -  the sql query to run
	 * 	@param {Function}  callback  -  the method to run on query end
	 * 	@param {Array} 	   qStrArgs  - 	string interpolations in query
	 */
 
	// run query then call your method
	client.query (query, qStrArgs, function (error, output) {
		
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

app.get('/', function (req, res) {
	res.setHeader('Content-Type', 'text/plain');
	res.end('root');
})

.get('/jessica', function (req, res) {
	res.render('jessica', { title: 'Jessica'});
})

.get('/locations/', function (req, res) {
	// pass through client and query then handle output in callback
	getDatabaseOutput (db, 'SELECT * FROM location', [], function(output) {
		// reference data on callback
		var o = output.rows;
		// render page since db query is done and output parsed
		res.render('jessica', { title: 'Palm Oil Locations', data: o });
	});
	//res.end(o);

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

.get('/locations/JSON/', function (req, res){
	var o = null; 	// store output text for user

	getDatabaseOutput (db, 'SELECT * FROM location', [], function (output) {
		o = JSON.stringify (output.rows, null, "  ");
		res.end(o);
	});
})

.get('/locations/:location/', function (req, res) {
	// read a single location with request.params.variableName
	var q = 'SELECT * FROM location WHERE name=$1::text';
	getDatabaseOutput (db, q, [req.params.location], function (output) {
		var o = output.rows;
		res.render ('jessica', { title: 'Single Palm Oil Location', data: o });
	});
})

.get('/write/:location/', function (req,res){
	// create insert query
	var q = 'INSERT INTO location(name) values($1::text)';
	// run insert query and reference data on callback
	getDatabaseOutput (db, q, [req.params.location], function (output) {
		res.render ('jessica', { title: 'Location added!', data: output });
	});
})

.get('/wipe/:relation/', function (req, res){
	// CAREFUL - wipes the relation
	var q = 'DELETE FROM $1::text';
	// run insert query and reference data on callback
	getDatabaseOutput (db, q, [req.params.relation], function (output) {
		res.end ('Successfully wiped table!');
	});
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
