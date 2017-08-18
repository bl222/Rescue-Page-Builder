/*
        Programmed By Benoit Lanteigne
        (c) Benoit Lanteigne, all rights reserved
        Licenced under GNU Affero General Public License 
    */
/**
 * Programmed by Benoit Lanteigne
 *  
 * Here is defined the HTML templating module. It handles HTML Blocks templates. 
 * In many ways, the HTML blocks templates are the core of rescue. The rescue editor
 * form web pages by fitting block templates togheter, a bit like a puzzle. The HTML block
 * template are written in what for now we'll call blreML (name subject to change).
 * If you know how to write HTML, than brlsEM will be easy to use.
 * 
 * In order to understand the html templating module’s job better, let’s examine 
 * an html block template’s syntax. 
 * First, every HMTL block begins by a parent tag named block
 * 
 * <block>
 * 
 * </block>
 * 
 * This is where it might get complicated. Every HTML block template is actually
 * composed of three templates: the content template, the editor template and the 
 * and the defaults template. Each of these are handled by the BlreHtmlTemplateHandler.
 * Here's how blreML now looks:
 * 
 * <block>
 *     <content></content>
 *     <editor></editor>
 *     <defaults></defaults>
 * <block>
 * 
 * Note that the editor and default templates are optional, however, the content
 * template is obligatory.
 * 
 * Let's examine the three template within a block template individually starting
 * with content.
 * 
 * The content template defines  HTML that can be inserted into a page being 
 * built. There is one important rule:  The html within the content template must
 * have a single root element. As an exemple
 * 
 * This is allowed:
 * 
 * <block>
 *     <content>
 *          <p>This is a paragraph</p>
 *     </content>
 *     <editor></editor>
 *     <defaults></defaults>
 * <block>
 * 
 * But this is NOT allowed: 
 * <block>
 *     <content>
 *          <p>This is a paragraph</p>
 *          <p>This is a paragraphToo!</p>
 *     </content>
 *     <editor></editor>
 *     <defaults></defaults>
 * <block>
 * 
 * Let's the the first valid exemple again:
 * <block>
 *     <content>
 *          <p>This is a paragraph</p>
 *     </content>
 *     <editor></editor>
 *     <defaults></defaults>
 * <block>
 * 
 * using this block HTML template, it would be possible to add a paragraph with
 * a fixed text of "This is a paragraph" to the page being built.
 * 
 * It is also possible to have content templates that can receive children. You simply 
 * need to mark the place where the children must be inserted like this.
 * 
 * <block>
 *     <content>
 * 	<ul>
 *          <children></children>
 * 	</ul>
 *     </content>
 *     <editor></editor>
 *     <defaults></defaults>
 * <block>
 * 
 * Inserting this block into a page will put an empty unordered list into the page. 
 * Since the list has a <children> tag within, the UI will offer a way to add children 
 * to it.  The <children></children> indicates where exactly within the blre-has-children block element 
 * the children are inserted 
 * The content template tag can also have a valid-children attribute. 
 * The valid-children attribute is used to specify what block html template types are allowed 
 * as children. You set it to a special ID that identifies a list of allowed 
 * block types.
 * 
 * <block>
 *     <content valid-children="only-li">
 * 	<ul> 
 *          <children></children>
 * 	</ul>
 *     </content>
 *     <editor></editor>
 *     <defaults></defaults>
 * <block>
 * 
 * In the preceding example, the ul can now only have children whitelisted by the 
 * only-li list which presumably specifies that only li blocks are allowed has 
 * children of the list.
 * 
 * An important point,  each content template are only allowed one children
 * insertion point. In other words:
 * 
 * This is allowed:
 * 
 * <block>
 *     <content>
 *          <section>
 *              <h2>A header</h2>
 *              <div>
 *                  <chidlren></children>
 *              </div>
 *          </section>
 *     </content>
 *     <editor></editor>
 *     <defaults></defaults>
 * <block>
 * 
 * But this is not allowed:
 * 
 * <block>
 *     <content>
 *          <section>
 *              <h2><chidlren></children></h2>
 *              <div>
 *                  <chidlren></children>
 *              </div>
 *          </section>
 *     </content>
 *     <editor></editor>
 *     <defaults></defaults>
 * <block>
 * 	
 * This might seem like a big limitation, but the general effect can be accomplish
 * through blocks combining For an explanation of this and a complete description of the
 * content template syntax, please see the RESCUE documentation.
 * 
 * This covers the basics of the content template Now there is a big problem with the HTML 
 * block templates described above. To illustrate this problem, let’s take the paragraph 
 * example from before:
 * 
 * <block>
 *     <content>
 *          <p>This is a paragraph</p>
 *     </content>
 *     <editor></editor>
 *     <defaults></defaults>
 * <block>
 * 
 * The problem is, I can insert a paragraph, but it will always have a text 
 * consisting of "This is a paragraph" with no way of changing that text. That’s a 
 * very severe limitation and this limitation can be removed thanks to tthe editor
 * template. The editor template specifies an HTML form that can be 
 * used to modify certain values. For instance, let’s take the paragraph 
 * block HTML template and change it so it can be edited: 
 * 
 * <block>
 *     <content>
 *          <p>{{{ParagraphText}}co</p>
 *     </content>
 *     <editor>
 *         <form>
 *             <textarea name="ParagraphText">{{ParagraphText}}</textarea>
 *             <br/>
 *             <input type="submit" />
 *         </form>*     
 *     </editor>
 *     <defaults></defaults>
 * <block>
 * 

 * 
 * First thing of note, the text of the paragraph has been replaced by 
 * {{{ParagraphText}}}. This is necessary for the editor to work. The idea is 
 * that for every place in the HTML block where you want editable text, you replace 
 * the text by {{{ }}} and inside you specify an unique ID.
 * In the editor template, there is a form.  The form '
 * consists of a textarea and a submit button. The name of textarea correspond to 
 * the ID between the {{{ }}}. The {{{ParagraphText}}} part of the paragraph can 
 * now be edited. For more details, check the RESCUE documentation.
 * 
 * One final Issue is that now the paragraph block doesn’t have a default text. 
 * This can be addressed with the defaults template. 
 * 
 * <block>
 *     <content>
 *          <p>{{{ParagraphText}}co</p>
 *     </content>
 *     <editor>
 *         <form>
 *             <textarea name="ParagraphText">{{ParagraphText}}</textarea>
 *             <br/>
 *             <input type="submit" />
 *         </form>*     
 *     </editor>
 *     <defaults>
 *          <default key="ParagraphText">Ceci est un paragraph!</default>
 *     </defaults>
 * <block>
 * 
 * With this, the paragraph now has a default text of This is a paragraph like 
 * before.
 * 
 * The BlreHtmlTemplateHander can take markup such as the one above and process
 * it so it becomes usable by the UI module.
 * 
 */
           
