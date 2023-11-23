<script lang="ts">
    import SimpleListItem from './simpleListItem.svelte';
    import {drag, type DraggableEvent} from '$lib/actions/drag';

    export let component = SimpleListItem;
    export let list: any[];

    let dragSource: HTMLElement;
    let dragTarget: HTMLElement;
    let dragOriginX = 0;
    let dragOriginY = 0;

    function onDragStart(e: CustomEvent<DraggableEvent>) {
        const {sourceEvent} = e.detail;
        const {target, clientX, clientY} = sourceEvent;
        dragSource = target as HTMLElement;
        dragTarget = dragSource;
        
        const bounds = dragSource.getBoundingClientRect();
        dragOriginX = clientX - bounds.left;
        dragOriginY = clientY - bounds.top;
        console.log('drag start', dragSource.textContent, dragOriginX, dragOriginY);
        dragSource.classList.add('drag-source');
    }

    function onDragMove(e: CustomEvent<DraggableEvent>) {
        if (dragSource) {
            const { clientY, target } = e.detail.sourceEvent;

            dragSource.style.transform = `translate(0px, ${clientY - dragOriginY}px)`;

            if (dragSource === dragTarget || dragTarget !== target) {
                if (dragSource !== dragTarget) {
                    dragTarget.classList.remove('drag-target');
                    dragTarget.removeAttribute('style');
                }
                dragTarget = target as HTMLElement;
                dragTarget.classList.add('drag-target');
                dragTarget.style.paddingTop = `${dragSource.clientHeight}px`;
            }
        }
    }
</script>

<ul class="list" use:drag on:drag-start={onDragStart} on:drag-move={onDragMove}>
    {#each list as item}
    <svelte:component this={component} item={item} />
    {/each}
</ul>