const express = require('express')
const User = require('../models/User')
const auth = require("../middleware/auth")
const router = express.Router()

var cors = require('cors')
var whitelist = ["http://localhost:3000"]
var corsOptionsDelegate = function (req, callback) {
    var corsOptions;
    if (whitelist.indexOf(req.header('Origin')) !== -1) {
      corsOptions = { origin: true } // reflect (enable) the requested origin in the CORS response
    } else {
      corsOptions = { origin: true } // disable CORS for this request
    }
    callback(null, corsOptions) // callback expects two parameters: error and options
  }

router.get('/',(req,res) =>{
res.send({message:'hi'})
})

router.post('/users',cors(corsOptionsDelegate), async (req, res) => {
    // Create a new user
    try {
        const user = new User(req.body)
        await user.save()
        const token = await user.generateAuthToken()
        res.status(201).send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }
})   
 
router.post('/users/login',cors(corsOptionsDelegate), async(req, res) => {
    //Login a registered user
    try {
        const { voter_id, password } = req.body
        const user = await User.findByCredentials(voter_id, password)
        if (!user) {
            return res.status(401).send({error: 'Login failed! Check authentication credentials'})
        }
        const token = await user.generateAuthToken()
        res.send({ user, token })
    } catch (error) {
        res.status(400).send(error)
    }

})

router.get('/users/me',cors(corsOptionsDelegate), auth, async(req, res) => {
    // View logged in user profile
    res.send(req.user)
})

router.post('/users/me/logout',cors(corsOptionsDelegate), auth, async (req, res) => {
    // Log user out of the application
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token != req.token
        })
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})

router.post('/users/me/logoutall',cors(corsOptionsDelegate), auth, async(req, res) => {
    // Log user out of all devices
    try {
        req.user.tokens.splice(0, req.user.tokens.length)
        await req.user.save()
        res.send()
    } catch (error) {
        res.status(500).send(error)
    }
})


router.get("/fetchallvoters",cors(corsOptionsDelegate), async(req, res, next) => {


    try {
        const user = await User.find()
        if (!user) {
            return res.status(401).send({error: 'no voters were found'})
        }
        
        res.send({ user, message:'voter list retrieved successfully!'})
    } catch (error) {
        res.status(400).send(error)
    }
    
});
module.exports = router