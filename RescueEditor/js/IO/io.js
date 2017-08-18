/*
        Programmed By Benoit Lanteigne
        (c) Benoit Lanteigne, all rights reserved
        Licenced under GNU Affero General Public License 
    */

/*
 * Programmed by Benoit Lanteigne
 * 
 * 
 * The following code defines the IO module of the Rescue Editor. The IO module 
 * is responsible for communication between the editor and the “outside world”,
 * usually the web server of the application using Rescue, but it could be web
 * services or other. For the most part, this communication means obtaining 
 * necessary data and saving data. 
 * 
 * The IO module allows Rescue Editor to be independent from a specific backend
 * technologies and implementation. The IO module doesn’t care if the backend 
 * is implemented in PHP or Java or anything else. Nor does it care whether 
 * the data it requests or persist is stored in a SQL database, a NoSql 
 * solution, the file system directly or anywhere else. It only cares that the 
 * data provided to and obtained by the backend is in the correct format. This 
 * means the Rescue Editor can be integrated into any platform.
 */

/**
 * First, the IO module defines the concept of a UrlFormater. In order to be as 
 * independent to the backend as possible, the IO module needs a way to easily 
 * change the URL used to obtain or persist specific data. This is done by using 
 * two simple tools: the config and the UrlFormaters. The config is used to 
 * store configuration data used by the RescouseHtml. Said configuration data 
 * includes the urls used by the IO module. The UrlFormaters takes a URL obtained 
 * from the config and customize (or format) it in a way that allows it to be 
 * usable by the IO module. This concept will become clearer by studying one of 
 * the provided UrlFormaters, such as the BasicGetUrlFormater.
 */

/**
 * A class containing only ajax methods. The purpose of this class
 * is to simplify making ajax requests.
 */
class BlreAjax {
/**
 * Makes an ajax request
 * 
 * @param url The url of the ajax request
 * @param a_type The type of the ajax request, is a string that can have 
 * the value post or get. 
 * @a_data A javascript object containing data that must sent along with the
 * request
 * 
 * @return A promise that can be used to execute code once the request
 * is completed
 */
static request(a_url, a_type, a_data) { 
   
    return new Promise(
        function (resolve, reject) { // (A)
            let xhr = new XMLHttpRequest();
            xhr.onreadystatechange = function () {
              if (xhr.readyState === 4) {
                if (xhr.status === 200) {
                    try {
                        //Parse json if response is json json
                        let json = JSON.parse(xhr.responseText);
                        resolve(json);
                    } catch(error) {
                        // Any type of response other than JSOn is passed as 
                        //a normal string
                        resolve(xhr.responseText);
                    }

                } else {
                    reject(xhr.responseText + ' ' + a_url);
                }
              }
            };
            xhr.open(a_type, a_url);
            xhr.send(a_data);
        }); 
    }

    /**
     * Perfors a get ajax request
     * 
     * @return A promise that can be used to execute code once the request
     * is completed
     */
    static get(a_url) {
        return BlreAjax.request(a_url, 'GET');
    }

    /**
     * Performs a post ajax request
     * 
     * @param url The url of the ajax request
     * @a_data A javascript object containing data that must sent along with the
     * request
     * 
     * @return A promise that can be used to execute code once the request
     * is completed
     */
    static post(a_url, a_data) {
        return BlreAjax.request(a_url, 'POST', a_data);
    }
}

/*
*This particular formatter formats 
* URL used by get request. It as assume such a URL has a customizable ID 
* representing the resource that is obtained and no other variable parameters. 
* For instance, the configuration of Rescue Editor might contain a URL such as 
* the one below:
* 
* http://my-url.com/%id%
* 
* The BasicGetUrlFormatter would replace the %id% part of this base URL by an ID 
* uniquely representing the desired resource. So, if I was trying to obtain the
* resource identified by the id "my-res", BasicGetUrlFormatter will be used to
* change to previous URL into:
* 
*  http://my-url.com/%id%/my-res 
*  
*  via its format method
*/
class BlreBasicGetUrlFormatter {
    /**
    * Constructor for the BasicGetUrlFormatter. 
    *
    * @param {type} a_idPattern : Specify the string representing the id in the base
    * URL. Defaults to %id%, but it can be overriden if needed (though that is
    * unlikely)

    */
    constructor(a_idPattern) {
        a_idPattern = a_idPattern | '%id%';
        this._idPattern = '%id%';        
    } 
    
    /**
     * The format method of BasicGetUrlFormater. Every object fulfilling the role of
     * a UrlFormater needs to define such a method. It performs the actual formatting 
     * task. In the case of BasicGetUrlFormater, it takes a base URL and replace
     * the %id% part by the actual id of the desired resource.
     * 
     * @param {type} a_url the URL that will be formated, normally comes from the
     * configuration but it doesn't have to
     * @param {type} a_data: An object containing the parameters. An object is used for
     * easy extension if necessary. Here are the valid parameters that can be passed
     * via the object:
     *    -id: A string reprensting the desired resource. This id replaces the %id% 
     *         pattern in the base URL.
     * @returns {string} The formatted URL
     */
    format(a_url, a_data) {
        if(a_data && a_data.id) {
            a_url =a_url.replace(this._idPattern, a_data.id);
        }
        return a_url
    }
}

/**
 * BlreBaseLoader will probably never be instantiated. 
 * It’s a base class used for inheritance. 
 * BaseLoader defines the basic functionality to obtain data via a GET request.
 *  Other “classes” inherits from BaseLoader and extends its functionality for
 *  specific resources types. 
 */