/**
  * An HtmlTemplatehandler is an object
 * that helps with rendering tasks related to HTML templates.
 */ 
class BlreHtmlTemplateHandler extends BaseTemplateHandler{
    
    /**
     * Constructor for a HtmlTemplateHandler.
     */
    constructor() {
        super();
        this._selectors = {
            baseId: 'blre-block-',
            classes: {
                block: 'blre-block',
                root: 'blre-root',
                hasChildren: 'blre-has-children',
                editable: 'blre-editable',
                deletable: 'blre-deletable',
                loader: 'blre-block-loader'
            },
            attributes: {
                allowedChildrenList: 'data-blre-allowed-children',
                blockType: 'data-blre-block-type',
                isTag: 'data-blre-is-tag',
                loadBloc: 'data-load-block'
            }      
        }
        
        this._blreML =  {
            tags: {
                block: 'block',
                content: 'content',
                editor: 'editor',
                defaults: 'defaults',
                'default': 'default',
                children: 'children',
                loadBlock: 'loadblock'
            },
            attributes: {
                block: 'block',
                validChildren: 'valid-children',
                noAdd: 'no-add',
                noEdit:'no-edit',
                noDelete: 'no-delete'
            }
        };
    }
    
    /**
     * Renders an html template (commonly refered to as an HTML block)
     * @param {type} a_htmlBlock The html block (html template) that will be rendered
     * @param {type} a_blockType The type of html block is being rendered (for example,
     * a paragraph, a list, a table, etc)
     * @returns {BLRE.HtmlTemplateHandler.prototype.renderHtml.templatingAnonym$0} an
     * object containing amongts other things:
     *     -rendered: The rendered HTML template/HTML block.
     *     -templateData:
     *         -template: The original non rendered template
     *         -jsonArray: An array built from the JSON used to provied the data
     *                     this rendered in the HTML block/HTML template
     */
    renderHtml(a_blockHtml, a_blockType) {

        let [templateInnerHtml, blockDom] = this._translateBlreML(a_blockHtml, a_blockType);
        let defaults = this._getBlockDefaultValues(blockDom);
        let rendered = this.renderTemplate(templateInnerHtml, defaults);

         return {html: rendered, templateData: {template: templateInnerHtml, jsonArray: defaults}};
    };

