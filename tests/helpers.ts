import { Behavior } from '../src/lib/behavior';
import { Component } from '../src/lib/component';

export class TestBehavior extends Behavior {
	getBehaviors() {
		return this._behaviors;
	}
}

export class TestComponent extends Component<HTMLDivElement, string> {
	getBehaviors() {
		return this.behaviors;
	}

	protected defaultModel(): string {
		return 'default';
	}

	public template(): string {
		return '<div><b>Test</b></div>';
	}
}
