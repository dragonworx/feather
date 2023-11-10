import { Ctrl } from './builder';
import { Button, defaultButtonState, type ButtonState } from './button';
import style from './style';
import { css } from './util';

const cssText = css`
	${style.control.base}

	display: inline-block;
	border: 1px outset #ccc;
	border-radius: 3px;
	width: 20px;
	height: 20px;

	svg {
		position: relative;
		fill: white;
	}

	&.down,
	&.toggled {
		svg {
			left: 1px;
			top: 1px;
		}
	}

	&.down {
		${style.control.down}
		opacity: 0.5;
	}

	&.toggled {
		${style.control.toggled}
	}

	&.down.toggled {
		${style.control.downToggled}
	}
`;

export type CheckboxState = ButtonState &
{
	label: string;
	isChecked: boolean;
}


export class Checkbox extends Button<CheckboxState> {
	protected html(): string | void
	{
		return `<svg width="20px" height="20px" viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg"><path d="M760 380.4l-61.6-61.6-263.2 263.1-109.6-109.5L264 534l171.2 171.2L760 380.4z"/></svg>`;
	}

	protected css(): string | void
	{
		return cssText;
	}
}

export default Ctrl<CheckboxState>({
	tagName: 'checkbox',
	state: {
		...defaultButtonState,
		isToggle: true,
		label: '',
		isChecked: false,
	},
}, Checkbox);
