<script lang="ts">
	import { onMount } from 'svelte';
	import { nextTick } from '../util';
	import { readLocalStorageKey, writeLocalStorageKey } from '../localStorage';

	export let title: string | undefined = undefined;
	export let isOpen: boolean = true;
	export let storageKey: string | undefined = undefined;

	let content: HTMLElement;
	let openHeight = Infinity;

	onMount(async () => {
		openHeight = content.offsetHeight;

		if (storageKey) {
			isOpen = readLocalStorageKey(storageKey) !== '0';
			content.classList.add('no-transition');
			animate();
		}
	});

	function toggle() {
		isOpen = !isOpen;

		animate();

		if (storageKey) {
			writeLocalStorageKey(storageKey, isOpen ? '1' : '0');
		}
	}

	function animate() {
		if (!isOpen) {
			// close
			openHeight = content.offsetHeight;
			content.style.height = `${openHeight}px`;
			// console.log('close', openHeight);
			nextTick().then(() => {
				content.style.height = '0px';
			});
		} else {
			// open
			if (content.classList.contains('no-transition')) {
				content.classList.remove('no-transition');
			}
			// console.log('open', openHeight);
			content.style.height = `${openHeight}px`;
		}
	}

	function onTransitionEnd() {
		if (isOpen) {
			content.removeAttribute('style');
		}
	}
</script>

<fieldset class="accordion" class:closed={!isOpen}>
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<legend on:click={toggle} class:closed={!isOpen} class:hidden={!!!title}>{title}</legend>
	<section class="content" on:transitionend={onTransitionEnd} bind:this={content}>
		<slot />
	</section>
</fieldset>
