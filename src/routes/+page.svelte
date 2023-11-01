<script lang="ts">
	import { onMount } from 'svelte';
	import { test } from '$lib/new/test2';
	import './forceHotReload';

	onMount(() => {
		test();
	});
</script>

<main id="root">
	<ctrl-button size="abc">foo</ctrl-button>
</main>

<style>
	main {
		width: 100%;
		height: 100%;
	}
</style>
