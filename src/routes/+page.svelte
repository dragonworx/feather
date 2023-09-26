<script lang="ts">
	import { onMount } from 'svelte';
	import { Checkbox } from '../lib/index.js';
	import { List } from '../lib/list.js';
	import { StringListItem } from '../lib/listItem.js';

	let main: HTMLElement;
	let checkbox: Checkbox;
	let list: List<string, StringListItem>;

	onMount(() => {
		checkbox = new Checkbox();
		list = new List(StringListItem as any);

		main.appendChild(checkbox.view);
	});
</script>

<main bind:this={main}>
	<button on:click={() => (checkbox.value = !checkbox.value)}>Test</button>
</main>
