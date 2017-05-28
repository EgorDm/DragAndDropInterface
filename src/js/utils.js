/**
 * Created by EgorDm on 27-May-2017.
 */

const voidElements = ['i', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'video', 'iframe', 'source', 'track', 'wbr'];
let utils = {
    /***
     * Get % of pos in rect
     * Example: bottom left -> x=100% and y=100%
     * @param {?ClientRect} rect
     * @param {{x: number, y: number}} pos
     * @returns {{x: number, y: number}}
     */
    posInRectToPercentage(rect, pos) {
        // Formula = (x - min_cord) / (max_cord - mix_cord) * 100
        return {
            x: ((pos.x - rect.left) / (rect.right - rect.left)) * 100,
            y: ((pos.y - rect.top) / (rect.bottom - rect.top)) * 100
        };
    },
    /***
     * Get object type
     * @param obj
     * @returns {string}
     */
    toType(obj) {
        return ({}).toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase()
    },
    /***
     * Check if its not a filler element for text style
     * @param {JQuery} element
     * @returns {boolean}
     */
    checkVoidElement(element) {
        const selector = voidElements.join(",");
        return element.is(selector);
    },
    /**
     * Calculate distance between two points. (Pytagoras)
     * @param {{x: number, y: number}} pos1
     * @param {{x: number, y: number}} pos2
     * @returns {number}
     */
    calculateDistance(pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    },
};

export default utils;