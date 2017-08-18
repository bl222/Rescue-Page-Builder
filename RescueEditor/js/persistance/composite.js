/*
 requires:
 
events/eventmanager.js
 */

/**
 * Programmed by Benoit Lanteigne
 * 
 * Composites are very powerful for certain types of
 * problems. Rescue utilizes the composite design pattern in numerous way, both for data
 * storage and data processing. Composites are pretty much tree structures. The
 * following code defines a basic composite structure that can be reused and 
 * adapted for a multitude of purpose through Rescue.
 *
 */

/**
* CompositeLeafNode is the most basic unit 
* of the Rescue Composite. It's basically representss a leaf tree node, or if
* you prefer a node that cannot have children. CompositeLeafNode defines the
* basic functionalty of a node forming the composite. As such, it is not very 
* useful on its own, it's mostly there to be inheried from other node types.
* For instance, the CompositeNode type is much more likely to be used since it
* can have children.
 */
class BlreCompositeLeafNode {
    /** 
     * Constructor for a CompositeLeafNode. 
     */    
    constructor() {
        this.parent = undefined; // Real parent is assinged when the node is added to the composite
        this.globalId = BlreCompositeLeafNode.nextGlobalId(); // Assign the note a unique id
        this.depth = 0;    // Indicates how dee the node is in the composite, managed internaly        
    }
    
    /**
     * 
     * Genrates a unique integer that can be used as unique ID for a node.
     * Every node in the composite is assinged such an id and it
     * can that be used to find the composite through a search amongst other things.
     * 
     * @return A unique integer (id)
     */
    static nextGlobalId() {
        return BlreCompositeLeafNode._nGId++;
    };    
    
    /**
     * Set the value of the next global id
     * 
     * @param a_value: The value to be assigned to the next global id
     */    
    static setGlobalId(a_value) {
        BlreCompositeLeafNode._nGId = a_value;
    }

    /**
     * Determines if a node matches 
     * a complete selector array or not. This concept makes uses of ancestry and is
     * better explained via exemples.
     * 
     * Example 1:
     * 
     * [
     *    {gId: 1}
     * ]
     * 
     * This selector matches any node with the global ID of value 1
     * 
     * Example 2:
     * [
     *    {gId: 1},
     *    {gId: 2}
     * ]
     * 
     * This selector matches any node with a global ID of value 2, but only if it has
     * an ancestor with a global ID value of 1.
     * 
     * Example 3:
     * [
     *    {gId: 1},
     *    {gId: 2},
     *    {gId: 3}
     * ]
     * 
     * [
     *    {gId: 1, isParent: true},
     *    {gId: 2}
     * ]
     * 
     * This selector matches any node with a global ID of value 2, but only if his parent
     * has a globalId of 1.
     * 
     * 
     * @param {type} a_sel The selector array the node is being matched agaisnt
     * @returns {Boolean} True if the node matches the whole selector, else false
     */
    is(a_sel) {
        a_sel[a_sel.length - 1].isParent = true; // The last selector of the selector array must have isParent set to true for the code to work

        // get an array of ancestors and adds the node itself at the begining of array
        let ancs = this._makeAncestorsArray(); 
        ancs.unshift(this);

        // Reverse Iterate through each selector in selector array and check it agaisnt
        // every ancestor. Since the first ancestor is actually the node itself, the 
        // node itself and the last selector must match. If Every other selector is matched
        // to an ancestor returns true, else false.
        let curAncs = 0;
        for(let i = a_sel.length - 1; i >= 0; --i) {
            //Check if the anscestor matches the
            if(a_sel[i].isParent) {
                //If the selector must match the parent rather than an ancestor
                if(!ancs[curAncs]._match(a_sel, i)) { 
                    return false;
                }

            } else { 
              // find the first ancestor matching the current selector
                for(; curAncs < ancs.length; ++curAncs) {
                    if(ancs[curAncs]._match(a_sel, i)) {
                        break;
                    }
                }

                // No matching ancestor, the node is not represented by the selector
                if(curAncs >= ancs.length) {
                    return false;
                }
            }

            ++curAncs;
        }

        return true;
    }

    /**
     * Returns an array of ancestors matching the given selector.
     * @param {type} a_sel The selector the ancestors must match. If no selector is given
     * @returns {Array|BLRE.CompositeLeafNode.prototype.ancestors.ancs} The array of ancestor
     */
    ancestors(a_sel) {
        a_sel = a_sel || [{}];
        let ancs = [];
        for(let parent = this.parent; parent !== undefined; parent = parent.parent) {
            if(parent.is(a_sel)) {
                ancs.push(parent);
            }
        }

        return ancs;    
    }


    /**
     * Returns the first ancestor matching the given selector
     * @param {type} a_sel The selector the ancestor must match
     * @returns {undefined|parent.parent|BLRE.CompositeLeafNode.prototype.ancestor.parent|Window|parent.parent.parent|BLRE.CompositeLeafNode.parent.parent|BLRE.CompositeLeafNode.parent}
     * The first ancestor matching the selector.
     */
    ancestor(a_sel) {
        a_sel = a_sel || [{}];
        let ancs = [];
        for(let parent = this.parent; parent !== undefined; parent = parent.parent) {
            if(parent.is(a_sel)) {
                return parent;
            }        
        }

        return undefined;    
    }

