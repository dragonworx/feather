/* eslint-disable @typescript-eslint/no-explicit-any */

// Define the structure for properties, attributes, and events
type PropDefinition = Record<string, any>;
type AttributeDefinition = Record<string, { value: any; validate?: (value: any) => boolean }>;
type EventDefinition = Record<string, any>;

// Helper type to define the parts of a descriptor
type DescriptorParts = {
  properties?: PropDefinition;
  attributes?: AttributeDefinition;
  events?: EventDefinition;
};

// Define a type that encompasses properties, attributes, and events
type Descriptor<D extends DescriptorParts> = {
  tagName: string;
} & D;

// User-defined descriptor example
type MyDescriptor = Descriptor<{
  properties: {
    prop1: string;
    prop2: number;
  };
  attributes: {
    attrib1: { value: number; validate: (value: any) => boolean };
    attrib2: { value: boolean; validate: (value: any) => boolean };
  };
  events: {
    event1: CustomEvent<{ x: number }>;
  };
}>;

// Define Metadata based on Descriptor with strict type checking
type Metadata<D extends DescriptorParts> = {
  [K in keyof D]?: D[K];
};

// Type for constructing a new class that has getters and setters for the attributes
type WithAttributeAccessors<AttributesType, CtorType extends new () => HTMLElement> = {
    new (): InstanceType<CtorType> & {
      [K in keyof AttributesType]: AttributesType[K] extends { value: infer V }
        ? V
        : never;
    };
  };
  
  // The build function
  function Build<D extends DescriptorParts>(
    metadata: Metadata<D>,
    ctor: new () => HTMLElement
  ) {
    type AttributesType = D['attributes'];
  
    // Generate the class with attribute accessors
    const DynamicClass = ctor as WithAttributeAccessors<AttributesType, typeof ctor>;
  
    return class {
      constructor() {
  
        // Initialize attributes from the metadata
        // if (metadata.attributes) {
        //   for (const [key, attr] of Object.entries(metadata.attributes)) {
        //     const attributeKey = `data-${key}`;
        //     this.setAttribute(attributeKey, String(attr.value));
  
        //     Object.defineProperty(this, key, {
        //       get() {
        //         const attrValue = this.getAttribute(attributeKey);
        //         return attrValue !== null ? attr.value : null;
        //       },
        //       set(value) {
        //         if (attr.validate && !attr.validate(String(value))) {
        //           throw new Error(`Validation failed for attribute ${key}`);
        //         }
        //         this.setAttribute(attributeKey, String(value));
        //       },
        //       enumerable: true,
        //     });
        //   }
        // }
      }
    } as WithAttributeAccessors<AttributesType, typeof ctor>;;
  }

// Usage of Build function
const MyControlClass = Build<MyDescriptor>({
  tagName: 'my-element',
  properties: {
    prop1: 'default string',
    prop2: 42,
  },
  attributes: {
    attrib1: { value: 0, validate: (value) => !isNaN(Number(value)) },
    attrib2: { value: true, validate: (value) => value === 'true' || value === 'false' },
  },
  // Events are not included since they're used for type inference and don't need initial values
}, HTMLElement);

const foo = new MyControlClass();