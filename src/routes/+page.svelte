<script lang="ts">
	import './forceHotReload';

	import { onMount } from 'svelte';
	import { Test } from '$lib/test';
	// note: we need to import constructor, type will not evaluate the Ctrl function
	import Button from '$lib/button';

	String(Button); // mute error above, would be fixed by proper index.ts export of Control

	onMount(() => {
		const root = document.getElementById('root') as HTMLElement;
		// const button = document.getElementById('button') as InstanceType<typeof Button>;

		/** Test Control, created with constructor */
		// const test = new Test({ x: 5 });

		// test.textContent = 'Click me!';
		// test.test();
		// test.on('event1', (e) => console.log('event1', e.detail.foo));
		// test.on('event2', (e) => console.log('event2', e.detail.bar));
		// test.on('event3', (e) => console.log('event3', e.detail));
		// test.style.color = 'white';
		// test.onclick = () => test.remove();

		// setTimeout(() => {
		// 	test.emit('event1', { foo: '123' });
		// 	test.emit('event2', { bar: 123 });
		// 	test.emit('event3');
		// 	test.setAttribute('size', '123');
		// 	test.removeAttribute('size');
		// }, 1000);

		// (window as any).test = test;
		// root.appendChild(test);

		/** Button Control, accessed from DOM */
		// button.setProps({ isToggled: true });

		// (window as any).button = button;
		// root.appendChild(button);
	});
</script>

<main id="root">
	<ctrl-test x="123">foo</ctrl-test>
	<!-- <ctrl-button id="button">Button!</ctrl-button> -->
</main>
