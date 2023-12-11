const mongoose = require("mongoose");
const { DateTime } = require("luxon");

const Schema = mongoose.Schema;

const ChangeSchema = new Schema({
    user: {type: Schema.Types.ObjectId, ref: 'User', required: true},
    doc: { type: Schema.Types.ObjectId, refPath: 'docType', required: true},
    docType: { type: String, required: true, enum: ['Recipe', 'Category', 'Tag', 'Comment', 'User']},
    changeType: {  type: String, required: true},
}, { timestamps: true });


ChangeSchema.virtual('date').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString({...DateTime.DATE_SHORT, year: '2-digit'});
});

ChangeSchema.virtual('time').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.TIME_SIMPLE);
});



module.exports = mongoose.model("Change", ChangeSchema);