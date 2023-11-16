<script>
	import '../css/theme.css';
</script>

<slot />

<style>
	:global(html),
	:global(body) {
		background: #222;
		width: 100%;
		height: 100%;
		margin: 0;
		overflow: hidden;
		color: white;
	}
	:global(main) {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		justify-content: flex-start;
		position: absolute;
		width: 100%;
		height: 100%;
	}
</style>
