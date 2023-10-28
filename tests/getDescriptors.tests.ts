import { Control } from '../src/lib/new/control';
import { getDescriptors } from '../src/lib/new/util';
import { SubControl, TestControl } from './helpers';

describe('Util', () =>
{
    describe('Descriptors', () =>
    {
        it('should detect descriptors through prototype chain', () =>
        {
            const descriptors = getDescriptors(TestControl);

            expect(descriptors.length).toBe(2);
            expect(descriptors[0].id).toBe('control');
            expect(descriptors[1].id).toBe('test');
        });

        it('should detect descriptors through extended prototype chain', () =>
        {
            const descriptors = getDescriptors(SubControl);

            expect(descriptors.length).toBe(3);
            expect(descriptors[0].id).toBe('control');
            expect(descriptors[1].id).toBe('test');
            expect(descriptors[2].id).toBe('sub');
        });

        it('should detect missing descriptor', () =>
        {
            class BadSubclass extends Control { }
            expect(() => getDescriptors(BadSubclass)).toThrowError('missing control descriptor');
        });

        it('should detect duplicate descriptor id', () =>
        {
            class BadSubclass extends Control
            {
                public static descriptor = {
                    id: 'control',
                    props: {},
                    template: '',
                };
            }

            expect(() => getDescriptors(BadSubclass)).toThrowError('duplicate control descriptor id \'control\'');
        });

        it('should detect duplicate control id', () =>
        {
            class Subclass1 extends Control
            {
                public static descriptor = {
                    id: 'subclass',
                    props: {},
                    template: '',
                };
            }

            class Subclass2 extends Control
            {
                public static descriptor = {
                    id: 'subclass',
                    props: {},
                    template: '',
                };
            }

            expect(() => getDescriptors(Subclass1)).not.toThrow();
            expect(() => getDescriptors(Subclass2)).toThrowError('control id \'subclass\' is already defined by Subclass1');
        });
    });
});