/**
 * link controller
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  /**
   * Create and create page actions
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  create(req, res) {
    if (!res.locals.template) {
      res.locals.template = res.locals.model + '/' + 'create';
    }

    if (!res.locals.data) {
      res.locals.data = {};
    }

    const plugin = req.we.plugins['we-plugin-menu'];

    if (req.method === 'POST') {
      if (req.isAuthenticated && req.isAuthenticated()) {
        req.body.creatorId = req.user.id;
      }

      req.we.utils._.merge(res.locals.data, req.body);

      return res.locals.Model
      .create(req.body)
      .then(function afterCreate (record) {
        res.locals.data = record;

        plugin.publishUpdate(()=> {
          res.created();
        });
        return null;
      })
      .catch(res.queryError);
    } else {
      res.ok();
    }
  },
  edit(req, res) {
    const record = res.locals.data;
    const plugin = req.we.plugins['we-plugin-menu'];

    record
    .updateAttributes(req.body)
    .then( ()=> {
      // update the menu after update link record
      return req.we.db.models.menu
      .findOne({
        where: { id: res.locals.data.menuId },
        include: [{ all: true }]
      })
      .then( (r)=> {
        plugin.publishUpdate(()=> {
          req.we.menu[r.name] = r;
          res.updated();

          return null;
        });
      });
    })
    .catch(res.queryError);
  },
  /**
   * Delete and delete action
   *
   * @param  {Object} req express.js request
   * @param  {Object} res express.js response
   */
  delete(req, res) {
    if (!res.locals.template) {
      res.locals.template = res.local.model + '/' + 'delete';
    }

    let record = res.locals.data;

    if (!record) {
      return res.notFound();
    }
    const plugin = req.we.plugins['we-plugin-menu'];

    res.locals.deleteMsg = res.locals.model + '.delete.confirm.msg';

    if (req.method === 'POST' || req.method === 'DELETE') {
      record
      .destroy()
      .then(function afterDestroy () {
        res.locals.deleted = true;

        plugin.publishUpdate(()=> {
          res.deleted();
        });
        return null;
      })
      .catch(res.queryError);
    } else {
      res.ok();
    }
  }
};