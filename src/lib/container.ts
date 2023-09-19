import { Component } from './component';

export abstract class Container<V extends HTMLElement, M = unknown> extends Component<V, M> {
	public readonly parent?: Component<HTMLElement, unknown>;
	public readonly children: Component<HTMLElement, unknown>[] = [];
}
