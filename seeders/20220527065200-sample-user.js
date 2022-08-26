'use strict';

module.exports = {
    async up(queryInterface, Sequelize) {
        return queryInterface.bulkInsert('Users', [{
                name: 'Taro',
                pass: 'yamada',
                mail: 'taro@gmail.com',
                birthday: '1890-10-24',
                createdAt: new Date(),
                updatedAt: new Date()

            },
            {
                name: 'Hanako',
                pass: 'flower',
                mail: 'hanako@gmail.com',
                birthday: '1988-11-11',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'toya',
                pass: 'fukuhara',
                mail: 'toya@gmail.com',
                birthday: '2000-05-04',
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                name: 'nana',
                pass: 'idol',
                mail: 'nana@gmail.com',
                birthday: '2000-07-07',
                createdAt: new Date(),
                updatedAt: new Date()
            }
        ])
    },

    async down(queryInterface, Sequelize) {

        return queryInterface.bulkDelete('Users', null, {});
    }
};