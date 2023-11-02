<script lang="ts">
	import './forceHotReload';

	import { onMount } from 'svelte';
	import { Button, type ButtonEvents } from '$lib/test';

	onMount(() => {
		const root = document.getElementById('root') as HTMLElement;

		/** Example Instantiation */
		const button = new Button({ x: 5 });

		button.textContent = 'Click me!';
		button.test();
		button.on('event1', (e) => console.log('event1', e.detail.foo));
		button.on('event2', (e) => console.log('event2', e.detail.bar));
		button.on('event3', (e) => console.log('event3', e.detail));
		button.style.color = 'white';
		button.onclick = () => button.remove();

		setTimeout(() => {
			button.emit('event1', { foo: '123' });
			button.emit('event2', { bar: 123 });
			button.emit('event3');
			button.setAttribute('size', '123');
			button.removeAttribute('size');
		}, 1000);

		(window as any).button = button;

		root.appendChild(button);
	});
</script>

<main id="root">
	<ctrl-button size="abc">foo</ctrl-button>
</main>
