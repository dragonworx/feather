/**
 * Parses an HTML string and returns the first child element as a specified type of `HTMLElement`.
 * @param htmlStr The HTML string to parse.
 * @returns The first child element of the parsed HTML string as a specified type of `HTMLElement`.
 */
// export function html<T extends HTMLElement>(htmlStr: string): T
// {
//     const parser = new DOMParser();
//     const doc = parser.parseFromString(htmlStr, 'text/html');
//     const element = doc.body.firstChild as T;

//     if (element === null)
//     {
//         throw new Error('Could not parse HTML');
//     }

//     return element;
// }

// export type Writable<T, K extends keyof T> = Omit<T, K> & { -readonly [P in K]: T[P] };

/**
//  * Returns the input value as an array if it is not already an array.
//  * @param value The value to return as an array.
//  * @returns The input value as an array.
//  */
// export function asArray<T>(value: T | T[])
// {
//     return Array.isArray(value) ? value : [value];
// }

// let _id = 0;

// /**
//  * Returns a unique string identifier.
//  * @returns A unique string identifier.
//  */
// export function uniqueId()
// {
//     return `${++_id}`;
// }

export function toHyphenCase(str: string): string
{
    return str
        .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
        .replace(/^-/, '')
        .toLowerCase();
}

export function toCamelCase(str: string): string
{
    return str
        .split('-')
        .map((word, index) => index === 0 ? word : word[0].toUpperCase() + word.slice(1))
        .join('');
}

export function randRgb()
{
    return `rgb(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255})`;
}

// export function createProxy<T extends Record<PropertyKey, unknown>>(
//     target: T,
//     onSet: (key: keyof T, oldValue: T[keyof T], newValue: T[keyof T]) => void
// ): T
// {
//     return new Proxy(target, {
//         set: (obj: T, prop: keyof T, value: T[keyof T]): boolean =>
//         {
//             if (obj[prop] !== value)
//             {
//                 const oldValue = obj[prop];
//                 obj[prop] = value;
//                 onSet(prop, oldValue, value);
//             }
//             return true;
//         }
//     });
// }

export function checkFlag<T extends number>(flag: number, mode: T): boolean
{
    return (flag & mode) !== 0;
}

export const stringTemplate = (strings: TemplateStringsArray, ...values: unknown[]): string => strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');

const tagNameRegex = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/i;

export const isValidTagName = (tagName: string): boolean => tagNameRegex.test(tagName);

export function setClass(node: HTMLElement, cssClass: string, predicate: boolean)
{
    if (predicate)
    {
        if (!node.classList.contains(cssClass))
        {
            insertClass(node, cssClass);
            // node.classList.add(cssClass);
        }
    } else
    {
        if (node.classList.contains(cssClass))
        {
            node.classList.remove(cssClass);
        }
    }
}

export function insertClass(node: HTMLElement, cssClass: string)
{
    if (!node.classList.contains(cssClass))
    {
        const classList = node.getAttribute('class') || '';

        node.setAttribute('class', `${cssClass} ${classList}`);
    }
}

export function css(...classes: Array<string | string[]>)
{
    return classes.flat().join(' ');
}