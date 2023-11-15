<script lang="ts">
	export let title: string | undefined = undefined;
	export let isOpen: boolean = true;

	function toggle() {
		isOpen = !isOpen;
	}
</script>

<fieldset class="accordion">
	<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
	<!-- svelte-ignore a11y-click-events-have-key-events -->
	<legend on:click={toggle}>{title}</legend>
	<section class:open={isOpen} class:closed={!isOpen}>
		<slot />
	</section>
</fieldset>
