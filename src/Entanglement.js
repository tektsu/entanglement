/*jshint esversion: 9 */

/**
 * Utilities routines for the Entanglement library.
 */
class Entanglement {

    static version = '0.0.7';

    /**
     * Choose a value
     * @param {number|Range} v A value or value range.
     * @returns {number} Return the value passed in or a random value from the Range passed in.
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
     * @returns {number} Return the value passed in or a random value from the Range passed in as an integer.
     */
    static getInt(v) {
        let ret = v;
        if (isNaN(v)) {
            ret = random(v.min, v.max + 1);
        }
        return Math.floor(ret);
    }

    /**
     * Get the minimum value
     * @param {number|Range} v A value or value range.
     * @returns {number} Return the value passed in or the minimum value from the Range passed in.
     */
    static getMinValue(v) {
        let ret = v;
        if (isNaN(v)) {
            ret = v.min;
        }
        return ret;
    }


}