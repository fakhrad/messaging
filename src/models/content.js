var mongoose = require('mongoose');
var sysfld = require('./sys');
var ctype = require('./contentType');
var status = require('./status');
var Schema = mongoose.Schema;

var content = new Schema({
    sys : {type:sysfld, required :true},
    requestId : {type: Schema.Types.ObjectId, ref: 'Request' },
    fields : {type : Object},
    status : {type : String, enum : ['draft', 'published', 'changed', 'archived'], default : 'draft'},
    statusLog : [status],
    versions : [Object],
    contentType : {type: Schema.Types.ObjectId, ref: 'ContentType' , required : true},
    userinfo : {type : Object}
});

module.exports = mongoose.model("Content", content);