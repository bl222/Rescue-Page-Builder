/**
 * Programmed by Benoit Lanteigne
 * 
 * The following code handles the IO needs for loading and saving files made
 * with the rescue editor
 *
 */

/**
* Class used to load or save a file that was created with the rescue editor
*/
class BlreEditorFilesSaverLoader extends BlreBaseSaverLoader {
    
    /**
     * The BlreEditorFilesSaverLoader constructor. 
     */      
    constructor() {
        super();
        
       // Thanks the following line, the _getHelper method of BlreEditorFilesSaverLoader
        // will use the URL stored under the readEditorFile key in the configuration as
        // its base URL.           
        this.configUrlKey = 'readEditorFile';
        
       // Thanks the following line, the post method of BlreEditorFilesSaverLoader
        // will use the URL stored under the saveEditorFile key in the configuration as
        // its base URL.          
        this.configPostUrlKey = 'saveEditorFile';
    }
}

blreTmp = function() {
    let saveLoad = new BlreEditorFilesSaverLoader();

    /**
     * Whenever a different module from IO needs to access an editor, it can
     * fire the blre-async-io-get-editor-file event defined below. In this way, the
     * other modules are decoupled from the IO module. It's possible to replace
     * the IO module by a new one using a completly different implementation and as
     * long as it defines the  blre-async-io-get-editor-file correctly Rescue Editor will
     * still work.
     * 
     * The async part of the event name indiquates that this event is asynchronous
     * and thus returns a promise.
     * 
     * When triggered, the blre-async-io-get-editor-file expect as parameter a object
     * with the two folloing parameters:
     *    -id: A unique ID identifying the desired editor file
     *    
     * The return value is a promise that can be used to execute code once the
     * file has been loaded. The promise's callback receives the file's data
     */
    BLRE.events.bind('blre-async-io-get-editor-file', a_data => {
        return saveLoad.get(a_data.id).then(data => {
            return data[1];
        });;
    });


    /**
     * Whenever a different module from IO needs to save an editor file, it can
     * fire the blre-async-io-save-editor-file event defined below. In this way, the
     * other modules are decoupled from the IO module. It's possible to replace
     * the IO module by a new one using a completly different implementation and as
     * long as it defines the  blre-async-io-save-editor-file correctly Rescue Editor will
     * still work.
     * 
     * The async part of the event name indiquates that this event is asynchronous
     * and thus returns a promise.
     * 
     * When triggered, the blre-async-io-save-editor-file expect as parameter a object
     * with the two folloing parameters:
     *    -fileData: the data of the editor file that will be saved.
     *    
     * The return value is a promise that can be used to execute code once the
     * file has been saved. 
     */
    BLRE.events.bind('blre-async-io-save-editor-file', a_data => {
        return saveLoad.post(a_data.fileData);
    });
}()