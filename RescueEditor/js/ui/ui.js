/**
 * Not useful on its own. Defines basic functionalities commun to every 
 * blui components. Is meant to be inherited by the various blui components
 * such as tabs and dialog.
 */
class BluiBase {
    
    /**
     * Base constructor. Saves the dom elements that will become the blui element,
     * saves a reference to the body dom element for searching purposes and
     * handles the options]
     * 
     * @param a_dom: The dom element that will become the blui element
     * @param a_options: A javascript object defining options that customize
     * the behavior of the blui element
     * @param a_defaults The defaults that values that will be used as options
     * if the user didn't overwrite them by passing an a_options parameter
     * 
     */
    constructor(a_dom, a_options = {}, a_defaults = {}) {    
        this._dom = a_dom;
        this._body = a_dom.closest('body');
        this._options = Object.assign(a_options, a_defaults);        
    }
    
    /**
     * Obtains the dom elment that became the blui element
     * 
     * @return the dom element
     */
    dom() {
        return this._dom;
    }  
    
    /**
     * Sometims the initialisation of a class needs to perform an ajax request.
     * This isn't a good idea in a class constructor, so the ajaxInit method
     * can be call to perform ajax based initialisation.  
     * 
     * Classes extending BluiBase must override this method if they need
     * ajax based initialisation.
     * 
     * @param a_options An options containing potential options/data  for the 
     * ajaxInit method. In this case, there is no such options available so you
     * can pass nothing when called.
     * 
     * @return A promise
     */
    _ajaxInit() {
    
    }    
    
    /** 
     * Show a dom element that was hidden with hide
     * @param a_dom the dom element that needs to be shown
     * 
     * @return A promise that can be used to execute code after the element
     * has been shown. Not useful yet, but there for future proofing
     */
    static show(a_dom) { 
        a_dom.style.display = '';
        a_dom.removeAttribute('data-hidden');
        return Promise.resolve();
    }
    
    /**
     * Hide a dom element
     * @param a_dom the dom element that needs to be hidden
     * 
     * @return A promise that can be used to execute code after the element
     * has been hidden. Not useful yet, but there for future proofing
     */
    static hide(a_dom) {
        
        a_dom.style.display = 'none';
        a_dom.setAttribute('data-hidden', true);
        return Promise.resolve();
    }
    
    /**
     * Givin a dom element, finds all previous sibblings matching a selector
     * for this dom element
     * 
     * @param a_dom The dom element
     * @param a_sel The selector the sibblings must match
     * 
     * @return an array of previous sibblings matching the selector
     */
    static prevAll(a_dom, a_sel) {
        let previous = [];
        while (a_dom = a_dom.previousElementSibling) 
        { 
            if(a_dom.matches && a_dom.matches(a_sel)) {
                previous.push(a_dom);
            }
        }
        return previous;
    }    
    
    /**
     * Givin a dom element, finds all previous sibblings matching a selector
     * for this dom element
     * 
     * @param a_dom The dom element
     * @param a_sel The selector the sibblings must match
     * 
     * @return an array of previous sibblings matching the selector
     */
    static nextAll(a_dom, a_sel) {
        let previous = [];
        while (a_dom = a_dom.nextElementSibling) 
        { 
            if(a_dom.matches(a_sel)) {
                previous.push(a_dom);
            }
        }
        return previous;
    }      
    
    /**
     * Trigers a  event
     * 
     * @param a_dom The dom element for which the event is triggered
     * @param a_dom A string representing the event
     * 
     */
    static trigger(a_dom, a_event) {
        let event;
        if (window.Event) {
          event = new Event(a_event);
        } else {
          event = document.createEvent('HTMLEvents');
          event.HTMLEvents(a_event, true, false);
        }

        a_dom.dispatchEvent(event);        
    }    
    
    /**
     * Trigers a custom event
     * 
     * @param a_dom The dom element for which the custom event is triggered
     * @param a_dom A string representing the custom event
     * @param a_data A javascript object containing the custom event's data
     * 
     */
    static triggerCustom(a_dom, a_event, a_data) {
        let event
        if (window.CustomEvent) {
          event = new CustomEvent(a_event, {detail: a_data});
        } else {
          event = document.createEvent('CustomEvent');
          event.initCustomEvent(a_event, true, true, a_data);
        }

        a_dom.dispatchEvent(event);        
    }
    
