const express = require('express');
const router = express.Router();
//const parseString = require('xml2js').parseString;
//const http = require('https');
const sqlite3 = require('sqlite3');
const { check, validationResult } = require('express-validator');

const db = new sqlite3.Database('mydb.sqlite3');

router.get('/add', (req, res) => {
    var data = {
        title: 'Hello/add',
        content: '新しいレコードを入力',
        form: { name: '', mail: '', age: 0 }
    }
    res.render('hello/add', data);
})
router.post('/add', [
    check('name', 'nameは必ず入力してください').notEmpty(),
    check('mail', 'mailはメールアドレスを記入して下さい').isEmail(),
    check('age', 'ageは年齢を入力して下さい。').isInt()
], (req, res) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
        var result = '<ul class = "text-danger">';
        var result_arr = errors.array();
        for (var i in result_arr) {
            result += '<li>' + result_arr[i].msg + '</li>'
        }
        result += '</ul>';
        var data = {
            title: 'Hello!',
            content: result,
            form: req.body
        }
        res.render('hello/add', data);
    } else {
        const nm = req.body.name;
        const ml = req.body.mail;
        const ag = req.body.age;
        db.serialize(() => {
            db.run('insert into mydata (name, mail, age) values(?, ?, ?)', nm, ml, ag);
        });
        res.redirect('/hello');
    }
});

router.get('/', (req, res, next) => {
    //res.send('ok')
    db.serialize(() => {
        db.all("select * from mydata", (err, rows) => {
            if (!err) {
                var data = {
                    title: 'Hello!',
                    content: rows
                };
                res.render('hello/index', data);

            }
        });
    });
});
router.get('/show', (req, res) => {
    const id = req.query.id;
    db.serialize(() => {
        const q = "select * from mydata where id = ?";
        db.get(q, [id], (err, row) => {
            if (!err) {
                var data = {
                    title: ' Hello/show',
                    content: 'id=' + id + 'のレコード',
                    mydata: row
                }
                res.render('hello/show', data);
            }
        })
    })
})

router.get('/edit', (req, res) => {
    //URLの末尾のやつ
    const id = req.query.id;
    db.serialize(() => {
        const q = "select * from mydata where id = ?";
        db.get(q, [id], (err, row) => {
            if (!err) {
                var data = {
                    title: ' Hello/edit',
                    content: 'id=' + id + 'のレコードを編集',
                    mydata: row
                }
                res.render('hello/edit', data);
            }
        })
    })
})
router.post('/edit', (req, res) => {
    const id = req.body.id;
    const nm = req.body.name;
    const ml = req.body.mail;
    const ag = req.body.age;
    const q = "update mydata set name = ?, mail = ?, age = ? where id = ?";
    db.serialize(() => {
        db.run(q, nm, ml, ag, id);
    });
    res.redirect('/hello');

})
router.get('/delete', (req, res) => {
    const id = req.query.id;
    db.serialize(() => {
        const q = "select * from mydata where id = ?";
        db.get(q, [id], (err, row) => {
            if (!err) {
                var data = {
                    title: 'Hello/Delete',
                    content: 'id=' + id + 'のレコードを削除',
                    mydata: row
                }
                res.render('hello/delete', data);

            }
        })
    })
})

router.post('/delete', (req, res) => {
    const id = req.body.id;
    db.serialize(() => {
        const q = "delete from mydata where id = ?";
        db.run(q, id);
    })
    res.redirect('/hello');
})

router.get('/find', (req, res) => [
    db.serialize(() => {
        db.all("select * from mydata", (err, rows) => {
            if (!err) {
                var data = {
                    title: 'Hello/find',
                    find: '',
                    content: '検索条件を入力してください。',
                    mydata: rows
                }
                res.render('hello/find', data);
            }
        })
    })
])

router.post('/find', (req, res) => {
    var find = req.body.find;
    db.serialize(() => {
        var q = "select * from mydata where ";
        db.all(q + find, [], (err, rows) => {
            if (!err) {
                var data = {
                    title: 'Hello/find',
                    find: find,
                    content: '検索条件' + find,
                    mydata: rows
                }
                res.render('hello/find', data);
            }
        })
    })
})

// router.get('/', (req, res, next) => {
//     var opt = {
//         host: 'news.google.com',
//         port: 443,
//         path: '/rss?hl=ja&ie=UTF-8&oe=UTF-8&gl=JP&ceid=JP:ja'
//     }
//     http.get(opt, (res2) => {
//         var body = '';
//         res2.on('data', (data) => {
//             body += data;
//         });
//         res2.on('end', () => [
//             parseString(body.trim(), (err, result) => {
//                 console.log(result);
//                 var data = {
//                     title: 'Google news',
//                     content: result.rss.channel[0].item
//                 }
//                 res.render('hello', data);
//             })
//         ])
//     });
// });
// router.post('/post', (req, res) => {
//     var msg = req.body['message'];
//     req.session.message = msg;
//     var data = {
//         title: 'Hello!',
//         content: " 最後のメッセージ:" + req.session.message
//     }
//     res.render('hello', data);
// })
module.exports = router;