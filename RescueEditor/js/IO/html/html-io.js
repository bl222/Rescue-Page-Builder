/*
 requires:
 
IO/io.js
 */
/**
 * Programmed by Benoit Lanteigne
 * 
 * The following code handles the IO needs of the HTML editor part of Rescue.
 *
 */

/**
* The HTML part of the Rescue Editor works
* by combining pre made HTML blocks to form a web page. This loader is used
* to obtain one of those HTML block.
*/
class BlreHtmlBlockLoader extends BlreBaseLoader {
    
    /**
     * The HtmlBlockLoader constructor. 
     */      
    constructor() {
        super();
        
       // Thanks the following line, the _getHelper method of BlreHtmlBlockLoader
        // will use the URL stored under the blockUrl key in the configuration as
        // its base URL.           
        this.configUrlKey = 'blockUrl';
    }
}

blreTmp = function() {
    let blockLoader = new BlreHtmlBlockLoader();

    /**
     * Whenever a different module from IO needs to access an HTML block, it can
     * fire the blre-async-io-get-html-block event defined below. In this way, the
     * other modules are decoupled from the IO module. It's possible to replace
     * the IO module by a new one using a completly different implementation and as
     * long as it defines the  blre-async-io-get-html-block correctly Rescue Editor will
     * still work.
     * 
     * The async part of the event name indiquates that this event is asynchronous
     * and thus returns a promise.
     * 
     * When triggered, the blre-async-io-get-html-block expect as parameter a object
     * with the two folloing parameters:
     *    -id: A unique ID identifying the desired HTML block
     *    
     * The return value is a promise that can be used to execute code once the
     * block has been loaded. The promise's callback receives the markup representing
     * the block
     */
    BLRE.events.bind('blre-async-io-get-html-block', a_data => {
        return blockLoader.get(a_data.id, a_data.callback).then(data => {
            return data[1];
        });;
    });


    /**
     * Whenever a different module from IO needs to access several HTML blocks, it can
     * fire the blre-async-io-get-many-html-blocks event defined below. In this way, the
     * other modules are decoupled from the IO module. It's possible to replace
     * the IO module by a new one using a completly different implementation and as
     * long as it defines the blre-async-io-get-many-html-blocksk correctly Rescue Editor will
     * still work.
     * 
     * The async part of the event name indiquates that this event is asynchronous
     * and thus returns a promise.
     * 
     * When triggered, the blre-async-io-get-html-block expect as parameter an object
     * with the two folloing parameters:
     *    -ids: Am array of unique IDs identifying the desired HTML blocks
     *    
     * The return value is a promise that can be used to execute code once the
     * block has been loaded. The promise's callback receives the markup representing
     * the block
     */
    BLRE.events.bind('blre-async-io-get-many-html-blocks', a_data => {
        return blockLoader.getMany(a_data.ids, a_data.callback);
    });
}()

/**
* The HTML part of the Rescue Editor works
* by combining pre made HTML blocks to form a web page. It is possible to define
* lists of HTML blocks in JSON. Those list can be used to define the valid
* children of a specific type of HTML block.
*/
class BlreListsHtmlBlocksLoader extends BlreBaseLoader {
    /**
    * The ListsHtmlBlocksLoader constructor.
    */
   constructor() { 

        super();

        // Thanks the following line, the _getHelper method of BlreListsHtmlBlocksLoader
        // will use the URL stored under the listBlockUrl key in the configuration as
        // its base URL.    
        this.configUrlKey = 'listBlockUrl';       
   };
}

blreTmp = function() {
    let listsBlocksLoader = new BlreListsHtmlBlocksLoader();

    /**
     * Whenever a different module from IO needs to access a list of HTML blocks, it can
     * fire the blre-async-io-get-list-html-blocks event defined below. In this way, the
     * other modules are decoupled from the IO module. It's possible to replace
     * the IO module by a new one using a completly different implementation and as
     * long as it defines the blre-async-io-get-list-html-blocks correctly Rescue Editor will
     * still work.
     * 
     * The async part of the event name indiquates that this event is asynchronous
     * and thus returns a promise
     * When triggered, the blre-async-io-get-list-html-blocks expect as parameter an object
     * with the two folloing parameters:
     *    -id: Aunique ID identifying the desired HTML blocks list
     *    
     * The return value is a promise that can be used to execute code once the
     * list has been loaded. The promise's callback receives object representing 
     * the list (this object is created by parsing the Json defining the list)
     */
    BLRE.events.bind('blre-async-io-get-list-html-blocks', a_data => {
        return listsBlocksLoader.get(a_data.id).then(data => {
            return data[1];
        });
    });
}();

