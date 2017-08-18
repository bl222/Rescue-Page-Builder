/*
        Programmed By Benoit Lanteigne
        (c) Benoit Lanteigne, all rights reserved
        Licenced under GNU Affero General Public License 
    */
/**
 * Programmed by Benoit Lanteigne
 * 
 * The HTML part of Rescue Editor is built on HTML blocks that are assembled.
 * HTML is organized in a tree structure, and the same old true for the HTML blocks
 * Because of this, a composite is an intuitive and effective way of representing
 * the structure of a HtmlRescue document.
 */

class BlreHtmlBuilderNode extends BlreCompositeNode{
    /**
     * Constructor for a HtmlBuilderNode. A composite node used by the HTML editor
     * part of Rescue.lA HtmlBuilderNode is equivalent to one of the HTML blocks used
     * by Rescue to create HTML pages.  It is the same as CompositeNode, but adds 
     * functionality to render the HTML block as well as its children.
     * 
     * @param {type} a_html The HTML linked to the block represented by the node. 
     * This HTML is how the node is visually displayed in the editor.
     * @param {type} a_templateData Data linked to the HTML block. This data comes
     * from the templating system and is specific to the templating system. The
     * composite part of rescue has no idea what the data is and so can't use it. It
     * only stores the data for the templating module. If you change the templating
     * module for a different one, this data will likely change.
     * @returns {BLRE.HtmlBuilderNode} The created node.
     */    
    constructor(a_html, a_templateData) {
        super();
        this.html = a_html || '';
        this.templateData = a_templateData;        
    }
    
    /**
    * Renders the HTML  coresponding to a node in the composite. This means the 
    * children's HTML is inserted into the node's HTML.
    *
    * @returns {BLRE.HtmlBuilderNode.html} The rendered HTML.
    */
   renderHtml() {

       let toReturn = this.html;

       let childrenHtml = '';

       for(let child of this.children) {
           childrenHtml += child.renderHtml();
       }

       toReturn = BLRE.events.trigger('blre-templating-insert-children-into-html', {html: toReturn, childrenHtml: childrenHtml});

       return toReturn;
   };
   
   /**
    * Seralize the  composite to json. The json can later be used to recreate
    * the composite.

    * @returns the json
    */
   serializeXml() {
   
        function serializeHelper(a_node, a_serialized = '') {
            a_serialized  +=  '<node>';
            a_serialized += '<htmlvalue>' +  a_node.html + '</htmlvalue>';
            a_serialized +=  '<globalid>' + a_node.globalId + '</globalid>'; 
            
            a_serialized += '<templatedata>';
            for(let key in a_node.templateData) {
                a_serialized +=  '<' + key + ` data-key="${key}">`;
                
                let value = a_node.templateData[key];
                if(typeof value === 'object') {
                    a_serialized +=  JSON.stringify(value);
                } else {
                    a_serialized += value;
                }
                
                a_serialized += '</' + key + '>';
            }
            a_serialized +='</templatedata>';
            
            a_serialized += '<children>';
            for(let child of a_node.children) {
                a_serialized += serializeHelper(child);
            }
            
            a_serialized += '</children></node>'

            return a_serialized; 
        }
        
        let toSerialize = serializeHelper(this);
        return JSON.stringify(toSerialize)
     
   }
   
   /**
    * Create a consposite from a json string
    * @param {type} a_json The json 
    * @returns {unresolved} The root of the composite
    */
   deserializeXml(a_xml) {
       let parser = new DOMParser();
       let nodeDom = parser.parseFromString(a_xml,"text/html");

       function deserializeHelper(a_node, a_nodeDom) {
         
           a_node.html = a_nodeDom.querySelector('htmlvalue').innerHTML
          
           a_node.globalId = parseInt(a_nodeDom.querySelector('globalid').innerHTML);
           
           a_node.templateData = {};
           let templateDataDom = a_nodeDom.querySelector('templatedata');
           for(let dataDom of templateDataDom.children) {
               
               let value =  dataDom.innerHTML;
              
               let key = dataDom.getAttribute('data-key');
               try {
                   a_node.templateData[key] = JSON.parse(value);
               }catch(e) {
                   a_node.templateData[key] = value;
               }
           }
           
           let childrenDom  = a_nodeDom.querySelector('children');
           if(childrenDom) {
                for(let child of childrenDom.children) {

                    let node = new BlreHtmlBuilderNode();
                    a_node.addChild(node);
                    deserializeHelper(node, child);
                }               
           }

           
           return a_node;
           
       }
       
       return deserializeHelper(this, nodeDom);
   }
}

