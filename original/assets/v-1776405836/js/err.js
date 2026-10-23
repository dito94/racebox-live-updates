window.onerror = function(errorMsg, url, lineNumber, column, errorObj) {
	try {
		var data = {msg: errorMsg, url: url, line: lineNumber, col: column, stack: null};
		try { data.stack = errorObj.stack } catch (e) {}
		$.post('/jserr', {
			data: JSON.stringify(data)
		}, function (res) {});
	} catch (e) {
		console.error(e);
	}
	return false;
};