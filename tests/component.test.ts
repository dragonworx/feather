import { Control, type ControlEvent } from '../src/lib/control';
import { TestComponent, type TestComponentEvent } from './helpers';

describe('Component', () => {
	describe('Model', () => {
		it('should initialise with default model if none passed', () => {
			const component = new TestComponent();
			expect(component.prop('foo')).toBe(component.defaultModel().foo);
			expect(component.prop('bar')).toBe(component.defaultModel().bar);
		});

		it('should initialise with a given model', () => {
			const component = new TestComponent({ foo: 'bar', bar: 5 });
			expect(component.prop('foo')).toBe('bar');
			expect(component.prop('bar')).toBe(5);
		});

		it('should update model when given new partial value', () => {
			const component = new TestComponent();
			component.update({ foo: 'bar' });
			expect(component.prop('foo')).toBe('bar');
			expect(component.prop('bar')).toBe(component.defaultModel().bar);
		});

		it('should fire event when new value given', (done) => {
			const component = new TestComponent();
			component.on<ControlEvent>('modelUpdated', (e: CustomEvent) => {
				expect(e.detail.value).toBe('bar');
				expect(e.detail.oldValue).toBe('default');
				done();
			});
			component.update({ foo: 'bar' });
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

		it('should detect element owner', () => {
			const component = new TestComponent();
			expect(Control.elementOwner(component.element)).toBe(component);
		});
	});

	describe('Mounting', () => {
		// todo: test dispose
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
		});

		// todo: test dispose cleans up listeners
	});

	describe('Hierarchy', () => {
		it('should call appendToElement when added to parent', () => {
			const component1 = new TestComponent();
			const component2 = new TestComponent();
			component1.on<TestComponentEvent>('appendChildElement', (e: CustomEvent<HTMLElement>) => {
				expect(e.detail).toBe(component2.element);
			});
			component1.addChild(component2);
		});
		
		it('should contain added children in both component and element', () => {
			const component1 = new TestComponent();
			const component2 = new TestComponent();
			component1.addChild(component2);
			expect(component1.getChildren()).toEqual([component2]);
			expect(component1.element.children).toHaveLength(1);
			expect(component1.querySelector('b test-component')).toEqual(component2.element);
		});

		it('should remove added children from both component and element', () => {
			const component1 = new TestComponent();
			const component2 = new TestComponent();
			component1.addChild(component2);
			component1.removeChild(component2);
			expect(component1.getChildren()).toEqual([]);
			expect(component1.querySelector('b test-component')).toBeNull();
		});
	});

	describe('CSS Style', () => {
		// todo: test dispose cleans up styles
	});

	describe('CSS Classes', () => {
		// todo: test dispose cleans up classes
	});

	describe('Behaviors', () => {
		// todo: test dispose cleans up behaviors
	});
});
