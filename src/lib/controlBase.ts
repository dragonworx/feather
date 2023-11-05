import type { Descriptor, WithDescriptor, WithFullTagname, WithInitialProps } from './builder';
import { createStyle } from './stylesheet';

let _id = 0;

interface CssCache
{
    className: string;
    elements: NodeListOf<Element>;
}

/** Base Control extends HTMLElement as Custom Element */
export abstract class ControlBase<
    PropsType extends object = object,
> extends HTMLElement
{
    protected _id = String(_id++);
    protected _isMounted = false;
    protected _cssCache?: CssCache;
    protected _props: PropsType = {} as PropsType;
    protected _initialProps?: Partial<PropsType>;
    protected _shadowDom?: ShadowRoot;

    constructor()
    {
        super();
    }

    protected get descriptor(): Descriptor<PropsType>
    {
        return (this.constructor as unknown as WithDescriptor).__descriptor as Descriptor<PropsType>;
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

    protected connectedCallback()
    {
        const { descriptor } = this;

        if (descriptor.classes)
        {
            this.classList.add(...descriptor.classes);
        }

        this._isMounted = true;

        this._props = {
            ...descriptor.props,
            ...(this as unknown as WithInitialProps)._initialProps,
            ...this._props,
        };

        this.render();
        this.mount();
    }

    protected disconnectedCallback()
    {
        this._isMounted = false;
        this.unmount();
    }

    protected adoptedCallback()
    {
        this.onDocumentChange();
    }

    public render()
    {
        const innerHTML = this.renderHtml();

        if (innerHTML)
        {
            this.innerHTML = innerHTML;
        }

        const cssText = this.renderCss();

        if (cssText)
        {
            if (this._cssCache)
            {
                const { className, elements } = this._cssCache;
                for (const element of elements)
                {
                    element.remove();
                }
                this.classList.remove(className);
            }
            const { className, elements } = createStyle(cssText, this._id);
            this.classList.add(className);
            this._cssCache = {
                className,
                elements,
            }
        }
    }

    protected renderHtml(): string | void
    {
        return;
    }

    protected renderCss(): string | void
    {
        return
    }

    protected mount() { /** override */ }
    protected unmount() { /** override */ }

    protected onDocumentChange() { /** override */ }
}