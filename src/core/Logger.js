// @ts-check

/**
 * App Logger System
*/
export class Logger {

    /**
     * @param {number} [level=Logger.DEBUG] 
     * @param {string} [prefix="APP"] 
    */
    constructor(prefix = "APP",level = Logger.DEBUG) {
        this.prefix = prefix;
        this.level = level;
    }

    static DEBUG = 0;
    static INFO  = 1;
    static WARN  = 2;
    static ERROR = 3;
    static NONE  = 4;

    /**
     * @param {number} level 
    */
    setLevel(level) {
        this.level = level;
    }

    /**
     * @param {...*} args 
    */
    debug(...args) {
        if (this.level > Logger.DEBUG) return;
        console.log(
            `%c${this.prefix}`,
            "background:#444;color:white;padding:2px 6px;border-radius:3px",
            ...args
        );
    }

    /**
     * @param {...*} args 
    */
    info(...args) {
        if (this.level > Logger.INFO) return;
        console.info(
            `%c${this.prefix}`,
            "background:#1976d2;color:white;padding:2px 6px;border-radius:3px",
            ...args
        );
    }

    /**
     * @param {...*} args 
    */
    warn(...args) {
        if (this.level > Logger.WARN) return;
        console.warn(
            `%c${this.prefix}`,
            "background:#f57c00;color:white;padding:2px 6px;border-radius:3px",
            ...args
        );
    }

    /**
     * @param {...*} args 
    */
    error(...args) {
        if (this.level > Logger.ERROR) return;
        console.error(
            `%c${this.prefix}`,
            "background:#c62828;color:white;padding:2px 6px;border-radius:3px",
            ...args
        );
    }

    /**@param {string} name */
    child(name) {
    const logger = new Logger(`${this.prefix}:${name}`);
    logger.level = this.level;
    return logger;
}

}