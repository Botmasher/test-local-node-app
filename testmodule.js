exports.init = function() {
	// postgres db connection
	const pg = require('pg');
	const connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/orangutan';
	const client = new pg.Client(connectionString);
	client.connect();

	return testQuery(client);
}

function writeDoc () {
	console.log("Got to inner module!");
	var someHTML = '<html><body>something</body></html>';
	return someHTML;
}

function testQuery(db) {
	/*
	 * 	Test executing update and read queries	
	 */
	//execute query queue
	var txt = '';
	var queue = 1000;
	while (queue > 0) {
    	db.query("INSERT INTO location(name) values('Happyland')");
    	db.query("INSERT INTO location(name) values($1)", ['Sadland']);
    	queue = queue-1;
	}
	var query = db.query("SELECT * FROM location");
	query.on('row', function(row){ txt+=row; });
	// end after last row emitted
	query.on('end', function(){ client.end(); });
	return txt;
}