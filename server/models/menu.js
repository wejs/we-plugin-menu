/**
 * menu
 *
 * @module      :: Model
 * @description :: Menu model
 *
 */

module.exports = function Model(we) {
  var model = {
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
        model: 'link'
      }
    },
    options: {
      titleField: 'name',
      classMethods: {}
    }
  };

  return model;
};
