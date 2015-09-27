/**
 * link controller
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  update: function update(req, res) {
    if(!res.locals.record) return res.notFound();

    res.locals.record.updateAttributes(req.body)
    .then(function() {
      // update the menu after update link record
      req.we.db.models.menu.findOne({
        where: { id: res.locals.record.menuId },
        include: [{ all: true }]
      }).then(function (r){
        req.we.menu[r.name] = r;
        return res.updated();
      }).catch(res.queryError);
    }).catch(res.queryError);
  },
  edit: function edit(req, res) {
    var record = res.locals.record;

    if (req.method === 'POST') {
      if (!record) return res.notFound();

      record.updateAttributes(req.body)
      .then(function() {
        // update the menu after update link record
        req.we.db.models.menu.findOne({
          where: { id: res.locals.record.menuId },
          include: [{ all: true }]
        }).then(function (r){
          req.we.menu[r.name] = r;
          return res.updated();
        }).catch(res.queryError);
      }).catch(res.queryError);
    } else {
      res.ok();
    }
  }
};