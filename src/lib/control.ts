import { ControlWithEvents, type ControlEventMap } from './controlWithEvents';

export abstract class Control<
    PropsType extends object = object,
    EventType extends ControlEventMap = ControlEventMap
> extends ControlWithEvents<PropsType, EventType>
{
}