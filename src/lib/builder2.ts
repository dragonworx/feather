/* eslint-disable @typescript-eslint/no-explicit-any */

import { createStyle, unregisterElement } from './stylesheet';
import { toHyphenCase } from './util';

export const tagPref = 'ctrl-';

export type Constructor<T, PropsType = any> = new (props?: Partial<PropsType>) => T;

export interface CustomEventListener<T = any>
{
    (evt: CustomEvent<T>): void;
}

export type AttributeType = string | number | boolean;
// type AttributeValidator = (value: string) => boolean;
export type Attributes = Record<string, AttributeType>;

export interface Descriptor<PropsType extends object, AttribsType extends Attributes>
{
    tagName: string;
    classes?: string[];
    props?: PropsType;
    attribs?: AttribsType;
}

export type ControlMeta<
    PropsType extends object,
    AttribsType extends Attributes,
> = {
    fullTagName: string;
    descriptor: Descriptor<PropsType, AttribsType>;
    props: object;
    attribs: Attributes;
};

export const defaultControlMeta: ControlMeta<any, any> = {
    fullTagName: '',
    descriptor: {
        tagName: '',
    },
    props: {},
    attribs: {},
};

let _id = 0;

export function createProxy<T extends Record<PropertyKey, any>>(
    target: T,
    onSet: (key: keyof T, oldValue: T[keyof T], newValue: T[keyof T]) => void
): T
{
    return new Proxy(target, {
        set: (obj: T, prop: keyof T, value: T[keyof T]): boolean =>
        {
            if (obj[prop] !== value)
            {
                const oldValue = obj[prop];
                obj[prop] = value;
                onSet(prop, oldValue, value);
            }
            return true;
        }
    });
}

/** ------- BaseControl ------- */

export class BaseControl<
    PropsType extends object = object,
    AttribsType extends Attributes = Attributes,
    EventsType = object,
