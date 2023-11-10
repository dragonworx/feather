import { Ctrl, type Descriptor } from './builder';
import { InteractiveControl, defaultState as defaultInteractiveControlState, type InteractiveControlState, type InteractiveControlEvent } from './interactiveControl';

export type ButtonState = InteractiveControlState & {
    label: string;
}

type CompositeState<S> = S & ButtonState;
type CompositeEvent<E> = E & InteractiveControlEvent;

export class Button<S, E = InteractiveControlEvent> extends InteractiveControl<CompositeState<S>, CompositeEvent<E>> {
    protected html(): string | void
    {
        const {label} = this.state;

        return label ? `<label>${label}</label>` : void 0;
    }
}

export const descriptor: Descriptor<ButtonState> = {
    tagName: 'button',
    state: {
        ...defaultInteractiveControlState,
        label: '',
    },
    classes: ['control', 'button'],
    isTabbable: true,
};

export default Ctrl<ButtonState, InteractiveControlEvent>(
    descriptor,
    Button
);