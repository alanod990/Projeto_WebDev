const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

mongoose.connect("mongodb+srv://projetofofoca:QamAsfi0qk1YHzKY@fofoqueiros.myctr.mongodb.net/unifor?retryWrites=true&w=majority", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("Conectado ao MongoDB");
}).catch(err => {
  console.error("Erro ao conectar ao MongoDB:", err);
});

const userSchema = new mongoose.Schema({
  nome: String,
  idade: Number,
  nickname: String,
  email: { type: String, required: true },
  senha: { type: String, required: true }
});

const User = mongoose.model('User', userSchema);

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'G58cadastro.html'));
});

app.post('/cadastro-usuario', async (req, res) => {
  console.log('Dados recebidos:', req.body);

  try {
    const hashedSenha = await bcrypt.hash(req.body.senha, 10);

    const newUser = new User({
      nome: req.body.nome,
      idade: req.body.idade,
      nickname: req.body.nickname,
      email: req.body.email,
      senha: hashedSenha
    });

    await newUser.save();
    console.log('Usuário salvo com sucesso');
    res.status(200).send('Usuário cadastrado com sucesso');
  } catch (err) {
    console.error("Erro ao salvar os dados:", err);
    res.status(400).send("Erro ao salvar os dados");
  }
});

app.get('/usuarios', async (req, res) => {
  try {
    const users = await User.find();
    res.json(users);
  } catch (err) {
    console.error("Erro ao buscar os dados:", err);
    res.status(500).send("Erro ao buscar os dados");
  }
});

app.post('/login', (req, res) => {
  const { email, senha } = req.body;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(400).json({ success: false, message: 'Usuário não encontrado' });
      }

      const isMatch = bcrypt.compareSync(senha, user.senha);

      if (!isMatch) {
        return res.status(400).json({ success: false, message: 'Senha incorreta' });
      }

      res.json({ success: true, message: 'Login bem-sucedido' });
    })
    .catch(err => {
      console.error('Erro no login:', err);
      res.status(500).json({ success: false, message: 'Erro no servidor' });
    });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
