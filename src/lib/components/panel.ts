import { Component, type ComponentDescriptor } from '../component';

export interface PanelModel {
	direction: 'horizontal' | 'vertical';
	wrap: boolean;
	justify: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly' | 'stretch';
	align: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
}

export class Panel extends Component<HTMLDivElement, PanelModel> {
	static descriptor: ComponentDescriptor<PanelModel> = {
		id: 'panel',
		model: {
			direction: 'horizontal',
			wrap: true,
			justify: 'start',
			align: 'start',
		},
		html: `<div></div>`,
	}

	protected render(): void {
		const { direction, wrap, justify, align } = this.model;
		this.setClassIf('horizontal', direction === 'horizontal');
		this.setClassIf('vertical', direction === 'vertical');
		this.setClassIf('wrap', wrap);
		this.setClassIf('justify-start', justify === 'start');
		this.setClassIf('justify-end', justify === 'end');
		this.setClassIf('justify-center', justify === 'center');
		this.setClassIf('justify-space-around', justify === 'space-around');
		this.setClassIf('justify-space-between', justify === 'space-between');
		this.setClassIf('justify-space-evenly', justify === 'space-evenly');
		this.setClassIf('justify-stretch', justify === 'stretch');
		this.setClassIf('align-start', align === 'start');
		this.setClassIf('align-end', align === 'end');
		this.setClassIf('align-center', align === 'center');
		this.setClassIf('align-baseline', align === 'baseline');
		this.setClassIf('align-stretch', align === 'stretch');
	}
}
