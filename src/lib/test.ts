/* eslint-disable @typescript-eslint/no-unused-vars */
// Utility type for merging states and events

// BaseControl with generic state and events
export abstract class BaseControl<State, Events> {
    protected state: State = {} as State;
    public emit<K extends keyof Events>(event: K, payload?: Events[K]): void {
        // Emitting event logic
    }

    protected onStateChanged<K extends keyof State>(key: K, oldValue: State[K], newValue: State[K]): void {
        // Default implementation or abstract
    }

    // ... other methods and properties
}

type ButtonCompositeState<S> = S & ButtonState;

type ButtonState = {
    isDown: boolean;
    // ... other Button specific states
};

type ButtonEvent = {
    down: { isChecked: boolean; };
    up: null;
    // ... other Button specific events
};

// Button with its own state and event types
export class Button<S, E> extends BaseControl<ButtonCompositeState<S>, E & ButtonEvent> {
    protected onStateChanged<K extends keyof ButtonCompositeState<S>>(key: K, oldValue: ButtonCompositeState<S>[K], newValue: ButtonCompositeState<S>[K]): void
    {
        this.emit('down', { isChecked: newValue });
    }
    // ... Button specific logic
}

type CheckboxState = ButtonState & {
    isChecked: boolean;
    // ... other Checkbox specific states
};

type CheckboxEvent = {
    toggle: { isChecked: boolean; }
    // ... other Checkbox specific events
};

// Checkbox extends Button with additional state and event types
export class Checkbox extends Button<CheckboxState, CheckboxEvent> {
    onStateChanged<K extends keyof CheckboxState>(name: K, oldValue: CheckboxState[K], newValue: CheckboxState[K]): void {
        if (name === 'isChecked') {
            console.log(`Checkbox state changed: ${name} from ${oldValue} to ${newValue}`);
            // ... additional logic for checkbox
        }
    }
    // ... Checkbox specific logic
}

const checkbox = new Checkbox();
checkbox.emit('down', { isChecked: true });