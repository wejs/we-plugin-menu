/**
 * Link
 *
 * @module      :: Model
 * @description :: Link model
 *
 */

module.exports = function Model(we) {
  return {
    definition: {
      href: { type:  we.db.Sequelize.TEXT, formFieldType: 'text' },

      text: { type:  we.db.Sequelize.TEXT, formFieldType: 'text' },
      title: { type:  we.db.Sequelize.TEXT, formFieldType: 'text' },

      class: { type:  we.db.Sequelize.STRING },
      style: { type:  we.db.Sequelize.STRING },

      target: { type:  we.db.Sequelize.STRING },
      rel: { type:  we.db.Sequelize.STRING },

      key: { type:  we.db.Sequelize.STRING(10) },

      depth: { type:  we.db.Sequelize.INTEGER },
      weight: { type:  we.db.Sequelize.INTEGER },
      parent: { type:  we.db.Sequelize.INTEGER }
    }
  };
};