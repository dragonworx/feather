<script lang="ts">
	import { drag, type DragOptions } from '../actions/drag';
</script>

<div
	use:drag={{
		onStart() {
			console.log('!');
		}
	}}
>
	<slot />
</div>

<style lang="scss">
	@import '../../sass/shared/control.scss';

	* {
		@include control;
	}
</style>
