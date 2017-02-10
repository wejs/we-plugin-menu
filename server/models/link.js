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
    },
    associations: {},
    options: {
      classMethods: {
        /**
         * Context loader, preload current request record and related data
         *
         * @param  {Object}   req  express.js request
         * @param  {Object}   res  express.js response
         * @param  {Function} done callback
         */
        contextLoader(req, res, done) {
          if (!res.locals.id || !res.locals.loadCurrentRecord) return done();

          return this
          .findOne({
            where: { id: res.locals.id },
            include: [{ all: true }]
          })
          .then(function afterLoadContextRecord (record) {
            res.locals.data = record;

            if (record) {
              if (record.menuId) {
                req.body.menuId = record.menuId;
                req.params.menuId = record.menuId;
              }

              if(record.dataValues.creatorId && req.isAuthenticated()) {
                // ser role owner
                if (record.isOwner(req.user.id)) {
                  if(req.userRoleNames.indexOf('owner') == -1 ) req.userRoleNames.push('owner');
                }
              }
            }

            done();
            return null;
          })
          .catch(done);
        }
      }
    }
  };
};