const express = require("express");
const path = require("path");
const bcrypt = require('bcrypt');
const mysql = require('mysql2/promise');

const App = express();

// Configurar EJS
App.set("view engine", "ejs");
App.set("views", path.join(__dirname, "mvc/views"));
App.use(express.static(path.join(__dirname, "public")));

// Middleware para processar dados do formulário
App.use(express.urlencoded({ extended: true }));
App.use(express.json());

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '', // Adicione sua senha do MySQL se houver
    database: 'login'
});

// Página inicial
App.get("/", (req, res) => {
    res.render("index", {
        nome: "Visitante", // Valor padrão
        texto: null
    });
});

// Página de login
App.get("/login", (req, res) => {
    res.render("login", { 
        erro: null,
        layout: false // Se estiver usando layouts
    });
});

// Processar login
App.post("/logar", async (req, res) => {
    const { conta, Senha } = req.body;

    try {
        // Consulta ao banco para verificar usuário e senha JUNTOS
        const [rows] = await pool.query(
            'SELECT * FROM conta WHERE usuario = ? AND senha = ?',
            [conta, Senha]  // Comparação direta
        );

        console.log('Resultado da consulta:', rows);

        if (rows.length > 0) {
            const usuario = rows[0]; // Armazena o usuário encontrado
            
            if (usuario.admin === 1) {
                // Para admin - mostra todos os usuários (exemplo)
                const [todosUsuarios] = await pool.query('SELECT idconta, usuario, senha, admin FROM conta');
                res.render("index", {
                    nome: usuario.usuario, // Mostra o nome do admin
                    texto: "Modo Administrador",
                    usuarios: todosUsuarios // Envia a lista formatada
                });
            } else {
                // Para usuário normal
                res.render("index", {
                    nome: usuario.usuario,
                    texto: "Login realizado com sucesso!",
                    usuarios: null
                });
            }
        } else {
            res.render("error");
        }

    } catch (err) {
        console.error("Erro no login:", err);
        res.render("login", { 
            erro: "Erro no servidor. Tente novamente." 
        });
    }
});


// Rota para exibir página de cadastro (GET)
App.get("/cadastro", (req, res) => {
    res.render("cadastro", { erro: null });
});

// Rota para processar cadastro (POST)
App.post("/cadastrar", async (req, res) => {
    const { usuario, senha } = req.body;

    try {
        // Verifica se usuário já existe
        const [rows] = await pool.query(
            'SELECT * FROM conta WHERE usuario = ?',
            [usuario]
        );

        if (rows.length > 0) {
            return res.render("cadastro", {
                erro: "Usuário já existe!"
            });
        }

        // Insere no banco (senha em texto puro)
        await pool.query(
            'INSERT INTO conta (usuario, senha) VALUES (?, ?)',
            [usuario, senha]
        );

        res.redirect("/login?cadastro=sucesso");

    } catch (err) {
        console.error("Erro no cadastro:", err);
        res.render("cadastro", {
            erro: "Erro ao cadastrar. Tente novamente."
        });
    }
});

// Rota para recuperação de senha (GET)
App.get("/recuperar", (req, res) => {
    res.render("recuperar", { erro: null, sucesso: null });
});

// Rota para processar recuperação (POST)
App.post("/recuperar-senha", async (req, res) => {
    const { usuario, novaSenha } = req.body;

    try {
        // Verifica se usuário existe
        const [rows] = await pool.query(
            'SELECT * FROM conta WHERE usuario = ?',
            [usuario]
        );

        if (rows.length === 0) {
            return res.render("recuperar", {
                erro: "Usuário não encontrado!",
                sucesso: null
            });
        }

        // Atualiza senha (em texto puro)
        await pool.query(
            'UPDATE conta SET senha = ? WHERE usuario = ?',
            [novaSenha, usuario]
        );

        res.render("recuperar", {
            erro: null,
            sucesso: "Senha alterada com sucesso!"
        });

    } catch (err) {
        console.error("Erro ao recuperar senha:", err);
        res.render("recuperar", {
            erro: "Erro ao alterar senha. Tente novamente.",
            sucesso: null
        });
    }
});

// Rota para a página de erro
App.get("/error", (req, res) => {
    res.render("error");
});

// Iniciar servidor
App.listen(3000, () => console.log("Aplicação ON na porta 3000"));