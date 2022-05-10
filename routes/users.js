const express = require('express')
const router = express.Router()
const User = require('../models/user.js')
const bcrypt = require('bcrypt')
const passport = require('passport')
//login handle
router.get('/login', (req, res) => {
  res.render('login')
})
router.get('/register', (req, res) => {
  res.render('register')
})
//register handle
router.post('/login', (req, res, next) => {
  passport.authenticate('local', {
    successRedirect: '/dashboard',
    failureRedirect: '/users/login',
    failureFlash: true
  })(req, res, next)
})
//register post handle
router.post('/register', (req, res) => {
  const { name, email, password, password2 } = req.body
  let errors = []
  console.log(' Name ' + name + ' email :' + email + ' pass:' + password)
  if (!name || !email || !password || !password2) {
    errors.push({ msg: 'Please fill in all fields' })
  }
  //verifica se as senhas coincidem
  if (password !== password2) {
    errors.push({ msg: 'Passwords dont match' })
  }

  //verifica se a senha tem 6 caracteres
  if (password.length < 6) {
    errors.push({ msg: 'Password atleast 6 characters' })
  }
  if (errors.length > 0) {
    res.render('register', {
      errors: errors,
      name: name,
      email: email,
      password: password,
      password2: password2
    })
  } else {
    //validation passed
    User.findOne({ email: email }).exec((err, user) => {
      console.log(user)
      if (user) {
        errors.push({ msg: 'Email already registered' })
        res.render('register', { errors, name, email, password, password2 })
      } else {
        const newUser = new User({
          name: name,
          email: email,
          password: password
        })

        //hash da senha
        bcrypt.genSalt(10, (err, salt) =>
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err
            //salva senha para has
            newUser.password = hash
            //salve user
            newUser
              .save()
              .then(value => {
                console.log(value)
                req.flash('success_msg', 'You have now registered!')
                res.redirect('/users/login')
              })
              .catch(value => console.log(value))
          })
        )
      }
    })
  }
})
//logout
router.get('/logout', (req, res) => {
  req.logout()
  req.flash('success_msg', 'Now logged out')
  res.redirect('/users/login')
})

// router.get('/dashboard', function (req, res) {
//   req.User.find({})
//     .then(users => {
//       const userFunction = users.map(user => {
//         const container = {}
//         container.nome = user.name
//         container.email = user.email
//         container.dataCriada = user.date
//         return container
//       })
//       res.send({ user: userFunction })
//     })
//     .catch(err =>
//       res.status(401).json({ message: 'Not successful', error: err.message })
//     )
// })

module.exports = router
