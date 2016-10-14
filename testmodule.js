exports.init = function() {
	return writeDoc();
}

function writeDoc () {
	console.log("Got to inner module!");
	var someHTML = '<html><body>something</body></html>';
	return someHTML;
}