var express = require('express')
var redis = require('redis')
var ejs = require('ejs')
var path = require('path')
var app=express()
var bodyParser = require('body-parser')

var fetch = require('node-fetch')
const { futimesSync } = require('fs')
app.use(express.json({
    limit:'1mb'
}))

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({
    extended:false
}))
app.set('view engine','ejs')
app.use(express.static('public'))

var client=redis.createClient(6379)

app.get('/repos/:username',getFromRedis,function(req,res){

   
    var name=req.params.username
    
     getInfo()
     async function getInfo(){
         var data1 = await fetch('https://api.github.com/users/'+name)
         
         var json = await data1.json()
         console.log(json)
        var repo = await json.public_repos;
        console.log(repo)
         res.render("index",{
             'repos':repo
         })
    
    
    }
    
   
})

function getFromRedis(req,res,next)
{
   
   var name= req.params.username
   var data = client.get(name,function(err,info){
       if(info==null)
       {
        getInfo()
        async function getInfo(){
            var data1 = await fetch('https://api.github.com/users/'+name)
           
            var json = await data1.json()
            
           var repo = await json.public_repos;
           client.setex(name,100000,repo)
           next()
       }
    }
       else
     {
         console.log("check")
         console.log(info)
        return res.render("index",{
            'repos':info
        })
     }
   })
  
   

  

}


app.listen(9000||process.env.PORT,()=>{
    console.log("Listening at port 9000....")
})