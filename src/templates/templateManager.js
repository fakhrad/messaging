var Templates = require('../models/templates');
exports.getTemplateById = (templateId, callback)=>{
    Templates.findById(templateId, (err, template)=>{
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            callback(result);       
            return; 
        }
        else
        {
            if (template)
            {
                result.success = true;
                result.data =  template;
                result.error = undefined;
                callback(result);       
                return; 
            }
            result.success = false;
            result.data =  undefined;
            result.error = undefined;
            callback(result);       
            return; 
        }
    });
}

exports.bind = (template, data)=>{
    console.log("Binding template to data-->" +JSON.stringify(template) + "----" + JSON.stringify(data));
    Object.keys(data).forEach(key => {
        var value = data[key];
        if (value)
        {
            template.body = template.body.replace("{@" + key + "}", value.toString());
        }
    });
}