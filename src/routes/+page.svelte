<script lang="ts">
	import './forceHotReload';

	import { onMount } from 'svelte';
	import '$lib';
	import { Test } from '$lib/index';
	import Button from '$lib/button';

	let root: HTMLElement;

	onMount(() => {
		root = document.getElementById('root') as HTMLElement;
		// 	// const button = document.getElementById('button') as InstanceType<typeof Button>;
		const test1 = document.getElementById('test1') as InstanceType<typeof Test>;
		const test2 = document.getElementById('test2') as InstanceType<typeof Test>;
		// 	/** Test Control, created with constructor */

		// 	// test.textContent = 'Click me!';
		// 	// test.test();
		// 	// test.on('event1', (e) => console.log('event1', e.detail.foo));
		// 	// test.on('event2', (e) => console.log('event2', e.detail.bar));
		// 	// test.on('event3', (e) => console.log('event3', e.detail));
		// 	// test.style.color = 'white';
		// 	// test.onclick = () => test.remove();

		// 	// setTimeout(() => {
		// 	// 	test.emit('event1', { foo: '123' });
		// 	// 	test.emit('event2', { bar: 123 });
		// 	// 	test.emit('event3');
		// 	// 	test.setAttribute('size', '123');
		// 	// 	test.removeAttribute('size');
		// 	// }, 1000);

		// 	// (window as any).test = test;
		// 	// root.appendChild(test);

		// 	/** Button Control, accessed from DOM */
		// 	// button.setProps({ isToggled: true });

		// 	test.z = 'testing!';
		// 	test.test();
		// 	test.setProp('y', true);

		(window as any).test1 = test1;
		(window as any).test2 = test2;
		// 	// root.appendChild(button);
	});
</script>

<main id="root">
	<button on:click={() => root.appendChild(new Test())}>Add</button>
	<ctrl-test id="test1" x="123" z="hi">foo</ctrl-test>
	<ctrl-test id="test2" x="123" z="hi">foo</ctrl-test>
	<ctrl-button id="button">Button!</ctrl-button>
</main>
