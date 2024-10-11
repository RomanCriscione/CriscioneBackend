const mongoose = require("mongoose");

const userCollection = "Users";

const userSchema = new mongoose.Schema({
    first_name: { type: String, required: true }, 
    last_name: { type: String, required: true },  
    email: { type: String, unique: true, required: true },
    age: { type: Number, required: true }, 
    password: { type: String, required: true }, 
    cart: { type: mongoose.Schema.Types.ObjectId, ref: 'Cart' },
    role: { type: String, default: 'user' }
});

const User = mongoose.model(userCollection, userSchema);

module.exports = User;
