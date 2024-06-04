const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path'); // Adicionado para manipulação de caminhos

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

const {MongoClient, ObjectId} = require("mongodb");
async function connect(){
  if(global.db) return global.db;
    const conn = await MongoClient.connect("mongodb+srv://projetofofoca:QamAsfi0qk1YHzKY@fofoqueiros.myctr.mongodb.net/?retryWrites=true&w=majority&appName=Fofoqueiros");
  if(!conn) return new Error("Can't connect");
    global.db = await conn.db("unifor");
  return global.db;
}

// Definição do esquema e modelo do usuário
const userSchema = new mongoose.Schema({
    nome: String,
    idade: Number,
    nickname: String,
    email: { type: String, required: true },
    senha: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

// Rota raiz que serve o formulário de cadastro
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'G58cadastro.html'));
});

// Rota de cadastro de usuário
app.post('/cadastro-usuario', (req, res) => {
    const newUser = new User({
        nome: req.body.nome,
        idade: req.body.idade,
        nickname: req.body.nickname,
        email: req.body.email,
        senha: req.body.senha
    });

    newUser.save()
        .then(() => res.redirect('/public/G58gerenciamento.html'))
        .catch(err => res.status(400).send("Erro ao salvar os dados"));

});

// Configuração do servidor para escutar em uma porta específica
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