    /**
     * I convert a string containing html to the corresponding
     * dom elements tree 
     * 
     * 
     * @param [string] The html   
     * 
     * @returns {BLRE.HtmlTemplateHandler} A node list containing the dom elements
     **/
    static parseHtml(a_html) {
        a_html = a_html.trim();
        let container = document.createElement('div');
        
        if(a_html.startsWith('<tr')) {
            let table = document.createElement('table');
            container = document.createElement('tbody');
            table.appendChild(container);
        } else if(a_html.startsWith('<td')) {
            let table = document.createElement('table');
            let tbody = document.createElement('tbody');
            container = document.createElement('tr');
            
            table.appendChild(tbody);   
            tbody.appendChild(container);
            
        }
        
        container.innerHTML = a_html;

        let elements = container.children;
       
       if(elements.length > 1) {
            return elements;
       } else if (elements.length === 1) {
           return elements[0];
       }
       
       return undefined;
     
    }    
    
}

/**
 * Constructor for BlreRescue. Takes a dom element and converts it into
 * a dialog.
 * @param a_dom: The dom element that will become the dialog
 * @param options: A javascript object defining options that customize
 * the behavior of the dialog. There are currently no options available.
 */
class BlUiDialog extends BluiBase { 
    /**
     * Consstructor 
     * 
     * @param a_dom: The dom element that will become the dialog
     * @param a_options: A javascript object defining options that customize
     * the behavior of the dialog
     * 
     */
    constructor(a_dom, a_options = {}) {
        let defaults = {
            modal: true
        };        
       super(a_dom, a_options, defaults);
       
       //Classes and attributes used by the BlUiDialog
       this._selectors = {
            classes: {
                dialog: 'blui-dialog',
                topmost: 'blui-dialog-topmost',
                focusableProcessed: 'blui-dialog-focusable-processed',
                overlay: 'blui-dialog-overlay',
                closeButton: 'blui-close'
            },
            attributes: {
                tmpTabindex: 'data-blui-tabindex-tmp'
            }
        }
        
        // Events fired by the bluiDialog
        this._events ={
            opening: 'blui-event-dialog-opening',
            opened: 'blui-event-dialog-opened',
            closing: 'blui-event-dialog-closing',
            closed: 'blui-event-dialog-closed',
            creating: 'blui-event-dialog-creating',
            created: 'blui-event-dialog-created'
           
        }        
        
        BluiBase.triggerCustom(this._dom, this._events.creating, {ui: this});
  
        this._content = a_dom.querySelector('.blui-dialog-content');
        
        // Add an overlay to the body so it can be displayed behind the dialog
        // if it is modal. this makes the content under the dialog unclickable
        this._overlay = BluiBase.parseHtml(`<div class="${this._selectors.classes.overlay}"></div>`);
        this._body.appendChild(this._overlay);
        BluiBase.hide(this._overlay);
 
        this._dom.classList.add(this._selectors.classes.dialog);
        
        this._dom.addEventListener('click', (e) => {
            if(e.target) {
                if(e.target.matches('.' + this._selectors.classes.closeButton)) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.close();
                }
            }
        });
        
        window.addEventListener('resize', (e) => {
            this._repositionDialog();   
        });
 
        
        BluiBase.hide(this._dom);
        
