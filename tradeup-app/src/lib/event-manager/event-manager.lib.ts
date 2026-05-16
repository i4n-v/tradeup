import type { IListener } from './event-manager.type';

export class EventManager<T> {
  listeners: Map<T, IListener[]>;

  constructor() {
    this.listeners = new Map<T, IListener[]>();
  }

  on(event: T, listener: IListener) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }

    this.listeners.get(event)!.push(listener);
  }

  off(event: T, listenerToRemove: IListener) {
    const listeners = this.listeners.get(event);

    if (!listeners) return;

    const filteredListeners = listeners.filter((listener) => listener !== listenerToRemove);

    this.listeners.set(event, filteredListeners);
  }

  emit(event: T, payload?: Parameters<IListener>[0]) {
    if (!this.listeners.has(event)) return;

    this.listeners.get(event)!.forEach((listener) => {
      listener(payload);
    });
  }
}
