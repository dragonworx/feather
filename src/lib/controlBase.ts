import type { Descriptor, WithDescriptor, WithFullTagname, WithInitialProps } from './builder';
import { createStyle, unregisterElement } from './stylesheet';

let _id = 0;

export type ControlProps = {
    [key: string]: string | number | boolean;
};

/** Base Control extends HTMLElement as Custom Element */
export abstract class ControlBase<
    PropsType extends ControlProps = ControlProps,
> extends HTMLElement
{
    protected _id = String(_id++);
    protected _isMounted = false;
    protected _cssClass?: string;
    protected _props: PropsType = {} as PropsType;
    protected _initialProps?: Partial<PropsType>;
    protected _shadowDom?: ShadowRoot;

    constructor()
    {
        super();
    }

    public get controlId()
    {
        return this._id;
    }

    protected get descriptor(): Descriptor<PropsType>
    {
        return (this.constructor as unknown as WithDescriptor).descriptor as Descriptor<PropsType>;
    }

    protected get fullTagName()
    {
        return (this.constructor as unknown as WithFullTagname).fullTagName;
    }

    protected get isMounted()
    {
        return this._isMounted
    }

    protected get shadowDom()
    {
        if (!this._shadowDom)
        {
            this._shadowDom = this.attachShadow({ mode: 'open' });
        }
        return this._shadowDom;
    }

    protected get props()
    {
        return this._props;
    }

    public get styleSheetId()
    {
        return this._cssClass;
    }

    protected connectedCallback()
    {
        const { descriptor } = this;

        if (descriptor.classes)
        {
            this.classList.add(...descriptor.classes);
        }

        this.setAttribute('ctrl-id', this.controlId);

        this._isMounted = true;

        this._props = {
            ...descriptor.props,
            ...(this as unknown as WithInitialProps)._initialProps,
            ...this._props,
        };

        this.render();
        this.applyStyle();
        this.mount();
    }

    protected disconnectedCallback()
    {
        this._isMounted = false;
        this.unmount();

        unregisterElement(this, this._cssClass);
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
            this._cssClass = createStyle(cssText, this as unknown as ControlBase);
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

    // protected get $(): this & PropsType
    // {
    //     return this as unknown as this & PropsType;
    // }

    protected mount() { /** override */ }
    protected unmount() { /** override */ }

    protected onDocumentChange() { /** override */ }
}