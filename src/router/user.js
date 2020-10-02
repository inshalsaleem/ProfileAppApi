const express  = require('express')
const bcrypt = require('bcryptjs')
const multer = require('multer')
const sharp = require('sharp')
const User = require('../models/user')
const auth = require('../middleware/auth')
const router = new express.Router()




//register a new user
router.post('/newuser', async (req, res) =>{
    try{
        //  const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
        //  req.user.avatar = buffer
        // //  console.log(buffer)
        const user = new User(req.body)
        //console.log(user)
        await user.save()
        const token = await user.generateAuthtoken()
        res.send({user, token})
    }catch(e){
        res.status(400).send(e)
    }
    
})


//login user
router.post('/user/login', async (req, res) => {
    try{
        const user = await User.findByCredentials(req.body.username, req.body.password)
        if(!user){
            res.status(400).send('Login Failed')
        }
        const token = await user.generateAuthtoken()
        res.send({user, token})
    }catch(e){
        res.status(400).send('Login Failed')
    }
})

//logout user
router.post('/user/logout', auth, async (req, res) => {
    try{
        req.user.tokens = req.user.tokens.filter((token) => {
            return token.token !== req.token
        })

        await req.user.save()

        res.send(req.user)
    }catch(e){
        res.status(400).send()
    }
})


//fetch user data
router.get('/profile/me', auth, async (req, res) =>{
    const id = req.user._id

    try{
        const fetchuser = await User.findById(id)
        res.send(fetchuser)
    }catch(e){
        res.status(500).send()
    }
})


//update password
router.patch('/profile/me', auth, async(req, res) =>{
    const id = req.user._id
    try{
        const user = await User.findById(id)
        user['password'] = req.body['password']

        await user.save()

        res.send(user)
    } catch (e){
        res.statue(500).send()
    }
})

//Setup for Uploading Profile Picture
const upload = multer({
    limits: {
        fileSize: 1000000
    },
    fileFilter(req, file, cb) {
        if (!file.originalname.match(/\.(jpg|jpeg|png)$/)) {
            return cb(new Error('Please upload an image'))
        }

        cb(undefined, true)
    }
})

// Upload Profile Picture
router.post('/user/avatar',auth, upload.single('avatar'), async (req, res) => {
    console.log(req.file.buffer)
    const buffer = await sharp(req.file.buffer).resize({ width: 250, height: 250 }).png().toBuffer()
    req.user.avatar = buffer
    await req.user.save()
    res.send()
}, (error, req, res, next) => {
    res.status(400).send({ error: error.message })
})
//Fetch Profile for a user
router.get('/profile/me/avatar', auth, async (req, res) => {
    const id = req.user._id
    try {
        const user = await User.findById(id)

        if (!user || !user.avatar) {
            throw new Error()
        }

        res.set('Content-Type', 'image/png')
        res.send(user.avatar)
    } catch (e) {
        res.status(404).send()
    }
})




module.exports = router