/**
 * Utilities routines for the Entanglement library.
 */
class Entanglement {

    static version = '0.0.6';

    /**
     * Choose a value
     * @param {number|Range} v A value or value range.
     */
    static getValue(v) {
        let ret = v;
        if (isNaN(v)) {
            ret = v.rand();
        }
        return ret;
    }

    /**
     * Choose an integer value
     * @param {number|Range} v A value or value range.
     */
    static getInt(v) {
        let ret = v;
        if (isNaN(v)) {
            ret = random(v.min, v.max+1);
        }
        return Math.floor(ret);
    }
}
