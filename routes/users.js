var express = require('express');
var router = express.Router();
const db = require('../models/index')
const { Op } = require('sequelize');
var crypto = require("crypto");

/* GET users listing. */
router.get('/', function(req, res, next) {
    const id = req.query.id;
    db.User.findAll({
        // where: {
        //     id: {
        //         [Op.lte]: id
        //     }
        // }
    }).then(usrs => {
        var data = {
            title: 'Users/Index',
            content: usrs
        }
        res.render('Users/Index', data);
    })
});

router.get('/add', (req, res) => {
    var data = {
        title: 'user/add',
        //Userオブジェクトを作っている。
        form: new db.User(),
        err: null
    }
    res.render('users/add', data);
})
router.post('/add', (req, res) => {
    //passハッシュ化
    var pass = req.body.pass;
    const sha512 = crypto.createHash('sha512');
    sha512.update(pass);
    var hashpass = sha512.digest('hex');
    const form = {
        name: req.body.name,
        pass: hashpass,
        mail: req.body.mail,
        birthday: req.body.birthday,
        words: req.body.words,
        likes: req.body.likes
    };
    const resform = {
        name: req.body.name,
        pass: req.body.pass,
        mail: req.body.mail,
        birthday: req.body.birthday,
        words: req.body.words,
        likes: req.body.likes
    }
    db.sequelize.sync()
        .then(() => db.User.create(form)
            .then(usr => {
                res.redirect('/users/login') //ここ変更
            })
            .catch(err => {
                var data = {
                    title: 'User/Add',
                    form: resform,
                    err: err
                }
                res.render('users/add', data);
            })
        )
})

router.get('/edit', (req, res) => {
    db.User.findByPk(req.query.id)
        .then(usr => {
            var data = {
                title: 'users/edit',
                mydata: usr
            }
            res.render('users/edit', data)
        })
})

router.post('/edit', (req, res) => {
        db.sequelize.sync()
            .then(() => db.User.update({
                name: req.body.name,
                pass: req.body.pass,
                mail: req.body.mail,
                age: req.body.age
            }, {
                where: { id: req.body.id }
            }))
            .then(usr => {
                res.redirect('/users');
            })
    })
    //削除用
router.get('/delete', (req, res) => {
    db.User.findByPk(req.query.id)
        .then(usr => {
            var data = {
                title: 'users/delete',
                form: usr
            }
            res.render('users/delete', data)
        })
})
router.post('/delete', (req, res) => {
    db.sequelize.sync()
        .then(() => db.User.destroy({
            where: { id: req.body.id }
        }))
        .then(usr => {
            res.redirect('/users');
        })
})

// ログイン処理
router.get('/login', (req, res) => {
    var data = {
        title: 'Users/Login',
        content: '名前 とパスワードを入力ください。'
    }
    res.render('users/login', data);
})

router.post('/login', (req, res) => {
    var pass = req.body.pass;
    //passハッシュ化
    const sha512 = crypto.createHash('sha512');
    sha512.update(pass);
    var hashpass = sha512.digest('hex');
    db.User.findOne({
        where: {
            name: req.body.name,
            pass: hashpass,
        }
    }).then(usr => {
        if (usr != null) {
            req.session.login = usr;
            let back = req.session.back;
            if (back == null) {
                back = '/boards';
            }
            res.redirect(back);
        } else {
            var data = {
                title: 'Users/Login',
                content: '名前かパスワードに問題があります再度入力してください'
            }
            res.render('users/login', data);
        }
    });
});
//____________________________________________________________
//自主制作機能
//プロフィール設定
router.post('/profile', (req, res) => {
    const id = req.body.id;
    const form = {
        userId: id,
        words: req.body.words,
        likes: req.body.likes
    };
    db.sequelize.sync().then(() => db.User.update(form, {
            where: { id: id }
        })
        .then(pro => {
            res.redirect('/boards');
        })
    )
})

module.exports = router;