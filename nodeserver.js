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
.get('/read/', function(req,res){
	/*
	 * 	Test reading from db	
	 */
	var txt = null;
	var query = db.query("SELECT * FROM location");
	query.on('row', function(row, result){
		if (txt === null) txt = "";
		result.addRow(row);
		txt = txt + "Location name: " + row.name + "\n";
	});
	// end after last row emitted
	query.on('end', function(result){
		console.log(JSON.stringify(result.rows, null, "  "));
		db.end();
		if (txt === null) txt = "No rows in the table.";
		res.render('jessica', { title: txt });
	});
})
.get('/write/:val/', function(req,res){
	/*
	 * 	Test writing to db
	 */
	// execute query queue
	var txt = 'Writing to database.';
	var queue = 1;
	while (queue > 0) {
		db.query("INSERT INTO location(name) values("+req.params.val+")");
		queue = queue-1;
		txt='';
	}
	var query = db.query("SELECT * FROM location");
	query.on('row', function(row) { console.log(row.name); });
	// end after last row emitted
	query.on('end', function() { db.end(); });
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
