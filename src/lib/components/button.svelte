<script lang="ts">
	import { button } from '../actions/button';
	import { contextMenu } from '../actions/contextMenu';
</script>

<!-- svelte-ignore a11y-positive-tabindex -->
<!-- svelte-ignore a11y-no-noninteractive-tabindex -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
	class="control button"
	tabindex="1"
	use:button={{ isToggle: false }}
	use:contextMenu
	on:button-down={() => console.log('down')}
	on:button-up={() => console.log('up')}
	on:button-upOutside={() => console.log('upOutside')}
	on:button-toggle={(e) => console.log('toggled', e.detail.isToggled)}
	on:context-menu={(e) => console.log('context menu', e.detail)}
	on:mousedown
	on:mouseup
>
	<label>
		<slot />
	</label>
</div>
