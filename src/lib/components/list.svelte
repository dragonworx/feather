<script lang="ts">
    import SimpleListItem from './simpleListItem.svelte';
    import {drag, type DraggableEvent} from '$lib/actions/drag';

    export let component = SimpleListItem;
    export let list: any[];

    let dragTarget: HTMLElement;
    let dragOriginX = 0;
    let dragOriginY = 0;

    function onDragStart(e: CustomEvent<DraggableEvent>) {
        const {sourceEvent} = e.detail;
        const {target, clientX, clientY} = sourceEvent;
        dragTarget = target as HTMLElement;
        // determine offset from mouse to target
        const bounds = dragTarget.getBoundingClientRect();
        dragOriginX = clientX - bounds.left;
        dragOriginY = clientY - bounds.top;
        console.log('drag start', dragTarget.textContent, dragOriginX, dragOriginY);
        dragTarget.classList.add('drag-target');
    }

    function onDragMove(e: CustomEvent<DraggableEvent>) {
        if (dragTarget) {
            const {clientY} = e.detail.sourceEvent;
            dragTarget.style.transform = `translate(0px, ${clientY - dragOriginY}px)`;
        }
    }
</script>

<ul class="list" use:drag on:drag-start={onDragStart} on:drag-move={onDragMove}>
    {#each list as item}
    <svelte:component this={component} item={item} />
    {/each}
</ul>