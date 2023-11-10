<script lang="ts">
	import type { Action, ActionReturn } from 'svelte/action';
    import {drag} from '../draggable';

    type Parameter = { x: number };
    type Event = { y: number };
    type Attributes = { 'on:emit': (e: CustomEvent<Event>) => void }
    export function foo(node: HTMLElement, parameter: Parameter): ActionReturn<Parameter, Attributes> {
        
        node.onmousedown = () => drag({
            startX: node.offsetLeft,
            startY: node.offsetTop,
            onStart(e)
            {
                node.dispatchEvent(new CustomEvent('emit', { detail: { y: 5 } }));
            },
            onMove(e)
            {
                node.style.left = e.xDelta + 'px';
                node.style.top = e.yDelta + 'px';
            },
        });

        return {
            update: (updatedParameter) => {},
            destroy: () => {}
        };
    }
</script>


<div use:foo={{x:1}} on:emit={e => console.log(e.detail.y)}>
    <slot/>
    <p>hey</p>
</div>

<style lang="scss">
    @import '../../sass/test.scss';

    div {
        position: relative;
        background-color: red;
        width: 100px;
        height: 100px;

        p {
            color: blue;
            @include test;
        }
    }
</style>