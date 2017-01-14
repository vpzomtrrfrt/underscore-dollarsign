(function() {
	var suppressedWarnings = [];
	var plugins = [];

	function isNode(o){
		return (
			typeof Node === "object" ? o instanceof Node : 
				o && typeof o === "object" && typeof o.nodeType === "number" && typeof o.nodeName==="string"
		);
	}

	function setup(list) {
		var tr = {};
		function setValue(key, value) {
			for(var i = 0; i < list.length; i++) {
				list[i][key] = value;
			}
		}
		function getValue(key, info) {
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
		setBasic("innerHTML");

		tr.is_$ = true;

		function callMethod(name) {
			var value = "";
			for(var i = 0; i < list.length; i++) {
				value += list[i][name].apply(list[i], [].slice.call(arguments, 1));
			}
			return value;
		}
		function setMethod(key) {
			tr[key] = callMethod.bind(this, key);
		}

		setMethod("addEventListener");

		for(var i = 0; i < plugins.length; i++) {
			var plugin = plugins[i];
			if(typeof plugin.extraFields === "object") {
				for(var key in plugin.extraFields) {
					tr[key] = plugin.extraFields[key];
				}
			}
			if(typeof plugin.applyToInstance === "function") {
				plugin.applyToInstance(tr);
			}
		}

		tr.__noSuchMethod__ = function(id, args) {
			return callMethod.apply(this, id, args);
		};

		if(typeof Proxy === "function") {
			function proxyWarning(name) {
				if(suppressedWarnings.indexOf(name) > -1) {
					return;
				}
				console.warn("Using proxy, as \""+name+"\" is not provided explicitly by _$.  This may not work in some browsers.  Report this and/or use _$.suppressProxyWarning");
			}
			tr = new Proxy(tr, {
				get: function(target, name) {
					if(name in target) return target[name];
					proxyWarning(name);
					return getValue(name, null);
				},
				set: function(target, name, value) {
					if(name in target) target[name] = value;
					else {
						proxyWarning(name);
						setValue(name, value);
					}
				}
			});
		}
		return tr;
	}

	var _$ = function(query) {
		var typ = typeof query;
		if(typ === "object") {
			if(query.is_$) {
				// already a _$ object
				return query;
			}
			if(isNode(query)) {
				// single element, make it an array
				return _$([query]);
			}
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

	_$.suppressProxyWarning = function(name) {
		suppressedWarnings.push(name);
	};

	_$.addPlugin = function(plugin) {
		plugins.push(plugin);
	};

	if(typeof window === "object") {
		window._$ = _$;
	}
	if(typeof module === "object") {
		module.exports = _$;
	}
})();
