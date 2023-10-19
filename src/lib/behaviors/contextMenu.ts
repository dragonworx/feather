import { Behavior } from '$lib/behavior';

export interface ContextMenuBehaviorOptions {}

export type ContextMenuBehaviorEvents = 'context';

export class ContextMenuBehavior extends Behavior<
	ContextMenuBehaviorOptions,
	ContextMenuBehaviorEvents
> {
	private static hasInstalledHook = false;

	private static listeners: ContextMenuBehavior[] = [];

	private static installHook(behavior: ContextMenuBehavior) {
		ContextMenuBehavior.listeners.push(behavior);

		if (ContextMenuBehavior.hasInstalledHook) {
			return;
		}

		document.addEventListener('contextmenu', (e) => {
			for (const listener of ContextMenuBehavior.listeners) {
				if (listener.element === e.target) {
					e.preventDefault();
					listener.onContext(e);
				}
			}
		});

		ContextMenuBehavior.hasInstalledHook = true;
	}

	public install(): void {
		ContextMenuBehavior.installHook(this);
	}

	public onContext(e: MouseEvent) {
		this.emit('context', e);
	}
}
