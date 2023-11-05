import createEmotion from '@emotion/css/create-instance';

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

const cache = new Map<string, CssCache>();

let _id = 0;

export function createStyle(cssText: string, element: HTMLElement, id: string, currentClassName?: string)
{
    if (cache.has(cssText))
    {
        const className = cache.get(cssText)!.className;

        // remove previous className
        if (currentClassName)
        {
            element.classList.remove(currentClassName);
        }

        // apply className to element
        element.classList.add(className);

        return className;
    }

    // configure emotion
    sheet.nonce = id;

    // generate styles
    const className = css(cssText);

    if (currentClassName)
    {
        // remove previous style for this id
        const currentElements = document.head.querySelectorAll(`[ctrl-id="${id}"]`);

        if (currentElements.length)
        {
            for (const element of currentElements)
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

    // cache styles
    cache.set(cssText, {
        className,
        elements,
    });

    // apply className to element
    element.classList.add(className);

    return className;
}