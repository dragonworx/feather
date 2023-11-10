<script lang="ts">
	import { drag } from '../actions/drag';
</script>

<div use:drag on:drag-start={() => console.log('begin')}>
	<slot />
</div>

<style lang="scss">
	@import '../../sass/shared/control.scss';

	* {
		@include control;
	}
</style>
