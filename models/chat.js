'use strict';
module.exports = (sequelize, DataTypes) => {
    const Chat = sequelize.define('Chat', {
        userId: DataTypes.INTEGER,
        message: {
            type: DataTypes.INTEGER,
            validate: {
                notEmpty: {
                    msg: '利用者は必須です.'
                }
            }
        },
        partner: DataTypes.INTEGER
    }, {});
    Chat.associate = function(models) {
        Chat.belongsTo(models.User)
    }
    return Chat;
};