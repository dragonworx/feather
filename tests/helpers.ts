import { Behavior } from '../src/lib/behavior';
import { Component } from '../src/lib/component';

export class TestBehavior extends Behavior {
	getBehaviors() {
		return this._behaviors;
	}
}

export type TestComponentEvent = 'testEvent';

export class TestComponent extends Component<HTMLDivElement, string> {
	getBehaviors() {
		return this.behaviors;
	}

	protected defaultModel(): string {
		return 'default';
	}

	public template(): string {
		return '<test-component><b>Test</b></test-component>';
	}

	public emitTestEvent(detail?: unknown) {
		this.emit<TestComponentEvent>('testEvent', detail);
	}

	public addChild(child: TestComponent) {
		this.children.push(child);
		this.element.appendChild(child.element);
	}
}
