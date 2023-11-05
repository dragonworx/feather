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

class StyleSheet
{
    public cssText: string;
    public className: string;
    public styleElements: HTMLStyleElement[] = [];
    public usageElements: Set<HTMLElement> = new Set();

    constructor(cssText: string, className: string, elements: NodeListOf<Element>)
    {
        this.cssText = cssText;
        this.className = className;
        this.styleElements = [...elements] as HTMLStyleElement[];
    }

    public get isSingleUsage()
    {
        return this.usageElements.size === 1;
    }

    public registerElement(element: HTMLElement)
    {
        if (!this.usageElements.has(element))
        {
            this.usageElements.add(element);
            element.classList.add(this.className);
        }
    }

    public unregisterElement(element: HTMLElement)
    {
        if (this.usageElements.has(element))
        {
            if (this.isSingleUsage)
            {
                for (const element of this.styleElements)
                {
                    element.remove();
                }
            }

            this.usageElements.delete(element);
            element.classList.remove(this.className);
        }
    }
}

class CssCache
{
    public byCssText: Map<string, StyleSheet> = new Map();
    public byClassName: Map<string, StyleSheet> = new Map();
    // public byElement: Map<HTMLElement, StyleSheet> = new Map();

    public getStyleSheetForCssText(cssText: string)
    {
        return this.byCssText.get(cssText);
    }

    public getStyleSheetForClassName(className: string)
    {
        return this.byClassName.get(className);
    }

    public add(stylesheet: StyleSheet)
    {
        this.byCssText.set(stylesheet.cssText, stylesheet);
        this.byClassName.set(stylesheet.className, stylesheet);
    }
}

const cache = new CssCache();

export function createStyle(cssText: string, element: HTMLElement, id: string, currentClassName?: string)
{
    let stylesheet = cache.getStyleSheetForCssText(cssText);

    if (stylesheet)
    {
        // cached, register element and return className
        stylesheet.registerElement(element);

        return stylesheet.className;
    }

    // new stylesheet, create and register
    sheet.nonce = id;

    // generate styles
    const className = css(cssText);

    // find elements and refactor them
    const elements = document.head.querySelectorAll(`[nonce="${id}"]`);

    for (const element of elements)
    {
        element.removeAttribute('nonce');
        element.setAttribute('ctrl-id', id);
        element.setAttribute('ctrl-class', className);
        element.setAttribute('style-id', String(_id++));
    }

    // create stylesheet
    stylesheet = new StyleSheet(cssText, className, elements);

    // register element
    stylesheet.registerElement(element);

    // update cache
    cache.add(stylesheet);

    // clean up if necessary
    if (currentClassName)
    {
        stylesheet = cache.getStyleSheetForClassName(currentClassName);

        if (stylesheet)
        {
            stylesheet.unregisterElement(element);
        }
    }

    return className;
}