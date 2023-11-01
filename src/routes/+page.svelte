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
		button.on('event1', () => console.log('event1'));
		button.style.color = 'white';
		button.onclick = () => button.remove();

		setTimeout(() => {
			button.emit<ButtonEvents['event1']>('event1', { foo: '123' });
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
