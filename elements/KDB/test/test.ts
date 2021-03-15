import {KDB, Group} from '../KDB.js';
import {Elements} from '../../elements_core.js';
import {randint} from '../../elements_helper.js';


export const testData = '{"type":"KDB","kerbals":["Ludrey","Lizena","Corald","Seelan","Leebles","Crismy","Gemzor","Katburry","Billy-Boptop","Neca","Richdrin","Matsby","Dema","Traphie","Richbo","Agaene","Nedwin","Caltrey","Peggy","Tramy","Phoebe","Gwengee","Rafred","Debbart","Valbur"],"kerbalObjs":[{"name":"Ludrey","text":"Tourist","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Lizena","text":"Tourist","jobs":{"Kerbin":0,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Corald","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Seelan","text":"Tourist","jobs":{"Kerbin":0,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Leebles","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Crismy","text":"Tourist","jobs":{"Kerbin":0,"Mun":3,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Gemzor","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Katburry","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Billy-Boptop","text":"Tourist","jobs":{"Kerbin":0,"Mun":4,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Neca","text":"Scientist","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Richdrin","text":"Scientist","jobs":{"Kerbin":0,"Mun":3,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Matsby","text":"Engineer","jobs":{"Kerbin":0,"Mun":3,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Dema","text":"Engineer","jobs":{"Kerbin":0,"Mun":3,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Traphie","text":"Scientist","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Richbo","text":"Scientist","jobs":{"Kerbin":0,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Agaene","text":"Pilot","jobs":{"Kerbin":0,"Mun":0,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Nedwin","text":"Scientist","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":0},"type":"Kerbal"},{"name":"Caltrey","text":"Scientist","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Peggy","text":"Engineer","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Tramy","text":"Scientist","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Phoebe","text":"Pilot","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Gwengee","text":"Scientist","jobs":{"Kerbin":0,"Mun":0,"Minmus":0,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Rafred","text":"Engineer","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Debbart","text":"Pilot","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"},{"name":"Valbur","text":"Pilot","jobs":{"Kerbin":0,"Mun":3,"Minmus":4,"Eve":0,"Gilly":0,"Duna":0,"Ike":0,"Dres":0,"Jool":0,"Laythe":0,"Vall":0,"Tylo":0,"Bop":0,"Pol":0,"Eeloo":0,"Kerbol":3},"type":"Kerbal"}]}';

export const testData2 = '{"type":"KDB","kerbals":["Ludrey","Lizena","Corald","Seelan","Leebles","Crismy","Gemzor","Katburry","Billy-Boptop","Neca","Richdrin","Matsby","Dema","Traphie","Richbo","Agaene","Nedwin","Caltrey","Peggy","Tramy","Phoebe","Gwengee","Rafred","Debbart","Valbur"],"kerbalObjs":[{"name":"Ludrey","text":"Tourist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Lizena","text":"Tourist","type":"Kerbal","jobs":{"Minmus":4,"Kerbol":3}},{"name":"Corald","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Seelan","text":"Tourist","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Leebles","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Crismy","text":"Tourist","type":"Kerbal","jobs":{"Mun":3}},{"name":"Gemzor","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Katburry","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Billy-Boptop","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Neca","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Richdrin","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Kerbol":3}},{"name":"Matsby","text":"Engineer","type":"Kerbal","jobs":{"Mun":3}},{"name":"Dema","text":"Engineer","type":"Kerbal","jobs":{"Mun":3}},{"name":"Traphie","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Richbo","text":"Scientist","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Agaene","text":"Pilot","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Nedwin","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4}},{"name":"Caltrey","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Peggy","text":"Engineer","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Tramy","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Phoebe","text":"Pilot","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Gwengee","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Rafred","text":"Engineer","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Debbart","text":"Pilot","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Valbur","text":"Pilot","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}}]}';

export const testData3 = '{"type":"KDB","kerbals":["Ludrey","Lizena","Seelan","Leebles","Gemzor","Katburry","Billy-Boptop","Matsby","Dema","Traphie","Agaene","Nedwin","Peggy","Tramy","Phoebe","Gwengee","Rafred","Debbart","Valbur"],"kerbalObjs":[{"name":"Ludrey","text":"Tourist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Lizena","text":"Tourist","type":"Kerbal","jobs":{"Minmus":4,"Kerbol":3}},{"name":"Seelan","text":"Tourist","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Leebles","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Gemzor","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Katburry","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Billy-Boptop","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Matsby","text":"Engineer","type":"Kerbal","jobs":{"Mun":3}},{"name":"Dema","text":"Engineer","type":"Kerbal","jobs":{"Mun":3}},{"name":"Traphie","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Agaene","text":"Pilot","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Nedwin","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4}},{"name":"Peggy","text":"Engineer","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Tramy","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Phoebe","text":"Pilot","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Gwengee","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Rafred","text":"Engineer","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Debbart","text":"Pilot","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Valbur","text":"Pilot","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}}]}';