        BluiBase.triggerCustom(this._dom, this._events.created, {ui: this});
        
    }
    
    /**
     * Opens the dialog, in other word it becomes visible.
     * 
     * @return A promise that can  be used to execute code after the dialog
     * has been opened. Currently useless, but does this for future proofing
     * in case animations are added to hide/show
     */
    open() {
        BluiBase.triggerCustom(this._dom, this._events.opening, {ui: this});							 

        // Prepare zIndex for dialog that is opening. the zIndex must
        // higher than that of all other opened dialog.
        let zIndex = 100000; 
       let topmostDom = this._body.querySelector('.' + this._selectors.classes.topmost);
       if(topmostDom) {
           zIndex = parseInt(topmostDom.style.zIndex);
           topmostDom.classList.remove(this._selectors.classes.topmost);
       }

        this._dom.classList.add(this._selectors.classes.topmost);
        this._dom.style.zIndex = zIndex + 2;

        if(this._options.modal) {
            // Display overlay so can't click what's below the opened dialog
            this._overlay.style.zIndex = zIndex + 1;
            BluiBase.show(this._overlay);

            this._removeFocus();

        }

        this._repositionDialog();

        //Makes sure the elements part of thee newly opened topmost 
        //dialog can  receive keyboard focus
        this._returnFocus(this._dom);

        BluiBase.show(this._dom).then(() => {
          
            BluiBase.triggerCustom(this._dom, this._events.opened, {ui: this});
            BluiBase.trigger(window, 'resize');   
            return Promise.resolve();
        });	

    }
    
    /**
     * Closes the dialob
     * 
     * @return A promise that can  be used to execute code after the dialog
     * has been opened. Currently useless, but does this for future proofing
     * in case animations are added to hide/show
     */
    close() {
        BluiBase.triggerCustom(this._dom, this._events.closing, {ui: this});					 

        return BluiBase.hide(this._dom).then(() => {
            this._dom.classList.remove(this._selectors.classes.topmost);
            let topMostDialogDom = this._getTopmostDialogDom();

            if(topMostDialogDom) {
                topMostDialogDom.classList.add(this._selectors.classes.topmost);

            } else {
                topMostDialogDom = this._body;
            }

            this._returnFocus(topMostDialogDom);

            BluiBase.hide(this._overlay);
            BluiBase.triggerCustom(this._dom, this._events.closed, {ui: this});	
                      
        });					       
    }
    
    /**
     * Change the content of the dialog to new HTML
     * @param a_htmlContent a string containing HTML forming the new content
     * of the dialog,or a dom element reprenting this HTML.
     */
    setContent(a_htmlContent) { 
        if(typeof a_htmlContent === 'string') { 
            this._content.innerHTML = a_htmlContent;
        } else {
            this._content.innerHTML = '';
            this._content.appendChild(a_htmlContent)
        }
            
    }
    
    /**
     * Obtains the dom element representing  thetopmost dialog based on zIndex
     * 
     * @return A dom element represening the topmost dialog
     */
    _getTopmostDialogDom() {
        let dialogs = Array.from(this._body.querySelectorAll('.' + this._selectors.classes.dialog + ':not([hidden])'));
        let topMostDialogDom = this._body.querySelector('.' + this._selectors.classes.dialog + ':not([hidden])');
        for(let dialogDom of dialogs) {
            let curZIndex = parseInt(dialogDom.style.zIndex);
            let topmostZIndex = parseInt(topMostDialogDom.style.zIndex);

            if(topmostZIndex > curZIndex) {
                topMostDialogDom = dialogDom;
            }                
        }
        
       return topMostDialogDom;
    }
    
    /**
     * Make every element are focusable, below the opened dialog an dnot part of another hidden dialog unfocusable
     * so its impossible to tab to an element that is outside the opened (topmost) modal dialog    
     **/
    _removeFocus() {
        let canHaveFocus = Array.from(this._body.querySelectorAll('a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, *[tabindex], *[contenteditable]'));
        for(let dom of canHaveFocus) {
                   if(!dom.matches('.' + this._selectors.classes.focusableProcessed) 
                        && dom.closest('.' + this._selectors.classes.topmost) 
                        && dom.closest('.' + this._selectors.classes.dialog + '[data-hidden]').length <= 0) {

                           if(dom.matches('*[tabindex]')) {
                                dom.setAttribute(this._selectors.attributes.tmpTabindex, dom.getAttribute('tabindex'));
                           }
                           dom.setAttribute('tabindex', -1);
                           dom.classList.add(this._selectors.classes.focusableProcessed);
                   }

           };        
    }
    
    /**
     * Returns the possibity of beein focused on the element that had this ability
     * removed by _removeFocus()
     */
    _returnFocus(a_containerDom) {
        let toGetFocusBackDom = Array.from(a_containerDom.querySelectorAll(this._selectors.classes.focusableProcessed));
        for(let dom of toGetFocusBackDom) {
            if(dom.matches('*[tabindex=-1]')) {
                dom.removeAttribute('tabindex');
            }
            
            if(dom.matches('[' + this._selectors.attributes.tmpTabindex + ']')) {
                dom.setAttribute('tabindex', dom.getAttribute(this._selectors.attributes.tmpTabindex));
                dom.removeAttribute(this._selectors.attributes.tmpTabindex);
            }
            
            dom.classList.remove(this._selectors.classes.focusableProcessed);
        }	       
    }
    
    /**
     * Position the dialog correctly on the screen after the window's has been
     * resized.
     */
    _repositionDialog() {
   
        let diffWidth =  (window.innerWidth - this._dom.offsetWidth ) / 2;
        let diffHeight = 0;
        diffHeight = (window.innerHeight - this._dom.offsetHeight) / 2;

        diffWidth = diffWidth > 0 ? diffWidth : 0 
        diffHeight = diffHeight > 0 ? diffHeight : 100;

        this._dom.style.top = (diffHeight + window.scrollY) + 'px';
        this._dom.style.left  = diffWidth + 'px';   
    }
}

