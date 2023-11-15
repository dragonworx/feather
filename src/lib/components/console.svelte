<script lang="ts">
	import style from '$lib/actions/style';
	export let height = 100;

	$: css = `height: ${height}px`;
</script>

<div use:style={css} class="console">text</div>
