import { Control } from './control';

export class Behavior<P extends object = object> extends Control<P>
{
    protected isBehavior()
    {
        return true;
    }

    public mount()
    {
    }

    public unmount()
    {
    }
}