/**
 * A class that can be used to create and insert the rescue editor's UI
 * into a page.
 */
class BlreRescueUi extends BluiBase {
    
    /**
     * Constructor for BlreRescue. Takes a dom element and converts it into
     * the editor.
     * @param a_dom: The dom element that will become the editor
     * @param options: A javascript object defining options that customize
     * the behavior of the editor. There are currently no options available.
     */
    constructor(a_dom, a_options = {}) {
        super(a_dom, a_options, {})
        let dialogDom = BluiBase.parseHtml(`
                                        <div>
                                            <a href="#" class="blui-close">X</a>
                                            <div class="blui-dialog-content"></div>
                                        </div>
                                     `);
        this._body.appendChild(dialogDom);
        this._dialog = new BlUiDialog(dialogDom);
        this._domData = new Map();
     
        this._blockIdBase = 'blre-block-';
        this._selectors = BLRE.events.trigger('blre-event-get-templating-selectors');
        
       //Expands the selectors obtained from the templating module with 
       //selctors used for the UI's varius buttons
        this._selectors.classes = Object.assign(this._selectors.classes, {
            addButton: 'blre-add-button',
            editButton: 'blre-edit-button',
            deleteButton: 'blre-delete-button',
            blockSelectedToAddButton: 'blre-selected-to-add-button',
            blockLabel: 'blre-block-label',
            fakeSubmit: 'blui-fake-submit'
        });
        
        // When the user clicks one of the add buttons in the UI,
        // this property is set to a dom element representing the
        // clicked button. 
        this._clickedAddButtonDom = undefined;
        
        // Handles what happens when the usesr clicks one of the various 
        //button types available in the UI
        this._dom.addEventListener('click', (e) => {
            if(e.target) {
                if(e.target.matches('.' + this._selectors.classes.addButton)) {
                    e.preventDefault();
                    e.stopPropagation();
                    // Find the closest ancestor dom element that is the block that can have
                    // children, or the first block that is can't have children, but contains
                    // a non block dom element that can have chidren
                    let blockDom = e.target;
                    blockDom = blockDom.closest('.' + this._selectors.classes.hasChildren);
                   
                    if(!blockDom.matches('.' + this._selectors.classes.block)) {
                        blockDom = blockDom.closest('.' + this._selectors.classes.block);
                    }  
                    
                    this.showBlockSelectionDialog(blockDom, e.target);   
                    
                } else if(e.target.matches('.' + this._selectors.classes.editButton)) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    let toEdit = e.target.closest('.' + this._selectors.classes.block);   
                    this.showEditDialog(toEdit);
                } else if(e.target.matches('.' + this._selectors.classes.deleteButton)) {
                    e.preventDefault();
                    e.stopPropagation();
                    
                    // Delete the block in "backend" (composite module)
                    let toDelete = e.target.closest('.' + this._selectors.classes.block);            
                    this.deleteBlock(toDelete);                    
                    
                }                  
            }
        });
       