> extends HTMLElement
{
    protected _meta: ControlMeta<PropsType, AttribsType> = {
        ...defaultControlMeta,
    };
    protected _id = String(_id++);
    protected _isMounted = false;
    protected _cssClass?: string;
    protected _shadowDom?: ShadowRoot;

    protected _props: PropsType = {} as PropsType;
    protected _attribs: AttribsType = {} as AttribsType;

    private _listeners: Map<string, CustomEventListener[]> = new Map();

    constructor()
    {
        super();
    }

    public props!: PropsType;
    public attribs!: AttribsType;

    public get controlId()
    {
        return this._id;
    }

    public get styleSheetId()
    {
        return this._cssClass;
    }

    public get fullTagName() {
        return this._meta.fullTagName;
    }

    protected get shadowDom()
    {
        if (!this._shadowDom)
        {
            this._shadowDom = this.attachShadow({ mode: 'open' });
        }
        return this._shadowDom;
    }

    protected connectedCallback()
    {
        const { descriptor } = this._meta;

        if (descriptor.classes)
        {
            this.classList.add(...descriptor.classes);
        }

        this.setAttribute('ctrl-id', this.controlId);

        this._isMounted = true;

        this.render();
        this.applyStyle();
        this.mount();
    }

    protected disconnectedCallback()
    {
        this._isMounted = false;
        this.unmount();

        unregisterElement(this as unknown as BaseControl, this._cssClass);
    }

    protected adoptedCallback()
    {
        this.onDocumentChange();
    }

    public render()
    {
        if (!this._isMounted)
        {
            return;
        }

        const innerHTML = this.html();

        if (innerHTML)
        {
            this.innerHTML = innerHTML;
        }
    }

    public applyStyle()
    {
        if (!this._isMounted)
        {
            return;
        }

        const cssText = this.css();

        if (cssText)
        {
            this._cssClass = createStyle(cssText, this as unknown as BaseControl);
        }
    }

    protected html(): string | void
    {
        return;
    }

    protected css(): string | void
    {
        return
    }

    protected mount() { /** override */ }
    protected unmount() { /** override */ }

    protected onDocumentChange() { /** override */ }

    protected attributeChangedCallback(name: keyof AttribsType, oldValue: string | null, newValue: string | null)
    {
        console.log(`${this.fullTagName}.attributeChangedCallback`, name, oldValue, newValue);

        if (this.onAttributeChanged(name, oldValue, newValue) === false)
        {
            return;
        }

        const attribute = this._attribs![name];

        if (attribute)
        {
            if (newValue === null)
            {
                // todo: clear attribute or default?
                // this.setProp(name as keyof PropsType, this.descriptor.props[name as keyof PropsType]);
            } else
            {
                // const isValid = attribute.validate!(newValue);
                const type = typeof attribute;

                // if (!isValid)
                // {
                //     throw new Error(`${this.fullTagName}: Invalid value for attribute "${name}": "${newValue}"`);
                // }

                switch (type) {
                    case 'number':
                        this._attribs[name] = parseFloat(newValue) as AttribsType[keyof AttribsType];
                        break;
                    case 'boolean':
                        this._attribs[name] = (newValue.toLowerCase() === 'true') as AttribsType[keyof AttribsType];
                        break;
                    case 'string':
                        this._attribs[name] = newValue as AttribsType[keyof AttribsType];
                }
            }

        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onAttributeChanged(name: keyof AttribsType, oldValue: string | null, newValue: string | null): false | void { /** override */ }

    private listenersForType(type: string)
    {
        if (!this._listeners.has(type))
        {
            this._listeners.set(type, []);
        }
        return this._listeners.get(type)!;
    }

    public on = (<T extends EventsType>() =>
        <E extends keyof T>(
            type: E,
            listener: CustomEventListener<T[E]>,
            options?: boolean | AddEventListenerOptions
        ): this =>
        {
            const key = String(type);
            this.listenersForType(key).push(listener);
            this.addEventListener(key, listener as EventListenerOrEventListenerObject, options);

            return this;
        })();
}

/** ------- Ctrl ------- */

export function Ctrl<
    PropsType extends object,
    AttribsType extends Attributes,
    EventsType,
>(
    descriptor: Descriptor<PropsType, AttribsType>,
    ctor: Constructor<BaseControl<PropsType, AttribsType, EventsType>, PropsType>
)
{
    type CtorType = typeof ctor;

    const { tagName } = descriptor;
    const fullTagName = tagPref + (tagName ?? toHyphenCase(ctor.name));
    const attribs = descriptor.attribs;

    if (fullTagName.endsWith('-') || fullTagName.startsWith('-'))
    {
        throw new Error(`Invalid tag name: ${fullTagName}`)
    }

    (ctor as any).observedAttributes = Object.keys(attribs ?? {});

    customElements.define(fullTagName, ctor);

    return class
    {
        constructor(props: Partial<PropsType> = {})
        {
            const element = document.createElement(fullTagName) as InstanceType<CtorType>;

            element['_meta'] = {
                fullTagName,
                descriptor,
                props: props,
                attribs: descriptor.attribs ?? {},
            };

            element['_props'] = {
                ...descriptor.props,
                ...props,
            } as PropsType;
    
            element['_attribs'] = {
                ...descriptor.attribs,
                ...attribs,
            } as AttribsType;

            element.props = createProxy(element['_props'], (key, oldValue, newValue) => {
                console.log("props proxy", key, oldValue, newValue);
            });

            element.attribs = createProxy(element['_attribs'], (key, oldValue, newValue) => {
                console.log("attribs proxy", key, oldValue, newValue);
            });

            /** Define the getters and setters type based on props */
            if (attribs)
            {
                for (const [key, value] of Object.entries(attribs))
                {
                    const attribName = toHyphenCase(key);
                    const attribType = typeof value;

                    Object.defineProperty(element, key, {
                        get()
                        {
                            return element['_attribs'][key];
                        },
                        set(value: any)
                        {
                            switch (attribType)
                            {
                                case "string":
                                case "number":
                                case "boolean":
                                    element.setAttribute(attribName, String(value));
                                    break;
                            }
                        }
                    });
                }
            }

            return element;
        }
    } as unknown as new (props?: Partial<PropsType>) => InstanceType<CtorType> & AttribsType;
}
