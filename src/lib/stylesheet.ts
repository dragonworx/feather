/* eslint-disable @typescript-eslint/no-explicit-any */
import createEmotion from '@emotion/css/create-instance';


const meta = {
    key: 'ctrl',
    metaKey: () => `__${meta.key}_className`
};

export function setMetaKey(key: string)
{
    meta.key = key;
}

let _nodeId = 0;
let _styleSheetId = 0;


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
    key: meta.key,
});

class StyleSheet
{
    public id = String(_styleSheetId++);
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

    public get isAttached()
    {
        return this.styleElements.every(e => e.parentElement);
    }

    public registerNode(node: HTMLElement)
    {
        if (this.usageElements.size === 0)
        {
            const { styleElements, className } = this;

            if (this.isAttached)
            {
                for (const styleElement of styleElements)
                {
                    styleElement.removeAttribute('nonce');
                    styleElement.setAttribute('class', className);
                    styleElement.setAttribute(`${meta.key}-id`, this.id);
                }
            } else
            {
                for (const styleElement of styleElements)
                {
                    document.head.appendChild(styleElement);
                }
            }


        }

        if (!this.usageElements.has(node))
        {
            this.usageElements.add(node);
            node.classList.add(this.className);
            (node as any)[meta.metaKey()] = this.className;
        }
    }

    public unregisterNode(node: HTMLElement)
    {
        if (this.usageElements.has(node))
        {
            if (this.isSingleUsage)
            {
                for (const styleElement of this.styleElements)
                {
                    styleElement.remove();
                }
            }

            this.usageElements.delete(node);
            node.classList.remove(this.className);
            delete (node as any)[meta.metaKey()];
        }
    }

    public debug()
    {
        console.log(`StyleSheet[${this.id} - ${this.className}]:`, {
            usageElements: [...this.usageElements].map(e => e.getAttribute('id')),
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

const _cache = new CssCache();

export function installStyle(cssText: string, node: HTMLElement)
{
    let stylesheet = _cache.getStyleSheetForCssText(cssText);

    if (stylesheet)
    {
        // cached, register node and return className
        stylesheet.registerNode(node);

        return stylesheet.className;
    }

    const id = String(_nodeId++);

    // new stylesheet, create and register
    sheet.nonce = id;

    // generate styles
    const className = css(cssText);

    // find elements and refactor them
    const elements = document.head.querySelectorAll(`[nonce="${id}"]`);

    // create stylesheet
    stylesheet = new StyleSheet(cssText, className, elements);

    // check for current class name before registering
    const currentClassName = (node as any)[meta.metaKey()];

    // update cache
    _cache.add(stylesheet);

    // clean up if necessary
    if (currentClassName)
    {
        const prevStylesheet = _cache.getStyleSheetForClassName(currentClassName);

        if (prevStylesheet)
        {
            prevStylesheet.unregisterNode(node);
        }
    }

    // register node
    stylesheet.registerNode(node);

    return className;
}

export function uninstallStyle(node: HTMLElement)
{
    const currentClassName = (node as any)[meta.metaKey()];

    if (currentClassName)
    {
        const stylesheet = _cache.getStyleSheetForClassName(currentClassName);

        if (stylesheet)
        {
            stylesheet.unregisterNode(node);
        }
    }
}