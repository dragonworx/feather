<script lang="ts">
	import './forceHotReload';
	import { onMount } from 'svelte';
	
	import {Ctrl} from '$lib/builder'
	import Button from '$lib/button';
	import Checkbox from '$lib/checkbox';
	import { BaseControl } from '$lib/control';

	let root: HTMLElement;

	onMount(() => {
		root = document.getElementById('root') as HTMLElement;

		type TestState = {
			prop1: string;
			prop2: number;
			prop3: boolean;
			prop4: { a: number };
		};

		type TestEvents = {
			event1: { x: number };
		}

		class TestControl extends BaseControl<TestState, TestEvents>
		{
			public test() {
				this.state.prop3 = false;
			}

			protected onStateChanged(name: keyof { prop1: string; prop2: number; prop3: boolean; prop4: object; }, oldValue: any, newValue: any): void
			{
				console.log('onPropChanged', name, oldValue, newValue);
			}
		}

		const CtrlTest = Ctrl<TestState, TestEvents>({
			tagName: 'test',
			state: {
				prop1: 'foo',
				prop2: 123,
				prop3: true,
				prop4: { a: 1 },
			},
		}, TestControl);
		
		const test = new CtrlTest({
			prop1: 'bar',
		});
		test.prop1 = 'boo';
		test.prop4 = { a: 5 };
		test.on('event1', (evt) => {console.log('event1', evt.detail.x)});
		
		setTimeout(() => {
			test.emit('event1', { x: 123 });
		}, 1000);

		(window as any).test = test;
		console.log(test);

		root.appendChild(test);


	});
</script>

<main id="root">
	<ctrl-checkbox>Check</ctrl-checkbox>
	<ctrl-button is-toggle="true">Click</ctrl-button>
</main>
