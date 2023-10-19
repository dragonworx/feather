import { Behavior } from '../behavior';

export class InlineStyleBehavior extends Behavior {
    private _styles: Partial<CSSStyleDeclaration> = {};

    public install() {
        this._styles = {
            ...this.element.style
        }
    }

    public uninstall(): void {
        // clean up styles
		for (const key of Object.keys(this._styles)) {
			this.clearStyle(key as keyof CSSStyleDeclaration);
		}
    }

    public setStyle(styles: Partial<CSSStyleDeclaration>) {
		this._styles = { ...styles };
		Object.assign(this.element.style, styles);
	}

    public addStyle(styles: Partial<CSSStyleDeclaration>) {
		this._styles = { ...this._styles, ...styles };
		Object.assign(this.element.style, styles);
	}

	public hasStyle(key: keyof CSSStyleDeclaration, value?: string) {
		return key in this._styles && (value === undefined || this._styles[key] === value);
	}

	public clearStyle(key?: keyof CSSStyleDeclaration) {
		if (key) {
			this.element.style.removeProperty(String(key));
			delete this._styles[key];
			return;
		}
		for (const key of Object.keys(this._styles)) {
			this.element.style.removeProperty(key);
		}
		this._styles = {};
	}
}