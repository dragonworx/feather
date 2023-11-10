<script lang="ts">
	import './forceHotReload';
	import Test from './test.svelte'
	import Button from '$lib/button';
	import Checkbox from '$lib/checkbox';
</script>

<main id="root">
	<Test>
		<ctrl-button is-toggle="true" label="Foo" />
		<ctrl-checkbox />
	</Test>
</main>
