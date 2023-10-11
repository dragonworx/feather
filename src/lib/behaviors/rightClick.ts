import { Behavior } from '$lib/behavior';

export interface RightClickBehaviorOptions {}

export type RightClickBehaviorEvents = 'context';

export class RightClickBehavior extends Behavior<
	RightClickBehaviorOptions,
	RightClickBehaviorEvents
> {
	private static hasInstalledHook = false;

	private static listeners: RightClickBehavior[] = [];

	private static installHook(behavior: RightClickBehavior) {
		RightClickBehavior.listeners.push(behavior);

		if (RightClickBehavior.hasInstalledHook) {
			return;
		}

		document.addEventListener('contextmenu', (e) => {
			for (const listener of RightClickBehavior.listeners) {
				if (listener.component.element === e.target) {
					e.preventDefault();
					listener.onContext(e);
				}
			}
		});

		RightClickBehavior.hasInstalledHook = true;
	}

	public install(): void {
		RightClickBehavior.installHook(this);
	}

	public onContext(e: MouseEvent) {
		console.log('context!' + this._uid, e.target);
	}
}
