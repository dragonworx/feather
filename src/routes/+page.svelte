<script lang="ts">
	import './forceHotReload';
	import { onMount } from 'svelte';
	
	import {BaseControl, Ctrl} from '$lib/builder2'

	let root: HTMLElement;

	onMount(() => {
		root = document.getElementById('root') as HTMLElement;

		type TestProps = {
			prop1: string;
		};

		type TestAttributes = {
			attrib1: number;
		};

		type TestEvents = {
			event1: { x: number };
		}

		class TestControl extends BaseControl<TestProps, TestAttributes, TestEvents>
		{
			public test() {
				this.attribs.attrib1 = 1;
			}
		}

		const CtrlTest = Ctrl<TestProps, TestAttributes, TestEvents>({
			tagName: 'test',
			props: {
				prop1: 'foo',
			},
			attribs: {
				attrib1: 0,
			},
		}, TestControl);
		
		const test = new CtrlTest({
			prop1: 'bar',
		});
		test.props.prop1 = "foo"; // <-- this should work, props are strongly typed
		// test.attrib1 = 1;
		test.on('event1', (evt) => {console.log(evt.detail.x)}); // <-- this should work, events are strongly typed

		(window as any).test = test;
		console.log(test);

		root.appendChild(test);
	});
</script>

<main id="root">
	
</main>
