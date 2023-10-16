import type { ComponentEvent } from '$lib/component';
import { TestComponent, type TestComponentEvent } from './helpers';

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

	describe('Element', () => {
		it('should create element from template', () => {
			const component = new TestComponent();
			expect(component.element.tagName).toBe('TEST-COMPONENT');
		});

		it('should be able to query element', () => {
			const component = new TestComponent();
			expect(component.querySelector('b')!.tagName).toBe('B');
		});

		it('should be able to query elements', () => {
			const component = new TestComponent();
			expect(component.querySelectorAll('b').length).toBe(1);
		});
	});

	describe('Mounting', () => {
		
	});

	describe('Events', () => {
		it('should bind event listener', () => {
			const component = new TestComponent();
			const handler = () => {};
			component.on('click', handler);
			expect(component.getEventListeners('click')).toEqual([handler]);
		});

		it('should unbind event listener explicitly', () => {
			const component = new TestComponent();
			const handler = () => {};
			component.on('click', handler);
			component.off('click', handler);
			expect(component.getEventListeners('click')).toHaveLength(0);
		});

		it('should unbind event listener implicitly', () => {
			const component = new TestComponent();
			const handler1 = () => {};
			const handler2 = () => {};
			component.on('click', handler1).on('click', handler2);
			component.off('click');
			expect(component.getEventListeners('click')).toHaveLength(0);
		});

		it('should fire event when emit called', (done) => {
			const component = new TestComponent();
			component.on<TestComponentEvent>('testEvent', () => {
				done();
			});
			component.emitTestEvent();
		});

		it('should fire bubbling events', (done) => {
			const component1 = new TestComponent();
			const component2 = new TestComponent();
			component1.addChild(component2);
			component1.on<TestComponentEvent>('testEvent', (e: CustomEvent<string>) => {
				expect(e.detail).toBe('component2');
				done();
			});
			component2.emitTestEvent('component2');
		})
	});

	describe('Hierarchy', () => {

	});

	describe('CSS Style', () => {

	});

	describe('CSS Classes', () => {
		
	});

	describe('Behaviors', () => {

	});
});
