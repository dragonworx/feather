<script lang="ts">
	import control from '../actions/control';
	import button from '../actions/button';

	export let isToggle: boolean = false;
</script>

<button use:control={{ type: 'checkbox' }} use:button={{ isToggle }}>
	<svg xmlns="http://www.w3.org/2000/svg">
		<path
			d="M14.84375 7.4296875l-1.203125-1.203125-5.140625 5.138671875-2.140625-2.138671875L5.15625 10.4296875l3.34375 3.34375L14.84375 7.4296875"
		/>
	</svg>
</button>
