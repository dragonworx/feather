import { Behavior } from '../src/lib/behavior';
import { Control } from '../src/lib/control';

export class TestBehavior extends Behavior {
	getBehaviors() {
		return this._behaviors;
	}
}

export type TestComponentEvent = 'testEvent' | 'appendChildElement';

export interface TestComponentModel {
	foo: string;
	bar: number;
}

export class TestComponent extends Control<HTMLDivElement, TestComponentModel> {
	getBehaviors() {
		return this.behaviors;
	}

	public defaultModel(): TestComponentModel {
		return {
			foo: 'default',
			bar: 0
		}
	}

	public template(): string {
		return '<test-component><b>Test</b></test-component>';
	}

	public emitTestEvent(detail?: unknown) {
		this.emit<TestComponentEvent>('testEvent', detail);
	}

	protected appendChild(element: HTMLElement) {
		this.querySelector('b')!.appendChild(element);
		this.emit<TestComponentEvent>('appendChildElement', element);
	}
}
