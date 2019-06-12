const provider = require('./../providerHelper');
const templateManager = require('../templates/templateManager');

exports.sendVerfiyCode = (phoneNumber, code, cb)=>{
    var result = {success : false, data : null, error : null };
    const service = provider.getsmsservice();
    if (service != undefined)
    {
        console.log("cote to client : " , code);
        service.sendMessage(phoneNumber, code, function(status, response)
        {
            if (status != 200)
            {
                result.success = false;
                result.data =  response;
                result.error = status;
                cb(result);       
                return; 
            }
            result.success = true;
            result.error = undefined;
            result.data =  response;
            cb(result); 
        });
    }
}

exports.sendMessage = (phoneNumber, message, cb)=>{
    const service = provider.getsmsservice();
    var result = {success : false, data : null, error : null };
    if (service != undefined)
    {
        service.sendMessage(phoneNumber, message, function(status, response){
            if (status != 200)
            {
                result.success = false;
                result.data =  response;
                result.error = status;
                cb(result);       
                return; 
            }
            result.success = true;
            result.error = undefined;
            result.data =  response;
            cb(result); 
        });
    }
}

exports.sendPushMessage = (device, message, data, cb)=>{
    const service = provider.getpushservice();
    var result = {success : false, data : null, error : null };
    if (service != undefined)
    {
        service.sendMessage(device, message, data, function(status, response){
            if (status != 200)
            {
                result.success = false;
                result.data =  response;
                result.error = status;
                cb(result);       
                return; 
            }
            result.success = true;
            result.error = undefined;
            result.data =  response;
            cb(result); 
        });
    }
}

var sendEmailMessage = (message, cb)=>{
    console.log("Start sending email ");
    const service = provider.getemailservice();
    var result = {success : false, data : null, error : null };
    if (service != undefined)
    {
        service.sendMessage(message, function(status, response){
            if (status != 200)
            {
                result.success = false;
                result.data =  response;
                result.error = status;
                cb(result);       
                return; 
            }
            result.success = true;
            result.error = undefined;
            result.data =  response;
            cb(result); 
        });
    }
}
exports.sendEmailMessage = sendEmailMessage;

exports.sendEmailByTemplate = (templateId, data, cb)=>{
    templateManager.getTemplateById(templateId, (result)=>{
        if (result.success)
        {
            var template = result.data;
            console.log(JSON.stringify(data));
            // template.body.replace("{@first_name}", data.first_name);
            var message = {
                to: data.username,
                from: "admin@reqter.com",
                subject: template.title.fa,
                text: undefined,
                html: template.body
            };
            console.log(JSON.stringify(message));

            sendEmailMessage(message, cb);
        }
    });
    
}