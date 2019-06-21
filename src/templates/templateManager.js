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

exports.bind = (text, data, user, space)=>{
    //console.log("Binding template to data-->\r\n" +JSON.stringify(template) + "\r\n----" + JSON.stringify(data));
    Object.keys(data).forEach(key => {
        var value = data[key];
        if (value)
        {
            text = text.replace("{@" + key + "}", value.toString());
        }
    });
    console.log(text);
    text = text.replace("{@appName}", "Reqter");
    text = text.replace("{@link}", "http://app.reqter.com/verify/" + data._id);
    console.log(text);
    return text;
}