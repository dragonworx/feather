import { Control } from './control';

export class Behavior extends Control
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