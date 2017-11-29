/**
 * menu
 *
 * @module      :: Model
 * @description :: Menu model
 *
 */

module.exports = function Model(we) {
  return {
    definition: {
      name: {
        type: we.db.Sequelize.STRING,
        formFieldType: 'text'
      },
      class: {
        type: we.db.Sequelize.STRING,
        formFieldType: 'text'
      }
    },
    associations: {
      links: {
        type: 'hasMany',
        model: 'link',
        inverse: 'menu'
      }
    },
    options: {
      titleField: 'name',
      classMethods: {},

      hooks: {
        afterCreate(r, opts, done) {
          we.plugins['we-plugin-menu'].publishUpdate(done);
        },
        afterUpdate(r, opts, done) {
          we.plugins['we-plugin-menu'].publishUpdate(done);
        },
        afterDestroy(r, opts, done) {
          we.plugins['we-plugin-menu'].publishUpdate(done);
        }
      }
    }
  };
};
