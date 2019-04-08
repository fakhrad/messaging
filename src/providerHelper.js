const email = require('./providers/email/sendgridService');
const push = require('./providers/push/fcmService');
const sms = require('./providers/sms/knService')
const config = require('./config');

const service = undefined;
exports.getsmsservice = ()=>{
    return sms;
}

exports.getemailservice = ()=>{
    return email;
}

exports.getpushservice = ()=>{
    return push;
}

exports.getservice = (type)=>{
    switch(type)
    {
        default :
        case "push" : 
            return getpushservice();
        case "sms" : 
            return getsmsservice();
        case "email" : 
            return getemailservice();
    }
}