var mongoose = require('mongoose');
var sysfld = require('./sys');
var Status = require('./status');
var Schema = mongoose.Schema;
 
var asset = new Schema({
    sys : {type : sysfld, required : true},
    name : {type : String, required:true},
    title : {type : Object, required : true},
    description : {type : Object},
    url : {type : Object},
    fileType : {type: Object},
    status : {type : String, enum : ['draft', 'published', 'changed', 'archived'], default : 'draft'},
    statusLog : [Status]
});

module.exports = mongoose.model("Asset", asset);