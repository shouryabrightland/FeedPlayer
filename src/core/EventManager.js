// @ts-check

/**
 * @typedef {import("./Logger").Logger} Logger
*/

export class EventManager {

    /**
     * @param {Logger} logger 
    */
    constructor(logger) {
        /** @type {Map<string, Set<Function>>} */
        this.events = new Map();
        this.log = logger;
        this.log.debug("constructor Called")
    }

    /**
     * Subscribe to an event.
     * @param {string} event
     * @param {Function} listener
     * @returns {Function} unsubscribe function
     */
    on(event, listener) {

        let listeners = this.events.get(event);

        if (!listeners) {
            listeners = new Set();
            this.events.set(event, listeners);
        }

        listeners.add(listener);
        this.log.debug("New Listener Added:",event)

        return () => this.off(event, listener);
    }

    /**
     * Subscribe once.
     * @param {string} event
     * @param {Function} listener
     */
    once(event, listener) {

        
        const wrapper = (/**@type {any[]}*/ ...args) => {
            this.off(event, wrapper);
            listener(...args);
        };

        this.log.debug("Subscribed once:",event)
        this.on(event, wrapper);
        
    }

    /**
     * Remove a listener.
     * @param {string} event
     * @param {Function} listener
     */
    off(event, listener) {

        const listeners = this.events.get(event);

        if (!listeners) return;

        listeners.delete(listener);
        this.log.debug("listener deleted",event)

        if (listeners.size === 0) {
            this.events.delete(event);
            this.log.debug("Event deleted",event)
        }

    }

    /**
     * Emit an event.
     * @param {string} event
     * @param {...any} args
     */
    emit(event, ...args) {

        const listeners = this.events.get(event);
        this.log.info("Event Emited",event)

        if (!listeners) return;

        this.log.debug("Event Listener chain started executing ",event)

        // clone to avoid issues if listeners modify subscriptions
        for (const listener of [...listeners]) {
            try {
                listener(...args);
            }
            catch (err) {
                this.log.error(`Event "${event}" failed`, err);
            }
        }

    }

    /**
     * Remove every listener.
     */
    clear() {
        this.log.info("Cleaned!")
        this.events.clear();
    }

    /**
     * Remove all listeners of one event.
     * @param {string} event
     */
    clearEvent(event) {
        this.events.delete(event);
        this.log.debug("event deleted",event)
    }

    /**
     * Check whether an event has listeners.
     * @param {string} event
     */
    has(event) {
        return this.events.has(event);
    }

    /**
     * Number of listeners.
     * @param {string} event
     */
    listenerCount(event) {
        return this.events.get(event)?.size ?? 0;
    }

}