import { Control, type ControlDescriptor } from '../control_orig';

export interface PanelModel
{
	direction: 'horizontal' | 'vertical';
	wrap: boolean;
	justify: 'start' | 'end' | 'center' | 'space-around' | 'space-between' | 'space-evenly' | 'stretch';
	align: 'start' | 'end' | 'center' | 'baseline' | 'stretch';
}

export class Panel extends Control<HTMLDivElement, PanelModel> {
	static descriptor: ControlDescriptor<PanelModel> = {
		id: 'panel',
		props: {
			direction: 'horizontal',
			wrap: true,
			justify: 'start',
			align: 'start',
		},
		template: `<div></div>`,
	}

	protected render(): void
	{
		const { direction, wrap, justify, align } = this._props;
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
