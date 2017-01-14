(function() {
	function setup(list) {
		var tr = {};
		function setValue(key, value) {
			for(var i = 0; i < list.length; i++) {
				list[i][key] = value;
			}
		}
		function getValue(key, info, value) {
			if(list.length == 1) {
				return list[0][key];
			}
			var tr = "";
			for(var i = 0; i < list.length; i++) {
				tr += list[i][key];
			}
			return tr;
		}
		function basic(key) {
			return {
				set: setValue.bind(this, key),
				get: getValue.bind(this, key, null)
			};
		}
		function setBasic(key) {
			Object.defineProperty(tr, key, basic(key));
		}
		setBasic("textContent");
		return tr;
	}

	var _$ = function(query) {
		var typ = typeof query;
		if(typ === "object") {
			// probably an array
			return setup([].slice.call(query));
		}
		else if(typ === "string") {
			return _$(document.querySelectorAll(query));
		}
		else {
			throw "Invalid query";
		}
	};

	if(typeof window === "object") {
		window._$ = _$;
	}
})();
