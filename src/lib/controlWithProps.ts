// import type { Descriptor, WithDescriptor } from './builder';
import type { AttributeDescriptor } from './builder';
import { ControlBase } from './controlBase';
import { simpleDiff, type DiffSet } from './diff';

/** Control With Props extends Base Control */
export abstract class ControlWithProps<
    PropsType extends object = object,
> extends ControlBase<PropsType>
{
    public setProp<K extends keyof PropsType>(name: K, value: PropsType[K])
    {
        this.setProps({ [name]: value } as unknown as Partial<PropsType>);
    }

    public setProps(props: Partial<PropsType>)
    {
        console.log(`[${this.fullTagName}].setProps:`, props);

        const newProps = {
            ...this._props,
            ...props,
        };

        const diff = simpleDiff(newProps, this._props);

        this._props = newProps;

        if (this._isMounted)
        {
            this.onPropsChanged(diff);
        }
    }

    protected onPropsChanged(diff: DiffSet)
    {
        console.log(`[${this.fullTagName}].onPropsChanged`, diff);
    }

    protected attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null)
    {
        console.log(`${this.fullTagName}.attributeChangedCallback`, name, oldValue, newValue);

        if (this.onAttributeChanged(name, oldValue, newValue) === false)
        {
            return;
        }

        const attribute = this.descriptor.attributes![name as keyof PropsType] as AttributeDescriptor;

        if (name in this.descriptor.props && attribute && attribute.public)
        {
            if (newValue === null)
            {
                this.setProp(name as keyof PropsType, this.descriptor.props[name as keyof PropsType]);
            } else
            {
                const isValid = attribute.validate!(newValue);
                const propKey = name as keyof PropsType;

                if (!isValid)
                {
                    throw new Error(`${this.fullTagName}: Invalid value for attribute "${name}": "${newValue}"`);
                }

                if (attribute.type === 'number')
                {
                    this.setProp(propKey, parseFloat(newValue) as PropsType[keyof PropsType]);
                } else if (attribute.type === 'boolean')
                {
                    this.setProp(propKey, (newValue.toLowerCase() === 'true') as PropsType[keyof PropsType]);
                } else
                {
                    this.setProp(name as keyof PropsType, newValue as PropsType[keyof PropsType]);
                }
            }

        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): false | void { /** override */ }
}