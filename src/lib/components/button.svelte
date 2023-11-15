<script lang="ts">
	import control from '../actions/control';
	import button from '../actions/button';

	export let isToggle: boolean = false;
</script>

<button use:control={{ type: 'button' }} use:button={{ isToggle }}>
	<label>
		<slot />
	</label>
</button>
