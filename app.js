//Intalação de Programas
// 1. MongoDB (Banco de dados)
// 2. Bootstrap (Front End), criar uma pasta /Public/ e gravar os arquivos
// 3. Dentro da pasta Public, copiar as pastas /css e /js do bootstrap

// Istalar os seguintes pacotes
// npm install --save express
// npm install --save express-handlebars
// npm install --save body-parser
// npm install --save mongoose
// npm install --save express-session (usado para criar seções e armazenar dados inseridos no sistema)
// npm install --save connect-flash
// npm install --save bcryptjs
// npm install --save passport 
// npm install --save passport-local

// abrir um cmd e digitar mongod, para colocar o servidor mongo para rodar

// criar uma pasta "views/partials" para padronizar um cabeçalho em seu template
// em https://getbootstrap.com/ produrar em documentação por NavBars

// Sistema de autenticação, tem várias opções e pode ser encontrados em
// http://www.passportjs.com

// Para publicação da aplicação usar http://www.heroku.com
// Peprando a aplicação, ir na pasta raiz da aplicação e digitar: npm init
// pressionar ENTER até gerar o arquivo PACKAGE.JSON

// site para armazenar dados MongoDB, o https://mlab.com

// Para publicação
// instalar o git-scm pelo site https://git-scm.com
// executar no prompt os seguintes comandos:
// 1. git init
// 2. git add .
// 3. git commit -am "initial commit"

// 4. heroku create             **Para criar uma nova aplicação
// 5. heroku git:remote -a evening-earth-00305         **evening-earth-00305 (é o nome da aplicação)
// 6. git push heroku master
// 7. heroku open        **Para testar a aplicação


// Carregando os módulos
const express = require('express')
const handlebars = require('express-handlebars')
const bodyParser = require('body-parser')
const app = express()
const admin = require('./Routes/admin.js')
const path = require('path') //já vem com o node
const mongoose = require('mongoose')
const session = require('express-session')
//const MongoStore = require('connect-mongo')(session)
const flash = require('connect-flash')
require('./models/Postagem.js')
const Postagem = mongoose.model('postagens')
require('./models/Categoria.js')
const Categoria = mongoose.model('categorias')
const usuarios = require('./Routes/usuario.js')
const passport = require('passport')
require('./config/auth.js')(passport)


const MongoClient = require('mongodb').MongoClient
//const uri = "mongodb+srv://admin:R4m5l4@blogapp-prod-pyvks.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority"

const client = new MongoClient("mongodb+srv://admin:R4m5l4@blogapp-prod-pyvks.gcp.mongodb.net/<dbname>?retryWrites=true&w=majority", { useNewUrlParser: true })
client.connect(err => {
  const collection = client.db("test").collection("devices") 
  client.close()
})

//Configurações
    //Sessão
    app.use(session({   // app.use --> criarção de middleware
        secret: "CursoNode",
        resave: true,
        saveUninitialized: true//,
        //useNewUrlParser: true
    })) 

    app.use(passport.initialize())
    app.use(passport.session())

    app.use(flash())
    // Middleware
    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        res.locals.error = req.flash("error")
        res.locals.user = req.user || null //Variável criado pelo pacotee do passport
        next()
    })
    // Body Parser
        app.use(bodyParser.urlencoded({extended: true}))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({ defaultLayout: 'main'}))
        app.set('view engine','handlebars')
    // Mongoose

    
    


        mongoose.Promise = global.Promise //Sempre utilizar esta linhapara acesso ao mongoose
        
        client.connect(err => {
            const collection = client.db("test").collection("devices");
            // perform actions on the collection object
            client.close();
          });
        //mongoose.connect(db.mongoURI, {useNewUrlParser: true}).then(() => { //db.mongoURI
        //    console.log("Base de Dados Mongo Conectada")
        //}).catch((err) => {
        //    console.log("Erro ao acessar base de dados"+err)
        //})
    // Public
        app.use(express.static(path.join(__dirname, 'public')))  // anuncia ao node que a pasta com arquivos estáticos é a public
//Rotas
    app.get('/', (req,res) => {
        Postagem.find().lean().populate('categoria').sort({data:"desc"}).then((postagens) => {
            res.render('index', {postagens: postagens})
        }).catch((err) => {
            req.flash("error_msg", "Ocorreu um erro interno")
            res.redirect('/404')
            console.log(err)
        })
        //res.send('Rota Principal')
        
    })


    app.get('/postagem/:slug', (req,res) => {
        Postagem.findOne({slug: req.params.slug}).lean().then((postagem) => {
            if(postagem){
                res.render('postagem/index.handlebars', {postagem: postagem})
            }else{
                req.flash("error_msg","Postagem não encontrada")
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash("error_msg","Erro interno")
        })
    })

    app.get('/categorias', (req,res) => {
        Categoria.find().lean().then((categorias) => {
            res.render('categorias/index.handlebars', {categorias: categorias})
        }).catch((err) => {
            req.flash("error_msg","Erro interno")
        })
    })

    app.get('/categorias/:slug', (req,res) => {
        Categoria.findOne({slug: req.params.slug}).lean().then((categoria) => {
            if(categoria){
                Postagem.find({categoria: categoria._id}).lean().then((postagens) => {
                    res.render('categorias/postagens.handlebars', {postagens: postagens, categoria: categoria})
                })
                
            }else{
                req.flash("error_msg","Categoria não encontrada")
                res.redirect('/')
            }
        }).catch((err) => {
            req.flash("error_msg","Erro interno ao carregar pagina desta categoria")
        })
    })

    app.get('/404', (req,res) => {
        res.send('Erro 404!')
    })

    app.use('/admin', admin) // com isso é criado um prefixo as rotas, neste caso admin
    app.use('/usuarios', usuarios)// com isso é criado um prefixo as rotas, neste caso usuarios


// Outros
const PORT = process.env.PORT || 8081 // o comando process.env.PORT é usado no HEROKU
app.listen(PORT, () => {
    console.log("Servidor Rodando")
})