    /**
     * Adds a new block of a given type to the composite module and in addition
     * performs the necessary templating. 
     * 
     * @param {type} a_blockType The type of block to be added
     * @param {type} a_parentId Id representing the parent of the block
     * @param {type} a_index Position where the block is added 
     * 
     * @returns {undefined} A promise that can be used to execute code once the 
     * block is added
     */
    addNewBlock(a_blockType, a_parentId, a_index, a_callback)  {

        // Obtain the block's type html
        let p1 = BLRE.events.trigger('blre-async-templating-render-html-block', {blockType: a_blockType});
        
        return p1.then(templateInfo => {
            return new Promise((resolve, reject) => {
                
                // Add the new block to the composite module (html builder)
                let  blockData = BLRE.events.trigger('blre-html-persistance-add-new-node', {html: templateInfo.html, templateData: templateInfo.templateData, parentId: a_parentId, index: a_index});

                // Find any blocks to be loaded within the block that was already added so 
                // they can also been added to the composite.
                let templateInnerDom = this._convertHtmlToDomNodeList(templateInfo.templateData.template.trim())[0];

                let blocksToLoad = this._getBlocksToLoad(templateInnerDom);

                // Loads all the children blocks that must be loaded
                let p3  = BLRE.events.trigger('blre-async-io-get-many-html-blocks', {ids: blocksToLoad});
                 p3.then(loaded => { 

                        let parentId = templateInnerDom.getAttribute('id').replace(this._selectors.baseId, '');
                        // for each children block in the template
                        let lastGid = parentId;

                        let childrenTempatesDom = Array.from(templateInnerDom.querySelectorAll('.' + this._selectors.classes.block));

                        for(let childrenTempateDom of childrenTempatesDom){
                            let tmpParentId = childrenTempateDom.closest('.blre-processed')? lastGid : parentId;

                            let renderHtml = this._createChildForNewBlock(childrenTempateDom, loaded);

                           // Add the child block to the composite
                            let t  =  BLRE.events.trigger('blre-html-persistance-add-new-node', {html: renderHtml.html, templateData: renderHtml.templateData, parentId: tmpParentId});
                            childrenTempateDom.classList.add('blre-processed');
                            lastGid = t.globalId;                                  
                        };    

                        var finalHtml = BLRE.events.trigger('blre-html-persistance-render-node-html', {blockId: blockData.globalId});
                        
                        resolve([blockData.globalId, finalHtml, blockData.parentId]);
                }) ;
                              
                
            });

        });
    }

