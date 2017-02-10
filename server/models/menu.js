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
      classMethods: {}
    }
  };
};
