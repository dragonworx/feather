import { Component } from './component';

export class Panel extends Component<undefined, HTMLDivElement> {
	static componentId = 'panel';

	protected defaults(): undefined {
		return undefined;
	}
}