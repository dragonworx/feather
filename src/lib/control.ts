import type { ControlProps } from './controlBase';
import { ControlWithEvents, type ControlEventMap } from './controlWithEvents';

export abstract class Control<
    PropsType extends ControlProps = ControlProps,
    EventType extends ControlEventMap = ControlEventMap
> extends ControlWithEvents<PropsType, EventType>
{
}

export const stringTemplate = (strings: TemplateStringsArray, ...values: unknown[]): string => strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
export const css = (strings: TemplateStringsArray, ...values: unknown[]): string => stringTemplate(strings, ...values);
export const html = (strings: TemplateStringsArray, ...values: unknown[]): string => stringTemplate(strings, ...values);