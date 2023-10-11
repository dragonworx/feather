<script lang="ts">
	import { onMount } from 'svelte';
	import { Checkbox } from '$lib/components/checkbox';
	import { Button } from '$lib/components/button';
	import { StringList } from '$lib/components/list';
	import { ButtonBehavior } from '$lib/behaviors/button';

	let main: HTMLElement;
	let button = new Button('Button');
	let checkbox = new Checkbox();
	let list = new StringList(['test1', 'test2', 'test3']);

	onMount(() => {
		const behavior = new ButtonBehavior();
		button.addBehavior('button', behavior);
		button.appendTo(main);
		checkbox.appendTo(main);
		list.appendTo(main);
		behavior
			.on('down', () => console.log('down'))
			.on('up', () => console.log('up'))
			.on('upOutside', () => console.log('upOutside'));
	});

	class SingletonBase {
		static instances: Record<string, any> = {};

		constructor() {
			const className = this.constructor.name;
			if (SingletonBase.instances[className]) {
				return SingletonBase.instances[className];
			}
			console.log('!');
			SingletonBase.instances[className] = this;
		}
	}

	class MySubClass extends SingletonBase {
		// Subclass logic here
	}

	const instance1 = new MySubClass();
	const instance2 = new MySubClass();

	console.log(instance1 === instance2); // Should print true
</script>

<main bind:this={main} />
