import { Behavior } from '$lib/behavior';

export interface DragBehaviorOptions {
	xDistThreshold: number;
	yDistThreshold: number;
}

export interface DragBehaviorEvent {
	xDelta: number;
	yDelta: number;
}

export type DragBehaviorEvents = 'start' | 'move' | 'end';

export class DragBehavior extends Behavior<DragBehaviorOptions, DragBehaviorEvents> {
	public static id = 'drag';
	
	protected isActive = false;
	protected startX = 0;
	protected startY = 0;

	protected defaultOptions(): DragBehaviorOptions {
		return {
			xDistThreshold: 5,
			yDistThreshold: 5
		};
	}

	protected install(): void {
		const { component } = this;
		component.on('mousedown', this.onMouseDown);
	}

	protected uninstall(): void {
		const { component } = this;
		component.off('mousedown', this.onMouseDown);
		// todo: double check whether more thorough way should be used for any possible state
		//       (eg. if called during move) with bound events
	}

	protected isActiveDelta(xDelta: number, yDelta: number): boolean {
		const { options } = this;
		return Math.abs(xDelta) > options.xDistThreshold || Math.abs(yDelta) > options.yDistThreshold;
	}

	protected onMouseDown = ((e: MouseEvent) => {
		this.isActive = false;
		this.startX = e.clientX;
		this.startY = e.clientY;
		window.addEventListener('mousemove', this.onMouseMove);
		window.addEventListener('mouseup', this.onMouseUp);
	}) as EventListener;

	protected onMouseMove = ((e: MouseEvent) => {
		const xDelta = e.clientX - this.startX;
		const yDelta = e.clientY - this.startY;
		if (this.isActive) {
			this.emit('move', { xDelta, yDelta });
		} else if (this.isActiveDelta(xDelta, yDelta)) {
			this.isActive = true;
			this.emit('start', { xDelta, yDelta });
		}
	}) as EventListener;

	protected onMouseUp = ((e: MouseEvent) => {
		window.removeEventListener('mousemove', this.onMouseMove);
		window.removeEventListener('mouseup', this.onMouseUp);
		if (this.isActive) {
			this.isActive = false;
			const xDelta = e.clientX - this.startX;
			const yDelta = e.clientY - this.startY;
			this.emit('end', { xDelta, yDelta });
		}
	}) as EventListener;
}
