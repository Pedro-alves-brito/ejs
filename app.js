const express = require("express");
const path = require("path");

const App = express();

// Configurar EJS
App.set("view engine", "ejs");
App.set("views", path.join(__dirname, "mvc/views"));
App.use(express.static(path.join(__dirname, "public")));

// Middleware para processar dados do formulário
App.use(express.urlencoded({ extended: true }));

// Simulação de usuário válido
const user = "admin"
const Senha1= "123456" 

// Página inicial
App.get("/", (req, res) => {
    res.render("index", {
        nome: "Pedro",
        texto: "Você é um ser muito interessante, não dá pra entendê-lo"
    });
});

// Página de login
App.get("/login", (req, res) => {
    res.render("Login", { erro: null });
});

// Processar login
App.post("/logar", (req, res) => {
    const { conta, senha } = req.body;

    if (conta === user && senha === Senha1) {
        res.render("index", { nome: conta, texto: "Login realizado com sucesso!" });
    } else {
        res.render("Login", { erro: "Usuário ou senha incorretos!" });
    }
});

// Iniciar servidor
App.listen(3000, () => console.log("Aplicação ON"));