    /**
     * Obtain the edit form for a given block
     * @param {type} a_blockId The global numerical id identifiying the block
     * @param {type} a_blockType The block's type
     * @returns {undefined} A promise that can be used to execute code once the 
     * form has been obtained.
     */
    getBlockEditForm(a_blockId, a_blockType, a_callback) {
        let templateData = BLRE.events.trigger('blre-html-persistance-get-node-template-data', {blockId: a_blockId});
       
        let promise = BLRE.events.trigger('blre-async-io-get-html-block', {id: a_blockType});
        return promise.then((htmlBlock) => {

            let $html = this._convertHtmlToDomNodeList(htmlBlock)[0];

            let formHtml = $html.querySelector(this._blreML.tags.editor).innerHTML;
            let rendered = this.renderTemplate(formHtml, templateData.jsonArray);

            return rendered;

        });
    }

    /**
     * This is used to take a blocks HTML and apply new data to its. Generally, this
     * is useful when the user edited a block's text/data.
     * 
     * @param {type} a_blockId Id of block that will be edited
     * @param {type} a_formData Data used to edit the block
     * @returns {unresolved} A promise that can be used to execute code after
     * the edits have been applied to the block.
     */
    applyEditsToBlock(a_blockId, a_formData) {
        let templateData = BLRE.events.trigger('blre-html-persistance-get-node-template-data', {blockId: a_blockId});

        // rearrange the form data in a format Mustach expects.
        let newData = {};
        let arr = a_formData;
        for(var i = 0; i < arr.length; ++i) {
            newData[arr[i].name] = arr[i].value;
        }

        let rendered = this.renderTemplate(templateData.template, newData);

        // Update the composite with the new data
        BLRE.events.trigger('blre-html-persistance-update-node', 
            {
                blockId: a_blockId, 
                html: rendered, 
                templateData:  {
                    template: templateData.template,
                    jsonArray: newData
                } 
            });

        // finish rendering the new HTML for the node by inserting the children
        return BLRE.events.trigger('blre-html-persistance-render-node-html', {blockId: a_blockId});    
    }

    /**
     * This method is used to obtain the HTML template for the rroot of the composite/page.
     * This is a starting point when creating a page
     * 
     * @returns {String} The HTML template for the root
     */
    getRootHtml() {
        return Promise.resolve(
                    `<div id="${this._selectors.baseId}1" class="${this._selectors.classes.block} ${this._selectors.classes.root} ${this._selectors.classes.hasChildren}">

                            <!--[[[--><!--]]]-->
 
                    </div>`
               );    
    }

    /**
     * Used to insert the children's HTML intos it's parent HTML. The children HTML
     * is placed where the <!--[[[--><!--]]]--> symbol is in the parent's HTML.
     * 
     * @param {type} html The parent HTML
     * @param {type} childrenHtml The children HTML
     * @returns {unresolved} The parent HTML with the children's HTML inserted into it
     */
    insertChildrenHtml(html, childrenHtml) {
        return html.replace(/<!--\[\[\[-->[\s\S]*<!--\]\]\]-->/g, childrenHtml);
    };

   
    /**
     * Internal methods that help convert a string containing html to the corresponding
     * dom elements tree 
     * 
     * @param [string] The html   
     * 
     * @returns {BLRE.HtmlTemplateHandler} A node list containing the dom elements
     **/
    _convertHtmlToDomNodeList(a_html) {
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

        let elements = container.childNodes;
       
        return elements;
     }
     
