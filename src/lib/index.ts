export interface Descriptor<PropsType extends object = object>
{
    tagName?: string;
    props: PropsType;
    classes?: string[];
    template?: HTMLElement | string;
    watchAttributes?: string[];
}

export interface CustomEventListener
{
    (evt: CustomEvent): void;
}

export type ControlEventHandler = EventListener | CustomEventListener;

export type Constructor<T> = new (...args: unknown[]) => T;

export type WithDescriptor = { __descriptor: Descriptor };
export type WithProps = { initialProps: object };
export type WithAttributes = { observedAttributes: string[] };