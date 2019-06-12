var Templates = require('../models/templates');
exports.getTemplateById = (templateId, callback)=>{
    Templates.findById(templateId, (err, template)=>{
        var result = {success : false, data : null, error : null };
        if (err)
        {
            result.success = false;
            result.data =  undefined;
            result.error = err;
            cb(result);       
            return; 
        }
        else
        {
            if (template)
            {
                result.success = true;
                result.data =  template;
                result.error = undefined;
                cb(result);       
                return; 
            }
            result.success = false;
            result.data =  undefined;
            result.error = undefined;
            cb(result);       
            return; 
        }
    });
}