     /**
      * %hiw is a helper method used by the renderHtml method. It translate
      * the brle into a form of html that can than been processed correctly
      * 
      * @param a_blockHtml The HTML block template (in blreML)
      * @param a_blockType a string (id) identifying the type f HTML block template
      * 
      * return An array containging the translated HTML and a dom Element 
      * corresponding to the inner html of the content template with the 
      * HTML block template. 
      */
     _translateBlreML(a_blockHtml, a_blockType) { 
       
        // Since blreeML is very similar t HTML, it is parsed with 
        // the DOM. However, because some of the tag in blreML are not 
        // valid HTML, sometimes there can be parsing problems, espacially
        // when tables are involved. For this reason, the content, children and
        // loadblock tags are replace by spans marked by special classes.
        //It would be to write the HTML block templates directly in HTML 
        // with those span, but the current blreML syntax is simpler and less
        // clutered.
        a_blockHtml = a_blockHtml.trim();
        a_blockHtml = a_blockHtml.blreReplaceAll(`<${this._blreML.tags.content}`, '<span class="blre-template" ').blreReplaceAll(`</${this._blreML.tags.content}>`, '</span>');
        a_blockHtml = a_blockHtml.blreReplaceAll(`<${this._blreML.tags.children}>`, '<span class="blre-children">&amp;&amp;&amp;').blreReplaceAll(`</${this._blreML.tags.children}>`, '</span><span>&&&</span>');
        a_blockHtml = a_blockHtml.blreReplaceAll(`<${this._blreML.tags.loadBlock}`, `<span class="${this._selectors.classes.block} ${this._selectors.classes.blockLoader}" `).blreReplaceAll(`</${this._blreML.tags.loadBlock}>`, '</span>');
        
        // table, tr and td can cause weird problems so they are temporarely replaced by divs.
        a_blockHtml = a_blockHtml.blreReplaceAll('<table', `<div ${this._selectors.attributes.isTag}="table" `).blreReplaceAll('</table>', '</div>');
        a_blockHtml = a_blockHtml.blreReplaceAll('<tbody', `<div ${this._selectors.attributes.isTag}="tbody" `).blreReplaceAll('</tr>', '</div>');
        a_blockHtml = a_blockHtml.blreReplaceAll('<thead', `<div ${this._selectors.attributes.isTag}="thead" `).blreReplaceAll('</tr>', '</div>');
        a_blockHtml = a_blockHtml.blreReplaceAll('<tr', `<div ${this._selectors.attributes.isTag}="tr" `).blreReplaceAll('</tr>', '</div>');
        a_blockHtml = a_blockHtml.blreReplaceAll('<td', `<div ${this._selectors.attributes.isTag}="td" `).blreReplaceAll('</td>', '</div>');
        a_blockHtml = a_blockHtml.blreReplaceAll('<th', `<div ${this._selectors.attributes.isTag}="th" `).blreReplaceAll('</tr>', '</div>');

         //Treats blreML attributes such as no-add, no-edit, no-delete, etc.
         let blockDom = this._convertHtmlToDomNodeList(a_blockHtml)[0]
         this._translateAttributes(blockDom, a_blockType);
         
         // When there are tables, tr and td involve, the <children> and the <span tag that replaces
         // the children tag causes parsing problem. Due to this, those spans are replaced by
         //<!--[[[--><!--]]]<--> so tables an be used in blreml without issues
         let templateInnerHtml = blockDom.outerHTML;
         templateInnerHtml = templateInnerHtml.blreReplaceAll(/<span class="blre-children"[\s\S]*?>&amp;&amp;&amp;/g, '<!--[[[-->').blreReplaceAll('</span><span>&amp;&amp;&amp;</span>', '<!--]]]-->');
     
         // Changes table, tr and td from divs back to their correct tags.
         let templateInnerDom = this._convertHtmlToDomNodeList(templateInnerHtml)[0];
         this._replaceTags(templateInnerDom);
         
         
         templateInnerHtml = templateInnerDom.querySelector('.blre-template').innerHTML;
         return [templateInnerHtml.trim(), templateInnerDom];
     }
     
