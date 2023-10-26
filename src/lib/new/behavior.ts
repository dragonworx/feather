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
}