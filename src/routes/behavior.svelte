<script lang="ts">
	import { createEventDispatcher, onMount } from 'svelte';

    let element: HTMLElement;

    const dispatcher = createEventDispatcher();
    
    export function init(el: HTMLElement) {
        element = el;
        console.log(element);
    }
</script>

<slot />