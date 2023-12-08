const mongoose = require("mongoose");
const { DateTime } = require("luxon");


const Schema = mongoose.Schema;

const ChangeSchema = new Schema({
    user: { type: String, required: true},
    docType: { type: String, required: true},
    doc: { type: String, required: true},
    changeType: {  type: String, required: true},
}, { timestamps: true });


ChangeSchema.virtual('date').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATETIME_SHORT)
});

ChangeSchema.virtual("description").get(function () {
  return `${this.date} - ${this.user} ${this.changeType}d the ${this.docType}: ${this.doc}`;
});

module.exports = mongoose.model("Change", ChangeSchema);