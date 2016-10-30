// simple server - run from terminal: node filename.js
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
		
		// test passing in function
		getOutput (function(data) {
			for (index in data.rows) {
				console.log (data.rows[index].name);
			}
		});

	}

	res.write ("See console for output.");
	res.end();
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



// grab data and run passed-in callback
function getOutput (callback) {

	// data to use in callback
	var dogs = {
		rows: [
			{
				name: 'Rar',
				type: 'fuzzy'
			},
			{
				name: 'Scars',
				type: 'floppy'
			},
			{
				name: 'Dubbins',
				type: 'dubbzy'
			}
		]
	};

	callback (dogs);			// run the user function
}