import NodeEventEmitter from 'events';
import { EventEmitter } from '../src/eventEmitter';

describe('Event Emitter', () => {
    let nodeEventEmitter: NodeEventEmitter = new NodeEventEmitter();
    nodeEventEmitter.setMaxListeners(10000); // needed for avoid warnings
    let eventEmitter: EventEmitter = new EventEmitter();

    describe.each`
        EventEmitterClass   | name
        ${EventEmitter}     | ${'own'}
        ${NodeEventEmitter} | ${'Node'}
    `('using our $name version', ({ EventEmitterClass }) => {
        let em: EventEmitter;

        beforeEach(() => {
            em = new EventEmitterClass();
        });

        describe('listening events', () => {
            it('listen an event executes the callback if the event is triggered', () => {
                const fn = jest.fn();
                const args = [1, 2, 3];

                em.on('my-event', fn);
                em.emit('my-event', ...args);

                expect(fn).toHaveBeenCalledTimes(1);
                expect(fn).toHaveBeenCalledWith(1, 2, 3);
            });

            it('listen an event executes the callback without params in case the trigger does not have', () => {
                const fn = jest.fn();

                em.on('my-event', fn);
                em.emit('my-event');

                expect(fn).toHaveBeenCalledTimes(1);
                expect(fn).toHaveBeenCalledWith();
            });

            it('execute the callback twice even if the event is triggered twice', () => {
                const fn = jest.fn();
                const args1 = [1, 2, 3];
                const args2 = ['a', 'b', 'c'];

                em.on('my-event', fn);
                em.emit('my-event', ...args1);
                em.emit('my-event', ...args2);

                expect(fn).toHaveBeenCalledTimes(2);
                expect(fn).toHaveBeenCalledWith(1, 2, 3);
                expect(fn).toHaveBeenCalledWith('a', 'b', 'c');
            });

            it('listen another event does not execute the callback if the event is triggered', () => {
                const fn = jest.fn();

                em.on('other-event', fn);
                em.emit('my-event');

                expect(fn).toHaveBeenCalledTimes(0);
            });

            it('listen two callbacks execute both callbacks if the event is triggered', () => {
                const fn1 = jest.fn();
                const fn2 = jest.fn();
                const args = ['a', 'b', 'c'];

                em.on('my-event', fn1);
                em.on('my-event', fn2);
                em.emit('my-event', ...args);

                expect(fn1).toHaveBeenCalledTimes(1);
                expect(fn2).toHaveBeenCalledTimes(1);
                expect(fn1).toHaveBeenCalledWith('a', 'b', 'c');
                expect(fn2).toHaveBeenCalledWith('a', 'b', 'c');
            });

            it('listen same callbacks twice execute the callback twice if the event is triggered', () => {
                const fn1 = jest.fn();
                const args = ['a', 'b', 'c'];

                em.on('my-event', fn1);
                em.on('my-event', fn1);
                em.emit('my-event', ...args);

                expect(fn1).toHaveBeenCalledTimes(2);
                expect(fn1).toHaveBeenNthCalledWith(1, 'a', 'b', 'c');
                expect(fn1).toHaveBeenNthCalledWith(2, 'a', 'b', 'c');
            });
        });

        describe('deleting events', () => {
            it('can remove an event listener even if is not being listened', () => {
                const fn = jest.fn();

                expect(() => {
                    em.off('my-event', fn);
                }).not.toThrow();
            });

            it('listen and remove a event listener does not trigger the callback', () => {
                const fn = jest.fn();
                const args = [1, 2, 3];

                em.on('my-event', fn);
                em.off('my-event', fn);
                em.emit('my-event', ...args);

                expect(fn).toHaveBeenCalledTimes(0);
            });

            it('listen two event listeners and remove once only removes that callback', () => {
                const fn1 = jest.fn();
                const fn2 = jest.fn();
                const args = [1, 2, 3];

                em.on('my-event', fn1);
                em.on('my-event', fn2);
                em.off('my-event', fn1);
                em.emit('my-event', ...args);

                expect(fn1).toHaveBeenCalledTimes(0);
                expect(fn2).toHaveBeenCalledTimes(1);
                expect(fn2).toHaveBeenCalledWith(1, 2, 3);
            });

            it('listen an event listener twice and remove once triggers the callback once', () => {
                const fn = jest.fn();
                const args = [1, 2, 3];

                em.on('my-event', fn);
                em.on('my-event', fn);
                em.off('my-event', fn);
                em.emit('my-event', ...args);

                expect(fn).toHaveBeenCalledTimes(1);
                expect(fn).toHaveBeenCalledWith(1, 2, 3);
            });

            it('listen an event listener for each event and remove one event does not avoid triggering the other event', () => {
                const fn1 = jest.fn();
                const fn2 = jest.fn();
                const args = [1, 2, 3];

                em.on('my-event', fn1);
                em.on('other-event', fn2);
                em.off('my-event', fn1);
                em.emit('other-event', ...args);

                expect(fn1).toHaveBeenCalledTimes(0);
                expect(fn2).toHaveBeenCalledTimes(1);
                expect(fn2).toHaveBeenCalledWith(1, 2, 3);
            });
        });

        describe('measuring performance', () => {

            it('adding 1000 Events takes less than 20ms', () => {
                const before = new Date().getTime();

                for (let i = 0; i < 1000; i++) {
                    const fn = jest.fn();
                    const eventName = Math.random().toString();
                    em.on(eventName, fn);
                }

                const after = new Date().getTime();

                expect(after - before).toBeLessThanOrEqual(20);

            });

            it('removing 1000 Events takes less than 20ms', () => {
                const fns = [];
                const eventNames = [];

                for (let i = 0; i < 1000; i++) {
                    const fn = jest.fn();
                    const eventName = Math.random().toString();
                    fns.push(fn);
                    eventNames.push(eventName);
                    em.on('bla', fn);
                }

                const before = new Date().getTime();

                for (let i = 0; i < 100; i++) {
                    em.off(eventNames[i], fns[i]);
                }

                const after = new Date().getTime();

                expect(after - before).toBeLessThanOrEqual(20);

            });

        });

    });
});
