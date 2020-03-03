var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');

router.get('/signup', function(req, res, next) {
  res.render('signup')
});

router.post('/signup', function(req, res, next) {
  models.users
    .findOrCreate({
      where: {
        Username: req.body.username
      },
      defaults: {
        FirstName: req.body.firstName,
        LastName: req.body.lastName,
        Email: req.body.email,
        Password: authService.hashPassword(req.body.password)
      }
    })
    .spread(function(result, created) {
      if (created) {
        res.render('login');
      } else {
        res.send('This user already exists');
      }
    });
});

router.get('/login', function(req, res, next) {
  res.render('login');
});


router.post('/login', function (req, res, next) {
  models.users.findOne({
    where: {
      Username: req.body.username,
    }
  }).then(user => {
    if (!user) {
      console.log('User not found')
      return res.status(401).json({
        message: "Login Failed"
      });
    } else {
      let passwordMatch = authService.comparePasswords(
        req.body.password, 
        user.Password
        );
      if (passwordMatch) {
        let token = authService.signUser(user);
        res.cookie('jwt', token);
        res.redirect('profile');
      } else {
        console.log('Wrong password');
        res.send('Wrong password');
      }
    }
  });
});

router.get('/profile', function(req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
    .then(user => {
      if (user) {
        models.users.findOne({
          where: { UserId: user.UserId, },
          include: [{ model: models.posts          
          }]
        }).then(data => {
          // res.send(JSON.stringify(data));
            res.render('profile', {
              FirstName: user.FirstName,
              LastName: user.LastName,
              Email: user.Email,
              Username: user.Username,
              // PostTitle: data,
              // PostBody: data.PostBody,
              posts: data.posts,
              Deleted: data.Deleted
              // posts: deleted = false
              
            })
        })
      } else {
        res.send('Must be logged in'); 
      }
    })
  } else {
    res.render('pleaseLogin');
  };
});

router.get('/logout', function (req, res, next) {
  res.cookie('jwt', "", { expires: new Date(0) });
  res.redirect('login');
  });

router.get("/admin", function(req, res, next) {
    let token = req.cookies.jwt;
    if (token) {
      authService.verifyUser(token).then(user => {
        if (user.Admin) {
          models.users
            .findAll({ where: { Deleted: false }, raw: true })
            .then(usersFound => res.render("users", { users: usersFound }));
        } else {
          res.send("unauthorized");
        }
      });
    }
});
  
// router.get('/admin', function(req, res, next) {
//   let token = req.cookies.jwt;
//   if (token) {
//     authService.verifyUser(token)
//       .then(user => {
//         if (user.Admin) {
//           models.users
//             .findAll({
//               where: {
//                 Deleted: false
//             }})
//             .then(usersFound => res.render('users', {users: usersFound}));
//         } else {
//           res.send('You are not an admin!');
//         }
//       });
//     } else {
//       res.send('Please login first')
//   }
// });

router.get("/admin/editUser/:id", function(req, res, next) {
  let userId = parseInt(req.params.id);
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user.Admin) {
        models.users
          .findOne({ where: { UserId: userId }, raw: true })
          .then(user => res.render("specificUser", { user: user }));
      } else {
        res.send("You are not an admin!");
      }
    });
  }
});


// Answer for final below

  // router.delete("/admin/editUser/:id", function(req, res, next) {
  //   let userId = parseInt(req.params.id);
  //   let token = req.cookies.jwt;
  //   if (token) {
  //     authService.verifyUser(token).then(user => {
  //       if (user.Admin) {
  //         models.users
  //           .update({ Deleted: true }, { where: { UserId: userId }, raw: true })
  //           .then(user => res.redirect("/users/admin"));
  //       } else {
  //         res.send("unauthorized");
  //       }
  //     });
  //   }
  // });
  

  router.post('/admin/editUser/:id', function(req, res, next) {
  let id = parseInt(req.params.id);
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
      .then(user => {
        if (user) {
          models.users.findByPk(id)
          .then(deleteUser => {
            return models.users.update(
              { Deleted: !deleteUser.Deleted },
              { where: { UserId: id}})
            }).then(() => res.redirect('/users/admin'))
      } else {
       res.send('unauthorized')
      }
    })
  } else {
    res.send(err)
  } 
});

module.exports = router;



