
/**
 * Programmed by Benoit Lanteigne
 * 
 * The template module is mainly used to insert data into template. Templates can
 * be pretty much anything such as base HTML files or base CSS files. 
 * The templating module defines the syntax to be used when writing template. If
 * a new syntax is desired, a new templating module can be provided. Since every
 * module is decoupled, it should in theory be possible to replace the templating
 * module without affecting the other modules as long as it is done correctly.
 * 
 * NOTE: The current templating module uses Mustache
 */
 
 /**
  * Base class for temlpate engines you'll want to create. Doesn't do anything
  * except offer a way to parse template using Mustache.
  */
class BaseTemplateHandler {
    
    /**
     * constructor for BaseTemplateHandler
     */
    constructor() {
    }
    
    /*
     * Renders a template using mustache
     * @param {type} a_template The template to be rendered
     * @param {type} a_json Json that specifies which data is rendered inside the template
     * @returns {unresolved} The rendered template
     */ 
    renderTemplate(a_template, a_json) { console.log(a_json);
        Mustache.parse(a_template);   // optional, speeds up future uses
        return Mustache.render(a_template, a_json);    
    };    
    
}





