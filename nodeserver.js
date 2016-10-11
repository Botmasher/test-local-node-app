// simple server
// run from terminal: node nodeserver.js
const http = require('http');

const host = '127.0.0.1';
const port = 8080;

const server = http.createServer(function(req, res){
	res.statusCode = 200;
	res.setHeader('Content-Type', 'text/plain');

	res.writeHead(200, {"Content-Type": "text/plain"});
	// parse and use url
	var uri = url.parse(req.url).pathname;
	if (uri == '/') {
		res.write('Homepage');
	} else if (uri == '/subdir') {
		res.write('One level down');
	}

	res.end('Hello World\n');
});

server.listen(port, host, function() {
	console.log("Server running at http:\/\/"+host+":"+port+"\/");
});

// events
server.on ('connect', function() {
	document.write("Hello World!!!");
});

server.on ('close', function() {
	console.log ('Bye for now!');
});

// https://openclassrooms.com/courses/ultra-fast-applications-using-node-js/node-js-modules-and-npm