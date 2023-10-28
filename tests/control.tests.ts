import { attributePrefix, metaPrefix, type HTMLElementWithMetaData, Control } from '../src/lib/new/control';
import { TestControl } from './helpers';

describe('Control', () =>
{
    describe('Props', () =>
    {
        it('should use default props from descriptor', () =>
        {
            const control = new TestControl();

            expect(control.props).toEqual({
                foo: 'bar',
                bar: 1,
            });
        });

        it('should use given props', () =>
        {
            const control = new TestControl({
                foo: 'foo',
                bar: 2,
            });

            expect(control.props).toEqual({
                foo: 'foo',
                bar: 2,
            });
        });

        it('should use given props and keep default props', () =>
        {
            const control = new TestControl({
                foo: 'foo',
            });

            expect(control.props).toEqual({
                foo: 'foo',
                bar: 1,
            });
        });
    });

    describe('Element', () =>
    {
        it('should create element from descriptor template', () =>
        {
            const control = new TestControl();

            expect(control.element.tagName).toEqual('DIV');
        });

        it('should accumulate descriptor ids in element class name', () =>
        {
            const control = new TestControl();

            expect(control.element.className).toEqual(`${attributePrefix}-control ${attributePrefix}-test`);
        });

        it('should bind control to element', () =>
        {
            const control = new TestControl();

            expect((control.element as unknown as HTMLElementWithMetaData)[metaPrefix]).toBe(control);
            expect(Control.elementOwner(control.element)).toBe(control);
        });
    });

    describe.skip('Events', () =>
    {

    });
});