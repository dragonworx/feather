import createEmotion from '@emotion/css/create-instance';

let _id = 0;

const {
    // flush,
    // hydrate,
    // cx,
    // merge,
    // getRegisteredStyles,
    // injectGlobal,
    // keyframes,
    css,
    sheet,
    // cache
} = createEmotion({
    key: 'ctrl'
});

export interface CssCache
{
    className: string;
    elements: NodeListOf<Element>;
}

const cache = {
    cssTextToClassName: new Map<string, string>(),
    classNameToStyleElements: new Map<string, NodeListOf<Element>>(),
    classNameToHTMLElements: new Map<string, Set<HTMLElement>>(),
}

function cacheControl(className: string, element: HTMLElement)
{
    if (!cache.classNameToHTMLElements.has(className))
    {
        cache.classNameToHTMLElements.set(className, new Set());
    }

    cache.classNameToHTMLElements.get(className)!.add(element);
}

function dumpCache()
{
    console.clear();
    console.log('cssTextToClassName', [...cache.cssTextToClassName.values()]);
    console.log('classNameToStyleElements', cache.classNameToStyleElements);
    console.log('classNameToHTMLElements', cache.classNameToHTMLElements);
}

export function createStyle(cssText: string, element: HTMLElement, id: string, currentClassName?: string)
{
    if (cache.cssTextToClassName.has(cssText))
    {
        const className = cache.cssTextToClassName.get(cssText)!;

        // remove previous className
        if (currentClassName)
        {
            element.classList.remove(currentClassName);
        }

        // apply className to element
        element.classList.add(className);

        // cache control reference to className
        cacheControl(className, element);

        dumpCache();

        return className;
    }

    // configure emotion
    sheet.nonce = id;

    // generate styles
    const className = css(cssText);

    if (currentClassName)
    {
        // remove previous style for this id
        // const currentElements = document.head.querySelectorAll(`[ctrl-id="${id}"]`);
        const currentStyleElements = cache.classNameToStyleElements.get(currentClassName);
        let currentElements = cache.classNameToHTMLElements.get(currentClassName);

        if (currentElements?.has(element))
        {
            currentElements.delete(element);
        }

        currentElements = cache.classNameToHTMLElements.get(currentClassName);

        if (currentStyleElements && currentElements && currentElements.size === 0)
        {
            // clean up
            cache.cssTextToClassName.delete(cssText);
            cache.classNameToStyleElements.delete(className);
            for (const element of currentStyleElements)
            {
                element.remove();
            }
        }

        // remove previous className
        if (currentClassName)
        {
            element.classList.remove(currentClassName);
        }
    }

    // find elements and refactor them
    const elements = document.head.querySelectorAll(`[nonce="${id}"]`);

    for (const element of elements)
    {
        element.removeAttribute('nonce');
        element.setAttribute('ctrl-id', id);
        element.setAttribute('ctrl-class', className);
        element.setAttribute('iter', String(_id++));
    }

    // update cache
    cache.cssTextToClassName.set(cssText, className);
    cache.classNameToStyleElements.set(className, elements);
    cacheControl(className, element);

    dumpCache();

    // apply className to element
    element.classList.add(className);

    return className;
}