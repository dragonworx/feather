import { Behavior } from '../src/lib/behavior';
import { Component } from '../src/lib/component';

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

export class TestComponent extends Component<HTMLDivElement, TestComponentModel> {
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

	protected appendChildElement(element: HTMLElement) {
		this.querySelector('b')!.appendChild(element);
		this.emit<TestComponentEvent>('appendChildElement', element);
	}
}
