"use strict";
const cryptos   = require('./cryptos.json')
const jwt       = require('jsonwebtoken')
const bodyParser= require('body-parser')
const helpers   = require('./helpers')
const config    = require('./config')
const express   = require('express')
const bcrypt    = require('bcrypt')
const DB        = require('./db')
const db        = new DB("sqlitedb")
const app       = express()
const router    = express.Router()

const {allowCrossDomain,fetchCoins,handleResponse,handleFavouriteResponse,generateUrl} = helpers
const defaultUrl= generateUrl(cryptos.coins,cryptos.currencies)

router.use(bodyParser.urlencoded({ extended: false }));
router.use(bodyParser.json());
app.use(allowCrossDomain)

fetchCoins(defaultUrl,handleResponse)

// We will define our routes here


router.post('/auth', function(req, res) {
  db.selectByEmail(req.body.email, (err,user) => {
    if (err) return res.status(500).send(JSON.stringify({message : "There was a problem getting user"}))
    if(user) {
        if(!bcrypt.compareSync(req.body.password, user.user_pass)) {
            return res.status(400).send(JSON.stringify({message : "The email or password incorrect"}))
        }
        let token = jwt.sign({ id: user.id }, config.secret, {
            expiresIn: 86400 // expires in 24 hours
        })
        res.status(200).send(JSON.stringify({token: token, user_id:user.id}))
    } else {
        db.insertUser([req.body.email,bcrypt.hashSync(req.body.password, 8)],
        function (err, id) {
            if (err) return res.status(500).send(JSON.stringify({message : "There was a problem getting user"}))
            else {
                let token = jwt.sign({ id: id }, config.secret, {
                    expiresIn: 86400 // expires in 24 hours
                });
                res.status(200).send(JSON.stringify({token: token, user_id:id}))
            }
        }); 
    }
  }) 
})

router.get('/coins', function(req, res) {
    let token = req.headers['x-access-token'];
    if (!token) return res.status(401).send(JSON.stringify({message: 'Unauthorized request!' }))
    jwt.verify(token, config.secret, function(err, decoded) {
    if (err) return res.status(500).send(JSON.stringify({message: 'Failed to authenticate token.' }))
        res.status(200).send(JSON.stringify({coins : cryptos.coins}))
    });
})

router.post('/favourite/add', function(req, res) {
    let token = req.headers['x-access-token'];
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(401).send(JSON.stringify({message: 'Unauthorized request' }))
        db.insertFavourite([req.body.coin, decoded.id], (err,favs) => {
        if (err) return res.status(500).send(JSON.stringify({message : "There was a problem adding your favs"}))
        res.status(200).send(JSON.stringify({message: "Coin added to your favourites"}))
        }); 
    });
})

router.get('/favourite', function(req, res) {
    let token = req.headers['x-access-token'];
    jwt.verify(token, config.secret, function(err, decoded) {
        if (err) return res.status(401).send(JSON.stringify({message: 'Unauthorized request' }))
        db.selectFavourite(decoded.id, (err,favs) => {
        // We use the favs returned by the db manager
           if (err) return res.status(500).send(JSON.stringify({message : "There was a problem getting your favs"}))
              let coins = []
              if (favs) {
                favs.forEach( fav => coins.push(fav.coin))
                const url = generateUrl(coins,cryptos.currencies)
                const event = `user${decoded.id}` 
                fetchCoins(url, handleFavouriteResponse, event)
                res.status(200).send(JSON.stringify({event : event}))
              } else {
                res.status(200).send(JSON.stringify({message : "You do not have favs"}))
              }
            }); 
    });
})

app.use(router)
app.listen(process.env.PORT || 4003)