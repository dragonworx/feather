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

export function toHyphenCase(str: string): string
{
    return str
        .replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, '$1-$2')
        .replace(/^-/, '')
        .toLowerCase();
}

export function checkType(value: string): "string" | "number" | "boolean"
{
    // Check for boolean values
    if (value === "true" || value === "false")
    {
        return "boolean";
    }

    // Check for number values
    if (!isNaN(Number(value)))
    {
        return "number";
    }

    // Fallback to string type
    return "string";
}

export function isValidSimpleType(value: string | null): boolean
{
    return value === null || checkType(value) !== "string";
}