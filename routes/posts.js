var express = require('express');
var router = express.Router();
var models = require('../models');
var authService = require('../services/auth');

// router.get('/signup', function(req, res, next) {
//   res.render('signup')
// });

router.get('/', function(req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token)
    .then(user => {
      if (user) {
        models.posts
          .findAll({
            where: {UserId: user.UserId, Deleted: false},
            // include: [{model: users.FirstName}]
          })
          .then(results => res.render('posts', { posts: results}))
        //console.log(user.posts);
        //res.render("posts", { posts: user.posts });
        //res.send(JSON.stringify(user));
      } else {
        res.status(401);
        res.send('Invalid token');
      }
    })
  } else {
    res.send('Please Sign in first')
  }
});

router.get("/:id", function(req, res, next) {
  let postId = parseInt(req.params.id);
  models.posts.findOne({ where: { 
    PostId: postId 
  }, 
    raw: true 
  })
    .then(post => {
    console.log(post);
    res.render("editPost", post);
  });
});

// router.get('/:id', function(req, res, next){
//     models.posts.findOne({
//       where: {
//         PostId: 23,
//         PostTitle: req.body.PostTitle,
//         PostBody: req.body.PostBody,
//       }
//     }).then(data => {
//       res.render('posts');
//     })
// });

router.post("/", function(req, res, next) {
  let token = req.cookies.jwt;
  if (token) {
    authService.verifyUser(token).then(user => {
      if (user) {
        models.posts
          .findOrCreate({
            where: {
              UserId: user.UserId,
              PostTitle: req.body.postTitle,
              PostBody: req.body.postBody
            }
          })
          .spread((result, created) => res.redirect("/posts"));
      } else {
        res.status(401);
        res.send("Invalid authentication token");
      }
    });
  } else {
    res.status(401);
    res.send("Must be logged in");
  }
});

// router.post('/', function(req, res, next) {
//   let token = req.cookies.jwt;
//   if (token) {
//     authService.verifyUser(token)
//     .then(user => {
//       if (user) {  
//           models.posts.findOrCreate({
//             where: {
//               PostTitle: req.body.postTitle},
//             defaults: {
//               PostBody: req.body.postBody,
//               PostId: req.body.postId,
//               UserId: user.UserId,
//             }    
//           })
//           .spread(function(result, created) {
//             if (created) {
//               res.redirect('posts');
//             } else {
//               res.send('This post already exists');
//             }
//           });
//       } else {
//         res.send('cant find posts');
//       }
//     })
//   } else {
//     res.send('cant find post');
//   }
// });

router.delete("/:id", function(req, res, next) {
  let postId = parseInt(req.params.id);
  models.posts
    .update(
      { Deleted: true },
      {
        where: { PostId: postId }
      }
    )
    .then(result => res.redirect("/"));
});

// router.post('/:id', function(req, res, next){
//   let postId = parseInt(req.params.id);
//   models.posts.update({ Deleted: true },
//       { where: { PostId: postId }
//     }).then(result => 
//       res.redirect('/posts'));
// });

router.put("/:id", function(req, res, next) {
  let postId = parseInt(req.params.id);
  console.log(req.body);
  console.log(postId);
  models.posts
    .update(req.body, { where: { PostId: postId } })
    .then(result => res.redirect("/"));
});

module.exports = router;