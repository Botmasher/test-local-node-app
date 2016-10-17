// import our js functions
var testmodule = require('./testmodule');

// routing and templating
var expressApp = require('express');
var app = expressApp();

app.set('views', './views');
app.set('view engine', 'ejs');

// postgres db connection
const pg = require('pg');
const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/orangutan';
const client = new pg.Client(connectionString);
client.connect();

app.get('/', function(req, res) {
	res.setHeader('Content-Type', 'text/plain');
	var txt = testmodule.init();

	/*
	 * 	Test executing update and read queries	
	 */
	//execute query queue
	var queue = 1000;
	while (queue > 0) {
    	client.query("INSERT INTO location(name) values('Happyland')");
    	client.query("INSERT INTO location(name) values($1)", ['Sadland']);
    	queue = queue-1;
	}
	var query = client.query("SELECT * FROM location");
	query.on('row', function(row){ txt+=row; });
	// end after last row emitted
	query.on('end', function(){ client.end(); });

	res.end(txt);
})
.get('/jessica', function(req,res){
	res.render('jessica', { title: 'Jessica'});
})
.get('/subdir/:variableName/', function(req,res){
	res.setHeader('Content-Type', 'text/plain');
	res.end('Your variable is ' + req.params.variableName);
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
