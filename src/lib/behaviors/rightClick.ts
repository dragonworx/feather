import { Behavior } from '$lib/behavior';

export interface RightClickBehaviorOptions {}

export type RightClickBehaviorEvents = 'context';

export class RightClickBehavior extends Behavior<
	RightClickBehaviorOptions,
	RightClickBehaviorEvents
> {
	// private static _
	// private static installHook() {
	// }
}
