const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    nome: String,
    idade: Number,
    nickname: String,
    email: { type: String, required: true },
    senha: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

module.exports = User;