     /**
      * This helper method process the attribures that can be on the content temlate
      * tag.  I tmostly involves putting certain class on the html root element 
      * depending on which attributes the content template has.
      * 
      * @param a_blockDom a dom element reprensenting the whole HTML block template
      * @param a_blockType The type of block
      */
     _translateAttributes(a_blockDom, a_blockType) {
         
        // Find the HTML part of the template and add an appropriate HTML ID based
        // on the composite global ID the corresponding HTML block will recieve.
        // Also set the block type in the data-block-type attribute. 
        let templateDom = a_blockDom.querySelector('.blre-template');
        let templateInnerDom = templateDom.querySelector('*');
        templateInnerDom.setAttribute('id', this._selectors.baseId +  BLRE.events.trigger('blre-html-persistance-preview-next-global-id'));
        
        templateInnerDom.setAttribute(this._selectors.attributes.blockType, a_blockType);
        
         let blockLoaders = Array.from(a_blockDom.querySelectorAll('.' + this._selectors.classes.blockLoader));
         for(let loader of blockLoaders) {
             loader.setAttribute(this._selectors.attributes.loadBlock, loader.getAttribute(this.blreML.attributes.block));
             loader.removeAttribute(this.blreML.attributes.block);
         }                 
        
        templateInnerDom.classList.add(this._selectors.classes.block);
        if(!templateDom.hasAttribute(this._blreML.attributes.noEdit)) {
            templateInnerDom.classList.add(this._selectors.classes.editable);
        }

        if(!templateDom.hasAttribute(this._blreML.attributes.noDelete)) {
            templateInnerDom.classList.add(this._selectors.classes.deletable);
        }

        if(!templateDom.hasAttribute(this._blreML.attributes.noAdd)) {
            //Find each block that can have children and mark them so the UI 
            //add the appropriate add button.            
            var childrenDom = templateDom.querySelector('.blre-children')
            if(childrenDom) {
                 childrenDom.parentNode.classList.add(this._selectors.classes.hasChildren)
            }
                    
        }

        if(templateDom.hasAttribute(this._blreML.attributes.validChildren)) { 
            templateInnerDom.setAttribute(this._selectors.attributes.allowedChildrenList, templateDom.getAttribute(this._blreML.attributes.validChildren));
        }         
     }
     
     /**
      * Tables cause problem so in the _translateBlreML method table, td and tr are 
      * replaced by div with an attribute data-is-tag. This helper method replace
      * div with the data-is-tag attribute back to the correct tag.
      */
     _replaceTags(a_blockDom) { 
      // find every element with an attribute data-is-tag. Every such element is
        // replaced by a new element corresponding to data-is-tag
        let toReplaceTags = Array.from(a_blockDom.querySelectorAll('[' + this._selectors.attributes.isTag + ']')).reverse();
        for(let toReplace of toReplaceTags) {
            let tag = toReplace.getAttribute(this._selectors.attributes.isTag);
            let newDom = document.createElement(tag);
            let attributes = toReplace.attributes;
            
            for(let att of attributes){
                newDom.setAttribute(att.name, att.value);
            }
          
            newDom.removeAttribute(this._selectors.attributes.isTag);
            
            newDom.innerHTML = toReplace.innerHTML;
            
            toReplace.parentNode.replaceChild(newDom, toReplace);            
        }     
     }
     
     /**
      * Helper method that translate the defaults template to an object that
      * can then be used with Mustach.
      * 
      * @param a_blockDom A dom element representing the whole HTML block template
      * 
      * @return An object that contains the defaults values
      */
     _getBlockDefaultValues(a_blockDom) {
  
        let defaults = {};
        
        let defaultsDom = Array.from(a_blockDom.querySelectorAll(this._blreML.tags.default));
        for(let def of defaultsDom) {
            defaults[def.getAttribute('key')] = def.textContent; 
        }
        
        return defaults;
     }    
     

    /**
     * Helper method that finds every inner block types present in a content template
     * and thus must be loaded.
     * 
     * @param a_templateInnerdom A dom element representing the content template
     * HTML root
     * 
     * @return An array containing every block type that must be loaded
     */
    _getBlocksToLoad(a_templateInnerDom) {
        let blocksToLoad = [];
        let loadDom = Array.from(a_templateInnerDom.querySelectorAll('.' + this._selectors.classes.blockLoader));

        for(let toLoad of loadDom) {
            var type = toLoad.getAttribute(this._selectors.attributes.loadBlock);
            if(loadDom.indexOf(type) < 0) {
                 blocksToLoad.push(type);
            }
        };      
        
        return blocksToLoad;
    }
    
