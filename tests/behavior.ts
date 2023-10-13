import { Behavior } from '$lib/behavior';
import { Component } from '$lib/component';

class TestBehavior extends Behavior {
	getBehaviors() {
		return this._behaviors;
	}
}

class TestComponent extends Component {
	getBehaviors() {
		return this._behaviors;
	}
}

describe('Behavior', () => {
	it('should add sub-behavior to component', () => {
		const component = new TestComponent();
		const behavior1 = new TestBehavior();
		// const behavior2 = new TestBehavior();

		component.addBehavior(behavior1);
	});

	// it('should remove sub-behavior when disposing', () => {
	// 	const component = new TestComponent();
	// 	const behavior1 = new TestBehavior();
	// 	const behavior2 = new TestBehavior();
	// });
});
