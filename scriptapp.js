// build prototype to handle app functionality
var App = function () {
	// routing and templating Express app
	var expressApp = require('express');
	this.app = expressApp();
	this.mainTemplate = null;
	this.templateVars = {};
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

App.prototype.setTemplateVars = function (obj) {
	// replace the template variables object
	this.templateVars = obj;
}

App.prototype.addTemplateVar = function (k, v) {
	// add an item to the template variables object
	this.templateVars[k] = v;
}

App.prototype.addTemplateVars = function (obj) {
	// add multiple items to the template variables object
	for (key in obj) {
		this.templateVars[key] = varsObj[key];
	}
}

App.prototype.get = function (route, query, queryArgs) {
	/*
	 * 	Define endpoint, query to run and template to render
	 * 	  - uses current app template and templateVars to render
	 * 	  - takes query and string interp args expected by pg query
	 * 	  - set queryArgs=true to use URI params to fill query args
	 */

	//if (route === undefined) throw "ERROR: route missing when calling App.get";

	// express app get method
	this.app.get.call (this, route, function (req, res) {
		res.setHeader ('Content-Type', 'text/html');
		
		// build array of request params
		var reqParams = [];
		for (p in req.params) {
			reqParams.push (req.params[p]);
		}

		if (query === undefined) {
			this.render (res);
			return;
		}

		// if query string args are not present set them to empty
		if (queryArgs === undefined) queryArgs = [];
		
		// if args are true, just use request params
		if (queryArgs == true) queryArgs = reqParams;

		// use integers to reorder query params
		// if (typeof queryArgs[0] === 'number') {
		// 	var newArgsList = req.params;
		// 	for (var i = 0; i < newArgsList.length; i++) {
		// 		newArgsList[i] = req.params[newArgsList[i]];
		// 	}
		// 	queryArgs = newArgsList;
		// }

		// use an object to replace just specific param args
		// e.g. given { 0: 'location', 1: 'Hilo' }
		// "'loc', 'city', 'state'" => "'location', 'Hilo', 'state'"
		// or do not use a specific query arg if index : null
		// if (typeof queryArgs === 'object') {
		// 	var newArgsList = reqParams;
		// 	// include custom parameters in final query args
		// 	for (var i = reqParams.length-1; i >= 0; i--) {
		// 		if  (queryArgs[i] !== undefined) {
		// 			newArgsList.push (queryArgs[i]);
		// 		} else if (queryArgs[i] != null) {
		// 			newArgsList.push (reqParams[i]);
		// 		}
		// 		// if queryArgs value is null, don't use the param
		// 	}
		// 	queryArgs = newArgsList;
		// };

		// my method for querying - pass callback to render once query is done
		this.db.query.call (this, query, queryArgs, function (output) {
			// add data to template variables
			this.templateVars.data = null;
			if (output.rows.length != 0) this.templateVars.data = output.rows;
		});

		// render page once db query is done and output parsed
		this.render (result);
	});	
}

App.prototype.render = function (result) {
	result.render (this.mainTemplate, this.templateVars);
}

App.prototype.getWithParams = function (route, templateVars, query) {
	// this is a duplicate of .getData with one addition:
	//   - pull out uri params and interpolate them into the query
	var mainTemplate = this.mainTemplate;
	var client = this.db;

	if (query === undefined) this.get (route);

	// call express app get method
	this.app.get (route, function (req, res) {
		res.setHeader ('Content-Type', 'text/html');
		// store uri params to insert into query
		// var qArgs = [];
		// for (pindex in req.params) {
		// 	qArgs.push (req.params[pindex]);
		// }
		if (req.params !== undefined && req.params != []) qArgs = req.params;
		
		// use those qArgs to interpolate into sql query and render page
		client.query (query, qArgs, function (output) {
			templateVars.data = output.rows;
			res.render (mainTemplate, templateVars);
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