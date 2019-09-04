
/**
 * Module dependencies.
 */

var mongoose = require('mongoose');
var Schema = mongoose.Schema;
/**
 * Schema definitions.
 */

 const space = new Schema({
  name : {type : String, required : true, max : 150, min : 3},
  description : {type : String, max : 256},
  image : {type : Object},
  type : {type : String},
  owner : {type: Schema.Types.ObjectId, ref: 'Systemuser' , required : true},
  roles : [],
  locales : [],
  webhooks : []
});

module.exports = mongoose.model('Space', space);