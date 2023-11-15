<script lang="ts" context="module">
	export type LogFunction = (...args: any[]) => void;
</script>

<script lang="ts">
	import style from '$lib/actions/style';
	export let height = 100;

	let logs: string[] = [];

	$: css = `height: ${height}px`;

	export const log: LogFunction = (...args: any[]) => {
		const line = args.map((arg) => arg.toString()).join(' ');
		logs = [...logs, line];
	};
</script>

<div use:style={css} class="console">
	{#each logs as log}
		<div class="log">{log}</div>
	{/each}
</div>
