const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const session = require('express-session');

const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use(session({
  secret: 'seu_segredo', 
  saveUninitialized: true,
  cookie: { secure: false } 
}));

mongoose.connect('mongodb://localhost:27017/fofoqueiras', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const userSchema = new mongoose.Schema({
  nome: String,
  idade: Number,
  nickname: String,
  email: String,
  senha: String
});

const User = mongoose.model('User', userSchema);

app.post('/cadastro-usuario', async (req, res) => {
  const { nome, idade, nickname, email, senha } = req.body;

  try {
    const hash = bcrypt.hashSync(senha, 10);
    const novoUsuario = new User({ nome, idade, nickname, email, senha: hash });
    await novoUsuario.save();
    res.status(201).send('Usuário cadastrado com sucesso! Prossiga para o login.');
  } catch (error) {
    res.status(500).send('Erro ao cadastrar usuário.');
  }
});

app.post('/login', async (req, res) => {
  const { email, senha } = req.body;

  try {
    const usuario = await User.findOne({ email });
    if (usuario && bcrypt.compareSync(senha, usuario.senha)) {
      req.session.userId = usuario._id; // armazena o ID do usuário na sessão
      res.json({ success: true });
    } else {
      res.json({ success: false, message: 'Email ou senha incorretos' });
    }
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).send('Erro no servidor.');
  }
});

function autenticar(req, res, next) {
  if (req.session.userId) {
    next();
  } else {
    res.redirect('/G58login.html');
  }
}

app.get('/G58gerenciamento.html', autenticar, (req, res) => {
  res.sendFile(__dirname + '/G58gerenciamento.html');
});

app.get('/usuarios/current', autenticar, async (req, res) => {
  try {
    const userId = req.session.userId;
    const usuario = await User.findById(userId);
    res.json(usuario);
  } catch (error) {
    res.status(500).send('Erro ao obter os dados do usuário.');
  }
});

app.put('/atualizar-usuario', autenticar, async (req, res) => {
  const userId = req.session.userId;
  const { nome, idade, nickname, email, senha } = req.body;

  try {
    const hash = bcrypt.hashSync(senha, 10);
    await User.findByIdAndUpdate(userId, { nome, idade, nickname, email, senha: hash });
    res.status(200).send('Dados do usuário atualizados com sucesso!');
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).send('Erro ao atualizar usuário.');
  }
});

app.get('/usuarios', autenticar, async (req, res) => {
  try {
    const usuarios = await User.find({}, 'nickname idade nome email');
    res.json(usuarios);
  } catch (error) {
    res.status(500).send('Erro ao obter usuários.');
  }
});

app.use(express.static('public'));

app.listen(port, () => {
  console.log(`Servidor rodando em http://localhost:${port}`);
});