        this._dialog.dom().addEventListener('click', (e) => {
                  e.preventDefault();
                    e.stopPropagation();
            if(e.target) {
                if(e.target.matches('.' + this._selectors.classes.blockSelectedToAddButton)) {
              

                    let blockTypeButtonDom = e.target;

                    if(!blockTypeButtonDom.matches('a[' + this._selectors.attributes.blockType + ']')) {
                        blockTypeButtonDom = blockTypeButtonDom.closest('a[' + this._selectors.attributes.blockType + ']');
                    }            

                    let type = blockTypeButtonDom.getAttribute(this._selectors.attributes.blockType);
                    let parent = this._clickedAddButtonDom.closest('.' + this._selectors.classes.block);

                    this.addBlock(type, parent, this._clickedAddButtonDom);                        
                } else if(e.target.matches('.' + this._selectors.classes.fakeSubmit)) {
                    e.preventDefault();
                    e.stopPropagation(); 

                    let formDom = this._dialog.dom().getElementsByTagName('form')[0];

                    let newValues = this._prepareEditFormValues(formDom);

                    let editedBlockId = formDom.getAttribute('data-edited-block-id');
                    this.editBlock(document.getElementById(editedBlockId), newValues);
                }
            } 
        });

    }
    
    /**
     * Sometims the initialisation of a class needs to perform an ajax request.
     * This isn't a good idea in a class constructor, so the ajaxInit method
     * can be call to perform ajax based initialisation. 
     * 
     * In the case of BlreRescueUi, this method create the root html block
     * of the editor. 
     * 
     * @param a_options An options containing potential options/data  for the 
     * ajaxInit method. In this case, there is no such options available so you
     * can pass nothing when called.
     * 
     * @return A promise
     */
    _ajaxInit() {
         let promise = BLRE.events.trigger('blre-async-html-persistance-create-root');
        
         return promise.then(
            a_values => {
                let [rootId, rootHtml] = a_values;
                let rootDom = BluiBase.parseHtml(rootHtml);
                rootDom.setAttribute('id', this._blockIdBase + rootId);
                this._dom.appendChild(rootDom);
               
                this._blockify(rootDom, false);
            });
    }
    
    /**
     * Displaly a dialog showing which type of blocks can be children of a
     * given block (reprented) by a dom element).
     * 
     * @param a_blockDom A dom object representing the block for which the
     * dialog is shown
     * 
     * @return a promise that can be used to excute code after the dialog is shown
     */
    showBlockSelectionDialog(a_blockDom, a_addButtonDom) {
        a_blockDom = a_blockDom;
        
        let listId = a_blockDom.getAttribute(this._selectors.attributes.allowedChildrenList);

        // Get the list of blocks that can be added a this location so the
        // user can choose which one to add
        let promise = BLRE.events.trigger('blre-async-io-get-list-html-blocks', {id: listId});

            promise.then(data => {

                // Prepare a HTML list of available block types and show it
                // to the user using a dialog
                let dialogContent = '<ul>';
                for(let key in data) {
                    for(let key2 in data[key]) {
                        dialogContent += `<li>
                                            <a href="" class="${this._selectors.classes.blockSelectedToAddButton}" ${this._selectors.attributes.blockType}="${key2}">${key2}</a>
                                          </li>`;
                    }
                }
                dialogContent += '</ul>'
                this._clickedAddButtonDom = a_addButtonDom;
               
                this._dialog.setContent(dialogContent);
                this._dialog.open();
            });                 
    }
    
    /**
     * Add an actual new block to the page being created (as well as to the UI)
     * 
     * @param a_blockType: A
     * 
     * @return A promise that can be used to execute code once the block is added
     */
    addBlock(a_blockType, a_parentDom, a_clickedAddButtonDom) {
                   
        this._dialog.close();

        // Preform the templating tasks necessary for the new block's creation
        // and saves the block into the persistance module
        let promise = BLRE.events.trigger('blre-async-templating-add-new-block', {
            blockType: a_blockType,
            parentId: this._extractGlobalId(a_parentDom),
            index: this._getAddButtonIndex(a_clickedAddButtonDom)
        });

        //Once the new block has been sucessfully add to the persistance layer,
        // modify the UI to reflect the addition of the new block.
        return promise.then(blockData => {           
            //Put the UI for the new block before the add button that was clicked
            let [blockId, html, parentId] = blockData;
            let toAddDom = BluiBase.parseHtml(html);
            a_clickedAddButtonDom.insertAdjacentHTML('beforebegin', toAddDom.outerHTML);
            this._blockify(a_clickedAddButtonDom.previousElementSibling);
            
            
    
           // call a custom even indicating a block of the given type has been
           // created. This allows to excute custom code when a block is added
           let eventName = 'blre-block-added-' + a_blockType;
           if(BLRE.events.exists(eventName)) {
               let result = BLRE.events.trigger(eventName, {blockDom: toAddDom });
               //this._dom.data('blre-form-input-custom-data', result);
           }        
           
           this._fireActionEvent();
        });        
        
    }
    
    /**
     * Show the edit diable of a specified block. This edit dialog can be used
     * to modify the block contents and options.
     * 
     * @param a_forBlockDom: a Dom element representing the block for which the dialog is shown
     * 
     * @return A promise that can be used to execute code once the dialog is
     * displayed
     */
    showEditDialog(a_forBlockdom) {

       let forBlockId = this._extractGlobalId(a_forBlockdom);

        // Obtains the edit form for this block and display it in a dialog
       let promise = BLRE.events.trigger('blre-async-templating-get-block-edit-form', {
            blockId: forBlockId,              
            blockType: a_forBlockdom.getAttribute(this._selectors.attributes.blockType),

        });

        return promise.then(form => {
            
            this._dialog.open();             
            
            let formDom = BluiBase.parseHtml(form);
            let submits = Array.from(formDom.querySelectorAll('[type=submit]'));
            for(let submit of submits) {
                submit.parentNode.removeChild(submit);
            }
            
            formDom.appendChild(BluiBase.parseHtml(`<input type="button" class="${this._selectors.classes.fakeSubmit}" value="submit"/>`));
            
            
            formDom.setAttribute('data-edited-block-id', a_forBlockdom.getAttribute('id'));
            this._dialog.setContent(formDom.outerHTML);
            formDom = this._dialog._dom.getElementsByTagName('form')[0];
            // fire an event for every input in the form. 
            // custom code can be excuted via those events
            // to create custom inputs.
            let inputs = Array.from(formDom.querySelectorAll('input, textarea'));
            for(let input of inputs) {
                let eventName = 'blre-form-input-init-' + (input.matches('textarea') && !input.getAttribute('type') ? 'textarea' : input.getAttribute('type'));

                if(BLRE.events.exists(eventName)) {
                    let result = BLRE.events.trigger(eventName, {input: input});
                    this._domData.set(this._dom, {'blre-form-input-custom-data': result});
                    
                }
            };
            
           
       });           
    }
    
    /**
     * Changes a block's content/option with new values
     * 
     * @param a_dom a_block A dom element replresenting the edited block
     * @param a_newValues a_newValues The new values that are applied to the block
     * 
     * @return A promise that can be used to execute code once the block
     * is edited.
     */
    editBlock(a_block, a_newValues) {
       
       let eventName = 'blre-block-before-edit-' + a_block.getAttribute(this._selectors.attributes.blockType);

       if(BLRE.events.exists(eventName)) {
           let result = BLRE.events.trigger(eventName, {blockDom: a_block, formData: a_newValues});
          // this._dom.data('blre-form-input-custom-data', result);
       }              

        let newHtml = BLRE.events.trigger('blre-templating-apply-edits-to-block-html', {
            blockId: this._extractGlobalId(a_block),
            formData: a_newValues
        });

        let newHtmlDom = BluiBase.parseHtml(newHtml);


        newHtmlDom.setAttribute(this._selectors.attributes.blockType, a_block.getAttribute(this._selectors.attributes.blockType));
        a_block.insertAdjacentHTML('beforebegin', newHtmlDom.outerHTML);
       
        newHtmlDom = a_block.previousElementSibling;
        a_block.parentNode.removeChild(a_block);
       // a_block.outerHTML = newHtmlDom.outerHTML;
        this._blockify(newHtmlDom, false);

        this._dialog.close(); 
        
        this._fireActionEvent();
    }
    
    /**
     * Deletes a block from the created page and UI
     * 
     * @param a_blockDom A dom element representing the block that will be deleted
     * 
     * return True if the block was deleted. False if the blocck wasn't delete
     * due to user cancellation
     */
    deleteBlock(a_blocDdom) {
       let sure = confirm('Are you sure you want to delete this block?');
       
       if(sure) {
            let eventName = 'blre-block-remove-' + a_blocDdom.getAttribute(this._selectors.attributes.blockType);

            // Fire a special event indicating that the block has been delete.
            // can be used to implement customs blocks
            if(BLRE.events.exists(eventName)) {
                let result = BLRE.events.trigger(eventName, {blockDom: a_blocDdom});
                //this._dom.data('blre-form-input-custom-data', result);
            }                

             // delete the block in the persistance module
             BLRE.events.trigger('blre-html-persistance-delete-node', {blockId: this._extractGlobalId(a_blocDdom)});

             // Delete the block in UI
             let addButtonDom = BluiBase.prevAll(a_blocDdom, '.' + this._selectors.classes.addButton)[0];
             addButtonDom.parentNode.removeChild(addButtonDom); 
             a_blocDdom.parentNode.removeChild(a_blocDdom);        
             this._fireActionEvent();
             return true;
        }
        
        return false;
    }
    
    /**
     * Get the final results of the editor: HTML that can be used in a website,
     * an HTML page's content in other words.
     * 
     * @return string the final HTML
     */
    getFinalHtml() {
        
        let rootDom = this._dom.querySelector('.' + this._selectors.classes.root);
        let finalHtml = BLRE.events.trigger('blre-html-persistance-render-node-html', {blockId: this._extractGlobalId(rootDom)});
        let finalDom = BluiBase.parseHtml(finalHtml);
    
        
        let blocks = Array.from(finalDom.querySelectorAll('.' + this._selectors.classes.block));
        for(let block of blocks) {
            block.classList.remove(this._selectors.classes.block);
            block.classList.remove(this._selectors.classes.editable);
            block.classList.remove(this._selectors.classes.deletable);
            block.removeAttribute(this._selectors.attributes.allowedChildrenList);
            block.removeAttribute(this._selectors.attributes.blockType);
        }
        
        let hasChildren = Array.from(finalDom.querySelectorAll('.' + this._selectors.classes.hasChildren));
        for(let hasChild of hasChildren) {
            hasChild.classList.remove(this._selectors.classes.hasChildren);
        }    
        
        return finalDom.innerHTML;        
    }
    
    /**
     * Obtains data that can be used to reconstruct the page that is currently
     * been worked on. This data can then be used to save an editor page
     * @returns {unresolved} Serialized data representing the editor page
     * that is currently been worked on
     */
    prepareSaveData() {
        return BLRE.events.trigger('blre-html-persistance-serialize');     
    }
    
    /**
     * Fills the editor with a page based on given serialized data
     * @param {type} a_data The data used to rebuild the page.
     * @returns {undefined} nothing
     */
    loadFromData(a_data) {
        
         let node = BLRE.events.trigger('blre-html-persistance-deserialize', {toLoad: a_data});     
         let htmlDom = BluiBase.parseHtml(BLRE.events.trigger('blre-html-persistance-render-node-html', {blockId: node.globalId}));
         
         this._blockify(htmlDom);
         
         this._dom.innerHTML = htmlDom.outerHTML;
    }
    
    
    /**
     * Save the page currently been worked on
     * @returns {unresolved} a Promise that can be used to execute code once the
     * page has been saved
     */
    Save() {
        let page = this.prepareSaveData();
        
        let formData = new FormData();
        formData.append('rescueFileData', page);
        
        return BLRE.events.trigger('blre-async-io-save-editor-file', {fileData: formData});
    }
    
    /**
     * Loads  a saved page back
     * @param {type} a_id Id used to identify the saved page
     * @returns A promise that can be used to execute code once the page is loaded
     */
    Load(a_id) {
        let promise = BLRE.events.trigger('blre-async-io-get-editor-file', {id: a_id});
        
        return promise.then((page) => {
            this.loadFromData(page);
        });
    }
    
 /**
   * A helper function that takes a selector representing a HTML block and adds
   * the apporpriate UI elements, such as add buttons, edit buttons and delete
   * buttons
   * 
   * @param {type} a_blockDom Selector representing the HTML block
   * @param {type} a_hasAddButtonAbove True, neesd need to add a add button
   * above itself, false it does not. Defaults to true
   * @returns {undefined} Nothing
   */
   _blockify(a_blockDom, a_hasAddButtonAbove = true) {
       
        let prepareAddButton = () => {
            return BluiBase.parseHtml(
                 `<a href="#" class="${this._selectors.classes.addButton}">+</a>`
            )
        }
        
        let prepareEditButton = () => {
            return BluiBase.parseHtml(
                 `<a href="#" class="${this._selectors.classes.editButton}">Edit</a>`
            )
        }        
        
        let prepareDeleteButton = () => {
            return BluiBase.parseHtml(
                 `<a href="#" class="${this._selectors.classes.deleteButton}">X</a>`
            )
        }
        
        let prepareLabel = (text) => {
            return BluiBase.parseHtml(
                 `<span class="${this._selectors.classes.blockLabel}">${text}</a>`
            )
        }
         
        
        // Place and add button above the blockified block and children blocks.
        
       
        let blocks = Array.from(a_blockDom.querySelectorAll('.' + this._selectors.classes.block + ':not(' + this._selectors.classes.root + ')'));
        blocks.unshift(a_blockDom);
        for(let blockDom of blocks) {
            //Give the blockified block an edit and delete button
            
            
           if(blockDom.classList.contains(this._selectors.classes.deletable)) {
               blockDom.appendChild(prepareDeleteButton());
           }
           
           if(blockDom.classList.contains(this._selectors.classes.editable)) {
               blockDom.appendChild(prepareEditButton())
           }
           
           blockDom.insertAdjacentHTML('beforebegin', prepareAddButton().outerHTML);
           
           if(!blockDom.classList.contains(this._selectors.classes.root)) {
               blockDom.appendChild(prepareLabel(blockDom.getAttribute(this._selectors.attributes.blockType)));
           }
        }  
        
        // Find the "inner blocks" that can have children and append a add button to them so children can be added.       
        let children = Array.from(a_blockDom.querySelectorAll('.' + this._selectors.classes.hasChildren));
        if(a_blockDom.classList.contains(this._selectors.classes.hasChildren)) {
            children.unshift(a_blockDom);
        }
        for(let child of children) {
            child.appendChild(prepareAddButton());
        }         
        
        
        
        // If the add button from abose isn't actually needed, remove it
        
        if(!a_hasAddButtonAbove) {
            let prevDom = a_blockDom.previousElementSibling;
            prevDom.parentNode.removeChild(prevDom);
        }        
        
    }
    
 /**
   * Takes a jquery object representing a UI html block and determines the 
   * numerical global ID linked to the block
   * @param {type} $sel A DOM element representing the UI html block
   * @returns {unresolved} The numerical global ID
   */
  _extractGlobalId(a_blockDom) {
      return a_blockDom.getAttribute('id').replace('blre-block-', '');
  }
  
  /**
   *  Get the index of an add button. Useful to figure where a new block must
   *  be added
   * @param {type} a_addButtonDom A dom element representing the add button
   * @returns {unresolved} The add button's index
   */
  _getAddButtonIndex(a_addButtonDom) {
      let children = Array.from(a_addButtonDom.parentNode.children);
      let addBlocks = [];
      for(let child of children) {
          if(child.classList.contains(this._selectors.classes.addButton)) {
              addBlocks.push(child);
          }
      }
      
      
     return addBlocks.indexOf(a_addButtonDom);
     
  }    
    
   /**
    * Extract the values inputed into an HTML form and formats it
    * in a way that it can be used to create a edit a block
    * 
    * @param a_formDom: A dom object representing the edit form
    * 
    * @return An array containing the edit values in a format that can
    * be used to edit a block with said values.
    */
  _prepareEditFormValues(a_formDom) {
        let results = [];
        
        
        let inputs = Array.from(a_formDom.querySelectorAll('input, textarea'));
        for(let input of inputs) {
          
            // If tere is a custom event impleted to obtain the value of the
            // input, fire that events to get the input value. if not,
            // simply use the normal method
            let event = 'blre-form-input-get-value-' + input.getAttribute('type');
            let val;
            if(BLRE.events.exists(event)) {
                let data = this._domData.get(this._dom)['blre-form-input-custom-data']
                data.input = input;
                val = BLRE.events.trigger(event, data);
                 
            } else {
                
                val = input.value;     
            }
        
           results.push({
               name: input.getAttribute('name'),
               value: val
           })

           

        }
    
        return results;
  }
  
  _fireActionEvent() {
        let eventName = 'blre-ui-action-happened';
        if(BLRE.events.exists(eventName)) {
            let result = BLRE.events.trigger(eventName);
        }      
  }
    
}