blreTmp = function() {
    let htmlRoot;

    /**
     * Whenever a different module from Composite needs to create the root of the HTML composite, it can
     * fire the blre-async-html-persistance-create-root event defined below. In this way, the
     * other modules are decoupled from the Composite module. It's possible to replace
     * the Composite module by a new one using a completly different implementation and as
     * long as it defines the blre-async-html-persistance-create-root correctly Rescue Editor will
     * still work.
     * 
     * The async part of the event name indiquates that this event is asynchronous
     * and thus returns a promise
     * 
     * When triggered, tthe event doesn't expect any data passed as a parameter.
     */
    BLRE.events.bind('blre-async-html-persistance-create-root', a_data => {
        let promise = BLRE.events.trigger('blre-async-templating-get-root-html');
        return promise.then(html => {
            htmlRoot = new BlreHtmlBuilderNode(html);
            return [htmlRoot.globalId, htmlRoot.renderHtml()];
        });
    });


    /**
     * Whenever a different module from Composite needs to create and add new node to 
     * the HTML composite, it can fire the blre-html-persistance-add-new-node event defined below. In this way, the
     * other modules are decoupled from the Composite module. It's possible to replace
     * the Composite module by a new one using a completly different implementation and as
     * long as it defines the blre-html-persistance-add-new-node correctly Rescue Editor will
     * still work.
     * 
     * 
     * When triggered, the blre-html-persistance-add-new-node expect as parameter an object
     * with the folloing parameters:
     *    -html: The html for the html block represented by the new node
     *    -templateData: Templating specific data associtated to the new node
     *    -parentId: Global node id identifying the parent of the new node
     *    -index: Zero based position the new node will be inserted at as a child
     *            of its parent.
     *            
     * return: An object containing the globalId of the new node and its rendered html.
     */
    BLRE.events.bind('blre-html-persistance-add-new-node', a_data => {

        let node = new BlreHtmlBuilderNode(a_data.html, a_data.templateData);

        let parent = htmlRoot.findFirst([{gId: a_data.parentId}], {excludeRoot: false});
        parent.addChild(node, a_data.index);

        return {globalId: node.globalId, html: node.renderHtml()};

    });


    /**
     * Whenever a different module from Composite needs to access the templating data
     * assigned to a specific node, it can fire the blre-html-persistance-get-node-template-data
     * event defined below. In this way, the
     * other modules are decoupled from the Composite module. It's possible to replace
     * the Composite module by a new one using a completly different implementation and as
     * long as it defines the blre-html-persistance-get-node-template-data correctly Rescue Editor will
     * still work.
     * 
     * 
     * When triggered, the blre-html-persistance-get-node-template-data expect as parameter an object
     * with the folloing parameters:
     *    -blockId: Id of the node for which the data is obtained
     *    
     *            
     * return: The templating data likely in the form of an object (but depends on the
     * templating module's implementation.
     */
    BLRE.events.bind('blre-html-persistance-get-node-template-data', a_data => {

        let node = htmlRoot.findFirst([{gId: a_data.blockId}]);

        return node.templateData;
    });

    /**
     * Whenever a different module from Composite needs to update a specific node, it can 
     * fire the blre-html-persistance-update-node
     * event defined below. In this way, the
     * other modules are decoupled from the Composite module. It's possible to replace
     * the Composite module by a new one using a completly different implementation and as
     * long as it defines the blre-html-html-builder-update-node correctly Rescue Editor will
     * still work.
     * 
     * 
     * When triggered, the  blre-html-persistance-update-node expect as parameter an object
     * with the folloing parameters:
     *    -blockId: Id of the node which will be updated
     *    -html: New html for the node
     *    -templateData: New templating related data for the node
     *    
     *            
     * return: Nothing
     */
    BLRE.events.bind('blre-html-persistance-update-node', a_data => {

        let node = htmlRoot.findFirst([{gId: a_data.blockId}], {excludeRoot: false});

        node.html = a_data.html;

        node.templateData = a_data.templateData;

    });

    /**
     * Whenever a different module from Composite needs to obtain the rendered HTML
     * of a nodes (include the HTML of the nodes and its children) it can
     * fire the blre-html-persistance-render-node-html
     * event defined below. In this way, the
     * other modules are decoupled from the Composite module. It's possible to replace
     * the Composite module by a new one using a completly different implementation and as
     * long as it defines the blre-html-persistance-render-node-html correctly Rescue Editor will
     * still work.
     * 
     * 
     * When triggered, the blre-html-persistance-render-node-html expect as parameter an object
     * with the folloing parameters:
     *    -blockId: Id of the node which will be updated
     *    
     *            
     * return: Nothing
     */
    BLRE.events.bind('blre-html-persistance-render-node-html', a_data => {

        let node = htmlRoot.findFirst([{gId: a_data.blockId}], {excludeRoot: false});

        return node.renderHtml();
    });

    /**
     * Whenever a different module from Composite needs know what the next global id
     * will be , it can fire the blre-html-persistance-preview-next-global-id
     * event defined below. In this way, the
     * other modules are decoupled from the Composite module. It's possible to replace
     * the Composite module by a new one using a completly different implementation and as
     * long as it defines the blre-html-persistance-preview-next-global-id correctly Rescue Editor will
     * still work.
     * 
     * return: The value of the next global ID that will be assigned to a new node.
     */
    BLRE.events.bind('blre-html-persistance-preview-next-global-id', a_data => {
        return BlreCompositeLeafNode._nGId;
    });

    /**
     * Whenever a different module from Composite needs to delete a node from the composite it can
     * fire the blre-html-persistance-delete-node
     * event defined below. In this way, the
     * other modules are decoupled from the Composite module. It's possible to replace
     * the Composite module by a new one using a completly different implementation and as
     * long as it defines the blre-html-persistance-delete-node correctly Rescue Editor will
     * still work.
     * 
     * 
     * When triggered, the blre-html-persistance-delete-node expect as parameter an object
     * with the folloing parameters:
     *    -blockId: Id of the node which will be removed
     *    
     *            
     * return: Nothing
     */
    BLRE.events.bind('blre-html-persistance-delete-node', a_data => { 
        let node = htmlRoot.findFirst([{gId: a_data.blockId}]);
        node.parent.removeChild(node);
    });
    
    /**
     * Whenever a different module from Composite needs serialize the composite
     * into JSON it can
     * fire the blre-html-persistance-serialize
     * event defined below. In this way, the
     * other modules are decoupled from the Composite module. It's possible to replace
     * the Composite module by a new one using a completly different implementation and as
     * long as it defines the blre-html-persistance-serialize correctly Rescue Editor will
     * still work.
     * 
     * 
     * When triggered, the blre-html-persistance-serialize expect no parameters
     *    
     *            
     * return: The json
     */    
    BLRE.events.bind('blre-html-persistance-serialize', a_data => { 
        return htmlRoot.serializeXml();
        
    });  
    
    
    
    /**
     * Whenever a different module from Composite needs to recreate the composite
     * from json it can
     * fire the blre-html-persistance-deserialize
     * event defined below. In this way, the
     * other modules are decoupled from the Composite module. It's possible to replace
     * the Composite module by a new one using a completly different implementation and as
     * long as it defines the blre-html-persistance-deserialize correctly Rescue Editor will
     * still work.
     * 
     * When triggered, the blre-html-persistance-persistance-deserialize as parameter an object
     * with the folloing parameters:
     *    -toLoad: the json
     * 
     * When triggered, the blre-html-persistance-deserialize expect no parameters
     *    
     *            
     * return: The  composite root
     */       
    BLRE.events.bind('blre-html-persistance-deserialize', a_data => { 
        htmlRoot = new BlreHtmlBuilderNode();
        let html = htmlRoot.deserializeXml(a_data.toLoad);
        let nextGlobalId = htmlRoot.getGreatestGlobalId() + 1;
        BlreCompositeLeafNode.setGlobalId(nextGlobalId);
        
        return html;
        
    }); 
}();