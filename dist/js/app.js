/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// identity function for calling harmony imports with the correct context
/******/ 	__webpack_require__.i = function(value) { return value; };
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.insertionCss = exports.clientFrameWindow = exports.clientFrame = undefined;

var _dndFunctions = __webpack_require__(3);

var _dndFunctions2 = _interopRequireDefault(_dndFunctions);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/***
 * @type {JQuery|jQuery|HTMLElement}
 */
var clientFrame = exports.clientFrame = $('#clientframe');
/***
 * @type {Window}
 */
/**
 * Created by EgorDm on 28-May-2017.
 */
var clientFrameWindow = exports.clientFrameWindow = clientFrame.get(0).contentWindow;

var dndBase = {
    /** @type{number} */
    total: 0,
    currentElement: null,
    currentElementChangeFlag: false,
    elementRectangle: null,
    countdown: 0,
    dragoverqueue_processtimer: 0,
    /**
     * Initiate
     */
    init: function init() {
        console.log('Initializing Drag and Drop');
        _dndFunctions2.default.init();
        $('#dragitemslistcontainer').find('li').on('dragstart', this._dragStart).on('dragend', this._dragEnd);
        clientFrame.on('load', this._frameLoad);
    },

    /**
     * Start of dragging a draggable element callback
     * @param {jQuery.Event|Event} event
     * @private
     */
    _dragStart: function _dragStart(event) {
        console.log("Drag Started");
        dndBase.dragoverqueue_processtimer = setInterval(function () {
            _dndFunctions2.default.processDragOverQueue();
        }, 100);
        var insertingHTML = $(this).attr('data-insert-html');
        event.originalEvent.dataTransfer.setData("Text", insertingHTML);
    },

    /**
     * End of dragging a draggable element callback
     * @param {jQuery.Event|Event} event
     * @private
     */
    _dragEnd: function _dragEnd(event) {
        console.log("Drag Ended");
        clearInterval(dndBase.dragoverqueue_processtimer);
        _dndFunctions2.default.removeDropMarker();
        _dndFunctions2.default.clearContainerContext();
    },

    /**
     * The Iframe has been loaded callback
     * @private
     */
    _frameLoad: function _frameLoad() {
        var style = $("<style data-reserved-styletag></style>").html(insertionCss);
        $(clientFrameWindow.document.head).append(style);

        var htmlBody = $(clientFrameWindow.document).find('body,html');
        htmlBody.find('*').addBack().on('dragenter', dndBase._frameDragEnter).on('dragover', dndBase._frameDragOver);
        $(clientFrameWindow.document).find('body,html').on('drop', dndBase._frameDragDrop);
    },

    /**
     * Dragging entered the element inside the iframe callback.
     * @param {jQuery.Event|Event} event
     * @private
     */
    _frameDragEnter: function _frameDragEnter(event) {
        event.stopPropagation();
        dndBase.currentElement = $(event.target);
        dndBase.currentElementChangeFlag = true;
        dndBase.elementRectangle = event.target.getBoundingClientRect();
        dndBase.countdown = 1;
    },

    /**
     * Dragging is over the element inside the iframe callback.
     * @param {jQuery.Event|Event} event
     * @private
     */
    _frameDragOver: function _frameDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        if (dndBase.countdown % 15 !== 0 && dndBase.currentElementChangeFlag === false) {
            dndBase.countdown += 1;
            return;
        }
        event = event || window.event;

        var x = event.originalEvent.clientX;
        var y = event.originalEvent.clientY;
        dndBase.countdown += 1;
        dndBase.currentElementChangeFlag = false;
        var mousePosition = { x: x, y: y };
        _dndFunctions2.default.addEntryToDragOverQueue(dndBase.currentElement, dndBase.elementRectangle, mousePosition);
    },

    /**
     * Object is droppped on an element inside the iframe callback.
     * @param {jQuery.Event|Event|object} event
     * @private
     */
    _frameDragDrop: function _frameDragDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('Drop event');
        var e = void 0;
        if (event.isTrigger) e = triggerEvent.originalEvent;else {
            e = event.originalEvent;
        }
        try {
            var textData = e.dataTransfer.getData('text');
            var insertionPoint = clientFrame.contents().find(".drop-marker");
            var checkDiv = $(textData);
            insertionPoint.after(checkDiv);
            insertionPoint.remove();
        } catch (e) {
            console.log(e);
        }
    }
};