    /**
     * An HTML block template can have children blocks that are imbricated
     * directly in the blreML. These block can be either inserted directly (inlined)
     * or loaded. This helper method renders the html of the children blocks
     * 
     * @param childTemplateDom A dom element representing the child's content temlate
     * @parent loaded: an array containing all the HTML Block template
     * 
     * @return the child's HTML
     */
    _createChildForNewBlock(childTempateDom, loaded) {
        let blockName = childTempateDom.getAttribute(this._selectors.attributes.loadBlock);
        let renderHtml;

        if(blockName) {
            // The child block was loaded so take the loaded data
            // and renders it.           
            renderHtml = htmlTemplateHandler.renderHtml(loaded[blockName], blockName);
        } else {  
            // The child block was inserted directly into the 
            // template, get this html from the template.
            renderHtml = this._createInlineBlock(childTempateDom);
        }   

        return renderHtml;   
    }
    
    /**
     * Helper method that renders the html for an inlined child block
     *
     * @param childTemplateDom A dom element representing the child's content temlate
     * 
     * @return the child's HTML
     */
    _createInlineBlock(childTempateDom) { 
        childTempateDom.setAttribute('id', this._selectors.baseId +  BLRE.events.trigger('blre-html-persistance-preview-next-global-id'));
        let childBlockDom = childTempateDom.closest(this.blreML.tags.block);
        return htmlTemplateHandler.renderHtml(childBlockDom.outerHTML, 'unknown-block');           
    }         
    
}

