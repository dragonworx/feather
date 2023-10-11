import { Behavior } from '$lib/behavior';
import type { Component } from '$lib/component';

export interface RolloverBehaviorOptions {}

export type RolloverBehaviorEvents = 'mouseover';

export class RolloverBehavior extends Behavior<RolloverBehaviorOptions, RolloverBehaviorEvents> {
	private _isOver = false;

	public get isOver() {
		return this._isOver;
	}

	public init(component: Component): void {
		component.on('mouseover', () => (this._isOver = true));
		component.on('mouseout', () => (this._isOver = false));
		component.on('mouseenter', () => (this._isOver = true));
		component.on('mouseleave', () => (this._isOver = false));
	}
}
