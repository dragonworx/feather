<script lang="ts">
	import { onMount } from 'svelte';
	import { Checkbox } from '../lib/index.js';

	let main: HTMLElement;
	let checkbox: Checkbox;

	onMount(() => {
		checkbox = new Checkbox();

		main.appendChild(checkbox.view);

		(window as any).test = checkbox;
	});
</script>

<main bind:this={main}>
	<button on:click={() => (checkbox.value = !checkbox.value)}>Test</button>
</main>
