let id: number = 0;

export class DynamicStyle {
  id: number;
  element: HTMLStyleElement;

  constructor(readonly root: CSSRuleNode) {
    this.id = id++;
    console.log(this.id);
    const element = (this.element = document.createElement('style'));
    element.setAttribute('class', this.className);
    document.head.appendChild(element);
    this.parse(root);
  }

  dispose() {
    document.head.removeChild(this.element);
    const sheet = this.sheet;
    for (let i = 0; i < sheet.cssRules.length; i++) {
      sheet.deleteRule(i);
    }
    delete (this as any).element;
  }

  get sheet() {
    return this.element.sheet!;
  }

  get className() {
    return `style-${this.id}`;
  }

  private parse(node: CSSRuleNode, selectorPrefix?: string) {
    const { element, className } = this;
    let selector = node.selector as string;
    const isSelfReferencing = selector[0] === '&';
    if (isSelfReferencing) {
      selector = selector.substring(1);
    }
    const rules = node.rules as { [Property in CSSRuleKey]?: string };
    const children = node.children as CSSRuleNode[];
    const cssText = Object.keys(rules)
      .map(
        key =>
          `${key.replace(/([A-Z])/g, '-$1').toLowerCase()}: ${
            rules[key as CSSRuleKey]
          }`
      )
      .join(';');

    const fullSelector = `${
      selectorPrefix ? selectorPrefix + (isSelfReferencing ? '' : ' ') : ''
    }${selector}${selectorPrefix ? '' : `.${className}`}`;
    const ruleText = `${fullSelector} {${cssText}}`;
    const html = `${element.innerHTML}\n${ruleText}`.trim();
    element.innerHTML = html;
    (node as any).$ = {
      stylesheet: this,
      ruleIndex: this.sheet.cssRules.length - 1,
    };
    children.forEach(childSchema =>
      this.parse(
        childSchema,
        selectorPrefix
          ? `${selectorPrefix} ${selector}`
          : `${selector}.${className}`
      )
    );
  }

  get(selector: string) {
    return this.root.get(selector);
  }

  set(ruleKey: CSSRuleKey, value: string) {
    return this.root.set(ruleKey, value);
  }

  select(selector: string) {
    let node = this.root;
    const parts = selector.split(' ');
    if (parts.length === 0) {
      throw new Error(`Invalid css selector "${selector}"`);
    } else if (parts.length === 1) {
      const part = parts[0] === '&' ? node.selector : parts[0];
      if (node.selector !== part) {
        throw new Error(`Invalid css selector "${selector}"`);
      }
      return node;
    } else {
      parts.shift();
      parts.forEach(part => (node = node.get(part)));
      return node;
    }
  }

  isCssProperty(key: string) {
    if (!this.sheet) {
      return false;
    }
    return key in (this.sheet.cssRules[0] as CSSStyleRule).style;
  }
}

export type CSSRuleStackItem = [CSSRuleKey, string];

export class CSSRuleNode {
  private $?: {
    stylesheet: DynamicStyle;
    ruleIndex: number;
  };
  private stack: CSSRuleStackItem[];

  constructor(
    readonly selector: string,
    readonly rules: { [Property in CSSRuleKey]?: string },
    readonly children: CSSRuleNode[]
  ) {
    this.stack = [];
  }

  private get cssStyleRule() {
    const { stylesheet, ruleIndex } = this.$!;
    const rule = stylesheet.sheet.cssRules[ruleIndex];
    return rule as CSSStyleRule;
  }

  valueOf(ruleKey: CSSRuleKey) {
    return (this.cssStyleRule.style as any)[ruleKey];
  }

  get(selector: string) {
    const { children } = this;
    for (let i = 0; i < children.length; i++) {
      if (children[i].selector === selector) {
        return children[i];
      }
    }
    throw new Error(`Cannot find child rule with selector ${selector}`);
  }

