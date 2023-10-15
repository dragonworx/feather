import { TestComponent, TestBehavior } from './helpers';

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
