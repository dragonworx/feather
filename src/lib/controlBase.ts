import type { Descriptor, WithDescriptor, WithFullTagname, WithInitialProps } from './builder';

/** Base Control extends HTMLElement as Custom Element */
export abstract class ControlBase<
    PropsType extends object = object,
> extends HTMLElement
{
    protected _isMounted = false;

    protected _props: PropsType = {} as PropsType;
    protected _initialProps?: Partial<PropsType>;

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

    protected render()
    {
        const innerHTML = this.html();

        if (innerHTML)
        {
            this.innerHTML = innerHTML;
        }
    }

    protected html(): string | void
    {
        return;
    }

    protected mount() { /** override */ }
    protected unmount() { /** override */ }

    protected onDocumentChange() { /** override */ }
}