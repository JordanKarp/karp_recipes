const mongoose = require('mongoose');
const { DateTime } = require("luxon");


const Schema = mongoose.Schema;

const CommentSchema = new Schema({
  user: {type: Schema.Types.ObjectId, ref: 'User'},
  rating: { type: Number, trim: true },
  content: { type: String, trim: true, required: true },
  recipe: {type: Schema.Types.ObjectId, ref: 'Recipe'}
}, { timestamps: true });



CommentSchema.virtual('date').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString({...DateTime.DATE_SHORT, year: '2-digit'});
});

CommentSchema.virtual('time').get(function () {
  return DateTime.fromJSDate(this.createdAt).toLocaleString(DateTime.TIME_SIMPLE);
});



module.exports = mongoose.model('Comment', CommentSchema);