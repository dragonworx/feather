// Define HTMLEventMap to hold base HTMLEvent type definitions.
type HTMLEvents = keyof HTMLElementEventMap;

// Define custom EventMap for Control class

// type ExtendEventMap<Base, Custom> = Base | Custom;

// type ControlEventMap = ExtendEventMap<HTMLEvents, {
//     customControlEvent: CustomEvent;
// }>;

type ControlEventMap = HTMLEvents | 'customControlEvent';

const a: ControlEventMap = 'customControlEvent';

class Control<
    ElementType extends HTMLElement,
    PropsType extends object,
    EventType extends string
> {
    protected element: ElementType;
    protected props: PropsType;

    constructor(element: ElementType, props: PropsType) {
        this.element = element;
        this.props = props;
    }

    on<K extends EventType>(
        type: K,
        listener: (this: ElementType, ev: EventType[K]) => any,
        options?: boolean | AddEventListenerOptions
    ) {
        this.element.addEventListener(type, listener, options);
    }

    off<K extends EventType>(
        type: K,
        listener: (this: ElementType, ev: EventType[K]) => any,
        options?: boolean | EventListenerOptions
    ) {
        this.element.removeEventListener(type, listener, options);
    }
}

// Define custom EventMap for Button class
// interface ButtonEventMap {
//     buttonClicked: CustomEvent;
// }

type ButtonEventType = ControlEventMap | 'buttonClicked';
const a: ButtonEventType = 'buttonClicked'

class Button extends Control<HTMLButtonElement, {}, ButtonEventType> {
    constructor(element: HTMLButtonElement, props: {}) {
        super(element, props);
    }

    // Additional methods specific to Button
    click() {
        console.log('Button clicked');
    }
}

// Usage
const buttonElement = document.createElement('button');
const myButton = new Button(buttonElement, {});

myButton.on('butto', (event) => {
    console.log('Button Clicked', event);
});

myButton.on('buttonClicked', (event) => {
    console.log('Custom Button Event', event);
});

myButton.on('customControlEvent', (event) => {
    console.log('Custom Control Event', event);
});

myButton.off('click', (event) => {
    console.log('Removed Button Clicked', event);
});
