/**
 * Created by EgorDm on 28-May-2017.
 */
import dndFunctions from "./dndFunctions";

/***
 * @type {JQuery|jQuery|HTMLElement}
 */
export const clientFrame = $('#clientframe');
/***
 * @type {Window}
 */
export const clientFrameWindow = clientFrame.get(0).contentWindow;


let dndBase = {
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
    init() {
        console.log('Initializing Drag and Drop');
        dndFunctions.init();
        $('#dragitemslistcontainer').find('li')
            .on('dragstart', this._dragStart)
            .on('dragend', this._dragEnd);
        clientFrame.on('load', this._frameLoad)
    },
    /**
     * Start of dragging a draggable element callback
     * @param {jQuery.Event|Event} event
     * @private
     */
    _dragStart(event) {
        console.log("Drag Started");
        dndBase.dragoverqueue_processtimer = setInterval(function () {
            dndFunctions.processDragOverQueue();
        }, 100);
        const insertingHTML = $(this).attr('data-insert-html');
        event.originalEvent.dataTransfer.setData("Text", insertingHTML);
    },
    /**
     * End of dragging a draggable element callback
     * @param {jQuery.Event|Event} event
     * @private
     */
    _dragEnd(event) {
        console.log("Drag Ended");
        clearInterval(dndBase.dragoverqueue_processtimer);
        dndFunctions.removeDropMarker();
        dndFunctions.clearContainerContext();
    },
    /**
     * The Iframe has been loaded callback
     * @private
     */
    _frameLoad() {
        const style = $("<style data-reserved-styletag></style>").html(insertionCss);
        $(clientFrameWindow.document.head).append(style);

        const htmlBody = $(clientFrameWindow.document).find('body,html');
        htmlBody.find('*').addBack()
            .on('dragenter', dndBase._frameDragEnter)
            .on('dragover', dndBase._frameDragOver);
        $(clientFrameWindow.document).find('body,html').on('drop', dndBase._frameDragDrop);
    },
    /**
     * Dragging entered the element inside the iframe callback.
     * @param {jQuery.Event|Event} event
     * @private
     */
    _frameDragEnter(event) {
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
    _frameDragOver(event) {
        event.preventDefault();
        event.stopPropagation();
        if (dndBase.countdown % 15 !== 0 && dndBase.currentElementChangeFlag === false) {
            dndBase.countdown += 1;
            return;
        }
        event = event || window.event;

        const x = event.originalEvent.clientX;
        const y = event.originalEvent.clientY;
        dndBase.countdown += 1;
        dndBase.currentElementChangeFlag = false;
        const mousePosition = {x: x, y: y};
        dndFunctions.addEntryToDragOverQueue(dndBase.currentElement, dndBase.elementRectangle, mousePosition)
    },
    /**
     * Object is droppped on an element inside the iframe callback.
     * @param {jQuery.Event|Event|object} event
     * @private
     */
    _frameDragDrop(event) {
        event.preventDefault();
        event.stopPropagation();
        console.log('Drop event');
        let e;
        if (event.isTrigger)
            e = triggerEvent.originalEvent;
        else {
            e = event.originalEvent;
        }
        try {
            const textData = e.dataTransfer.getData('text');
            const insertionPoint = clientFrame.contents().find(".drop-marker");
            const checkDiv = $(textData);
            insertionPoint.after(checkDiv);
            insertionPoint.remove();
        } catch (e) {
            console.log(e);
        }
    }
};

export const insertionCss = `.reserved-drop-marker{width:100%;height:2px;background:#00a8ff;position:absolute}.reserved-drop-marker::after,.reserved-drop-marker::before{content:'';background:#00a8ff;height:7px;width:7px;position:absolute;border-radius:50%;top:-2px}.reserved-drop-marker::before{left:0}.reserved-drop-marker::after{right:0} \
[data-dragcontext-marker],[data-sh-parent-marker]{outline:#19cd9d solid 2px;text-align:center;position:absolute;z-index:123456781;pointer-events:none;font-family:'Helvetica Neue',Helvetica,Arial,sans-serif}[data-dragcontext-marker] [data-dragcontext-marker-text],[data-sh-parent-marker] [data-sh-parent-marker-text]{background:#19cd9d;color:#fff;padding:2px 10px;display:inline-block;font-size:14px;position:relative;top:-24px;min-width:121px;font-weight:700;pointer-events:none;z-index:123456782}[data-dragcontext-marker].invalid{outline:#dc044f solid 2px}[data-dragcontext-marker].invalid [data-dragcontext-marker-text]{background:#dc044f}[data-dragcontext-marker=body]{outline-offset:-2px}[data-dragcontext-marker=body] [data-dragcontext-marker-text]{top:0;position:fixed} \
.drop-marker{pointer-events:none;}.drop-marker.horizontal{background:#00adff;position:absolute;height:2px;list-style:none;visibility:visible!important;box-shadow:0 1px 2px rgba(255,255,255,.4),0 -1px 2px rgba(255,255,255,.4);z-index:123456789;text-align:center}.drop-marker.horizontal.topside{margin-top:0}.drop-marker.horizontal.bottomside{margin-top:2px}.drop-marker.horizontal:before{content:"";width:8px;height:8px;background:#00adff;border-radius:8px;margin-top:-3px;float:left;box-shadow:0 1px 2px rgba(255,255,255,.4),0 -1px 2px rgba(255,255,255,.4)}.drop-marker.horizontal:after{content:"";width:8px;height:8px;background:#00adff;border-radius:8px;margin-top:-3px;float:right;box-shadow:0 1px 2px rgba(255,255,255,.4),0 -1px 2px rgba(255,255,255,.4)}.drop-marker.vertical{height:50px;list-style:none;border:1px solid #00ADFF;position:absolute;margin-left:3px;display:inline;box-shadow:1px 0 2px rgba(255,255,255,.4),-1px 0 2px rgba(255,255,255,.4)}.drop-marker.vertical.leftside{margin-left:0}.drop-marker.vertical.rightside{margin-left:3px}.drop-marker.vertical:before{content:"";width:8px;height:8px;background:#00adff;border-radius:8px;margin-top:-4px;top:0;position:absolute;margin-left:-4px;box-shadow:1px 0 2px rgba(255,255,255,.4),-1px 0 2px rgba(255,255,255,.4)}.drop-marker.vertical:after{content:"";width:8px;height:8px;background:#00adff;border-radius:8px;margin-left:-4px;bottom:-4px;position:absolute;box-shadow:1px 0 2px rgba(255,255,255,.4),-1px 0 2px rgba(255,255,255,.4)}`;

export default dndBase;