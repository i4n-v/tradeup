import { EventManager } from './event-manager.lib';

describe('EventManager', () => {
  it('should register listener when on is called', () => {
    const manager = new EventManager<'test'>();
    const listener = () => {};
    manager.on('test', listener);
    expect(manager.listeners.get('test')).toContain(listener);
  });

  it('should call listener with payload when emit is called', () => {
    const manager = new EventManager<'test'>();
    const listener = (payload: string) => {
      expect(payload).toBe('data');
    };
    manager.on('test', listener);
    manager.emit('test', 'data');
  });

  it('should remove listener when off is called', () => {
    const manager = new EventManager<'test'>();
    const listener = () => {};
    manager.on('test', listener);
    manager.off('test', listener);
    expect(manager.listeners.get('test')).not.toContain(listener);
  });
});
