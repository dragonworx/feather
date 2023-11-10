<script lang="ts">
    import {drag} from '../lib/draggable';

    function foo(node, bar) {
		// the node has been mounted in the DOM
        node.onmousedown = () => drag({
            startX: node.offsetLeft,
            startY: node.offsetTop,
            onMove(e)
            {
                node.style.left = e.xDelta + 'px';
                node.style.top = e.yDelta + 'px';
            },
        })

		return {
			destroy() {
				// the node has been removed from the DOM
			}
		};
	}
</script>


<div use:foo={["bar", 2]}>
    <slot/>
</div>

<style>
    div {
        position: relative;
        background-color: red;
        width: 100px;
        height: 100px;
    }
</style>