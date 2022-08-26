var express = require('express');
var router = express.Router();
const db = require('../models/index');
const { Op } = require('sequelize');
const res = require('express/lib/response');

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
// トップページ(ログイン後)
router.get('/', (req, res) => {
    res.redirect('/boards/0');
})
router.get('/:page', (req, res) => {
        if (check(req, res)) {
            return
        }
        // ページ番号を変数に取り出している
        const pg = req.params.page * 1;
        const find = req.query.find;

        db.Board.findAll({
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
                title: 'Boards',
                login: req.session.login,
                content: brds,
                page: pg,
                pnum: pnum,
                find: find
            }
            res.render('boards/index', data);
        })
    })
    // メッセージフォームの送信処理
router.post('/add', (req, res) => {
    if (check(req, res)) { return }
    db.sequelize.sync()
        .then(() => db.Board.create({
                userId: req.session.login.id,
                message: req.body.msg,
            })
            .then(brd => {
                res.redirect('/boards');
            })
            .catch(err => {
                res.send('エラー');
            })
        )
});
// 利用者のホーム
router.get('/home/:user/:id/:page', (req, res) => {
    if (check(req, res)) { return }

    //URLから取り出しているのか？

    req.session.userId = req.params.id * 1;

    const id = req.session.userId;

    const pg = req.params.page * 1;

    db.Board.findAll({
        //ここでuserIdに
        where: { userId: id },
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
            title: 'Boards',
            login: req.session.login,
            userId: req.session.userId,
            userName: req.params.user,
            content: brds,
            page: pg,
            pnum: pnum,
        }
        res.render('boards/home', data)
    })
})

//__________________________________________________
//自己制作機能
// ログインしてるユーザのメッセージの消去が可能な機能
router.post('/delete', (req, res) => {
    db.sequelize.sync()
        .then(() => db.Board.destroy({
            where: { id: req.body.id }
        }))
        .then(usr => {
            res.redirect('/boards');
        })
});
// 文字列検索機能
router.get('/find/:page', (req, res) => {
    if (check(req, res)) {
        return
    }
    // ページ番号を変数に取り出している
    const pg = req.params.page * 1;
    const find = req.query.find;

    // console.log('ここ気になる' + find);
    db.Board.findAll({
        where: {
            message: {
                [Op.like]: '%' + find + '%'
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
            title: 'Boards',
            login: req.session.login,
            content: brds,
            // filename: 'data_item',
            page: pg,
            pnum: pnum,
            find: find
        }
        res.render('boards/index', data);
    })

})
module.exports = router;