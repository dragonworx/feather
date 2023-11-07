<script lang="ts">
	import './forceHotReload';
	import { onMount } from 'svelte';
	
	import {BaseControl, Ctrl} from '$lib/builder2'

	let root: HTMLElement;

	onMount(() => {
		root = document.getElementById('root') as HTMLElement;

		type TestProps = {
			prop1: string;
			prop2: number;
			prop3: boolean;
			prop4: object;
		};

		type TestEvents = {
			event1: { x: number };
		}

		class TestControl extends BaseControl<TestProps, TestEvents>
		{
			public test() {
			}

			protected onPropChanged(name: keyof { prop1: string; prop2: number; prop3: boolean; prop4: object; }, oldValue: any, newValue: any): void
			{
				console.log('onPropChanged', name, oldValue, newValue);
			}
		}

		const CtrlTest = Ctrl<TestProps, TestEvents>({
			tagName: 'test',
			props: {
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
		test.on('event1', (evt) => {console.log('event1', evt.detail.x)}); // <-- this should work, events are strongly typed
		setTimeout(() => {
			test.emit('event1', { x: 123 });
		}, 1000);

		(window as any).test = test;
		console.log(test);

		root.appendChild(test);
	});
</script>

<main id="root">
	
</main>
