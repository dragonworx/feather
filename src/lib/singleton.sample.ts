export class SingletonBase {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
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
