<script lang="ts">
	import { css } from '../util';
	import Control from './control.svelte';

	export let classes: string[] | string = [];
	export let isToggle: boolean = false;
</script>

<Control classes={css('button', classes)} {isToggle}>
	<label>
		<slot />
	</label>
</Control>
