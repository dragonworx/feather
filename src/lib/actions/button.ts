/* eslint-disable @typescript-eslint/no-unused-vars */
import type { ActionReturn } from 'svelte/action';
import { checkFlag, insertClass, setClass } from '../util';

type Event = {
    down: undefined;
    up: undefined;
    upOutside: undefined;
    toggle: { isToggled: boolean };
    longPress: undefined;
};

type Attributes = {
    'on:button-down'?: (e: CustomEvent<Event['down']>) => void;
    'on:button-up'?: (e: CustomEvent<Event['up']>) => void;
    'on:button-upOutside'?: (e: CustomEvent<Event['upOutside']>) => void;
    'on:button-toggle'?: (e: CustomEvent<Event['toggle']>) => void;
    'on:button-longPress'?: (e: CustomEvent<Event['longPress']>) => void;
}

const cssClasses = {
    down: 'down',
    toggled: 'toggled',
};

export enum ButtonFlag
{
    Left = 1,
    Middle = 4,
    Right = 2
}

export type InteractiveControlState =
    {
        buttons: ButtonFlag;
        isDown: boolean;
        isToggle: boolean;
        isToggled: boolean;
        longPressTime: number;
    }

export const defaultState: InteractiveControlState = {
    buttons: ButtonFlag.Left,
    isDown: false,
    isToggle: false,
    isToggled: false,
    longPressTime: 500,
};

export default function button(node: HTMLElement, props?: Partial<InteractiveControlState>): ActionReturn<InteractiveControlState, Attributes>
{
    const onMouseDown = (e: MouseEvent, force = false) =>
    {
        if (!force && !checkFlag(e.buttons, state.buttons))
        {
            return;
        }

        clearTimeout(_longPressTimeout);

        const currentIsDown = state.isDown;

        state.isDown = true;

        if (currentIsDown === false)
        {
            insertClass(node, cssClasses.down);
            // node.classList.add(cssClasses.down);
            node.dispatchEvent(new CustomEvent('button-down'));
        }

        _longPressTimeout = setTimeout(() => node.dispatchEvent(new CustomEvent('button-longPress')), state.longPressTime) as unknown as number;

        if (!force)
        {
            window.addEventListener('mouseup', onMouseUp);
        }
    };

    const onMouseUp = (e: MouseEvent) =>
    {
        state.isDown = false;

        clearTimeout(_longPressTimeout);
        node.classList.remove(cssClasses.down);

        window.removeEventListener('mouseup', onMouseUp);

        if (e.target === node || node.contains(e.target as Node))
        {
            node.dispatchEvent(new CustomEvent('button-up'));

            const oldValue = state.isToggled;

            state.isToggled = !state.isToggled;

            if (state.isToggle && oldValue !== state.isToggled)
            {
                setClass(node, cssClasses.toggled, state.isToggled);
                node.dispatchEvent(new CustomEvent('button-toggle', { detail: { isToggled: state.isToggled } }));
            }
        } else
        {
            node.dispatchEvent(new CustomEvent('button-upOutside'));
        }
    };

    const onMouseLeave = () =>
    {
        clearTimeout(_longPressTimeout);
    };

    const onKeyDown = (e: KeyboardEvent) =>
    {
        if (e.key === 'Enter' || e.key === ' ')
        {
            onMouseDown(e as unknown as MouseEvent, true);
        }
    }

    const onKeyUp = (e: KeyboardEvent) =>
    {
        if (e.key === 'Enter' || e.key === ' ')
        {
            onMouseUp(e as unknown as MouseEvent);
        }
    }

    let _longPressTimeout = 0;

    const state: InteractiveControlState = {
        ...defaultState,
        ...props,
    };

    node.addEventListener('mousedown', onMouseDown);
    node.addEventListener('mouseleave', onMouseLeave);
    node.addEventListener('keydown', onKeyDown);
    node.addEventListener('keyup', onKeyUp);

    if (state.isToggle && state.isToggled)
    {
        insertClass(node, cssClasses.toggled);
        // node.classList.add('toggled');
    }

    return {
        update: (updatedProp) => { },
        destroy: () =>
        {
            node.removeEventListener('mousedown', onMouseDown);
            node.removeEventListener('mouseleave', onMouseLeave);
            node.removeEventListener('keydown', onKeyDown);
            node.removeEventListener('keyup', onKeyUp);
        }
    };
}