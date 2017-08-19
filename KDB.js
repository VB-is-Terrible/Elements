window.KDB =  {
	places: ['Kerbin', 'Mun', 'Minmus', 'Eve', 'Gilly', 'Duna', 'Ike', 'Dres', 'Jool', 'Laythe', 'Vall', 'Tylo', 'Bop', 'Pol', 'Eeloo', 'Kerbol'],
	/**
	 * Kerbal backend type
	 * @type {[type]}
	 */
	Kerbal: class {
		construtor () {
			this.name = 'Kerbal';
			this.text = "Desc";
			this.jobs = KDB.blankPlaceList(null);
			this.displays = [];

		}
		dispatchUpdate (place) {

		}
		addJob (place, value) {
			if (this.jobs[place] >= value) {
				return;
			}
			this.jobs[place] = value;
		}
	},
	blankPlaceList: function (value) {
		let placeList = {};
		for (let place of this.places) {
			placeList[place] = value;
		}
		return placeList;
	},
};
