var PgClient = function () {
	// postgres db connection
	var pg = require('pg');
	var connectionString = process.env.DATABASE_URL || 'postgres://localhost:5432/orangutan';
	// store reference to db connection
	this.db = new pg.Client(connectionString);
	this.db.connect();
}
// abstract out db query and callback for rendering pages
PgClient.prototype.query = function (query, qStrArgs, callback) {
	/*
	 *	@param {String}    query 	 -  the sql query to run
	 * 	@param {Function}  callback  -  the method to run on query end
	 * 	@param {Array} 	   qStrArgs  - 	string interpolations in query
	 */

	// direct ref to pgdb to avoid "this" in query closures
	var client = this.db;

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

PgClient.prototype.select = function (tableName, colName) {
	// select all if only table but not columns defined
	if (colName === undefined) colName = '*';

	// iterate through list of columns and turn into string
	//if (colName instanceof Array) {
	if (Object.prototype.toString.call(colName) == '[object Array]') {
		var columns = '';
		for (i in colName) {
			columns = columns + colName[i] + ', ';
		}
		columns = columns.slice(0,-1);
	}
	var q = 'FROM '+tableName+' SELECT '+colName;

	return q;
}

// node require exports
module.exports.PgClient = PgClient;