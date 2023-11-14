<script lang="ts">
	import { button } from '../actions/button';
	import { contextMenu } from '../actions/contextMenu';
	import { css } from '../util';

	export let classes: string[] | string = [];
	export let isToggle: boolean = false;
</script>

<!-- svelte-ignore a11y-positive-tabindex -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class={css('control', classes)}
	tabindex="1"
	use:button={{ isToggle }}
	use:contextMenu
	on:button-up={() => console.log('up')}
	on:button-upOutside={() => console.log('upOutside')}
	on:button-toggle={(e) => console.log('toggled', e.detail.isToggled)}
	on:context-menu={(e) => console.log('context menu', e.detail)}
	on:button-down
	on:button-up
	on:button-upOutside
	on:button-toggle
	on:context-menu
	on:mousedown
	on:mouseup
>
	<slot />
</div>
