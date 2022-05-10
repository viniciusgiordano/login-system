const User = require('../models/user.js')

module.exports = {
  getUsers: async (req, res, next) => {
    await User.find({})
      .then(users => {
        const userFunction = users.map(user => {
          const container = {}
          container.nome = user.name
          container.email = user.email
          container.dataCriada = user.date
          return container
        })
        res.send({ user: userFunction })
      })
      .catch(err =>
        res.status(401).json({ message: 'Not successful', error: err.message })
      )
  },
  ensureAuthenticated: function (req, res, next) {
    if (req.isAuthenticated()) {
      return next()
    }
    req.flash('error_msg', 'Please login to view this resource')
    res.redirect('/users/login')
  }
}