class BlreBaseLoader {
    /**
     * The BaseLoader constructor. 
     */
    constructor() {
        // The _cache object is used as a simple mecanism to cache loaded resources
        // This way if a resources has already been loaded a web request will not 
        // be used to fetch the data again.
        this._cache = {};
        
        // The URL formatter used by the BaseLoader object. Defaults to 
        // BasicGetUrlFormatter and that's probably adequate for most cases.
        // Can be changed like this if necessary:
        // myLoader.urlFormatter = new MyForamterType();
        this.urlFormatter = new BlreBasicGetUrlFormatter();
    }
    

    /**
     * Obtains a resource via its unique ID. Will check the cache, if the resource 
     * is not there, will perform a web request via ajax through the _getHelper
     * method.
     * 
     * @param {type} a_id Unique ID representing the desired resource
     * @returns A promise that can be used to execute code once the resource is 
     * retrived. The promise's callback will receive the following parameter:
     *   -An array containing the id of the resource (same as_a_id) and the resource.
     *   It is suggested to use destructering when calling the _getHelper method
     *   to separate this array in appropriate variables
     *  
     */
    get(a_id) {
        let resource = this._getFromCache(a_id);
        
        if(!resource) {
            return this._getHelper(a_id);
        }
        
        return Promise.resolve([a_id, resource]);
    }

    /**
     * Sometimes, its necessary to load several resources before its possible to 
     * proceed. This can become complicated due to the asynchronous nature of obtaining
     * a resource via a web request. (or at least it was before the convertion to ES6)
     * The getMany methods solves this problem. 
     * It will load several resources and a promise is used to determine when they
     * are all loaded.
     * 
     * @param {type} a_ids An array of unique ID each identifying a different
     * resource.
     * @param {type} a_callback A function that will be called after the resources
     * are all loaded. The callback receives a single parameters:

     * @returns {undefined} A promise that can be used to execute code once all
     * resources are obtained. The promise's callback will received the following
     * parameter:
     *   -An object containing all the loaded resources. the ID of each 
     *    resource is the key.
     */
    getMany(a_ids) {
        // If no resources to load
        if(a_ids.length === 0) {
            return Promise.resolve({});
        }
        
        // Load each resources. Each load is monitored by a promise.
        // promosis (returned by the call to get). Each promises is put
        //in an array.
        var promises = [];
        for(let id of a_ids) {
             promises.push(this.get(id));
        }
        
        // promise.all only resolves when when all the promises in the passed
        //array are resolved. Thus, the then will only be executed once all
        // resources are loaded.
        return Promise.all(promises)
                .then(data => {
                    let[id, res] = data;
                    let resources = {};
                    for(let params of data) {
                        let [id, res] = params;
                        resources[id] = res;                        
                    }
                    return resources;
                });
    };       

    /**
     * A helper function that is only used internaly, obtains a resources from the
     * cache via its unique ID. If the resource isn't in the cache, then returns 
     * undefined.
     * 
     * @param {type} a_id The unique ID identify the desired resource
     * @returns {BLRE.BaseLoader._cache} The data representing the requested resource
     * if it was in the cache. If it wasn't the cache, returns undefined.
     */
    _getFromCache(a_id) {
        return this._cache[a_id];
    }


    /**
     * A helper function that is only used internaly. saves a resource into the
     * cache via its unique ID. 
     * 
     * @param {type} a_id The unique ID identify the desired resource
     * @param  a_resource The resource's data to be saved into the cache
     * @returns {BLRE.BaseLoader._cache} nothing
     */
    _setToCache(a_id, a_resource) {
        this._cache[a_id] = a_resource;
    }  

    /**
     * A helper function that is only used internally. Obtains a ressource via a web
     * request. This method needs to be adapted by inheritor of BaseLoader. there 
     * are two ways to adapt _getHelper
     *   -Assign a value to the configUrlKey member variable of the inheritor. That
     *   value will be used to access the configuration and obtain the correct
     *   base url
     *   -Override _getHelper completly in cases where the previous method isn't 
     *   sufficient.
     * 
     * @param {type} a_id A id that identifies a resource uniquely
     * @returns A promise that can be used to excute code once the resource as 
     * been retrived. The promise's callback will receive the following parameter:
     *   -An array containing the id of the resource (same as_a_id) and the resource.
     *   It is suggested to use destructering when calling the _getHelper method
     *   to separate this array in appropriate variables
     */
    _getHelper(a_id) {
        a_id = a_id || 'default';

        let url =  this.urlFormatter.format(BLRE.events.trigger('blre-get-config-value', this.configUrlKey), {id: a_id});

        let $this = this;
       
        let promise = BlreAjax.get(url);
        return promise.then(    
            resource =>{
               $this._setToCache(a_id, resource);
               return [a_id, resource];
           }, 
           message => {
               console.log('ajax call failed! ' + message);
            }
        );
    }    
}

/**
 * BlreBaseSaverLoader will probably never be instantiated. 
 * It’s a base class used for inheritance. 
 * BaseSaverLoader takes the functionality of BlreBaseLoader 
 *  and adds to it teh capacity of saving data by performing a 
 *  post ajax request.
 */
class BlreBaseSaverLoader extends BlreBaseLoader {
    constructor() {
        super();
    }
    
    /**
     * Post some data to a server, probably for saving said data
     * @param {type} a_data The data to be sent
     * @returns nothing
     */
    post(a_data) {
        let url =  this.urlFormatter.format(BLRE.events.trigger('blre-get-config-value', this.configPostUrlKey));
        return BlreAjax.post(url, a_data);
    }
}