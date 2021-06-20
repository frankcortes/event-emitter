import { CallbackMap } from './callbackMap';
import { fn } from './types';

export class EventEmitter {
  events: Record<string, CallbackMap>;

  constructor() {
    this.events = {};
  }

  on(eventName: string, listener: fn) {
    if (!this.events[eventName]) {
      this.events[eventName] = new CallbackMap();
    }

    this.events[eventName].add(listener);
  }

  off(eventName: string, listener?: fn) {
    if (!this.events[eventName]) {
      return;
    }

    if (!listener) {
      delete this.events[eventName];
      return;
    }

    this.events[eventName].remove(listener);
  }

  emit(eventName: string, ...args: any[]) {
    if (this.events[eventName]) {
      this.events[eventName].run(...args);
    }
  }
}
