import type { Component } from './component';

export interface ComponentPlugin {
	id: string;
	init(component: Component): void;
	destroy?(component: Component): void;
}
