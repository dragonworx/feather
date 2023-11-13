<script lang="ts">
	let innerWidth = 0;

	$: console.log('innerWidth', innerWidth);

	function handleVisibilityChange() {
		console.log('visibilitychange', document.visibilityState);
	}
</script>

<svelte:window bind:innerWidth />
<svelte:document on:visibilitychange={handleVisibilityChange} />

<slot />