var insertionCss = exports.insertionCss = '.reserved-drop-marker{width:100%;height:2px;background:#00a8ff;position:absolute}.reserved-drop-marker::after,.reserved-drop-marker::before{content:\'\';background:#00a8ff;height:7px;width:7px;position:absolute;border-radius:50%;top:-2px}.reserved-drop-marker::before{left:0}.reserved-drop-marker::after{right:0} [data-dragcontext-marker],[data-sh-parent-marker]{outline:#19cd9d solid 2px;text-align:center;position:absolute;z-index:123456781;pointer-events:none;font-family:\'Helvetica Neue\',Helvetica,Arial,sans-serif}[data-dragcontext-marker] [data-dragcontext-marker-text],[data-sh-parent-marker] [data-sh-parent-marker-text]{background:#19cd9d;color:#fff;padding:2px 10px;display:inline-block;font-size:14px;position:relative;top:-24px;min-width:121px;font-weight:700;pointer-events:none;z-index:123456782}[data-dragcontext-marker].invalid{outline:#dc044f solid 2px}[data-dragcontext-marker].invalid [data-dragcontext-marker-text]{background:#dc044f}[data-dragcontext-marker=body]{outline-offset:-2px}[data-dragcontext-marker=body] [data-dragcontext-marker-text]{top:0;position:fixed} .drop-marker{pointer-events:none;}.drop-marker.horizontal{background:#00adff;position:absolute;height:2px;list-style:none;visibility:visible!important;box-shadow:0 1px 2px rgba(255,255,255,.4),0 -1px 2px rgba(255,255,255,.4);z-index:123456789;text-align:center}.drop-marker.horizontal.topside{margin-top:0}.drop-marker.horizontal.bottomside{margin-top:2px}.drop-marker.horizontal:before{content:"";width:8px;height:8px;background:#00adff;border-radius:8px;margin-top:-3px;float:left;box-shadow:0 1px 2px rgba(255,255,255,.4),0 -1px 2px rgba(255,255,255,.4)}.drop-marker.horizontal:after{content:"";width:8px;height:8px;background:#00adff;border-radius:8px;margin-top:-3px;float:right;box-shadow:0 1px 2px rgba(255,255,255,.4),0 -1px 2px rgba(255,255,255,.4)}.drop-marker.vertical{height:50px;list-style:none;border:1px solid #00ADFF;position:absolute;margin-left:3px;display:inline;box-shadow:1px 0 2px rgba(255,255,255,.4),-1px 0 2px rgba(255,255,255,.4)}.drop-marker.vertical.leftside{margin-left:0}.drop-marker.vertical.rightside{margin-left:3px}.drop-marker.vertical:before{content:"";width:8px;height:8px;background:#00adff;border-radius:8px;margin-top:-4px;top:0;position:absolute;margin-left:-4px;box-shadow:1px 0 2px rgba(255,255,255,.4),-1px 0 2px rgba(255,255,255,.4)}.drop-marker.vertical:after{content:"";width:8px;height:8px;background:#00adff;border-radius:8px;margin-left:-4px;bottom:-4px;position:absolute;box-shadow:1px 0 2px rgba(255,255,255,.4),-1px 0 2px rgba(255,255,255,.4)}';

exports.default = dndBase;