    /**
     * Iterate through the node's children using the well known breath traversal algorithm.
     * Can be passed a callback that will be called on every iterated node. In this
     * way, breathTraversal can be used to execute code on every node in the composite
     * or a subset of the composite.
     * 
     * @param {type} a_opts Options influancing the behavior of the breathTraversal. They
     * include:
     *   -excludeRoot: If true the root is not traversed, if false the root is traversed in
     *                 addition to it's children. Defaults to false
     *   -maxDepth: How deep must the traveral go? If a number is specified, the traversal
     *              will stop once that depth is reached
     *   -callback: A function that will be called on every node being traversed. The 
     *              callback can return true to stop the traversal prematurely. The
     *              callback takes the following parameters:
     *              a_curNode: the traversed node
     *              opt: The same options object passed to the breathTraversal method
     *   
     * @returns {undefined}
     */
    breathTraveral(a_opts) {

        a_opts.maxDepth = a_opts.maxDepth === undefined  ? Number.MAX_SAFE_INTEGER : a_opts.maxDepth;

        a_opts.maxDepth += this.depth;
        let nodes = [];

        if(a_opts.excludeRoot) {
            if(this.children) {
                nodes = nodes.concat(this.children);  
            } else {
                return;
            }

        } else {
            nodes.push(this);
        }

        while(nodes.length > 0) {

            let curN = nodes.shift();

            if(curN.children && curN.depth < a_opts.maxDepth && (!a_opts.lowest || !curN.is(a_opts.lowest))) {
                nodes = nodes.concat(curN.children);
            }

            if(a_opts.callback) {
                if(a_opts.callback(curN, a_opts)) {
                    return;
                }   
            }
        }
    }

    /**
     * Iterate through the node's children using the well known depth traversal algorithm.
     * Can be passed a callback that will be called on every iterated node. In this
     * way, depthTraversal can be used to execute code on every node in the composite
     * or a subset of the composite.
     * 
     * @param {type} a_opts Options influancing the behavior of the breathTraversal. They
     * include:
     *   -callback: A function that will be called on every node being traversed before
     *              their children are processed. The
     *              callback takes the following parameters:
     *                a_curNode: the traversed node
     *                opt: The same options object passed to the depthTraversal method
      *   -callbackPost: A function that will be called on every node being traversed after
     *              their children are processed. The
     *              callback takes the following parameters:
     *                a_curNode: the traversed node
     *                opt: The same options object passed to the depthTraversal method*                
     *   
     * @returns {undefined}
     */
    depthTraversal(a_opts) {

        if(a_opts.callback) {
            a_opts.callback(this, a_opts);
        }

        if(this.children) {
            for(let i = 0; i < this.children.length; ++i) {
                this.children[i].depthTraversal(a_opts);
            }
        }

        if(a_opts.callbackPost) {
            a_opts.callbackPost(this, a_opts);
        }
    }

    /**
     * Finds all the decendants of the node matching the given selector. Built on 
     * breathTraversal
     * @param {type} a_sel The selector used to find the descendants
     * @param {type} a_opts Options specifying the behavor of find. These are the same
     * options as for breathTraversal
     * @returns {Array|BLRE.CompositeLeafNode.prototype.find.res} An array containing
     * all the found descendants.
     */
    find(a_sel, a_opts) {
        let res = [];
        a_opts = a_opts || {};

        if(a_opts.excludeRoot !== false) {
            a_opts.excludeRoot = true;
        }

        a_opts.callback = function(e)  {
            if(e.is(a_sel)) {
                res.push(e);
            }
        };

        this.breathTraveral(a_opts);

        return res;
    }

    /**
     * Finds all the children of the node matching the given selector. Built on 
     * breathTraversal
     * @param {type} a_sel The selector used to find the children
     * @param {type} a_opts Options specifying the behavor of find. These are the same
     * options as for breathTraversal
     * @returns {Array|BLRE.CompositeLeafNode.prototype.find.res} An array containing
     * all the found descendants.
     */
    children(a_sel, a_opts) {
        a_opts = a_opts || {};
        a_opts.maxDepth = 0;
        return this.find(a_sel, a_opts);
    }

    /**
     * Finds the first decendants of the node matching the given selector. Built on 
     * breathTraversal
     * @param {type} a_sel The selector used to find the first descendants
     * @param {type} a_opts Options specifying the behavor of find. These are the same
     * options as for breathTraversal
     * @returns {Array|BLRE.CompositeLeafNode.prototype.find.res} An array containing
     * all the found descendants.
     */
     findFirst(a_sel, a_opts) {
        let res;
        a_opts = a_opts || {};

        if(a_opts.excludeRoot !== false) {
            a_opts.excludeRoot = false;
        }

        a_opts.callback = function(e) {

            if(e.is(a_sel)) {

                res = e;
                return true;
            }
        };

        this.breathTraveral(a_opts);

        return res;
    };

