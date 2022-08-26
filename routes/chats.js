var express = require('express');
var router = express.Router();
const db = require('../models/index');
const { Op } = require('sequelize');
const res = require('express/lib/response');
// 自主制作個人チャット
const pnum = 10;
// ログインチェック
function check(req, res) {
    if (req.session.login == null) {
        // ログイン後に戻るページ
        req.session.back = '/boards';
        res.redirect('/users/login');
        return true;
    } else {
        return false;
    }
}

router.get('/', (req, res) => {
    res.redirect('/chats/0');
})
router.get('/:page', (req, res) => {
        if (check(req, res)) { return }
        console.log('ここ出るかな' + req.session.userId);
        console.log('ここ出るかな' + req.session.login.id);

        const id = req.session.userId;
        const login = req.session.login.id;

        // ページ番号を変数に取り出している
        const pg = req.params.page * 1;
        const find = req.query.find;

        db.Chat.findAll({
            //ここでuserIdに
            where: {
                [Op.or]: [{
                        [Op.and]: {
                            userId: id,
                            partner: login
                        }
                    },
                    {
                        [Op.and]: {
                            userId: login,
                            partner: id
                        }
                    }
                ]
            },
            // 表示位置
            offset: pg * pnum,
            limit: pnum,
            order: [
                ['createdAt', 'DESC']
            ],
            include: [{
                model: db.User,
                required: true
            }]
        }).then(brds => {
            var data = {
                title: 'Chat/partner',
                login: req.session.login,
                userId: req.session.userId,
                userName: req.params.user,
                content: brds,
                page: pg,
                pnum: pnum,
                find: find
            }
            res.render('chats/index', data)
        })

    })
    //個人メッセージ追加
router.post('/add', (req, res) => {
        if (check(req, res)) { return }
        var userId = req.body.partner;
        req.session.userId = userId;

        db.sequelize.sync()
            .then(() => db.Chat.create({
                userId: req.session.login.id,
                message: req.body.msg,
                partner: req.session.userId
            }))
            .then(brd => {
                res.redirect('/chats')
            })
            .catch(err => {
                res.redirect('/chats');
            })
    })
    // 利用者のホーム
router.get('/index/:id/:page', (req, res) => {
    if (check(req, res)) { return }
    //URLから取り出しているのか？
    const id = req.params.id * 1;
    req.session.userId = id;

    const pg = req.params.page * 1;
    const login = req.session.login.id;

    console.log('セッションログインの値：' + req.session.userId);
    const find = '';
    db.Chat.findAll({
        //ここでuserIdに
        where: {
            [Op.or]: [{
                    [Op.and]: {
                        userId: id,
                        partner: login
                    }
                },
                {
                    [Op.and]: {
                        userId: login,
                        partner: id
                    }
                }
            ]
        },
        // 表示位置
        offset: pg * pnum,
        limit: pnum,
        order: [
            ['createdAt', 'DESC']
        ],
        include: [{
            model: db.User,
            required: true
        }]
    }).then(brds => {
        var data = {
            title: 'Chat/partner',
            login: req.session.login,
            userId: req.session.userId,
            userName: req.params.user,
            content: brds,
            page: pg,
            pnum: pnum,
            find: find
        }
        res.render('chats/index', data)
    })
})

router.post('/delete', (req, res) => {

    db.sequelize.sync()
        .then(() => db.Chat.destroy({
            where: { id: req.body.id }
        }))
        .then(usr => {
            res.redirect('/chats');
        })
});

// 文字列検索機能
router.get('/find/:page', (req, res) => {
    if (check(req, res)) {
        return
    }
    // ページ番号を変数に取り出している
    const id = req.session.userId * 1;
    const pg = req.params.page * 1;
    const login = req.session.login.id;
    const find = req.query.find;

    // console.log('ここ気になる' + find);
    db.Chat.findAll({
        where: {
            [Op.or]: [{
                    [Op.and]: {
                        userId: id,
                        partner: login
                    }
                },
                {
                    [Op.and]: {
                        userId: login,
                        partner: id
                    }
                },
            ],
            [Op.and]: {
                message: {
                    [Op.like]: '%' + find + '%'
                }
            }

        },
        offset: pg * pnum,
        limit: pnum,
        order: [
            ['createdAt', 'DESC']
        ],
        include: [{
            model: db.User,
            required: true
        }]
    }).then(brds => {
        var data = {
            title: 'chats',
            login: req.session.login,
            content: brds,
            userName: req.params.user,
            // filename: 'data_item',
            page: pg,
            pnum: pnum,
            userId: id,
            find: find
        }
        res.render('chats/index', data);
    })

})

module.exports = router;