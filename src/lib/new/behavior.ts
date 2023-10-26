import { Control } from './control';

export class Behavior extends Control
{
    constructor()
    {
        super();
        console.log('behavior constructor');
    }

    public behaviorMethod()
    {
        console.log('behavior method');
    }

    public mount() {
        console.log('behavior mount', this.id);
    }

    public unmount() {
        console.log('behavior unmount', this.id);
    }
}