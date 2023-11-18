<script lang="ts">
	import './forceHotReload';
	import App from '../lib/components/app.svelte';
	import Button from '../lib/components/button.svelte';
	import Checkbox from '../lib/components/checkbox.svelte';
	import Accordion from '../lib/components/accordion.svelte';
	import Console, { type LogFunction } from '../lib/components/console.svelte';
	import Scrollbar from '../lib/components/scrollbar.svelte';
	import { deepStore } from '../lib/deepStore';
	import { debugSvg } from '../lib/util';

	const store = deepStore({
		foo: 'bar' as string | number
	});

	let height = 50;

	let log: LogFunction;
</script>

<main>
	<App>
		<Button
			on:click={() => {
				store.foo = 12;
				height += 10;
				log(height, store.foo);
			}}>Click@ {store.foo}</Button
		>
		<Checkbox />
		<Accordion title="Console">
			<Console {height} bind:log />
		</Accordion>
		<Accordion title="Console">
			<Console {height} bind:log />
		</Accordion>
		<Accordion title="Console" storageKey="test">
			<Console {height} bind:log />
		</Accordion>
		<div class="container">
			{@html debugSvg(50, 150)}
			<Scrollbar direction="vertical" />
			<Scrollbar direction="horizontal" isPair={true} />
		</div>
	</App>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
	}

	.container {
		width: 100px;
		height: 100px;
		background: grey;
		outline: white;
		position: absolute;
		top: 200px;
		left: 200px;
	}

	.container :global(svg) {
		opacity: 0.5;
	}
</style>
