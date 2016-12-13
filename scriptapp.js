// build prototype to handle app functionality
var App = function () {
	// routing and templating Express app
	var expressApp = require('express');
	this.app = expressApp();
	this.mainTemplate = null;
}

App.prototype.listen = function (port) {
	// serve app on the port given
	this.app.listen (port);
}

App.prototype.setDatabase = function (client) {
	// store pg client reference for querying
	this.db = client;
}

App.prototype.setViews = function (viewsDirectory, viewEngine) {
	// set the templates directory and engine
	this.app.set ('views', viewsDirectory);
	this.app.set ('view engine', viewEngine);
}

App.prototype.setMainTemplate = function (template) {
	// set the template for the next view render
	this.mainTemplate = template;
}

App.prototype.get = function (route, templateVars, query, queryArgs) {
	/*
	 * 	Define endpoint, query to run and template to render
	 * 	  - uses current app template and templateVars to render
	 * 	  - takes query and string interpolation args expected by pg query
	 */
	
	// store db and main template for querying and building template
	var mainTemplate = this.mainTemplate;
	var client = this.db;

	//if (route === undefined) throw "ERROR: route missing when calling App.get";

	// express app get method
	this.app.get (route, function (req, res) {
		res.setHeader ('Content-Type', 'text/html');
		// if query string args are not present set them to empty
		if (queryArgs === undefined) queryArgs = [];
		if (query !== undefined) {
			// my method for querying - pass callback to render once query is done
			client.query (query, queryArgs, function (output) {
				// add data to template variables
				templateVars.data = output.rows;
			});
		}
		// render page once db query is done and output parsed
		res.render (mainTemplate, templateVars);
	});	
}

App.prototype.getWithParams = function (route, query) {
	// this is a duplicate of .getData with one addition:
	//   - pull out uri params and interpolate them into the query
	var template = this.template;
	var templateVars = this.templateVars;
	var client = this.db;

	if (query === undefined) this.get (route);

	// call express app get method
	this.app.get (route, function (req, res) {
		res.setHeader ('Content-Type', 'text/html');
		// store uri params to insert into query
		var qArgs = [];
		for (pindex in req.params) {
			qArgs.push (req.params[pindex]);
		}
		// use those qArgs to interpolate into sql query and render page
		client.query (query, qArgs, function (output) {
			templateVars.data = output.rows;
			res.render (template, templateVars);
		});
	});
}

App.prototype.getJSON = function (route, query, qArgs) {
	/*
	 * 	Define endpoint and query for JSON using basic express app get
	 */

	// store db info for querying
	var client = this.db;

	this.app.get (route, function (req, res) {
		res.setHeader ('Content-Type', 'text/plain');
		// my db querying method - pass callback to store and display output
		client.query (query, qArgs, function (output) {
			o = JSON.stringify (output.rows, null, "  ");
			res.end (o);
		})
	});
}

// node require exports
module.exports.App = App;