// Define HTMLEventMap to hold base HTMLEvent type definitions.
type HTMLEvent = keyof HTMLElementEventMap;

type ControlEvent = HTMLEvent | 'customControlEvent';

const a: ControlEvent = 'customControlEvent';

class Control<
    ElementType extends HTMLElement,
    PropsType extends object,
    EventType extends string = ControlEvent
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


type ButtonEvent = ControlEvent | 'buttonClicked';
const a: ButtonEvent = 'buttonClicked'

class Button extends Control<HTMLButtonElement, {}, ButtonEvent> {
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

myButton.on('but', (event) => {
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
