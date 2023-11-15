<script lang="ts">
	import './forceHotReload';
	import App from '../lib/components/app.svelte';
	import Button from '../lib/components/button.svelte';
	import Checkbox from '../lib/components/checkbox.svelte';
	import Console from '../lib/components/console.svelte';
	// import { deepEvent } from '../lib/deepEvent';
	import { deepStore } from '../lib/deepStore';

	const store = deepStore({
		foo: 'bar' as string | number
	});

	let height = 50;
</script>

<main>
	<App>
		<Button
			on:click={() => {
				store.foo = 12;
				height += 10;
			}}>Click@ {store.foo}</Button
		>
		<Checkbox />
		<Console {height} />
	</App>
</main>

<style>
	main {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
	}
</style>
