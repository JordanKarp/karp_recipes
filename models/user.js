const mongoose = require("mongoose");

const { Schema } = mongoose;

const UserSchema = new Schema({
  username: {type: String, required: true },
  hash: {type: String, required: true },
  salt: {type: String, required: true }
});


// Virtual for Users's URL
UserSchema.virtual("url").get(function () {
    // We don't use an arrow function as we'll need the this object
    return `/user/${this._id}`;
  });

// Export model
module.exports = mongoose.model("User", UserSchema);