/***/ }),
/* 1 */
/***/ (function(module, exports) {

// removed by extract-text-webpack-plugin

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var _dndBase = __webpack_require__(0);

var _dndBase2 = _interopRequireDefault(_dndBase);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by EgorDm on 29-May-2017.
 */
//SCSS
__webpack_require__(1);

//JS


_dndBase2.default.init();

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
exports.dropMarkerIgnoreRule = exports.dropMarkerClass = undefined;

var _utils = __webpack_require__(4);

var _utils2 = _interopRequireDefault(_utils);

var _dndBase = __webpack_require__(0);

var dndBase = _interopRequireWildcard(_dndBase);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/**
 * Created by EgorDm on 28-May-2017.
 */
var dropMarkerClass = exports.dropMarkerClass = 'drop-marker';
var dropMarkerIgnoreRule = exports.dropMarkerIgnoreRule = ":not(." + dropMarkerClass + ",[data-dragcontext-marker])";

var dndFunctions = {
    /**
     * Initiate
     */
    init: function init() {
        console.log('Initializing Drag and Drop Fucntions');
    },

    dragoverQueue: [],
    /**
     * Add element with mouse position to dragover queue. This will be processed by another instance.
     * @param {JQuery} element
     * @param {?ClientRect} elementRect
     * @param {{x: number, y: number}} mousePos
     * @constructor
     */
    addEntryToDragOverQueue: function addEntryToDragOverQueue(element, elementRect, mousePos) {
        var newEvent = [element, elementRect, mousePos];
        this.dragoverQueue.push(newEvent);
    },
    //p
    /***
     * Process drag over. Pick the last queue element and ignore others.
     */
    processDragOverQueue: function processDragOverQueue() {
        var processing = this.dragoverQueue.pop();
        this.dragoverQueue = [];
        if (processing && processing.length === 3) {
            var el = processing[0];
            var elRect = processing[1];
            var mousePos = processing[2];
            this._orchestrateDragDrop(el, elRect, mousePos);
        }
    },
    //p
    /***
     * Arrange drag and drop states.
     * On element:
     *      Within the 5% margin
     *      before, after, inside
     * Nearest element:
     *      Outside the 5% margin
     *      before, after
     * @param {JQuery} element
     * @param {?ClientRect} elementRect
     * @param {{x: number, y: number}} mousePos
     * @returns {*}
     * @private
     */
    _orchestrateDragDrop: function _orchestrateDragDrop(element, elementRect, mousePos) {
        //If no element is hovered or element hovered is the placeholder -> not valid -> return false;
        if (!element || element.length === 0 || !elementRect || !mousePos) return false;

        if (element.is('html')) element = element.find('body');

        //Top and Bottom Area Percentage to trigger different case. [5% of top and bottom area gets reserved for this]
        var breakPointNumber = { x: 5, y: 5 };
        var mousePercents = this._getMouseBearingsPercentage(element, elementRect, mousePos); // % of mouse in

        // Hovering over inside of the element. Decide before, after or inside.
        if (mousePercents.x > breakPointNumber.x && mousePercents.x < 100 - breakPointNumber.x && mousePercents.y > breakPointNumber.y && mousePercents.y < 100 - breakPointNumber.y) {
            var tempelement = element.clone();
            tempelement.find("." + dropMarkerClass).remove();

            if (tempelement.html() === "" && !_utils2.default.checkVoidElement(tempelement)) {
                if (mousePercents.y < 90) return this._placeInside(element);
            } else if (tempelement.children().length === 0) {
                //text element detected
                this._decideBeforeAfter(element, mousePercents);
            } else if (tempelement.children().length === 1) {
                //only 1 child element detected
                this._decideBeforeAfter(element.children(dropMarkerIgnoreRule).first(), mousePercents);
            } else {
                //more than 1 child element present
                var positionAndElement = this._findNearestElement(element, mousePos);
                this._decideBeforeAfter(positionAndElement.el, mousePercents, mousePos);
            }
            return;
        }
        var validElement = null;
        // Find the nearest neighbor AKA -> We are ON the margin
        if (mousePercents.x <= breakPointNumber.x || mousePercents.y <= breakPointNumber.y) {
            if (mousePercents.y <= mousePercents.x) {
                validElement = this._findValidParent(element, 'top');
            } else validElement = this._findValidParent(element, 'left');

            if (validElement.is("body,html")) validElement = dndBase.clientFrame.contents().find("body").children(dropMarkerIgnoreRule).first();
        } else if (mousePercents.x >= 100 - breakPointNumber.x || mousePercents.y >= 100 - breakPointNumber.y) {
            if (mousePercents.y >= mousePercents.x) validElement = this._findValidParent(element, 'bottom');else validElement = this._findValidParent(element, 'right');

            if (validElement.is("body,html")) validElement = dndBase.clientFrame.contents().find("body").children(dropMarkerIgnoreRule).last();
        }
        this._decideBeforeAfter(validElement, mousePercents, mousePos);
    },

    /***
     * % of of the x and y coords inside the elements
     * Example: bottom left -> x=100% and y=100%
     * @param {JQuery} element
     * @param {?ClientRect} elementRect
     * @param {{x: number, y: number}} mousePos
     * @returns {{x: number, y: number}}
     * @private
     */
    _getMouseBearingsPercentage: function _getMouseBearingsPercentage(element, elementRect, mousePos) {
        if (!elementRect) elementRect = element.get(0).getBoundingClientRect();
        return _utils2.default.posInRectToPercentage(elementRect, mousePos);
    },

    /**
     * Find valid element we want to target around.
     *
     * If we are on the edge of parent from direction the element is in, then return parent. Which
     * will make parent the target we want to hop around. Otherwise it would be impossible to place something
     * above the parent since this element is blocking its top. (This is used if we are on the edge of element
     * ofcourse.)
     * @param {JQuery} element
     * @param {string} direction
     * @returns {JQuery}
     * @private
     */
    _findValidParent: function _findValidParent(element, direction) {
        var tempElementRect = void 0;
        var tempElement = void 0;
        var elementRect = void 0;
        switch (direction) {
            case "left":
                while (true) {
                    elementRect = element.get(0).getBoundingClientRect();
                    tempElement = element.parent();
                    tempElementRect = tempElement.get(0).getBoundingClientRect();
                    if (element.is("body")) return element;
                    if (Math.abs(tempElementRect.left - elementRect.left) === 0) element = element.parent();else return element;
                }
                break;
            case "right":
                while (true) {
                    elementRect = element.get(0).getBoundingClientRect();
                    tempElement = element.parent();
                    tempElementRect = tempElement.get(0).getBoundingClientRect();
                    if (element.is("body")) return element;
                    if (Math.abs(tempElementRect.right - elementRect.right) === 0) element = element.parent();else return element;
                }
                break;
            case "top":
                while (true) {
                    elementRect = element.get(0).getBoundingClientRect();
                    tempElement = element.parent();
                    tempElementRect = tempElement.get(0).getBoundingClientRect();
                    if (element.is("body")) return element;
                    if (Math.abs(tempElementRect.top - elementRect.top) === 0)
                        // We are element on the edge of the parent from direction
                        element = element.parent();else return element;
                }
                break;
            case "bottom":
                while (true) {
                    elementRect = element.get(0).getBoundingClientRect();
                    tempElement = element.parent();
                    tempElementRect = tempElement.get(0).getBoundingClientRect();
                    if (element.is("body")) return element;
                    if (Math.abs(tempElementRect.bottom - elementRect.bottom) === 0) element = element.parent();else return element;
                }
                break;
        }
    },

    /**
     * Find closest child in this element which is not a marker. And its position relatively to clientpos.
     * @param {JQuery} container
     * @param {{x: number, y: number}}clientPos
     * @returns {{el: JQuery, position: string}|boolean}
     * @private
     */
    _findNearestElement: function _findNearestElement(container, clientPos) {
        var previousElData = null;
        var childElement = container.children(dropMarkerIgnoreRule);
        if (childElement.length > 0) {
            childElement.each(function () {
                if ($(this).is("." + dropMarkerClass)) return;

                var offset = $(this).get(0).getBoundingClientRect();
                var distance = 0;
                var distance1 = void 0,
                    distance2 = null;
                var position = '';
                var xPosition1 = offset.left;
                var xPosition2 = offset.right;
                var yPosition1 = offset.top;
                var yPosition2 = offset.bottom;
                var corner1 = null;
                var corner2 = null;

                //Parellel to Yaxis and intersecting with x axis
                if (clientPos.y > yPosition1 && clientPos.y < yPosition2) {
                    if (clientPos.x < xPosition1 && clientPos.y < xPosition2) {
                        corner1 = { x: xPosition1, y: clientPos.y, 'position': 'before' };
                    } else {
                        corner1 = { x: xPosition2, y: clientPos.y, 'position': 'after' };
                    }
                }
                //Parellel to xAxis and intersecting with Y axis
                else if (clientPos.x > xPosition1 && clientPos.x < xPosition2) {
                        if (clientPos.y < yPosition1 && clientPos.y < yPosition2) {
                            corner1 = { x: clientPos.x, y: yPosition1, 'position': 'before' };
                        } else {
                            corner1 = { x: clientPos.x, y: yPosition2, 'position': 'after' };
                        }
                    } else {
                        //runs if no element found!
                        if (clientPos.x < xPosition1 && clientPos.x < xPosition2) {
                            corner1 = { x: xPosition1, y: yPosition1, 'position': 'before' }; //left top
                            corner2 = { x: xPosition1, y: yPosition2, 'position': 'after' }; //left bottom
                        } else if (clientPos.x > xPosition1 && clientPos.x > xPosition2) {
                            //console.log('I m on the right of the element');
                            corner1 = { x: xPosition2, y: yPosition1, 'position': 'before' }; //Right top
                            corner2 = { x: xPosition2, y: yPosition2, 'position': 'after' }; //Right Bottom
                        } else if (clientPos.y < yPosition1 && clientPos.y < yPosition2) {
                            // console.log('I m on the top of the element');
                            corner1 = { x: xPosition1, y: yPosition1, 'position': 'before' }; //Top Left
                            corner2 = { x: xPosition2, y: yPosition1, 'position': 'after' }; //Top Right
                        } else if (clientPos.y > yPosition1 && clientPos.y > yPosition2) {
                            // console.log('I m on the bottom of the element');
                            corner1 = { x: xPosition1, y: yPosition2, 'position': 'before' }; //Left bottom
                            corner2 = { x: xPosition2, y: yPosition2, 'position': 'after' }; //Right Bottom
                        }
                    }

                distance1 = _utils2.default.calculateDistance(corner1, clientPos);

                if (corner2 !== null) distance2 = _utils2.default.calculateDistance(corner2, clientPos);

                if (distance1 < distance2 || distance2 === null) {
                    distance = distance1;
                    position = corner1.position;
                } else {
                    distance = distance2;
                    position = corner2.position;
                }

                if (previousElData !== null) {
                    if (previousElData.distance < distance) {
                        //My dist is bigger than of previous element. So don't assign previousElData.
                        return true;
                    }
                }
                previousElData = {
                    'el': this,
                    'distance': distance,
                    'xPosition1': xPosition1,
                    'xPosition2': xPosition2,
                    'yPosition1': yPosition1,
                    'yPosition2': yPosition2,
                    'position': position
                };
            });
            if (previousElData !== null) {
                var position = previousElData.position;
                return { 'el': $(previousElData.el), 'position': position };
            } else {
                return false;
            }
        }
    },

    /***
     * Decide if element should be placed before or after given element.
     * If element is display: inline or inline-block then decide if to place left or right.
     * @param {JQuery} targetElement
     * @param {{x: number, y: number}} mousePercents
     * @param {?{x: number, y: number}} mousePos
     * @returns {*}
     * @private
     */
    _decideBeforeAfter: function _decideBeforeAfter(targetElement, mousePercents) {
        var mousePos = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

        if (mousePos) {
            mousePercents = this._getMouseBearingsPercentage(targetElement, null, mousePos);
        }

        var horizontal = targetElement.css('display') === "inline" || targetElement.css('display') === "inline-block";
        if (targetElement.is("br")) horizontal = false;

        var axis = horizontal ? mousePercents.x : mousePercents.y;
        if (axis < 50) {
            return this._placeSide(targetElement, horizontal, true); // Place before
        } else {
            return this._placeSide(targetElement, horizontal, false); // Place after
        }
    },

    /***
     * Place inside. The drop marker.
     * @param {JQuery} element
     * @private
     */
    _placeInside: function _placeInside(element) {
        var placeholder = this._getDropMarker();
        placeholder.addClass('horizontal').css('width', element.width() + "px");
        this._addDropMarker(element, "inside-append", placeholder);
    },

    /***
     * Place before or after. The drop marker.
     * @param {JQuery} element
     * @param {boolean} horizontal
     * @param {boolean} before
     * @returns {*}
     * @private
     */
    _placeSide: function _placeSide(element, horizontal, before) {
        var placeholder = this._getDropMarker();
        if (element.is("td,th")) {
            placeholder.addClass('horizontal').css('width', element.width() + "px");
            return this._addDropMarker(element, before ? "inside-prepend" : "inside-append", placeholder);
        }
        if (horizontal) placeholder.addClass("vertical").css('height', element.innerHeight() + "px");else placeholder.addClass("horizontal").css('width', element.parent().width() + "px");
        this._addDropMarker(element, before ? "before" : "after", placeholder);
    },

    /**
     * Add drop marker element where it belongs. (Before, after, left or right)
     * Also add a container which tells where we are in.
     * @param {JQuery} element
     * @param {string} position - one of these [before, after, left, right]
     * @param {JQuery} placeholder - our drop marker element
     * @private
     */
    _addDropMarker: function _addDropMarker(element, position, placeholder) {
        this.removeDropMarker();
        switch (position) {
            case "before":
                placeholder.find(".message").html(element.parent().data('sh-dnd-error'));
                element.before(placeholder);
                console.log(element);
                console.log("BEFORE");
                this._addContainerContext(element, 'sibling');
                break;
            case "after":
                placeholder.find(".message").html(element.parent().data('sh-dnd-error'));
                element.after(placeholder);
                console.log(element);
                console.log("AFTER");
                this._addContainerContext(element, 'sibling');
                break;
            case "inside-prepend":
                placeholder.find(".message").html(element.data('sh-dnd-error'));
                element.prepend(placeholder);
                this._addContainerContext(element, 'inside');
                console.log(element);
                console.log("PREPEND");
                break;
            case "inside-append":
                placeholder.find(".message").html(element.data('sh-dnd-error'));
                element.append(placeholder);
                this._addContainerContext(element, 'inside');
                console.log(element);
                console.log("APPEND");
                break;
        }
    },

    /**
     * Get new drop marker element. In this case drop marker.
     * @returns {JQuery|jQuery|HTMLElement}
     * @private
     */
    _getDropMarker: function _getDropMarker() {
        return $("<li class='" + dropMarkerClass + "'></li>");
    },

    /**
     * Remove placeholder from the whole frame.
     */
    removeDropMarker: function removeDropMarker() {
        dndBase.clientFrame.contents().find("." + dropMarkerClass).remove();
    },
    //p
    /**
     * Get new context marker. Used to specify where the parent where object will be placed in.
     * @returns {JQuery|jQuery|HTMLElement}
     */
    _getContextMarker: function _getContextMarker() {
        return $("<div data-dragcontext-marker><span data-dragcontext-marker-text></span></div>");
    },

    /**
     * Add context container to specify where the parent where object will be placed in.
     * @param {JQuery} element
     * @param {string} position - How object will be placed in. [inside, sibling]
     * @private
     */
    _addContainerContext: function _addContainerContext(element, position) {
        var contextMarker = this._getContextMarker();
        this.clearContainerContext();
        var clientContents = dndBase.clientFrame.contents();
        if (element.is('html,body')) {
            position = 'inside';
            element = clientContents.find("body");
        }
        switch (position) {
            case "inside":
                this._positionContextMarker(contextMarker, element);
                if (element.hasClass('stackhive-nodrop-zone')) contextMarker.addClass('invalid');
                var name = this._getElementName(element);
                contextMarker.find('[data-dragcontext-marker-text]').html(name);

                if (clientContents.find("body [data-sh-parent-marker]").length !== 0) clientContents.find("body [data-sh-parent-marker]").first().before(contextMarker);else clientContents.find("body").append(contextMarker);
                break;
            case "sibling":
                this._positionContextMarker(contextMarker, element.parent());
                if (element.parent().hasClass('stackhive-nodrop-zone')) contextMarker.addClass('invalid');
                name = this._getElementName(element.parent());
                contextMarker.find('[data-dragcontext-marker-text]').html(name);
                contextMarker.attr("data-dragcontext-marker", name.toLowerCase());
                if (clientContents.find("body [data-sh-parent-marker]").length !== 0) clientContents.find("body [data-sh-parent-marker]").first().before(contextMarker);else clientContents.find("body").append(contextMarker);
                break;
        }
    },

    /***
     * Position the marker above the element we will place the object in.
     * @param {JQuery} contextMarker
     * @param {JQuery} element - Where to center/wrap it around
     * @private
     */
    _positionContextMarker: function _positionContextMarker(contextMarker, element) {
        var rect = element.get(0).getBoundingClientRect();
        var contentWindowElement = $(dndBase.clientFrameWindow);
        contextMarker.css({
            height: rect.height + 4 + "px",
            width: rect.width + 4 + "px",
            top: rect.top + contentWindowElement.scrollTop() - 2 + "px",
            left: rect.left + contentWindowElement.scrollLeft() - 2 + "px"
        });
        // If our marker is outside of the top of the frame.
        if (rect.top + dndBase.clientFrame.contents().find("body").scrollTop() < 24) {
            contextMarker.find("[data-dragcontext-marker-text]").css('top', '0px');
        }
    },

    /**
     * Remove the contact container.
     */
    clearContainerContext: function clearContainerContext() {
        dndBase.clientFrame.contents().find('[data-dragcontext-marker]').remove();
    },
    //p
    /**
     * Get element name. Pretty straight forward.
     * @param {JQuery} element
     * @private
     */
    _getElementName: function _getElementName(element) {
        return element.prop('tagName');
    }
};

exports.default = dndFunctions;

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


Object.defineProperty(exports, "__esModule", {
    value: true
});
/**
 * Created by EgorDm on 27-May-2017.
 */

var voidElements = ['i', 'area', 'base', 'br', 'col', 'command', 'embed', 'hr', 'img', 'input', 'keygen', 'link', 'meta', 'param', 'video', 'iframe', 'source', 'track', 'wbr'];
var utils = {
    /***
     * Get % of pos in rect
     * Example: bottom left -> x=100% and y=100%
     * @param {?ClientRect} rect
     * @param {{x: number, y: number}} pos
     * @returns {{x: number, y: number}}
     */
    posInRectToPercentage: function posInRectToPercentage(rect, pos) {
        // Formula = (x - min_cord) / (max_cord - mix_cord) * 100
        return {
            x: (pos.x - rect.left) / (rect.right - rect.left) * 100,
            y: (pos.y - rect.top) / (rect.bottom - rect.top) * 100
        };
    },

    /***
     * Get object type
     * @param obj
     * @returns {string}
     */
    toType: function toType(obj) {
        return {}.toString.call(obj).match(/\s([a-zA-Z]+)/)[1].toLowerCase();
    },

    /***
     * Check if its not a filler element for text style
     * @param {JQuery} element
     * @returns {boolean}
     */
    checkVoidElement: function checkVoidElement(element) {
        var selector = voidElements.join(",");
        return element.is(selector);
    },

    /**
     * Calculate distance between two points. (Pytagoras)
     * @param {{x: number, y: number}} pos1
     * @param {{x: number, y: number}} pos2
     * @returns {number}
     */
    calculateDistance: function calculateDistance(pos1, pos2) {
        return Math.sqrt(Math.pow(pos1.x - pos2.x, 2) + Math.pow(pos1.y - pos2.y, 2));
    }
};

exports.default = utils;

/***/ })
/******/ ]);
//# sourceMappingURL=app.js.map