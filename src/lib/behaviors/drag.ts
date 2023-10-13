import { Behavior } from '$lib/behavior';

export interface DragBehaviorOptions {}

export interface DragEvent {
	xDelta: number;
	yDelta: number;
}

export type DragBehaviorEvents = 'start' | 'move' | 'end';

export class DragBehavior extends Behavior<DragBehaviorOptions, DragBehaviorEvents> {
	protected startX: number = 0;
	protected startY: number = 0;

	protected defaultOptions(): DragBehaviorOptions {
		return {};
	}

	protected install(): void {
		const { component } = this;
		component.on('mousedown', this.onMouseDown);
	}

	protected uninstall(): void {}

	protected onMouseDown = ((e: MouseEvent) => {
		this.startX = e.clientX;
		this.startY = e.clientY;
		window.addEventListener('mousemove', this.onMouseMove);
		window.addEventListener('mouseup', this.onMouseUp);
		this.emitter.emit('start', { xDelta: 0, yDelta: 0 });
	}) as EventListener;

	protected onMouseMove = ((e: MouseEvent) => {
		const xDelta = e.clientX - this.startX;
		const yDelta = e.clientY - this.startY;
		this.emitter.emit('move', { xDelta, yDelta });
	}) as EventListener;

	protected onMouseUp = ((e: MouseEvent) => {
		window.removeEventListener('mousemove', this.onMouseMove);
		window.removeEventListener('mouseup', this.onMouseUp);
		const xDelta = e.clientX - this.startX;
		const yDelta = e.clientY - this.startY;
		this.emitter.emit('end', { xDelta, yDelta });
	}) as EventListener;
}
