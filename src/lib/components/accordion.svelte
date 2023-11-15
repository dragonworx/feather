<script lang="ts">
	import { onMount } from 'svelte';
	import { nextTick } from '../util';

	export let title: string | undefined = undefined;
	export let isOpen: boolean = true;

	let content: HTMLElement;
	let openHeight = Infinity;

	onMount(() => {
		openHeight = content.offsetHeight;
	});

	function toggle() {
		isOpen = !isOpen;
		if (!isOpen) {
			openHeight = content.offsetHeight;
			content.style.height = `${openHeight}px`;
			nextTick().then(() => (content.style.height = '0px'));
		} else {
			content.style.height = `${openHeight}px`;
		}
	}

	function onTransitionEnd() {
		if (isOpen) {
			content.removeAttribute('style');
		}
	}
</script>

<fieldset class="accordion">
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<legend on:click={toggle} class:hidden={!!!title}>{title}</legend>
	<section class="content" on:transitionend={onTransitionEnd} bind:this={content}>
		<slot />
	</section>
</fieldset>
