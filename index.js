
const mongoose = require('mongoose');
const next = require('next');

const express = require('express');

let bodyParser = require('body-parser');

const path = require('path');
const { error } = require('console');

const app = express();

const Posts = require('./posts.js');

mongoose.connect('mongodb+srv://root:n1m8TkbF6TR1UhnR@cluster0.nixfx.mongodb.net/Winchester-Portal?retryWrites=true&w=majority',{ useNewUrlParser: true, useUnifiedTopology: true }).then(function() {
  console.log('connected!');
}).catch(function(err) {
  console.log(err.message);
})


app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({
   extended: true
}));

app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');
app.use('/public', express.static(path.join(__dirname, 'public')));
app.set('views', path.join(__dirname, '/pages'));


app.get('/', (req,res)=> {
  
    if(req.query.busca == null) {
      Posts.find({}).sort({'_id': -1}).exec(function(err,posts){

       posts = posts.map(function(val) {
           return {
              titulo: val.titulo,
              conteudo: val.conteudo,
              descricaoCurta: val.conteudo.substr(0,100),
              imagem: val.imagem,
              categoria: val.categoria,
              slug: val.slug
           }
        })
    
    

      Posts.find({}).sort({'views': -1}).limit(4).exec(function(err,postsTop){

        postsTop = postsTop.map(function(val) {
            return {
               titulo: val.titulo,
               conteudo: val.conteudo,
               descricaoCurta: val.conteudo.substr(0,100),
               imagem: val.imagem,
               categoria: val.categoria,
               slug: val.slug,
               views: val.views
            }
         })
            res.render('home',{posts:posts,postsTop:postsTop});
        })  

      })
      

    }else{
      Posts.find({titulo: {$regex: req.query.busca,$options:"i"}},function(err,posts){
    
        posts = posts.map(function(val) {
          return {
             titulo: val.titulo,
             conteudo: val.conteudo,
             descricaoCurta: val.conteudo.substr(0,300),
             imagem: val.imagem,
             categoria: val.categoria,
             slug: val.slug
          }

        })
        res.render('busca',{posts:posts,contagem:posts.length});
      })

      
  }

});


app.get('/:slug',(req,res)=> {
    //res.send(req.params.slug);

    Posts.findOneAndUpdate({slug: req.params.slug}, {$inc : {views: 1}}, {new: true}, function(err, resposta) {

      if(resposta != null) {

        Posts.find({}).sort({'views': -1}).limit(4).exec(function(err,postsTop){

        postsTop = postsTop.map(function(val) {
          return {
             titulo: val.titulo,
             conteudo: val.conteudo,
             descricaoCurta: val.conteudo.substr(0,100),
             imagem: val.imagem,
             categoria: val.categoria,
             slug: val.slug,
             views: val.views
          }
        })
      
      res.render('single',{noticia: resposta,postsTop:postsTop});

    })

  }else {
    res.redirect('/');
  }

    })
   
   
  })
   



app.listen(5000, () => {
    console.log('server started');
})