var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var field = new Schema({
    name : {type:Object, required :true},
    title : {type : Object, required : true},
    desc : {type : Object},
    type : {type : Object, required : true},
    isBase : {type : Boolean, default : false},
    localize : {type : Boolean, default : false}
}, {_id : false}, {id : false}, { toJSON: { virtuals: true } });
  
module.exports = field;