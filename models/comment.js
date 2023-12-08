const mongoose = require('mongoose');
const { DateTime } = require("luxon");


const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  username: { type: String, required: true },
  content: { type: String, trim: true, required: true },
  recipe: {type: Schema.Types.ObjectId, ref: 'Recipe'}
}, { timestamps: true });

CommentSchema.virtual('date').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.DATE_SHORT)
});

module.exports = mongoose.model('Comment', CommentSchema);