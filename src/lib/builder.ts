import type { Control } from './control';
import type { ControlProps } from './controlBase';
import { toHyphenCase } from './util';

export const tagPref = 'ctrl-';

export type Constructor<T> = new (...args: unknown[]) => T;

export type WithFullTagname = { fullTagName: string };
export type WithInitialProps = { _initialProps: ControlProps };
export type WithObservedAttributes = { observedAttributes: string[] };
export type WithAttributes = { _attributes: AttributeDescriptor };

export type AttributeType = string | number | boolean;
export type AttributeTypeKey = "string" | "number" | "boolean";
export type AttributeValidator = (value: AttributeType) => boolean;
export type AttributeDescriptor<T> = Record<keyof T, Attribute<T[keyof T]>;

export interface Attribute<T extends AttributeType>
{
    value: T;
    validate?: AttributeValidator;
}

export const attributeValidators: Record<AttributeTypeKey, AttributeValidator> = {
    string: () => true,
    number: (value) => !isNaN(Number(value)),
    boolean: (value) => { const val = String(value).toLowerCase(); return val === "true" || val === "false" },
};


export interface Descriptor<PropsType extends ControlProps = ControlProps, AttribType extends AttributeDescriptor = AttributeDescriptor>
{
    tagName: string;
    props?: PropsType;
    classes?: string[];
    attributes?: AttribType;
    shouldRenderOnPropChange?: boolean;
}

export const descriptorDefaults: Partial<Descriptor> = {
    props: {},
    attributes: {},
    classes: [],
    shouldRenderOnPropChange: true,
};

export type WithDescriptor = { descriptor: Descriptor };
export type Writable<T, K extends keyof T> = Omit<T, K> & { -readonly [P in K]: T[P] };

/** Custom Element registration function */
export function Ctrl<PropsType extends ControlProps, AttribType extends AttributeDescriptor, CtorType extends Constructor<Control<PropsType & AttribType>>>(
    descriptor: Descriptor<PropsType, AttribType>,
    htmlElementCtor: CtorType,
)
{
    descriptor = {
        ...descriptorDefaults as Descriptor<PropsType, AttribType>,
        ...descriptor,
    };

    console.log("*** Ctrl ***", htmlElementCtor.name, descriptor);

    const { tagName } = descriptor;
    const fullTagName = tagPref + (tagName ?? toHyphenCase(htmlElementCtor.name));

    if (fullTagName.endsWith('-') || fullTagName.startsWith('-'))
    {
        throw new Error(`Invalid tag name: ${fullTagName}`)
    }

    /** Initialise Custom Class */
    (htmlElementCtor as unknown as WithDescriptor).descriptor = descriptor;
    (htmlElementCtor as unknown as WithAttributes)._attributes = {...descriptor.attributes} as AttributeDescriptor;

    // add user-defined descriptor attributes
    const descAttributes = descriptor.attributes as AttributeDescriptor;

    /** Define the getters and setters type based on props */
    for (const [attrName, attr] of Object.entries(descAttributes))
    {
        const attribName = toHyphenCase(attrName);
        const attribType = typeof attr.value as AttributeTypeKey;
        const attrValidate = attr.validate!;

        Object.defineProperty(htmlElementCtor.prototype, attribName, {
            get(): typeof attr.value
            {
                return attr.value;
            },
            set(value: typeof attr.value)
            {
                if (!attrValidate(value))
                {
                    throw new Error(`Invalid attribute value for ${attribName}: ${value}`);
                }

                switch (attribType)
                {
                    case "string":
                    case "number":
                    case "boolean":
                        this.setAttribute(attribName, String(value));
                        break;
                }
            }
        });
    }

    const attributes = {} as AttributeDescriptor;

    for (const [attrName, attr] of Object.entries(descAttributes))
    {
        const attribName = toHyphenCase(attrName);
        const attribType = typeof attr.value as AttributeTypeKey;

        attributes[attribName] = {
            value: attr.value,
            validate: attr.validate ?? attributeValidators[attribType],
        };
    }

    /** Initialise Observed Attributes */
    (htmlElementCtor as unknown as WithObservedAttributes).observedAttributes = Object.keys(attributes ?? {});

    /** Define Custom Element */
    customElements.define(fullTagName, htmlElementCtor);

    /** Return Custom Class Constructor */
    return class
    {
        constructor(props: Partial<PropsType> = {})
        {
            const element = document.createElement(fullTagName) as InstanceType<CtorType>;

            (element as unknown as WithInitialProps)._initialProps = props;
            (element as unknown as WithInitialProps)._initialProps = props;

            return element;
        }
    } as unknown as new (props?: Partial<PropsType>) => InstanceType<CtorType> & PropsType;
}