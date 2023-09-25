// Type definition for a class constructor
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Constructor<T extends HTMLElement = HTMLElement> = new (...args: any[]) => T;

// Type definition for a mixin
// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Mixin = { [key: string]: any };

// Mixin Registry
const mixinRegistry: { [key: string]: Mixin } = {};

// Function to register a mixin
function registerMixin<T extends Mixin>(name: string, mixin: T) {
  mixinRegistry[name] = mixin;
}

// Function to apply mixins to a base class
function applyMixins(baseClass: Constructor, mixins: Mixin[]): Constructor {
  mixins.forEach(mixin => Object.assign(baseClass.prototype, mixin));
  return baseClass;
}

// Function to apply registered mixins by name
function applyRegisteredMixins(baseClass: Constructor, mixinNames: string[]): Constructor {
  const mixins = mixinNames.map(name => mixinRegistry[name]);
  return applyMixins(baseClass, mixins);
}

// Define Mixins with Types
type ColorMixinType = {
  setColor(color: string): void;
};

const ColorMixin: ColorMixinType = {
  setColor(color: string) {
    if (this instanceof HTMLElement) {
      this.style.color = color;
    }
  }
};

type BackgroundMixinType = {
  setBackground(background: string): void;
};

const BackgroundMixin: BackgroundMixinType = {
  setBackground(background: string) {
    if (this instanceof HTMLElement) {
      this.style.backgroundColor = background;
    }
  }
};

// Register Mixins
registerMixin('Color', ColorMixin);
registerMixin('Background', BackgroundMixin);

// Dynamic Type Augmentation
type AllMixinTypes = ColorMixinType & BackgroundMixinType;
interface HTMLElement extends AllMixinTypes {}

// Create a custom DOM element using the mixins
class StyledButton extends applyRegisteredMixins(HTMLElement, ['Color', 'Background']) {
  constructor() {
    super();
    this.addEventListener('mouseenter', function() {
      this.setColor('white');
      this.setBackground('blue');
    });
    this.addEventListener('mouseleave', function() {
      this.setColor('black');
      this.setBackground('transparent');
    });
  }
}

// Register the custom element with its own tag
customElements.define('custom-button', StyledButton);