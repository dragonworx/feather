<script lang="ts">
	import { onMount } from 'svelte';
	import { Checkbox } from '../lib/index.js';

	let main: HTMLElement;

	onMount(() => {
		const checkbox = new Checkbox();

		main.appendChild(checkbox.view);

		(window as any).checkbox = checkbox;
	});
</script>

<main bind:this={main} />
