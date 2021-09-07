import type { ToastData, ToasterToast } from '../toast/toast.js';
import type { Toaster } from '../toaster.js';



export class ToasterContext {
	private _toaster: Toaster;
	toast: ToasterToast | null = null;
	constructor(toaster: Toaster) {
		this._toaster = toaster;
	}
	addToast(data: ToastData) {
		if (this.toast === null) {
			this.toast = this._toaster.addToast(data);
			this.toast.addEventListener('toast_close_final', () => {
				this.toast = null;
			});
			return true;
		} else {
			this.toast.setToast(data);
			return false;
		}
	}
	get toasts() {
		return [this.toast];
	}
}

export const elements_loaded = ['toaster/Common'];
