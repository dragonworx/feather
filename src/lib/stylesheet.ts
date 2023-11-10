import createEmotion from '@emotion/css/create-instance';
import type { BaseControl } from './control';

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
    public id = String(_id++);
    public cssText: string;
    public className: string;
    public styleElements: HTMLStyleElement[] = [];
    public usageElements: Set<BaseControl> = new Set();

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

    public get isAttached()
    {
        return this.styleElements.every(e => e.parentElement);
    }

    public registerElement(element: BaseControl)
    {
        if (this.usageElements.size === 0)
        {
            const { styleElements, className } = this;

            if (this.isAttached)
            {
                for (const styleElement of styleElements)
                {
                    styleElement.removeAttribute('nonce');
                    styleElement.setAttribute('ctrl-class', className);
                    styleElement.setAttribute('style-id', this.id);
                }
            } else
            {
                for (const styleElement of styleElements)
                {
                    document.head.appendChild(styleElement);
                }
            }


        }

        if (!this.usageElements.has(element))
        {
            this.usageElements.add(element);
            element.classList.add(this.className);
        }
    }

    public unregisterElement(element: BaseControl)
    {
        if (this.usageElements.has(element))
        {
            if (this.isSingleUsage)
            {
                for (const styleElement of this.styleElements)
                {
                    styleElement.remove();
                }
            }

            this.usageElements.delete(element);
            element.classList.remove(this.className);
        }
    }

    public debug()
    {
        console.log(`StyleSheet[${this.id} - ${this.className}]:`, {
            usageElements: [...this.usageElements].map(e => e.controlId),
            styleElements: this.styleElements.map(e => e.getAttribute('style-id')),
        });
    }
}

class CssCache
{
    public stylesheets: StyleSheet[] = [];
    public byCssText: Map<string, StyleSheet> = new Map();
    public byClassName: Map<string, StyleSheet> = new Map();

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
        this.stylesheets.push(stylesheet);
        this.byCssText.set(stylesheet.cssText, stylesheet);
        this.byClassName.set(stylesheet.className, stylesheet);
    }

    public debug()
    {
        this.stylesheets.forEach(s => s.debug());
    }
}

const cache = new CssCache();

// eslint-disable-next-line @typescript-eslint/no-explicit-any

export function unregisterElement(element: BaseControl, currentClassName?: string)
{
    if (currentClassName)
    {
        const stylesheet = cache.getStyleSheetForClassName(currentClassName);

        if (stylesheet)
        {
            stylesheet.unregisterElement(element);
        }
    }
}

// todo: check that stylesheet is ready for next removed cached cssText
export function createStyle(cssText: string, element: BaseControl)
{
    const id = element.controlId;
    const currentClassName = element.styleSheetId;
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