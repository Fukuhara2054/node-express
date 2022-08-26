'use strict';
module.exports = (sequelize, DataTypes) => {
    const User = sequelize.define('User', {
        name: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: '名前は必須です。'
                }
            }
        },
        pass: {
            type: DataTypes.STRING,
            validate: {
                notEmpty: {
                    msg: 'パスワードは必須です。'
                }
            }
        },
        mail: {
            type: DataTypes.STRING,
            notEmpty: {
                msg: 'メールアドレスは必須です。'
            }
        },
        birthday: DataTypes.DATE,
        words: DataTypes.STRING,
        likes: DataTypes.STRING
    }, {});
    User.associate = function(models) {
        User.hasMany(models.Board);
        User.hasMany(models.Chat);
    }
    return User;
};