  set(ruleKey: CSSRuleKey, value: string) {
    const { stylesheet } = this.$!;
    if (stylesheet.sheet !== null) {
      (this.cssStyleRule.style as any)[ruleKey] = value;
    }
    return this;
  }

  push(ruleKey: CSSRuleKey, value: string) {
    this.stack.push([ruleKey, this.valueOf(ruleKey)]);
    this.set(ruleKey, value);
    return this;
  }

  pop() {
    if (this.stack.length) {
      const [ruleKey, value] = this.stack.pop() as CSSRuleStackItem;
      this.set(ruleKey, value);
    }
    return this;
  }

  css(
    selector: string,
    rules: { [Property in CSSRuleKey]?: string },
    ...children: CSSRuleNode[]
  ) {
    this.children.push(cssRule(selector, rules, ...children));
    return this;
  }

  append(ruleNode: CSSRuleNode) {
    this.children.push(ruleNode);
    return this;
  }
}

export function cssRule(
  selector: string,
  rules: { [Property in CSSRuleKey]?: string },
  ...children: CSSRuleNode[]
) {
  return new CSSRuleNode(selector, rules, [...children]);
}

export type CSSRuleKey =
  | 'accentColor'
  | 'additiveSymbols'
  | 'alignContent'
  | 'alignItems'
  | 'alignSelf'
  | 'alignmentBaseline'
  | 'all'
  | 'animation'
  | 'animationDelay'
  | 'animationDirection'
  | 'animationDuration'
  | 'animationFillMode'
  | 'animationIterationCount'
  | 'animationName'
  | 'animationPlayState'
  | 'animationTimingFunction'
  | 'appRegion'
  | 'appearance'
  | 'ascentOverride'
  | 'aspectRatio'
  | 'backdropFilter'
  | 'backfaceVisibility'
  | 'background'
  | 'backgroundAttachment'
  | 'backgroundBlendMode'
  | 'backgroundClip'
  | 'backgroundColor'
  | 'backgroundImage'
  | 'backgroundOrigin'
  | 'backgroundPosition'
  | 'backgroundPositionX'
  | 'backgroundPositionY'
  | 'backgroundRepeat'
  | 'backgroundRepeatX'
  | 'backgroundRepeatY'
  | 'backgroundSize'
  | 'baselineShift'
  | 'blockSize'
  | 'border'
  | 'borderBlock'
  | 'borderBlockColor'
  | 'borderBlockEnd'
  | 'borderBlockEndColor'
  | 'borderBlockEndStyle'
  | 'borderBlockEndWidth'
  | 'borderBlockStart'
  | 'borderBlockStartColor'
  | 'borderBlockStartStyle'
  | 'borderBlockStartWidth'
  | 'borderBlockStyle'
  | 'borderBlockWidth'
  | 'borderBottom'
  | 'borderBottomColor'
  | 'borderBottomLeftRadius'
  | 'borderBottomRightRadius'
  | 'borderBottomStyle'
  | 'borderBottomWidth'
  | 'borderCollapse'
  | 'borderColor'
  | 'borderEndEndRadius'
  | 'borderEndStartRadius'
  | 'borderImage'
  | 'borderImageOutset'
  | 'borderImageRepeat'
  | 'borderImageSlice'
  | 'borderImageSource'
  | 'borderImageWidth'
  | 'borderInline'
  | 'borderInlineColor'
  | 'borderInlineEnd'
  | 'borderInlineEndColor'
  | 'borderInlineEndStyle'
  | 'borderInlineEndWidth'
  | 'borderInlineStart'
  | 'borderInlineStartColor'
  | 'borderInlineStartStyle'
  | 'borderInlineStartWidth'
  | 'borderInlineStyle'
  | 'borderInlineWidth'
  | 'borderLeft'
  | 'borderLeftColor'
  | 'borderLeftStyle'
  | 'borderLeftWidth'
  | 'borderRadius'
  | 'borderRight'
  | 'borderRightColor'
  | 'borderRightStyle'
  | 'borderRightWidth'
  | 'borderSpacing'
  | 'borderStartEndRadius'
  | 'borderStartStartRadius'
  | 'borderStyle'
  | 'borderTop'
  | 'borderTopColor'
  | 'borderTopLeftRadius'
  | 'borderTopRightRadius'
  | 'borderTopStyle'
  | 'borderTopWidth'
  | 'borderWidth'
  | 'bottom'
  | 'boxShadow'
  | 'boxSizing'
  | 'breakAfter'
  | 'breakBefore'
  | 'breakInside'
  | 'bufferedRendering'
  | 'captionSide'
  | 'caretColor'
  | 'clear'
  | 'clip'
  | 'clipPath'
  | 'clipRule'
  | 'color'
  | 'colorInterpolation'
  | 'colorInterpolationFilters'
  | 'colorRendering'
  | 'colorScheme'
  | 'columnCount'
  | 'columnFill'
  | 'columnGap'
  | 'columnRule'
  | 'columnRuleColor'
  | 'columnRuleStyle'
  | 'columnRuleWidth'
  | 'columnSpan'
  | 'columnWidth'
  | 'columns'
  | 'contain'
  | 'containIntrinsicBlockSize'
  | 'containIntrinsicHeight'
  | 'containIntrinsicInlineSize'
  | 'containIntrinsicSize'
  | 'containIntrinsicWidth'
  | 'content'
  | 'contentVisibility'
  | 'counterIncrement'
  | 'counterReset'
  | 'counterSet'
  | 'cursor'
  | 'cx'
  | 'cy'
  | 'd'
  | 'descentOverride'
  | 'direction'
  | 'display'
  | 'dominantBaseline'
  | 'emptyCells'
  | 'fallback'
  | 'fill'
  | 'fillOpacity'
  | 'fillRule'
  | 'filter'
  | 'flex'
  | 'flexBasis'
  | 'flexDirection'
  | 'flexFlow'
  | 'flexGrow'
  | 'flexShrink'
  | 'flexWrap'
  | 'float'
  | 'floodColor'
  | 'floodOpacity'
  | 'font'
  | 'fontDisplay'
  | 'fontFamily'
  | 'fontFeatureSettings'
  | 'fontKerning'
  | 'fontOpticalSizing'
  | 'fontSize'
  | 'fontStretch'
  | 'fontStyle'
  | 'fontVariant'
  | 'fontVariantCaps'
  | 'fontVariantEastAsian'
  | 'fontVariantLigatures'
  | 'fontVariantNumeric'
  | 'fontVariationSettings'
  | 'fontWeight'
  | 'forcedColorAdjust'
  | 'gap'
  | 'grid'
  | 'gridArea'
  | 'gridAutoColumns'
  | 'gridAutoFlow'
  | 'gridAutoRows'
  | 'gridColumn'
  | 'gridColumnEnd'
  | 'gridColumnGap'
  | 'gridColumnStart'
  | 'gridGap'
  | 'gridRow'
  | 'gridRowEnd'
  | 'gridRowGap'
  | 'gridRowStart'
  | 'gridTemplate'
  | 'gridTemplateAreas'
  | 'gridTemplateColumns'
  | 'gridTemplateRows'
  | 'height'
  | 'hyphens'
  | 'imageOrientation'
  | 'imageRendering'
  | 'inherits'
  | 'initialValue'
  | 'inlineSize'
  | 'inset'
  | 'insetBlock'
  | 'insetBlockEnd'
  | 'insetBlockStart'
  | 'insetInline'
  | 'insetInlineEnd'
  | 'insetInlineStart'
  | 'isolation'
  | 'justifyContent'
  | 'justifyItems'
  | 'justifySelf'
  | 'left'
  | 'letterSpacing'
  | 'lightingColor'
  | 'lineBreak'
  | 'lineGapOverride'
  | 'lineHeight'
  | 'listStyle'
  | 'listStyleImage'
  | 'listStylePosition'
  | 'listStyleType'
  | 'margin'
  | 'marginBlock'
  | 'marginBlockEnd'
  | 'marginBlockStart'
  | 'marginBottom'
  | 'marginInline'
  | 'marginInlineEnd'
  | 'marginInlineStart'
  | 'marginLeft'
  | 'marginRight'
  | 'marginTop'
  | 'marker'
  | 'markerEnd'
  | 'markerMid'
  | 'markerStart'
  | 'mask'
  | 'maskType'
  | 'maxBlockSize'
  | 'maxHeight'
  | 'maxInlineSize'
  | 'maxWidth'
  | 'maxZoom'
  | 'minBlockSize'
  | 'minHeight'
  | 'minInlineSize'
  | 'minWidth'
  | 'minZoom'
  | 'mixBlendMode'
  | 'negative'
  | 'objectFit'
  | 'objectPosition'
  | 'offset'
  | 'offsetDistance'
  | 'offsetPath'
  | 'offsetRotate'
  | 'opacity'
  | 'order'
  | 'orientation'
  | 'orphans'
  | 'outline'
  | 'outlineColor'
  | 'outlineOffset'
  | 'outlineStyle'
  | 'outlineWidth'
  | 'overflow'
  | 'overflowAnchor'
  | 'overflowClipMargin'
  | 'overflowWrap'
  | 'overflowX'
  | 'overflowY'
  | 'overscrollBehavior'
  | 'overscrollBehaviorBlock'
  | 'overscrollBehaviorInline'
  | 'overscrollBehaviorX'
  | 'overscrollBehaviorY'
  | 'pad'
  | 'padding'
  | 'paddingBlock'
  | 'paddingBlockEnd'
  | 'paddingBlockStart'
  | 'paddingBottom'
  | 'paddingInline'
  | 'paddingInlineEnd'
  | 'paddingInlineStart'
  | 'paddingLeft'
  | 'paddingRight'
  | 'paddingTop'
  | 'page'
  | 'pageBreakAfter'
  | 'pageBreakBefore'
  | 'pageBreakInside'
  | 'pageOrientation'
  | 'paintOrder'
  | 'perspective'
  | 'perspectiveOrigin'
  | 'placeContent'
  | 'placeItems'
  | 'placeSelf'
  | 'pointerEvents'
  | 'position'
  | 'prefix'
  | 'quotes'
  | 'r'
  | 'range'
  | 'resize'
  | 'right'
  | 'rowGap'
  | 'rubyPosition'
  | 'rx'
  | 'ry'
  | 'scrollBehavior'
  | 'scrollMargin'
  | 'scrollMarginBlock'
  | 'scrollMarginBlockEnd'
  | 'scrollMarginBlockStart'
  | 'scrollMarginBottom'
  | 'scrollMarginInline'
  | 'scrollMarginInlineEnd'
  | 'scrollMarginInlineStart'
  | 'scrollMarginLeft'
  | 'scrollMarginRight'
  | 'scrollMarginTop'
  | 'scrollPadding'
  | 'scrollPaddingBlock'
  | 'scrollPaddingBlockEnd'
  | 'scrollPaddingBlockStart'
  | 'scrollPaddingBottom'
  | 'scrollPaddingInline'
  | 'scrollPaddingInlineEnd'
  | 'scrollPaddingInlineStart'
  | 'scrollPaddingLeft'
  | 'scrollPaddingRight'
  | 'scrollPaddingTop'
  | 'scrollSnapAlign'
  | 'scrollSnapStop'
  | 'scrollSnapType'
  | 'scrollbarGutter'
  | 'shapeImageThreshold'
  | 'shapeMargin'
  | 'shapeOutside'
  | 'shapeRendering'
  | 'size'
  | 'sizeAdjust'
  | 'speak'
  | 'speakAs'
  | 'src'
  | 'stopColor'
  | 'stopOpacity'
  | 'stroke'
  | 'strokeDasharray'
  | 'strokeDashoffset'
  | 'strokeLinecap'
  | 'strokeLinejoin'
  | 'strokeMiterlimit'
  | 'strokeOpacity'
  | 'strokeWidth'
  | 'suffix'
  | 'symbols'
  | 'syntax'
  | 'system'
  | 'tabSize'
  | 'tableLayout'
  | 'textAlign'
  | 'textAlignLast'
  | 'textAnchor'
  | 'textCombineUpright'
  | 'textDecoration'
  | 'textDecorationColor'
  | 'textDecorationLine'
  | 'textDecorationSkipInk'
  | 'textDecorationStyle'
  | 'textDecorationThickness'
  | 'textIndent'
  | 'textOrientation'
  | 'textOverflow'
  | 'textRendering'
  | 'textShadow'
  | 'textSizeAdjust'
  | 'textTransform'
  | 'textUnderlineOffset'
  | 'textUnderlinePosition'
  | 'top'
  | 'touchAction'
  | 'transform'
  | 'transformBox'
  | 'transformOrigin'
  | 'transformStyle'
  | 'transition'
  | 'transitionDelay'
  | 'transitionDuration'
  | 'transitionProperty'
  | 'transitionTimingFunction'
  | 'unicodeBidi'
  | 'unicodeRange'
  | 'userSelect'
  | 'userZoom'
  | 'vectorEffect'
  | 'verticalAlign'
  | 'visibility'
  | 'webkitAlignContent'
  | 'webkitAlignItems'
  | 'webkitAlignSelf'
  | 'webkitAnimation'
  | 'webkitAnimationDelay'
  | 'webkitAnimationDirection'
  | 'webkitAnimationDuration'
  | 'webkitAnimationFillMode'
  | 'webkitAnimationIterationCount'
  | 'webkitAnimationName'
  | 'webkitAnimationPlayState'
  | 'webkitAnimationTimingFunction'
  | 'webkitAppRegion'
  | 'webkitAppearance'
  | 'webkitBackfaceVisibility'
  | 'webkitBackgroundClip'
  | 'webkitBackgroundOrigin'
  | 'webkitBackgroundSize'
  | 'webkitBorderAfter'
  | 'webkitBorderAfterColor'
  | 'webkitBorderAfterStyle'
  | 'webkitBorderAfterWidth'
  | 'webkitBorderBefore'
  | 'webkitBorderBeforeColor'
  | 'webkitBorderBeforeStyle'
  | 'webkitBorderBeforeWidth'
  | 'webkitBorderBottomLeftRadius'
  | 'webkitBorderBottomRightRadius'
  | 'webkitBorderEnd'
  | 'webkitBorderEndColor'
  | 'webkitBorderEndStyle'
  | 'webkitBorderEndWidth'
  | 'webkitBorderHorizontalSpacing'
  | 'webkitBorderImage'
  | 'webkitBorderRadius'
  | 'webkitBorderStart'
  | 'webkitBorderStartColor'
  | 'webkitBorderStartStyle'
  | 'webkitBorderStartWidth'
  | 'webkitBorderTopLeftRadius'
  | 'webkitBorderTopRightRadius'
  | 'webkitBorderVerticalSpacing'
  | 'webkitBoxAlign'
  | 'webkitBoxDecorationBreak'
  | 'webkitBoxDirection'
  | 'webkitBoxFlex'
  | 'webkitBoxOrdinalGroup'
  | 'webkitBoxOrient'
  | 'webkitBoxPack'
  | 'webkitBoxReflect'
  | 'webkitBoxShadow'
  | 'webkitBoxSizing'
  | 'webkitClipPath'
  | 'webkitColumnBreakAfter'
  | 'webkitColumnBreakBefore'
  | 'webkitColumnBreakInside'
  | 'webkitColumnCount'
  | 'webkitColumnGap'
  | 'webkitColumnRule'
  | 'webkitColumnRuleColor'
  | 'webkitColumnRuleStyle'
  | 'webkitColumnRuleWidth'
  | 'webkitColumnSpan'
  | 'webkitColumnWidth'
  | 'webkitColumns'
  | 'webkitFilter'
  | 'webkitFlex'
  | 'webkitFlexBasis'
  | 'webkitFlexDirection'
  | 'webkitFlexFlow'
  | 'webkitFlexGrow'
  | 'webkitFlexShrink'
  | 'webkitFlexWrap'
  | 'webkitFontFeatureSettings'
  | 'webkitFontSmoothing'
  | 'webkitHighlight'
  | 'webkitHyphenateCharacter'
  | 'webkitJustifyContent'
  | 'webkitLineBreak'
  | 'webkitLineClamp'
  | 'webkitLocale'
  | 'webkitLogicalHeight'
  | 'webkitLogicalWidth'
  | 'webkitMarginAfter'
  | 'webkitMarginBefore'
  | 'webkitMarginEnd'
  | 'webkitMarginStart'
  | 'webkitMask'
  | 'webkitMaskBoxImage'
  | 'webkitMaskBoxImageOutset'
  | 'webkitMaskBoxImageRepeat'
  | 'webkitMaskBoxImageSlice'
  | 'webkitMaskBoxImageSource'
  | 'webkitMaskBoxImageWidth'
  | 'webkitMaskClip'
  | 'webkitMaskComposite'
  | 'webkitMaskImage'
  | 'webkitMaskOrigin'
  | 'webkitMaskPosition'
  | 'webkitMaskPositionX'
  | 'webkitMaskPositionY'
  | 'webkitMaskRepeat'
  | 'webkitMaskRepeatX'
  | 'webkitMaskRepeatY'
  | 'webkitMaskSize'
  | 'webkitMaxLogicalHeight'
  | 'webkitMaxLogicalWidth'
  | 'webkitMinLogicalHeight'
  | 'webkitMinLogicalWidth'
  | 'webkitOpacity'
  | 'webkitOrder'
  | 'webkitPaddingAfter'
  | 'webkitPaddingBefore'
  | 'webkitPaddingEnd'
  | 'webkitPaddingStart'
  | 'webkitPerspective'
  | 'webkitPerspectiveOrigin'
  | 'webkitPerspectiveOriginX'
  | 'webkitPerspectiveOriginY'
  | 'webkitPrintColorAdjust'
  | 'webkitRtlOrdering'
  | 'webkitRubyPosition'
  | 'webkitShapeImageThreshold'
  | 'webkitShapeMargin'
  | 'webkitShapeOutside'
  | 'webkitTapHighlightColor'
  | 'webkitTextCombine'
  | 'webkitTextDecorationsInEffect'
  | 'webkitTextEmphasis'
  | 'webkitTextEmphasisColor'
  | 'webkitTextEmphasisPosition'
  | 'webkitTextEmphasisStyle'
  | 'webkitTextFillColor'
  | 'webkitTextOrientation'
  | 'webkitTextSecurity'
  | 'webkitTextSizeAdjust'
  | 'webkitTextStroke'
  | 'webkitTextStrokeColor'
  | 'webkitTextStrokeWidth'
  | 'webkitTransform'
  | 'webkitTransformOrigin'
  | 'webkitTransformOriginX'
  | 'webkitTransformOriginY'
  | 'webkitTransformOriginZ'
  | 'webkitTransformStyle'
  | 'webkitTransition'
  | 'webkitTransitionDelay'
  | 'webkitTransitionDuration'
  | 'webkitTransitionProperty'
  | 'webkitTransitionTimingFunction'
  | 'webkitUserDrag'
  | 'webkitUserModify'
  | 'webkitUserSelect'
  | 'webkitWritingMode'
  | 'whiteSpace'
  | 'widows'
  | 'width'
  | 'willChange'
  | 'wordBreak'
  | 'wordSpacing'
  | 'wordWrap'
  | 'writingMode'
  | 'x'
  | 'y'
  | 'zIndex'
  | 'zoom';
