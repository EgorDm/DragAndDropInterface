/**
 * Created by EgorDm on 28-May-2017.
 */
import utils from "../utils";
import * as dndBase from "./dndBase";

export const dropMarkerClass = 'drop-marker';
export const dropMarkerIgnoreRule = `:not(.${dropMarkerClass},[data-dragcontext-marker])`;

let dndFunctions = {
    /**
     * Initiate
     */
    init() {
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
    addEntryToDragOverQueue(element, elementRect, mousePos) {
        const newEvent = [element, elementRect, mousePos];
        this.dragoverQueue.push(newEvent);
    }, //p
    /***
     * Process drag over. Pick the last queue element and ignore others.
     */
    processDragOverQueue() {
        const processing = this.dragoverQueue.pop();
        this.dragoverQueue = [];
        if (processing && processing.length === 3) {
            const el = processing[0];
            const elRect = processing[1];
            const mousePos = processing[2];
            this._orchestrateDragDrop(el, elRect, mousePos);
        }
    }, //p
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
    _orchestrateDragDrop(element, elementRect, mousePos) {
        //If no element is hovered or element hovered is the placeholder -> not valid -> return false;
        if (!element || element.length === 0 || !elementRect || !mousePos)
            return false;

        if (element.is('html'))
            element = element.find('body');

        //Top and Bottom Area Percentage to trigger different case. [5% of top and bottom area gets reserved for this]
        const breakPointNumber = {x: 5, y: 5};
        const mousePercents = this._getMouseBearingsPercentage(element, elementRect, mousePos); // % of mouse in

        // Hovering over inside of the element. Decide before, after or inside.
        if ((mousePercents.x > breakPointNumber.x && mousePercents.x < 100 - breakPointNumber.x) &&
            (mousePercents.y > breakPointNumber.y && mousePercents.y < 100 - breakPointNumber.y)) {
            let tempelement = element.clone();
            tempelement.find(`.${dropMarkerClass}`).remove();

            if (tempelement.html() === "" && !utils.checkVoidElement(tempelement)) {
                if (mousePercents.y < 90)
                    return this._placeInside(element);
            }
            else if (tempelement.children().length === 0) { //text element detected
                this._decideBeforeAfter(element, mousePercents);
            }
            else if (tempelement.children().length === 1) { //only 1 child element detected
                this._decideBeforeAfter(element.children(dropMarkerIgnoreRule).first(), mousePercents);
            }
            else { //more than 1 child element present
                const positionAndElement = this._findNearestElement(element, mousePos);
                this._decideBeforeAfter(positionAndElement.el, mousePercents, mousePos);
            }
            return;
        }
        let validElement = null;
        // Find the nearest neighbor AKA -> We are ON the margin
        if ((mousePercents.x <= breakPointNumber.x) || (mousePercents.y <= breakPointNumber.y)) {
            if (mousePercents.y <= mousePercents.x) {
                validElement = this._findValidParent(element, 'top');
            } else
                validElement = this._findValidParent(element, 'left');

            if (validElement.is("body,html"))
                validElement = dndBase.clientFrame.contents().find("body").children(dropMarkerIgnoreRule).first();
        }
        else if ((mousePercents.x >= 100 - breakPointNumber.x) || (mousePercents.y >= 100 - breakPointNumber.y)) {
            if (mousePercents.y >= mousePercents.x)
                validElement = this._findValidParent(element, 'bottom');
            else
                validElement = this._findValidParent(element, 'right');

            if (validElement.is("body,html"))
                validElement = dndBase.clientFrame.contents().find("body").children(dropMarkerIgnoreRule).last();
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
    _getMouseBearingsPercentage(element, elementRect, mousePos) {
        if (!elementRect)
            elementRect = element.get(0).getBoundingClientRect();
        return utils.posInRectToPercentage(elementRect, mousePos);
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
    _findValidParent(element, direction) {
        let tempElementRect;
        let tempElement;
        let elementRect;
        switch (direction) {
            case "left":
                while (true) {
                    elementRect = element.get(0).getBoundingClientRect();
                    tempElement = element.parent();
                    tempElementRect = tempElement.get(0).getBoundingClientRect();
                    if (element.is("body"))
                        return element;
                    if (Math.abs(tempElementRect.left - elementRect.left) === 0)
                        element = element.parent();
                    else
                        return element;
                }
                break;
            case "right":
                while (true) {
                    elementRect = element.get(0).getBoundingClientRect();
                    tempElement = element.parent();
                    tempElementRect = tempElement.get(0).getBoundingClientRect();
                    if (element.is("body"))
                        return element;
                    if (Math.abs(tempElementRect.right - elementRect.right) === 0)
                        element = element.parent();
                    else
                        return element;
                }
                break;
            case "top":
                while (true) {
                    elementRect = element.get(0).getBoundingClientRect();
                    tempElement = element.parent();
                    tempElementRect = tempElement.get(0).getBoundingClientRect();
                    if (element.is("body"))
                        return element;
                    if (Math.abs(tempElementRect.top - elementRect.top) === 0)
                    // We are element on the edge of the parent from direction
                        element = element.parent();
                    else
                        return element;
                }
                break;
            case "bottom":
                while (true) {
                    elementRect = element.get(0).getBoundingClientRect();
                    tempElement = element.parent();
                    tempElementRect = tempElement.get(0).getBoundingClientRect();
                    if (element.is("body"))
                        return element;
                    if (Math.abs(tempElementRect.bottom - elementRect.bottom) === 0)
                        element = element.parent();
                    else
                        return element;
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
    _findNearestElement(container, clientPos) {
        let previousElData = null;
        const childElement = container.children(dropMarkerIgnoreRule);
        if (childElement.length > 0) {
            childElement.each(function () {
                if ($(this).is(`.${dropMarkerClass}`))
                    return;

                const offset = $(this).get(0).getBoundingClientRect();
                let distance = 0;
                let distance1, distance2 = null;
                let position = '';
                const xPosition1 = offset.left;
                const xPosition2 = offset.right;
                const yPosition1 = offset.top;
                const yPosition2 = offset.bottom;
                let corner1 = null;
                let corner2 = null;

                //Parellel to Yaxis and intersecting with x axis
                if (clientPos.y > yPosition1 && clientPos.y < yPosition2) {
                    if (clientPos.x < xPosition1 && clientPos.y < xPosition2) {
                        corner1 = {x: xPosition1, y: clientPos.y, 'position': 'before'};
                    }
                    else {
                        corner1 = {x: xPosition2, y: clientPos.y, 'position': 'after'};
                    }
                }
                //Parellel to xAxis and intersecting with Y axis
                else if (clientPos.x > xPosition1 && clientPos.x < xPosition2) {
                    if (clientPos.y < yPosition1 && clientPos.y < yPosition2) {
                        corner1 = {x: clientPos.x, y: yPosition1, 'position': 'before'};
                    }
                    else {
                        corner1 = {x: clientPos.x, y: yPosition2, 'position': 'after'};
                    }

                }
                else {
                    //runs if no element found!
                    if (clientPos.x < xPosition1 && clientPos.x < xPosition2) {
                        corner1 = {x: xPosition1, y: yPosition1, 'position': 'before'};          //left top
                        corner2 = {x: xPosition1, y: yPosition2, 'position': 'after'};       //left bottom
                    }
                    else if (clientPos.x > xPosition1 && clientPos.x > xPosition2) {
                        //console.log('I m on the right of the element');
                        corner1 = {x: xPosition2, y: yPosition1, 'position': 'before'};   //Right top
                        corner2 = {x: xPosition2, y: yPosition2, 'position': 'after'}; //Right Bottom
                    }
                    else if (clientPos.y < yPosition1 && clientPos.y < yPosition2) {
                        // console.log('I m on the top of the element');
                        corner1 = {x: xPosition1, y: yPosition1, 'position': 'before'}; //Top Left
                        corner2 = {x: xPosition2, y: yPosition1, 'position': 'after'}; //Top Right
                    }
                    else if (clientPos.y > yPosition1 && clientPos.y > yPosition2) {
                        // console.log('I m on the bottom of the element');
                        corner1 = {x: xPosition1, y: yPosition2, 'position': 'before'}; //Left bottom
                        corner2 = {x: xPosition2, y: yPosition2, 'position': 'after'} //Right Bottom
                    }
                }

                distance1 = utils.calculateDistance(corner1, clientPos);

                if (corner2 !== null)
                    distance2 = utils.calculateDistance(corner2, clientPos);

                if (distance1 < distance2 || distance2 === null) {
                    distance = distance1;
                    position = corner1.position;
                }
                else {
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
                }
            });
            if (previousElData !== null) {
                const position = previousElData.position;
                return {'el': $(previousElData.el), 'position': position};
            }
            else {
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
    _decideBeforeAfter(targetElement, mousePercents, mousePos = null) {
        if (mousePos) {
            mousePercents = this._getMouseBearingsPercentage(targetElement, null, mousePos);
        }

        let horizontal = (targetElement.css('display') === "inline" || targetElement.css('display') === "inline-block");
        if (targetElement.is("br"))
            horizontal = false;

        let axis = (horizontal) ? mousePercents.x : mousePercents.y;
        if (axis < 50) {
            return this._placeSide(targetElement, horizontal, true); // Place before
        }
        else {
            return this._placeSide(targetElement, horizontal, false); // Place after
        }
    },
    /***
     * Place inside. The drop marker.
     * @param {JQuery} element
     * @private
     */
    _placeInside(element) {
        const placeholder = this._getDropMarker();
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
    _placeSide(element, horizontal, before) {
        const placeholder = this._getDropMarker();
        if (element.is("td,th")) {
            placeholder.addClass('horizontal').css('width', element.width() + "px");
            return this._addDropMarker(element, before ? "inside-prepend" : "inside-append", placeholder);
        }
        if (horizontal)
            placeholder.addClass("vertical").css('height', element.innerHeight() + "px");
        else
            placeholder.addClass("horizontal").css('width', element.parent().width() + "px");
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
    _addDropMarker(element, position, placeholder) {
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
    _getDropMarker() {
        return $(`<li class='${dropMarkerClass}'></li>`);
    },
    /**
     * Remove placeholder from the whole frame.
     */
    removeDropMarker() {
        dndBase.clientFrame.contents().find(`.${dropMarkerClass}`).remove();
    }, //p
    /**
     * Get new context marker. Used to specify where the parent where object will be placed in.
     * @returns {JQuery|jQuery|HTMLElement}
     */
    _getContextMarker() {
        return $("<div data-dragcontext-marker><span data-dragcontext-marker-text></span></div>");
    },
    /**
     * Add context container to specify where the parent where object will be placed in.
     * @param {JQuery} element
     * @param {string} position - How object will be placed in. [inside, sibling]
     * @private
     */
    _addContainerContext(element, position) {
        let contextMarker = this._getContextMarker();
        this.clearContainerContext();
        let clientContents = dndBase.clientFrame.contents();
        if (element.is('html,body')) {
            position = 'inside';
            element = clientContents.find("body");
        }
        switch (position) {
            case "inside":
                this._positionContextMarker(contextMarker, element);
                if (element.hasClass('stackhive-nodrop-zone'))
                    contextMarker.addClass('invalid');
                let name = this._getElementName(element);
                contextMarker.find('[data-dragcontext-marker-text]').html(name);

                if (clientContents.find("body [data-sh-parent-marker]").length !== 0)
                    clientContents.find("body [data-sh-parent-marker]").first().before(contextMarker);
                else
                    clientContents.find("body").append(contextMarker);
                break;
            case "sibling":
                this._positionContextMarker(contextMarker, element.parent());
                if (element.parent().hasClass('stackhive-nodrop-zone'))
                    contextMarker.addClass('invalid');
                name = this._getElementName(element.parent());
                contextMarker.find('[data-dragcontext-marker-text]').html(name);
                contextMarker.attr("data-dragcontext-marker", name.toLowerCase());
                if (clientContents.find("body [data-sh-parent-marker]").length !== 0)
                    clientContents.find("body [data-sh-parent-marker]").first().before(contextMarker);
                else
                    clientContents.find("body").append(contextMarker);
                break;
        }
    },
    /***
     * Position the marker above the element we will place the object in.
     * @param {JQuery} contextMarker
     * @param {JQuery} element - Where to center/wrap it around
     * @private
     */
    _positionContextMarker(contextMarker, element) {
        const rect = element.get(0).getBoundingClientRect();
        const contentWindowElement = $(dndBase.clientFrameWindow);
        contextMarker.css({
            height: (rect.height + 4) + "px",
            width: (rect.width + 4) + "px",
            top: (rect.top + contentWindowElement.scrollTop() - 2) + "px",
            left: (rect.left + contentWindowElement.scrollLeft() - 2) + "px"
        });
        // If our marker is outside of the top of the frame.
        if (rect.top + dndBase.clientFrame.contents().find("body").scrollTop() < 24) {
            contextMarker.find("[data-dragcontext-marker-text]").css('top', '0px');
        }
    },
    /**
     * Remove the contact container.
     */
    clearContainerContext() {
        dndBase.clientFrame.contents().find('[data-dragcontext-marker]').remove();
    }, //p
    /**
     * Get element name. Pretty straight forward.
     * @param {JQuery} element
     * @private
     */
    _getElementName(element) {
        return element.prop('tagName');
    }
};

export default dndFunctions;