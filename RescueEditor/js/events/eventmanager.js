

/* 
 * Programmed by Benoit Lanteigne
 * 
 * This file defines the event manager used by the HtmlRescue editor. HtmRescue 
 * is composed of several decoupled modules each performing specific tasks. The
 * mains such modules are the io module, the templating module, the composite
 * module and the ui module. Since they are decoupled, each module could be 
 * replaced by a new one performing a similar task without any effect of the 
 * other modules. For example, someone could customize the user interface by
 * rewriting a completely new UI module without having to touch the other  
 * modules. This decoupling is possible via the event manager which handles 
 * communication between the various modules via an observer pattern.
 */


/*Add a method to the string prototype to facilitate replacing all occurance of a string
in another string.*/
if(!String.prototype.blreReplaceAll) {
    String.prototype.blreReplaceAll = function(search, replacement) {
        let target = this;
        
        if(!(search instanceof RegExp)) {
            search = search.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
            search = RegExp(search, 'g') ;
        }    
      
            
        return target.replace(search, replacement);
    };
}

// Used for namespacing purposes through the RescueHtml project
var BLRE = {};


/**
 * Use to create a new event manager object
 * @returns {BLRE.EventsManager}
 */
class BlreEventsManager {
    constructor() {
        this._events = {};
    }

    /**
     * 
     * The bind mecanism of the observer patters. Binds a callback to a specific 
     * event. When the event is triggered (see trigger method), the callback binded 
     * to the event is called.
     * 
     * NOTE: Normally, in the observer pattern you can bind several callback to a 
     * single event. This wasn't necessary for the purpose of HtmlRescue so to
     * make a few things simpler, it is only possible to bind one callback per event.
     * In this way, the events in RescueHtml are more like decoupled method calls
     * then traditional events
     * 
     * @param {type} event A string representing the event the callback will be 
     * binded to
     * @param {type} callback A function or method that will be called when the
     * relatd event is triggered. The callback can have two parameters, the first
     * for the data passed by the call to trigger, the other for the data passed by 
     * the call to bind
     * @param {type} data Custom data that the callback will receive as its second
     * parameter when the related event is triggered. Rarely useful, but its there
     * just in case. The data can be anything, but it is recommanded it takes the 
     * form of a hash/JavaScript object for flexibility purposes.
     * @returns {undefined}
     */
    bind(event, callback, data)     {
        this._events[event] = {
            bindedData: data,
            callback: callback
        };
    }; 
    
    /**
     * The trigger mecanism of the observer pattern. Triggers an event and in doing 
     * so the callback binded to that event is called.
     * @param {type} event A unique string representing the event that is fired
     * @param {type} data This is passed to the callback as its first parameter. The 
     * data can be anything, but it is recommanded it takes the 
     * form of a hash/JavaScript object for flexibility purposes.
     * @returns {unresolved} The return value of the callback. This can be done
     * because in this version of the observer pattern an event can only be binded to
     * one callback.
     */
    trigger(event, data) {
        let e = this._events[event];
        return e.callback(data, e.bindedData);
    };

    exists(event) {
        return this._events[event] !== undefined;
    };    
}

// The event manager that will be used by RescueHtml
BLRE.events = new BlreEventsManager();