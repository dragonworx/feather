<script lang="ts">
	import control from '../actions/control';
	import button from '../actions/button';
	import { getContext } from 'svelte';

	export let isToggle: boolean = false;
</script>

<button use:control={{ type: 'button' }} use:button={{ isToggle }} on:click>
	<label>
		<slot />
	</label>
</button>
