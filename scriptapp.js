// build prototype to handle app functionality
var App = function () {
	// routing and templating Express app
	var expressApp = require('express');
	this.app = expressApp();
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
App.prototype.setTemplate = function (template, templateVars) {
	// set the template for the next view render
	this.template = template;
	// template variables optional
	if (templateVars === undefined) {
		this.templateVars = {}
	} else {
		this.templateVars = templateVars;
	}
}
App.prototype.get = function (route) {
	// simple get using rendered template and passed in template variables object
	var template = this.template;
	var templateVars = this.templateVars;
	// express app get and render
	this.app.get (route, function (req, res) {
		res.setHeader ('Content-Type', 'text/html');
		res.render (template, templateVars);
	});
}
App.prototype.getWithData = function (route, query, queryArgs) {
	/*
	 * 	Define endpoint, query to run and template to render
	 * 	  - uses current app template and templateVars to render
	 * 	  - takes query and string interpolation args expected by pg query
	 */
	
	// store db and template info for querying and building template
	var template = this.template;
	var templateVars = this.templateVars;
	var client = this.db;

	// run the simple get method instead if there's no query
	if (query === undefined) this.get (route);

	// express app get method
	this.app.get (route, function (req, res) {
		res.setHeader('Content-Type', 'text/html');
		// if query string args are not present set them to empty
		if (queryArgs === undefined) queryArgs = [];
		// my method for querying - pass callback to render once query is done
		client.query (query, queryArgs, function (output) {
			// add data to template variables
			templateVars.data = output.rows;
			// render page since db query is done and output parsed
			res.render (template, templateVars);
		});
	})
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