import { Behavior } from '$lib/behavior_orig';

export class RolloverBehavior extends Behavior
{
	public static id = 'rollover';

	private _isOver = false;

	// todo: create custom events, options for whether to use enter/leave or over/out

	public get isOver()
	{
		return this._isOver;
	}

	public install(): void
	{
		const { component } = this;
		component.on('mouseover', this.onMouseOver);
		component.on('mouseout', this.onMouseOut);
		component.on('mouseenter', this.onMouseEnter);
		component.on('mouseleave', this.onMouseLeave);
	}

	public uninstall(): void
	{
		const { component } = this;
		component.off('mouseover', this.onMouseOver);
		component.off('mouseout', this.onMouseOut);
		component.off('mouseenter', this.onMouseEnter);
		component.off('mouseleave', this.onMouseLeave);
	}

	protected onMouseOver = () =>
	{
		this._isOver = true;
	};

	protected onMouseOut = () =>
	{
		this._isOver = false;
	};

	protected onMouseEnter = () =>
	{
		this._isOver = true;
	};

	protected onMouseLeave = () =>
	{
		this._isOver = false;
	};
}
