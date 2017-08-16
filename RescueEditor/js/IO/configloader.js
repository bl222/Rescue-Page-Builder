/**
 * Programmed by Benoit Lanteigne
 * 
 * The configuration module is used to handle the configuration of Rescue.
 * The configuration is defined as a JSON file that provides values specifying
 * customizable options such as a URL for loading an HTML block. 
 * 
 * The Rescue Editor only specifies the format in which the configuration must
 * be offered to REscue (Json by default). It does not defines how the configuration 
 * is stored (database, json file, other) or how the end user modifies the configaration.
 * These details are left to the application using the Rescue Editor
 * 
 * If the JSON format is inappropriate for your need, a new configuration module
 * supporting the desired format (such as XML) can be written.
 */

let blreTmp = function () {
    // This object will contain the configuration values.
    let config = {};

    /**
     * The first thing the rescue editor needs to to is load the configuration for
     * the editor. This is done by firing theblre-async-load-config event. This event obtains
     * the configuration and returns a promise. The rescue editor UI can then be
     * initialized through this promise. NOTE: The default configuration module expects
     * the loaded configuration to be in JSON. If you needd another format, such as
     * XML for exemple, then you will need to code a diffirent configuration module. 
     * 
     * Since loading the configutation is done with an event, other modules are decoupled
     * from the Config module. It's possible to replace
     * the Config module by a new one using a completly different implementation and as
     * long as it defines the blre-async-load-config correctly Rescue Editor will
     * still work.
     * 
     * The async part of the event name indiquates that this event is asynchronous
     * and thus returns a promise.
     * 
     * When triggered, the blre-async-load-config expect as parameter an object
     * with the folloing values:
     *    -url: Url from which the configuration is loaded.
     *  return: a promise that can be used to execute code once the configuration 
     *  is loaded. The promise's callback does not receive a parameter
     */
    BLRE.events.bind('blre-async-load-config', function(a_data) {
        let promise = BlreAjax.get(a_data.url);

        return promise.then(a_config => {
                config = a_config;
            },
            () => {
                console.log('Error! blre config loading failed');
            }

        );
    });


    /**
     * Whenever a different module from Config needs to obtain a value from the configuration
     * , it can fire the blre-get-config-value event defined below. In this way, the
     * other modules are decoupled from the Config module. It's possible to replace
     * the Config module by a new one using a completly different implementation and as
     * long as it defines the blre-get-config-value correctly Rescue Editor will
     * still work.
     * 
     * When triggered, the blre-async-html-persistance-create-root expect as parameter a
     * key string identifying the desired value from the configuration data.
     * 
     * return: The configuration value identified by the passed key
     */
    BLRE.events.bind('blre-get-config-value', a_key => {
        return config[a_key];
    });
}();