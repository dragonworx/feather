import type { ComponentEvent } from '$lib/component';
import { TestComponent } from './helpers';

describe('Component', () => {
	describe('Model', () => {
		it('should initialise with default model if none passed', () => {
			const component = new TestComponent();
			expect(component.value).toBe('default');
		});

		it('should initialise with a given model', () => {
			const component = new TestComponent('foo');
			expect(component.value).toBe('foo');
		});

		it('should update model when given new value', () => {
			const component = new TestComponent();
			component.value = 'bar';
			expect(component.value).toBe('bar');
		});

		it('should fire event when new value given', (done) => {
			const component = new TestComponent();
			component.on<ComponentEvent>('modelUpdated', (e: CustomEvent) => {
				expect(e.detail.value).toBe('bar');
				expect(e.detail.oldValue).toBe('default');
				done();
			});
			component.value = 'bar';
		});
	});
});
