<script lang="ts">
	import './forceHotReload';

	import App from '../lib/components/app.svelte';
	import Button from '../lib/components/button.svelte';
	import Checkbox from '../lib/components/checkbox.svelte';
	import Accordion from '../lib/components/accordion.svelte';
	import ScrollView from '../lib/components/scrollview.svelte';
	import List from '../lib/components/list.svelte';
	import Debug from '../lib/components/debug.svelte';
	import Console, { type LogFunction } from '../lib/components/console.svelte';

	import { deepStore } from '../lib/deepStore';
	import { onMount } from 'svelte';

	const store = deepStore({
		foo: 'bar' as string | number
	});

	let height = 50;

	let w = 350;
	let h = 150;
	let autoScroll = false;
	let offsetY = 0;

	let log: LogFunction;

	onMount(() => {
		for (let i = 0; i < 7; i++) {
			log(`log ${i}`);
		}
		offsetY = 50;
	});
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<App>
	<List list={['a', 'b', 'c', 'd', 'e']} />

	<Button
		on:click={() => {
			store.foo = 12;
			height += 10;
			log(height, store.foo);
		}}>Click@ {store.foo}</Button
	>

	<Checkbox isChecked={false} />

	<Accordion title="Console">
		<ScrollView height={100} {offsetY} autoScrollTo={'bottom'}>
			<Console bind:log />
		</ScrollView>
	</Accordion>

	<!-- <Accordion title="Console">
		<Console {height} bind:log />
	</Accordion>

	<Accordion title="Console" storageKey="test">
		<Console {height} bind:log />
	</Accordion> -->

	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<div class="wrapper" on:click={(e) => e.shiftKey && (autoScroll = !autoScroll)}>
		<ScrollView offsetX={0} offsetY={25} {autoScroll} clip={false}>
			<Debug width={w} height={h} />
		</ScrollView>
	</div>

	
</App>

<style>
	.wrapper {
		top: 100px;
		height: 100px;
		width: 100px;
		background: #eee;
		position: relative;
	}
</style>
