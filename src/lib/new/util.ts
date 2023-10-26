/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Behavior } from './behavior';
import { Control, type ControlDescriptor } from './control';

type GeneralCtor<T = object> = new (...args: any[]) => T;
type ControlCtor<T extends Control = Control, P = object> = new (props?: Partial<P>) => T;
type ControlCtorWithDescriptor<T extends Control = Control, P = object> = ControlCtor<T, P> & { descriptor: ControlDescriptor<P> };
type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends ((k: infer I) => void) ? I : never;

/**
 * Parses an HTML string and returns the first child element as a specified type of `HTMLElement`.
 * @param htmlStr The HTML string to parse.
 * @returns The first child element of the parsed HTML string as a specified type of `HTMLElement`.
 */
export function html<T extends HTMLElement>(htmlStr: string): T
{
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlStr, 'text/html');
    const element = doc.body.firstChild as T;

    if (element === null)
    {
        throw new Error('Could not parse HTML');
    }

    return element;
}

export type Writable<T, K extends keyof T> = Omit<T, K> & { -readonly [P in K]: T[P] };

/**
 * Returns the input value as an array if it is not already an array.
 * @param value The value to return as an array.
 * @returns The input value as an array.
 */
export function asArray<T>(value: T | T[])
{
    return Array.isArray(value) ? value : [value];
}

let _id = 0;

/**
 * Returns a unique string identifier.
 * @returns A unique string identifier.
 */
export function uniqueId()
{
    return `${++_id}`;
}

const _controlIds = new Set<string>();
const _validatedControls = new Set<ControlCtor>();

/**
 * Returns an array of `ControlDescriptor` objects for a `Control` constructor and its prototype chain.
 * @param ctor The `Control` constructor to get descriptors for.
 * @returns An array of `ControlDescriptor` objects for the `Control` constructor and its prototype chain.
 */
export function getDescriptors<T extends ControlCtorWithDescriptor<Control, object>>(ctor: T): ControlDescriptor<object>[]
{
    const descriptors: ControlDescriptor<object>[] = [];
    let currentCtor: ControlCtorWithDescriptor<Control, object> = ctor;

    // walk up prototype chain and collect descriptors
    while (currentCtor)
    {
        if (currentCtor.descriptor)
        {
            descriptors.unshift(currentCtor.descriptor);
        }

        const newCtor = Object.getPrototypeOf(currentCtor) as ControlCtorWithDescriptor<Control, object>;

        if ((currentCtor as unknown) === Control)
        {
            break;
        }

        if (currentCtor.descriptor === newCtor.descriptor)
        {
            currentCtor = Object.getPrototypeOf(newCtor);
        } else
        {
            currentCtor = newCtor;
        }
    }

    // check that all descriptors in array have unique ids
    const ids = new Set<string>();

    for (const descriptor of descriptors)
    {
        if (ids.has(descriptor.id))
        {
            throw new Error(`duplicate control descriptor id '${descriptor.id}'`);
        }
        ids.add(descriptor.id);
    }

    // check control id is unique
    if (!_validatedControls.has(ctor))
    {
        const topDescriptor = descriptors[descriptors.length - 1];
        if (_controlIds.has(topDescriptor.id))
        {
            throw new Error(`duplicate control id '${topDescriptor.id}'`);
        }
        _controlIds.add(topDescriptor.id);
    }

    // add to validated controls so we don't have to validate again
    _validatedControls.add(ctor);

    return descriptors;
}

/**
 * Creates a control class by extending the provided base class and applying specified behaviors.
 *
 * @template T - Type of control that extends a base Control class with a set of properties.
 * @template P - Type of the properties object that the control expects.
 * @template B - An array type representing the constructors of behavior classes.
 *
 * @param {ControlCtorWithDescriptor<T, P>} ControlClass - The constructor function for the control base class.
 * @param {...B} behaviors - A variadic list of behavior constructors to be applied to the control.
 *
 * @returns {ControlCtorWithDescriptor<T & UnionToIntersection<InstanceType<B[number]>>, P>}
 * A new control class that extends the original control class and incorporates the specified behaviors.
 */
export function CreateControl<
    T extends Control<P>,
    P extends object,
    B extends GeneralCtor<Behavior>[]
>(
    ControlClass: ControlCtorWithDescriptor<T, P>,
    ...behaviors: B
): ControlCtorWithDescriptor<T & UnionToIntersection<InstanceType<B[number]>>, P>
{
    return class extends (ControlClass as any) {
        public static descriptor: ControlDescriptor<P> = ControlClass.descriptor;

        constructor(props?: Partial<P>)
        {
            super(props);

            for (const BehaviorClass of behaviors)
            {
                let behaviorProto = Object.getPrototypeOf(new BehaviorClass());

                while (behaviorProto && behaviorProto !== Object.prototype)
                {
                    const propertyDescriptors = Object.getOwnPropertyDescriptors(behaviorProto);

                    for (const [key, property] of Object.entries(propertyDescriptors))
                    {
                        if (key === 'constructor')
                        {
                            continue;
                        }

                        const currentProperty = findPropertyDescriptorInProtoChain(this, key);

                        if (typeof property.value === 'function')
                        {
                            this[key] = property.value.bind(this);
                        } else if ('get' in property)
                        {
                            if (typeof property.get === 'function')
                            {
                                Object.defineProperty(this, key, {
                                    get: property.get!.bind(this),
                                    set: currentProperty?.set,
                                    enumerable: true,
                                    configurable: true,
                                });
                            } else
                            {
                                Object.defineProperty(this, key, {
                                    get: property.value,
                                    set: currentProperty?.set,
                                    enumerable: true,
                                    configurable: true,
                                });
                            }
                        }
                        if (property.set)
                        {
                            Object.defineProperty(this, key, {
                                get: currentProperty?.get,
                                set: property.set!.bind(this),
                                enumerable: true,
                                configurable: true,
                            });
                        }
                    }

                    behaviorProto = Object.getPrototypeOf(behaviorProto);
                }
            }
        }
    } as ControlCtorWithDescriptor<T & UnionToIntersection<InstanceType<B[number]>>, P>;
}

/**
 * Searches for a property descriptor in an object's prototype chain.
 *
 * @param {object} obj - The object whose prototype chain will be searched.
 * @param {string | symbol} key - The property key to look for in the object's prototype chain.
 *
 * @returns {PropertyDescriptor | null} - Returns the property descriptor if found; otherwise, returns null.
 */
function findPropertyDescriptorInProtoChain(obj: object, key: string | symbol): PropertyDescriptor | null
{
    let currentProto = Object.getPrototypeOf(obj);

    while (currentProto !== null)
    {
        const descriptor = Object.getOwnPropertyDescriptor(currentProto, key);
        if (descriptor)
        {
            return descriptor;
        }
        currentProto = Object.getPrototypeOf(currentProto);
    }

    return null;
}