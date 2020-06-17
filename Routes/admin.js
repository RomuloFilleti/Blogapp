const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categoria')
const Categoria = mongoose.model('categorias')
require('../models/Postagem')
const Postagem = mongoose.model('postagens')
const {eAdmin} = require('../helpers/eAdmin.js')

router.get('/', eAdmin, (req,res) => {
    res.send("Página principal do painel ADM")
})

router.get('/posts', eAdmin, (req,res) => {
    res.send('Pagina Posts')
})

router.get('/categorias', eAdmin, (req,res) =>{
    Categoria.find().sort({nome: 'desc'}).lean().then((categorias) => { //.sort({date: 'desc'}) - serve para ordenar pela data
        res.render('./admin/categorias.handlebars', {categorias: categorias})
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Erro ao listar ao listar as categorias")
        res.redirect('/admin')
    })
    //res.send('Pagina Categorias')
})

router.get('/categorias/add', eAdmin, (req,res) => {
    res.render('./admin/addcategorias.handlebars')
})

router.post('/categorias/nova', eAdmin, (req,res) => {

    var erros = [] // array
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erros.push({texto: "Nome invalido"}) //push serve para colocar um novo dado dentro do array
    }

    if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
        erros.push({texto: "Slug invalido"}) //push serve para colocar um novo dado dentro do array
    }

    if(req.body.nome.length < 4) {
        erros.push({texto: "Nome da categoria muito pequeno"})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias.handlebars", { erros: erros})
    }else{
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }
            new Categoria(novaCategoria).save().then(() => {
                req.flash("success_msg", "Categoria criada com sucesso!") // Carrega o texto: Categoria... para variável: success_msg
                res.redirect('/admin/categorias')
                //console.log ("Categoria Cadastrada com Sucesso")
            }).catch((err) => {
                console.log(err)
                req.flash("error_msg", "Erro ao criar categoria!"+err) // Carrega o texto: Categoria... para variável: success_msg
                res.redirect('/admin')
                //console.log("Erro ao cadastrar"+err)
            })
        }
    })
    
router.get('/categorias/edit/:id', eAdmin, (req,res) => {
    Categoria.findOne({_id: req.params.id}).lean().then((categoria) => {
        res.render('admin/editcategorias', {categoria: categoria})
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Erro ao encontrar a Categoria")
        res.redirect('/admin/categorias')
    })
    
    //res.send("Pagina de edição")
})

router.post('/categorias/edit', eAdmin, (req,res) => {
    Categoria.findOne({_id: req.body.id}).then((categoria) => {
        
        categoria.nome = req.body.nome
        categoria.slug = req.body.slug
        
        categoria.save().then(() => {
            req.flash("success_msg","Categoria Editada com sucesso")
            res.redirect('/admin/categorias')
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Erro ao cadastrar a categoria "+err)
            res.redirect('/admin/categorias')
        })
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Erro ao editar a Categoria")
        res.redirect("/admin/categorias")
    })
    
    //res.send("Pagina de edição")
})

router.post('/categorias/deletar', eAdmin, (req,res) => {
    Categoria.deleteOne({_id: req.body.id}).then(() => {
        req.flash("success_msg","Categoria apagada com sucesso")
        res.redirect('/admin/categorias')
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg","Erro ao apagar a Categoria")
        res.redirect('/admin/categorias')
    })
})

router.get('/postagens', eAdmin, (req,res) => {
    Postagem.find().lean().populate("categoria").sort({date:'desc'}).then((postagens) => {
        res.render('admin/postagens.handlebars', {postagens: postagens}) //render é usado para chamar views do handlebars
    }).catch((err) =>{
        console.log(err)
        req.flash("error_msg","Erro ao listar a postagem")
        res.redirect('/admin')
    })
})

router.get('/postagens/add', eAdmin, (req,res) => {
    Categoria.find().lean().then((categorias) => {
        res.render('admin/addpostagem.handlebars', {categorias: categorias}) //render é usado para chamar views do handlebars
        req.flash("success_msg","Cadastro Realizado com sucesso")
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg","Erro ao cadastrar a postagem")
        res.redirect('/admin')
    })
})

router.post('/postagens/nova', eAdmin, (req,res) => {
    var erros = []
    if(req.body.categoria == "0"){
        erros.push({texto: "Categoria inválida, necessário cadastrar categoria"})
    }

    if(erros.length > 0){
        res.render("admin/addpostagem.handlebars", { erros: erros})
    }else{
        const novaPostagem = {
            titulo: req.body.titulo,
            slug: req.body.slug,
            descricao: req.body.descricao,
            conteudo: req.body.conteudo,
            categoria: req.body.categoria
        }
        new Postagem(novaPostagem).save().then(() => {
            req.flash("success_msg","Postagem realizado com sucesso")
            res.redirect('/admin/postagens')
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg","Erro na postagem, criar novamente. Description: " + err)
            res.redirect('/admin/postagens')
        })
        
    }
})

router.get('/postagens/edit/:id', eAdmin, (req,res) => {
    Postagem.findOne({_id: req.params.id}).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render('admin/editpostagem', {postagem: postagem, categorias: categorias})
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Erro ao encontrar a Categoria da Postagens")
            res.redirect('/admin/postagens')
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Erro ao encontrar a Postagem")
        res.redirect('/admin/postagens')
    })
})
    //res.send("Pagina de edição")
})

router.post('/postagens/edit', eAdmin, (req,res) => {
    Postagem.findOne({_id: req.body.id}).then((postagem) => {
        
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria
        
        postagem.save().then(() => {
            req.flash("success_msg","Postagem Editada com sucesso")
            res.redirect('/admin/postagens')
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Erro ao editar a postagem "+err)
            res.redirect('/admin/postagens')
        })
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Erro ao editar a Postagem")
        res.redirect("/admin/postagens")
    })
    
    //res.send("Pagina de edição")
})

router.get('/postagens/deletar/:id', eAdmin, (req,res) => {
    Postagem.remove({_id: req.params.id}).then(() => {
        res.redirect('/admin/postagens')
    })
})

module.exports = router