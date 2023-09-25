import { Component } from './component';

export abstract class Container<M = unknown, V extends HTMLElement = HTMLDivElement> 
	extends Component<M, V> {
	public readonly parent?: Component<unknown, HTMLElement>;
	public readonly children: Component<unknown, HTMLElement>[] = [];

	public set value(value: M) {
		this.model = value;
		this.initFromModel();
		this.updateView();
	}

	protected initFromModel() {
		// subclasses can override this method to initialize children from the model
		// they can choose how to optimise this, for example list
	}
}
