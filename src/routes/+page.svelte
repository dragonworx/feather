<script lang="ts">
	import './forceHotReload';
	import App from '../lib/components/app.svelte';
	import Button from '../lib/components/button.svelte';
	import { createNestedStores } from '$lib/store';

	const store = createNestedStores({
		x: 1,
		y: {
			z: 1
		}
	});
</script>

<main>
	<App>
		<Button
			on:mousedown={() => {
				store.x++;
			}}
			on:mouseup={() => {
				store.y.z++;
			}}>Click x: {store.x} z: {store.y.z}</Button
		>
	</App>
</main>
