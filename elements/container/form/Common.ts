export const accept_event_string = 'elements-form-simple-accept';
export const reset_event_string = 'elements-form-simple-reset';
import type {GConstructor} from '../../elements_helper.js';

export const FormWrapper = <T extends GConstructor<HTMLElement>>(Base: T) => {
	abstract class FormWrapped extends Base {
		constructor(...args: any[]) {
			super(args);
			this.addEventListener(accept_event_string, () => {
				this.accept();
			});
			this.addEventListener(reset_event_string, () => {
				this.reset();
			});
		}
		protected abstract accept(): void;
		protected abstract reset(): void;
	}
	return FormWrapped;
}
