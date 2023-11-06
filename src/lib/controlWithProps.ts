// import type { Descriptor, WithDescriptor } from './builder';
import type { Attribute, AttributeDescriptor, AttributeTypeKey } from './builder';
import { ControlBase, type ControlProps } from './controlBase';
import { simpleDiff, type DiffSet } from './diff';

/** Control With Props extends Base Control */
export abstract class ControlWithProps<
    PropsType extends ControlProps = ControlProps,
    AttribType extends AttributeDescriptor = AttributeDescriptor
> extends ControlBase<PropsType, AttribType>
{
    public getProp<K extends keyof PropsType>(name: K): PropsType[K]
    {
        return this.props[name];
    }

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
            if (this.descriptor.shouldRenderOnPropChange === true)
            {
                this.render();
            }

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

        const attribute = this._attributes![name as keyof AttribType] as Attribute;

        if (attribute)
        {
            if (newValue === null)
            {
                // todo: clear attribute or default?
                // this.setProp(name as keyof PropsType, this.descriptor.props[name as keyof PropsType]);
            } else
            {
                const isValid = attribute.validate!(newValue);
                const type = typeof attribute.value as AttributeTypeKey;

                if (!isValid)
                {
                    throw new Error(`${this.fullTagName}: Invalid value for attribute "${name}": "${newValue}"`);
                }

                switch (type) {
                    case 'number':
                        attribute.value = parseFloat(newValue);
                        break;
                    case 'boolean':
                        attribute.value = (newValue.toLowerCase() === 'true');
                        break;
                    case 'string':
                        attribute.value = newValue;
                }
            }

        }
    }

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected onAttributeChanged(name: string, oldValue: string | null, newValue: string | null): false | void { /** override */ }
}