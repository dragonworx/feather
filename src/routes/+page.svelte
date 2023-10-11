<script lang="ts">
	import { onMount } from 'svelte';
	import { Checkbox } from '$lib/components/checkbox';
	import { Button } from '$lib/components/button';
	import { StringList } from '$lib/components/list';
	import type { ButtonBehavior } from '$lib/behaviors/button';

	console.clear();

	let main: HTMLElement;
	let button1 = new Button('Button');
	let button2 = new Button('Button');
	let checkbox = new Checkbox();
	let list = new StringList(['test1', 'test2', 'test3']);

	onMount(() => {
		button1.appendTo(main);
		button2.appendTo(main);
		checkbox.appendTo(main);
		list.appendTo(main);
		button1
			.behavior<ButtonBehavior>('button')
			.on('down', () => console.log('down'))
			.on('up', () => console.log('up'))
			.on('upOutside', () => console.log('upOutside'));

		(window as any).button1 = button1;
		(window as any).button2 = button2;
	});

	// class SingletonBase {
	// 	static instances: Record<string, any> = {};

	// 	constructor() {
	// 		const className = this.constructor.name;
	// 		if (SingletonBase.instances[className]) {
	// 			return SingletonBase.instances[className];
	// 		}
	// 		console.log('!');
	// 		SingletonBase.instances[className] = this;
	// 	}
	// }

	// class MySubClass extends SingletonBase {
	// 	// Subclass logic here
	// }

	// const instance1 = new MySubClass();
	// const instance2 = new MySubClass();

	// console.log(instance1 === instance2); // Should print true
</script>

<main bind:this={main} />
