<script lang="ts">
	import './forceHotReload';

	import App from '../lib/components/app.svelte';
	import Button from '../lib/components/button.svelte';
	import Checkbox from '../lib/components/checkbox.svelte';
	import Accordion from '../lib/components/accordion.svelte';
	import ScrollView from '../lib/components/scrollview.svelte';
	import Debug from '../lib/components/debug.svelte';
	import Console, { type LogFunction } from '../lib/components/console.svelte';

	import { deepStore } from '../lib/deepStore';

	const store = deepStore({
		foo: 'bar' as string | number
	});

	let height = 50;

	let w = 150;
	let h = 150;

	let log: LogFunction;
</script>

<App>
	<Button
		on:click={() => {
			store.foo = 12;
			height += 10;
			log(height, store.foo);
		}}>Click@ {store.foo}</Button
	>

	<Checkbox isChecked={true} />

	<Accordion title="Console">
		<Console {height} bind:log />
	</Accordion>

	<Accordion title="Console">
		<Console {height} bind:log />
	</Accordion>

	<Accordion title="Console" storageKey="test">
		<Console {height} bind:log />
	</Accordion>

	<div class="wrapper">
		<ScrollView offsetX={0} offsetY={0}>
			<Debug width={w} height={h} />
		</ScrollView>
	</div>
</App>

<style>
	.wrapper {
		height: 100px;
		width: 100px;
		background: #eee;
		position: relative;
	}
</style>
