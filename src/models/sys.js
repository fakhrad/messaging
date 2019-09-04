var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var sys = new Schema(
  {
    link: { type: String },
    type: { type: String },
    spaceId: { type: String, required: true },
    issuer: { type: String },
    issueDate: { type: Date, required: true, default: new Date() },
    lastUpdater: { type: Object },
    lastUpdateTime: { type: Date }
  },
  { _id: false },
  { id: false },
  { toJSON: { virtuals: true } }
);

module.exports = sys;
