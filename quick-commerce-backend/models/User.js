const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String },
  email: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['customer', 'delivery'], required: true }
});

module.exports = mongoose.models.User || mongoose.model("User", UserSchema);