    /**
     * Finds the first child of the node matching the given selector. Built on 
     * breathTraversal
     * @param {type} a_sel The selector used to find the first child
     * @param {type} a_opts Options specifying the behavor of find. These are the same
     * options as for breathTraversal
     * @returns {Array|BLRE.CompositeLeafNode.prototype.find.res} The first child matching
     * the selector.
     */
    firstChild(a_sel, a_opts) {
        a_opts = a_opts || {};
        a_opts.maxDepth = 0;
        return this.findFirst(a_sel, a_opts);
    }   
    
    /**
     * Get the greatest (highest) valued global id found in the composite and 
     * children.
     * @return The greatest global id
     */
    getGreatestGlobalId() {
        let res = [];
        let opts = {excludeRoot: false};
        let max = 0;


        opts.callback = function(e)  {
            if(e.globalId > max) {
                max = e.globalId;
            }
        };

        this.breathTraveral(opts);

        return max;
    }    
    
    
    /**
     * _match is the method that uses the _matchers array do dermine if a node
     * matches a selector or not.
     * @param {type} a_sel The selecotr the node is matched agaisnt
     * @param {type} a_idx The part of the selector array is beeing matched
     * @returns {Boolean} True if the node matches the selector, else false.
     */
    _match(a_sel, a_idx) {
        let match = true;
        for(let matcher of BlreCompositeLeafNode._matchers) {
            match = match && matcher(this, a_sel, a_idx);
            if(!match) { 
                return false;
            }
        }

        return true;
    }  
    
    /**
     * This internal method is used to create and array containing all the ancestor
     * a the given node.
     * @returns {Array|BLRE.CompositeLeafNode.prototype._makeAncestorsArray.ancs} An
     * array containing all the ancestors of the node.
     */
    _makeAncestorsArray() {
        let ancs = [];
        //Iterate through every ancestor of the node and puch them in the array
        for(let parent = this.parent; parent !== undefined; parent = parent.parent) {
            ancs.push(parent);
        }

        return ancs;
    };
    
}

//Used by nextGlobalId to generate unique ids 
BlreCompositeLeafNode._nGId = 1;

/**
 * @type Array the _matchers array is used to dermine if a node matches a given
 * selector. The selector are simillar in concept to jQuery or CSS selectors, but
 * different in syntax.
 */
BlreCompositeLeafNode._matchers = [];
BlreCompositeLeafNode._matchers.push(
  
    /**
     * A matcher used to dermines if a node matches the following selector:
     * 
     * [{gId: number}]
     * 
     * 
     * 
     * @param {type} a_n The node that is been checked for a match
     * @param (Array) a_sel The selector that is matched agaisnt the node
     * @param {type} a_idx  Which part of the selector array is been matched
     * @returns {Boolean} if the global ID in th selector matches the node's clobal id returns true,
     * else returns false
     */
    function(a_n, a_sel, a_idx) {
        return !a_sel[a_idx].gId || a_n.globalId == a_sel[a_idx].gId;
    }
);

/**
 * CompositeNode has all the same functionalities
 * as CompositeLeafNode, with one crucial addition: The capacity to have children
 * and manage those children.
 */
class BlreCompositeNode extends BlreCompositeLeafNode {
    /** 
     * Constructor for a CompositeNode. 
     */    
    constructor() {
        super();
        this.children = [];
    }
    
    /**
     * Add a child to the CompositeNode
     * @param {type} a_node The node that will be the new child
     * @param {type} a_index Zero based position of the new child, If not specified,
     * added as the last child.
     * @returns {undefined} Nothing
     */
    addChild(a_node, a_index) {
        a_node.depth = this.depth + 1;

        if(!a_index && a_index !== 0) {
            this.children.push(a_node);

        } else {
            this.children.splice(a_index, 0, a_node);
        }

        a_node.parent = this;
    }

    /**
     * Obtains the  index/position of a given child
     * @param {type} a_node The child node for which we wish to know the index
     * @returns {undefined|Number} The index of the child. If the a_node parameter
     * is not a child of the node, returns undefined.
     */
    getChildIndex(a_node) {
        for(let idx = 0; idx < this.children.length; ++idx) {
            if(this.children[idx].globalId === a_node.globalId) {
                return idx;
            }
        }

        return undefined;
    }

    /**
     * Removes a child of the node
     * @param {type} a_node The child to be removed
     * @returns {Boolean} True if the child is removed, false if the given node isn't
     * actually a child and thus could not be removed.
     */
    removeChild(a_node) {
        let idx = this.getChildIndex(a_node);

        if(idx < this.children.length) {

            this.children.splice(idx, 1);
            return true;
        }

        return false;
    }

    /**
     * Removes a child of the node based on an index
     * @param {type} a_index The index of the child to be removed
     * @returns {Boolean} True if the child is removed, false if the given node isn't
     * actually a child and thus could not be removed.
     */
    removeChildFromIndex(_index) {
        if(a_index < this.children.length) {

            this.children.splice(a_index, 1);
            return true;
        }

        return false;

    }
}