export const testData4 = '{"type":"KDB","kerbalObjs":[{"name":"Ludrey","text":"Tourist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Lizena","text":"Tourist","type":"Kerbal","jobs":{"Minmus":4,"Kerbol":3}},{"name":"Corald","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Seelan","text":"Tourist","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Leebles","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Crismy","text":"Tourist","type":"Kerbal","jobs":{"Mun":3}},{"name":"Gemzor","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Katburry","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Billy-Boptop","text":"Tourist","type":"Kerbal","jobs":{"Mun":4}},{"name":"Neca","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Richdrin","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Kerbol":3}},{"name":"Matsby","text":"Engineer","type":"Kerbal","jobs":{"Mun":3}},{"name":"Dema","text":"Engineer","type":"Kerbal","jobs":{"Mun":3}},{"name":"Traphie","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Richbo","text":"Scientist","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Agaene","text":"Pilot","type":"Kerbal","jobs":{"Minmus":4}},{"name":"Nedwin","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4}},{"name":"Caltrey","text":"Scientist","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Peggy","text":"Engineer","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Tramy","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Phoebe","text":"Pilot","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Gwengee","text":"Scientist","type":"Kerbal","jobs":{"Kerbol":3}},{"name":"Rafred","text":"Engineer","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Debbart","text":"Pilot","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}},{"name":"Valbur","text":"Pilot","type":"Kerbal","jobs":{"Mun":3,"Minmus":4,"Kerbol":3}}],"groups":[{"type":"Group","name":"Group","text":"Test","kerbals":["Agaene","Lizena","Corald","Seelan","Katburry","Neca","Matsby","Dema","Traphie","Caltrey","Tramy","Rafred","Debbart","Valbur"]},{"type":"Group","name":"Group","text":"Testing","kerbals":["Dema","Debbart","Ludrey","Corald","Richdrin","Nedwin","Rafred"]},{"type":"Group","name":"Group","text":"Testing Groups","kerbals":["Rafred"]},{"type":"Group","name":"Group","text":"Nope","kerbals":[]}]}';

export const test = () => {
	const testData = {
		g1: {
			name: 'testData1',
			text: 'test group 1',
		},
		g2: {
			name: 'Tango Echo Sierra Tango',
			text: 'What\'s p again?',
		},
	};
	let pick = (array: Array<string>) => {
		let index = randint(0, array.length);
		let result = array.splice(index, 1)[0];
		return result;
	}
	let db = KDB.fromJSON(testData3);
	let group1 = new Group(db.groupCounter);
	let kerbals = new Array(...db.kerbals);
	let kerbalStore1 = [];
	for (let i = 0; i < 5; i++) {
		let kerbal = db.getKerbal(pick(kerbals))!;
		kerbalStore1.push(kerbal);
		group1.addKerbal(kerbal);
	}
	Object.assign(group1, testData.g1);
	db.addGroup(group1);
	let group2 = new Group(db.groupCounter);
	kerbals = new Array(...db.kerbals);
	let kerbalStore2 = [];
	for (let i = 0; i < 5; i++) {
		let kerbal = db.getKerbal(pick(kerbals))!;
		kerbalStore2.push(kerbal);
		group2.addKerbal(kerbal);
	}
	Object.assign(group2, testData.g2);
	db.addGroup(group2);

	let dbString = JSON.stringify(db);
	let db2 = KDB.fromJSON(dbString);

	let newGroups = [];
	for (let iter of db2.groups.entries()) {
		newGroups.push(iter[1]);
	}
	let check = (group: Group, groups: Group[]) => {
		let matches = 0;
		for (let g of groups) {
			if (Group.equals(group, g)) {
				matches += 1;
			}
		}
		if (matches === 1) {
			return true;
		} else {
			return false;
		}
	}
	console.assert(check(group1, newGroups));
	console.assert(check(group2, newGroups));

}

Elements.loaded('KDB-test');