blreTmp = function() {
    // The HtmlTemplateHandler used by the templating module
    let htmlTemplateHandler = new BlreHtmlTemplateHandler();

    /**
     * Whenever a different module from Templating (normally UI in this case)  
     * needs to obtain the rendered HTML for a specific html block type
     * it fires the blre-async-templating-render-html-block
     * event defined below. In this way, the
     * other modules are decoupled from the Templating module. It's possible to replace
     * the Templating module by a new one using a completly different implementation and as
     * long as it defines the blre-async-templating-render-html-block  correctly Rescue Editor will
     * still work.
     * 
     * The async part of the event name indiquates that this event is asynchronous
     * and thus returns a promise that can be used to execute code after the block html
     * is rendered
     * 
     * When triggered, the blre-async-templating-render-html-block expect as parameter a hash
     * with the following parameters:
     *     -blockType: A string indicating the type of block for which the HTML must
     *     be rendered

     *            
     * return: Nothing
     */ 
    BLRE.events.bind('blre-async-templating-render-html-block', a_data => {
        var promise = BLRE.events.trigger('blre-async-io-get-html-block',{id: a_data.blockType});
        return promise.then(
            htmlBlock => {return htmlTemplateHandler.renderHtml(htmlBlock, a_data.blockType)}
        );      

    });

    /**
     * Whenever a different module from Templating (normally UI in this case)  
     * needs add render a block type's HTML and add that HTML to the composite
     * it fires the blre-async-templating-add-new-block
     * event defined below. In this way, the
     * other modules are decoupled from the Templating module. It's possible to replace
     * the Templating module by a new one using a completly different implementation and as
     * long as it defines theblre-async-templating-add-new-block correctly Rescue Editor will
     * still work.
     * 
     * The async part of the event name indiquates that this event is asynchronous
     * and thus returns a promise that can be used to execute call after the block
     * as been added.
     * 
     * When triggered, the blre-async-templating-add-new-block expect as parameter a hash
     * with the following parameters:
     *     -blockType: A string indicating the type of block for which the HTML must
     *     be rendered
     *            
     * return: Nothing
     */ 
    BLRE.events.bind('blre-async-templating-add-new-block', a_data => {
        return htmlTemplateHandler.addNewBlock(a_data.blockType, a_data.parentId, a_data.index);
    });    

    /**
     * Whenever a different module from Templating (normally UI in this case)  
     * needs to obtain the edit form of a block
     * it fires the blre-async-templating-get-block-edit-form
     * event defined below. In this way, the
     * other modules are decoupled from the Templating module. It's possible to replace
     * the Templating module by a new one using a completly different implementation and as
     * long as it defines the blre-async-templating-get-block-edit-form correctly Rescue Editor will
     * still work.
     * 
     * The async part of the event name indiquates that this event is asynchronous
     * and thus returns a promise that can be used to execute code after the edit form
     * as been obtained.
     * 
     * When triggered, the blre-async-templating-get-block-edit-form expect as parameter a hash
     * with the following parameters:
     *     -blockId: The numerical global id identifying the block
     *     -blockType: A string indicating the type of block for which the HTML must
     *     be rendered
     *            
     * return: Nothing
     */ 
    BLRE.events.bind('blre-async-templating-get-block-edit-form', a_data => {
        return htmlTemplateHandler.getBlockEditForm(a_data.blockId, a_data.blockType);
    });

    /**
     * Whenever a different module from Templating (normally UI in this case)  
     * needs to edit the HTML of a block
     * it fires the blre-templating-apply-edits-to-block-html
     * event defined below. In this way, the
     * other modules are decoupled from the Templating module. It's possible to replace
     * the Templating module by a new one using a completly different implementation and as
     * long as it defines the blre-templating-apply-edits-to-block-html correctly Rescue Editor will
     * still work.
     * 
     * 
     * When triggered, the blre-templating-apply-edits-to-block-html expect as parameter a hash
     * with the following parameters:
     *     -blockId Id of block that will be edited
     *     -formData Data used to edit the block
     *            
     * return: The edited HTML
     */ 
    BLRE.events.bind('blre-templating-apply-edits-to-block-html', a_data => {
        return htmlTemplateHandler.applyEditsToBlock(a_data.blockId, a_data.formData);
    });

    /**
     * Whenever a different module from Templating (normally UI in this case)  
     * needs the HTML template for the root
     * it fires the blre-templating-get-root-html
     * event defined below. In this way, the
     * other modules are decoupled from the Templating module. It's possible to replace
     * the Templating module by a new one using a completly different implementation and as
     * long as it defines the blre-templating-get-root-html correctly Rescue Editor will
     * still work.
     * 
     *            
     * return: The root's HTML template
     */ 
    BLRE.events.bind('blre-async-templating-get-root-html', () => {
        return htmlTemplateHandler.getRootHtml();
    });

    /**
     * Whenever a different module from Templating (normally UI in this case)  
     * needs to insert the children's HTML into the parent HTML
     * it fires the blre-templating-insert-children-into-html
     * event defined below. In this way, the
     * other modules are decoupled from the Templating module. It's possible to replace
     * the Templating module by a new one using a completly different implementation and as
     * long as it defines the blre-templating-insert-children-into-html correctly Rescue Editor will
     * still work.
     * 
      * When triggered, the blre-templating-insert-children-into-html expect as parameter an object
     * with the following parameters:
     *    -html The parent HTML
     *    -childrenHtml The children HTML
     * 
     *            
     * return: The parent HtML with the children HTML insertd at the correct spot
     */     
    BLRE.events.bind('blre-templating-insert-children-into-html', a_data => {
        return htmlTemplateHandler.insertChildrenHtml(a_data.html, a_data.childrenHtml);
    });


    /**
     * When the templating module translate blreML to HTML, it places certain attributes
     * and classes on the elemnt within the resulting html. These elementss are used for
     * things like indicating a particular element represent the root of a processed HTML
     * Block, or the list of allowed children with a processed block and so on.
     * Selectors based on these classes and attribues are useful particularly for the UI module and so
     * can be obtained by firing the blre-event-get-templating-selectors
     * event defined below. In this way, the
     * other modules are decoupled from the Templating module. It's possible to replace
     * the Templating module by a new one using a completly different implementation and as
     * long as it defines the blre-event-get-templating-selectors correctly Rescue Editor will
     * still work.
     * 
     * 

     *            
     * return: A javascript objects containing the selectors
     */  
    BLRE.events.bind('blre-event-get-templating-selectors', () => {
       return htmlTemplateHandler._selectors;
    });
}();