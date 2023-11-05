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

export function createStyle(cssText: string, id: string, container: HTMLElement | ShadowRoot = document.head)
{
    sheet.container = container;
    sheet.nonce = id;
    const className = css(cssText);
    const elements = document.querySelectorAll(`[nonce="${id}"]`);
    elements.forEach(element =>
    {
        element.removeAttribute('nonce');
        element.setAttribute('ctrl-id', id);
    });
    return {
        className,
        elements
    };
}