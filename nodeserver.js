// Custom app and db prototype built around express and pgclient
var expressWrap = require ('./scriptapp');
var appDB = require ('./scriptdb');

// Set up app instance
var db = new appDB.PgClient();
var myApp = new expressWrap.App();
myApp.setViews('./views', 'ejs');
myApp.setDatabase(db);


// build content formatter prototype
var ContentMaker = function (starterContent) {
	if (starterContent === undefined) {
		this.content = '';
	} else {
		this.content = starterContent;
	}
	// by default expects html body content
	this.inBody = true;
};
ContentMaker.prototype.appendContent = function (content) {
	this.content = this.content + content;
}
ContentMaker.prototype.prependContent = function (content) {
	this.content = content + this.content;
}
ContentMaker.prototype.insertContent = function (content, loc) {
	if (loc type is int) {
		this.content = this.content[0:loc] + content + this.content[loc:];
	} else {
		locIndex = this.content.indexOf (loc);
		this.content = this.content[0:locIndex] + content + this.content[locIndex:];
	}
}
ContentMaker.prototype.setContent = function (content) {
	this.content = content;
}
ContentMaker.prototype.removeContent = function (subcontent) {
	this.content = this.content.replace (subcontent, '');
}
ContentMaker.prototype.makeList = function (a, ordered, lID, lClass) {
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
ContentMaker.prototype.makeImgGrid = function (a, colCount) {
	if (typeof colCount === 'number') colCount = colCount.toString();
	var o = '';
	// take an array of sources and format them as img
	for (i in a) {
		o = o + '<img src = "' + a[i] + '">';
	}
	// in div or section as grid using our or BtStrp styles?
	var newChunk = '<section>'+o+'</section>';
	newChunk = this.addTagAttribs('class', 'col-md-'+colCount);
	return newChunk;
}
ContentMaker.prototype.addTagAttribs = function (content, attr, val, tag) {
	// given text starting with an html tag of type <name>
	// check that tag start is formatted like '<name' not '< name'
	if (content[1] == ' ') {
		content = content.replace (' ', '');
	}

	var i;
	if (tag !== undefined) {
		// tag is defined - find this tag in the content
		i = content.indexOf ('<'+tag)
	} else {
		// tag is at start - use space or > to check for end of tag name
		i = content.indexOf(' ') < content.indexOf('>') ? content.indexOf(' ') : content.indexOf('>');
	}
	var tagged = '';
	tagged = content[0:i+1] + attr + '="' + val + '"' + content[i:];
	return tagged;
}
// add one to create tag and add it to beginning and end of a chunk
ContentMaker.prototype.addTag = function (content, tag) {
	// recognized tag types
	var tags = ['section', 'div', 'p', 'h1', 'h2', 'h3', 'h4', 'span', 'strong', 'em'];
	// do not add a tag if the tag is not of a recognized type
	if (tags.indexOf(tag) === -1) return content;
	content = '<'+tag+'>'+content+'</'+tag+'>';
	return content;
}
ContentMaker.prototype.makeProse = function (txt) {
	// build basic paragraphs allowing for h1-h4 headers
	var o = '';
	var a = [];
	var counter = 0;
	for (i in txt) {
		if (a[counter]=== undefined) a[counter] = '';
		if (txt[i] != '\n') a[counter] = a[counter] + txt[i];
		if (txt[i] == '\n') counter = counter + 1;
	}
	for (l in a) {
		if (a[l][0:3] in ['h1: ','h2: ','h3: ','h4: ']) {
			o = o+'<'+a[l][0:1]+'>'+a[l][4:]+'</'+a[l][0:1]+'>';
		} else {
			o = o+'<p>'+a[l]+'</p>';
		}	
	}
	this.addContent (o); 
}
var myContent = new ContentMaker();
// - make myContent accessible outside the scope of this file

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
