<script lang="ts">
	import './forceHotReload';
	import App from '../lib/components/app.svelte';
	import Button from '../lib/components/button.svelte';
	import { installStyle, uninstallStyle } from '../lib/stylesheet';
	import { onMount } from 'svelte';

	function applyStyle(e?: MouseEvent) {
		const node = document.getElementById('test')!;
		const className = installStyle(
			`
				background: red;
				border-radius: ${e && e.shiftKey ? Math.random() * 20 : 0}px;
				width: 50px;
				height: 50px;
			`,
			node
		);
		console.log('className', className);
	}

	function uninstall() {
		const node = document.getElementById('test')!;
		uninstallStyle(node);
	}

	onMount(applyStyle);
</script>

<main>
	<App>
		<Button>Click</Button>
		<!-- svelte-ignore a11y-click-events-have-key-events -->
		<!-- svelte-ignore a11y-no-static-element-interactions -->
		<div id="test" on:click={(e) => applyStyle(e)} />
		<button on:click={uninstall}>Dispose</button>
	</App>
</main>

<style>
	#test {
		width: 10px;
		height: 10px;
		background: grey;
	}
</style>
