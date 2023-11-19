<script lang="ts">
	import { onMount } from 'svelte';
	import { nextTick } from '../util';
	import { readLocalStorageKey, writeLocalStorageKey } from '../localStorage';

	export let title: string | undefined = undefined;
	export let isOpen: boolean = true;
	export let storageKey: string | undefined = undefined;

	let fieldset: HTMLElement;
	let content: HTMLElement;
	let openHeight = Infinity;

	onMount(async () => {
		openHeight = content.offsetHeight;

		if (storageKey) {
			isOpen = readLocalStorageKey(storageKey) !== '0';
			fieldset.classList.add('no-transition');
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
			nextTick().then(() => {
				content.style.height = '0px';
			});
		} else {
			// open
			if (fieldset.classList.contains('no-transition')) {
				fieldset.classList.remove('no-transition');
			}
			content.style.height = `${openHeight}px`;
		}
	}

	function onTransitionEnd() {
		if (isOpen) {
			content.removeAttribute('style');
		}
	}
</script>

<fieldset bind:this={fieldset} class="accordion" class:closed={!isOpen}>
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<legend on:click={toggle} class:closed={!isOpen} class:hidden={!!!title}>{title}</legend>
	<section bind:this={content} class="content" on:transitionend={onTransitionEnd}>
		<slot />
	</section>
</fieldset>
