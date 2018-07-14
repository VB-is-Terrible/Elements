/**
 * @callback SearcherKey
 * Takes in a object, and returns a string to search for a match
 * @param {Object} object Object to give a key to
 * @return {String} Key to search/match by
 */

/**
 * Standalone searcher class, adapted from KerbalSearcherCommonName
 * Search functions take in an objectList to search through, and a key function
 * The key function takes in a object, and returns a string to search for a match
 * @type {Object}
 */
Elements.common.Searcher = class Searcher {
	/**
	 * Match keys to the search, matching by prefix
	 * @param  {String} search        Name to search for
	 * @param  {Object[]} objectList  List of objects to search through
	 * @param  {SearcherKey} key 	  Key function to use
	 * @return {Set}                  Ordered set of results
	 */
	static prefix (search, objectList, key) {
		search = search.toLowerCase();
		let checker = (object) => {
			let name = key(object).toLowerCase();
			if (name.indexOf(search) === 0) {
				return true;
			}
			return false;
		}
		let results = new Set();
		for (let object of objectList) {
			if (checker(object)) {
				results.add(object);
			}
		}
		return results;
	}
	/**
	 * Match names to the search, matching by fuzzy search
	 * @param  {String} search        Name to search for
	 * @param  {Object[]} objectList  List of objects to search through
	 * @param  {SearcherKey} key 	  Key function to use
	 * @return {Set}                  Ordered set of results
	 */
	static fuzzy (search, objectList, key) {
		search = search.toLowerCase();
		let checker = (object) => {
			let name = key(object).toLowerCase();
			let position = 0;
			for (let char of name) {
				if (char === search[position]) {
					position += 1;
				}
			}
			if (position === search.length) {
				return true;
			} else {
				return false;
			}
		}
		let results = new Set();
		for (let object of objectList) {
			if (checker(object)) {
				results.add(object);
			}
		}
		return results;
	}
	/**
	 * Match names to the search, matching by prefix
	 * @param  {String} search        Name to search for
	 * @param  {Object[]} objectList  List of objects to search through
	 * @param  {SearcherKey} key 	  Key function to use
	 * @param  {Number} threshold     Edit distance limit
	 * @return {Set}                  Ordered set of results
	 */
	static edit (search, objectList, key, threshold) {
		let result = new Set();
		for (let object of objectList) {
			let distance = this.editDistance(key(object), search);
			if (distance < threshold) {
				result.add(name);
			}
		}

		for (let name of nameList) {
		}
		return result;
	}
	/**
	 * Find the edit distance between two strings
	 * @param  {String} string1 First string to compare
	 * @param  {String} string2 Second string to compare
	 * @return {Number}         The edit distance between the two strings
	 * @private
	 */
	static editDistance (string1, string2) {
		const m = string1.length + 1;
		const n = string2.length + 1;
		const fill = (length) => {
			let result = [];
			for (let i = 0; i < length; i++) {
				result.push(0);
			}
			return result;
		}
		let d = [];
		for (let i = 0; i < n; i++) {
			d.push(fill(m));
		}
		for (let i = 0; i < m; i++) {
			d[0][i] = i;
		}
		for (let i = 0; i < n; i++) {
			d[i][0] = i;
		}
		for (let y = 1; y < n; y++) {
			for (let x = 1; x < m; x++) {
				if (string1[x-1] === string2[y-1]) {
					d[y][x] = d[y-1][x-1];
				} else {
					d[y][x] = Math.min(d[y-1][x] + 1, d[y][x-1] + 1, d[y-1][x-1] + 1);
			}
		}
		}
		return d[n-1][m-1];
	}
	/**
	 * Match names to the search, matching by prefix
	 * @param  {String} search        Name to search for
	 * @param  {Object[]} objectList  List of objects to search through
	 * @param  {SearcherKey} key 	  Key function to use
	 * @return {Set}                  Ordered set of results
	 */
	static exact (search, objectList, key) {
		for (let object in objectList) {
			if (key(object) === search) {
				return new Set([object]);
			}
		}
		return new Set();
	}
};

Elements.loaded('common-Searcher');
