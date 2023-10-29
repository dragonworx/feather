import { SubControlWithBehaviors, type TestControlProps } from './helpers'

describe('Util', () =>
{
    describe('Mixin', () =>
    {
        it('should mix behaviors into control', () =>
        {
            const control = new SubControlWithBehaviors({
                foo: 'baz',
            });

            expect(typeof control.publicTestControlMethod).toBe('function');
            expect(typeof control.publicSubControlMethod).toBe('function');
            expect(typeof control.publicBehavior1Method).toBe('function');
            expect(typeof control.publicBehavior2Method).toBe('function');
            expect(control.props).toEqual({
                foo: 'baz',
                bar: 1,
                baz: true,
            } as TestControlProps);
        });

        it('should have access to protected methods', () =>
        {
            const control = new SubControlWithBehaviors();

            expect(control.publicTestControlMethod()).toBe('publicTestControlMethod:protectedTestControlMethod:privateTestControlMethod:testControl');
            expect(control.publicSubControlMethod()).toBe('publicSubControlMethod:protectedSubControlMethod:privateSubControlMethod:subControl');
            expect(control.publicBehavior1Method()).toBe('behavior1 method { foo: \'bar\', bar: 1 }protectedBehavior1Method');
        });
    });
});