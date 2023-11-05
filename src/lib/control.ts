import { ControlWithEvents, type ControlEventMap } from './controlWithEvents';

export abstract class Control<
    PropsType extends object = object,
    EventType extends ControlEventMap = ControlEventMap
> extends ControlWithEvents<PropsType, EventType>
{
}

export function css(strings: TemplateStringsArray, ...values: unknown[]): string
{
    return strings.reduce((acc, str, i) => acc + str + (values[i] || ''), '');
}