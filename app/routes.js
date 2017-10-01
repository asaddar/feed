var Media = require('./models/media');
var User = require('./models/user');
var MetaInspector = require('node-metainspector');
var mongoose = require('mongoose');

mongoose.Promise = global.Promise;

module.exports = function(app, passport) {
    
    app.get('/', (req, res) => {
        if (!req.isAuthenticated()) {
            res.render('index.ejs');
        } else {
            User.findOne({ '_id': req.user._id }).then((user) => {
                return Media.find({tags: { "$in" : user.tags }}).sort('-datePosted').populate('author');
            }).then((posts) => {
                res.render('display.ejs', { posts: posts , user: req.user, page: 'home' });
            });
        }
    });

    app.get('/user/:username', (req, res) => {
        User.findOne({ 'local.username': req.params.username }).then((doc) => {
            return Media.find({ author: doc._id }).sort('-datePosted').populate('author');

        }).then((posts) => {
            res.render('profile.ejs', { posts: posts , user: req.user, page: req.params.username });
        });
    });

    app.get('/user/:username/likes', (req, res) => {
        User.findOne({ 'local.username': req.params.username }).then((doc) => {
            return Media.find({ likedBy: doc._id }).sort('-datePosted').populate('author');

        }).then((posts) => {
            res.render('profile.ejs', { posts: posts , user: req.user, page: req.params.username });
        });
    });

    app.get('/top', (req, res) => {
        Media.find().sort('-likesCount').populate('author').then((posts) => {
            res.render('display.ejs', { posts: posts , user: req.user, page: 'top' });
        }, (e) => {
            res.send(e);
        });
    });

    app.get('/new', (req, res) => {
        Media.find().sort('-datePosted').populate('author').then((posts) => {
            res.render('display.ejs', { posts: posts , user: req.user, page: 'new' });
        }, (e) => {
            res.send(e);
        });
    });

    app.put('/like/:postID', isLoggedIn, (req, res) => {
        Media.findById(req.params.postID).then((doc) => {
            doc.likesCount += 1;
            doc.likedBy.push(req.user._id);
            return doc.save();
        }).then((doc) => {
            res.send(doc);
        });
    });

    app.put('/unlike/:postID', isLoggedIn, (req, res) => {
        Media.findById(req.params.postID).then((doc) => {
            doc.likesCount -= 1;
            var index = doc.likedBy.indexOf(req.user._id);
            doc.likedBy.splice(index, 1);
            return doc.save();
        }).then((doc) => {
            res.send(doc);
        });
    });

    app.delete('/:postID', isLoggedIn, (req, res) => {
        Media.findOneAndRemove({ _id: req.params.postID, author: req.user._id }).then((doc) => {
            res.send(doc);
        }, (e) => {
            console.log(e);
        });
    });

    app.get('/create', isLoggedIn, (req, res) => {
        res.render('create.ejs');
    });

    app.get('/follow', isLoggedIn, (req, res) => {
        res.render('follow.ejs');
    });

    app.post('/new', isLoggedIn, (req, res) => {
        var client = new MetaInspector(req.body.link, { timeout: 5000 });
 
        client.on("fetch", function(){
            var media = new Media({
                link: req.body.link,
                category: req.body.category,
                title: client.title,
                host: client.host,
                image: client.image || '',
                author: req.user._id,
                tags: getTags(req.body.tags)
            });

            media.save().then((doc) => {
                res.redirect('/new');
            }, (e) => {
                res.send(e);
            });

        });
         
        client.on("error", function(err){
            console.log(err);
        });
         
        client.fetch();

    });

    app.post('/follow', isLoggedIn, (req, res) => {
        User.findOne({ '_id': req.user._id }).then((user) => {
            user.tags = user.tags.concat(getTags(req.body.tags));
            return user.save();
        }).then((user) => {
            res.redirect('/');
        });
    });

    app.get('/categories/:category', (req, res) => {
        Media.find({ category: req.params.category }).sort('-datePosted').populate('author').then((posts) => {
            res.render('display.ejs', { posts: posts , user: req.user, page: req.params.category });
        }, (e) => {
            res.send(e);
        });
    });

    app.get('/tags/:tag', (req, res) => {
        Media.find({tags: req.params.tag}).sort('-datePosted').populate('author').then((posts) => {
            res.render('display.ejs', { posts: posts , user: req.user, page: req.params.tag });
        }, (e) => {
            res.send(e);
        });
    });

    app.get('/login', (req, res) => {
        res.render('login.ejs'); 
    });

    app.post('/login', passport.authenticate('local-login', {
        successRedirect : '/',
        failureRedirect : '/login'
    }));

    app.get('/signup', (req, res) => {
        res.render('signup.ejs');
    });

    app.post('/signup', passport.authenticate('local-signup', {
        successRedirect : '/',
        failureRedirect : '/signup'
    }));

    app.get('/logout', (req, res) => {
        req.logout();
        res.redirect('/');
    });
};

function getTags(tags) {
    return tags.replace(/\s+/g, '').split(",");
}

function isLoggedIn(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }

    res.redirect('/');
}