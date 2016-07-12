/**
 * link controller
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  update: function update(req, res) {
    if(!res.locals.data) return res.notFound();

    res.locals.data.updateAttributes(req.body)
    .then(function() {
      // update the menu after update link record
      return req.we.db.models.menu
      .findOne({
        where: { id: res.locals.data.menuId },
        include: [{ all: true }]
      })
      .then(function (r) {

        req.we.menu[r.name] = r;
        res.updated();

        return null;
      })
    })
    .catch(res.queryError);
  },
  edit: function edit(req, res) {
    var record = res.locals.data;

    if (req.method === 'POST') {
      if (!record) return res.notFound();

      record.updateAttributes(req.body)
      .then(function() {
        // update the menu after update link record
        return req.we.db.models.menu
        .findOne({
          where: { id: res.locals.data.menuId },
          include: [{ all: true }]
        })
        .then(function (r) {

          req.we.menu[r.name] = r;
          res.updated();

          return null;
        })
      })
      .catch(res.queryError);
    } else {
      res.ok();
    }
  }
};