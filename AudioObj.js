'use strict'

//Flattened closure declaration
window.AudioObj = (() => {

const context = new window.AudioContext();
const defaultVolume = .05;

const defaultFreq = 500;

let status = "open";
let audioCount = 0;


const createVol = (volume = 0) => {
	let vol = context.createGain();
	vol.gain.audio = volume;
	vol.connect(context.destination);
	return vol;
};

const createOsc = (gainNode, freq = defaultFreq) => {
	let osc = context.createOscillator();
	osc.type = 'square'
	osc.frequency.value = freq;
	osc.connect(gainNode)
	return osc;
};


const update = (i = 0) => {
	audioCount += i;
	if (audioCount === 0) {
		context.suspend();
	} else {
		context.resume();
	}
}

update();

let audio = class {
	constructor(vol = defaultVolume, freq = defaultFreq) {
		this._audioNode = null;
		this.volume = vol;
		this.status = "open";
		this.closed = false;
		this.freq = freq;

		this._vol = createVol(vol);
		this._vol.gain.volume = vol;
	}

	start () {
		if (this.closed) {
			throw("Attempted to use closed Audio object");
		}

		if (this._audioNode !== null) {
			this.stop();
		}

		update(1);
		this._vol.gain.value = this.volume;
		this._audioNode = createOsc(this._vol, this.freq);
		this._audioNode.start();
		this.status = "running";
	}

	stop () {
		if (this.closed) {
			throw("Attempted to use closed Audio object");
		}

		if (this._audioNode !== null) {
			this._audioNode.stop();
			this._audioNode = null;
			this.context = "open";
			update(-1);
		}
	}

	changeVol (vol) {
		if (this.closed) {
			throw("Attempted to use closed Audio object");
		}

		this._vol.gain.value = vol;
		this.volume = vol;
	}

	close () {
		if (this.closed === false) {this.stop();}
		this.closed = true;
		this.state = "closed";
		this._audioNode = null;
	}
}

return audio;
})();
