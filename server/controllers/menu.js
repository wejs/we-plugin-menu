/**
 * menu controller
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  sortLinks: function sortLinks(req, res) {
    var redirectTo = req.we.utils.getRedirectUrl(req, res);
    if (redirectTo) res.locals.redirectTo = redirectTo;

    if (!req.body) {
      if (redirectTo) return res.redirect(redirectTo);
      return res.send();
    }

    req.we.db.models.menu.findOne({
      where: { id: req.params.menuId}, include: { all: true }
    }).then(function (menu) {
      if (!menu) return res.notFound();

      var itensToSave = {};
      var linkAttrs;

      for (var item in req.body) {
        linkAttrs = item.split('-');

        if (linkAttrs.length !== 3) continue;
        if (linkAttrs[0] !== 'link') continue;
        if (req.we.utils._.isNumber(linkAttrs[1])) continue;
        if (req.we.config.menu.linkSortAttrs.indexOf(linkAttrs[2]) === -1) {
          continue;
        }

        if (!itensToSave[linkAttrs[1]]) itensToSave[linkAttrs[1]] = {};

        itensToSave[linkAttrs[1]][linkAttrs[2]] = req.body[item];
      }

      req.we.utils.async.each(menu.links, function(link, next) {
        if (!itensToSave[link.id]) return next();

        link.updateAttributes(itensToSave[link.id])
        .then(function() {
          next();
        }).catch(next);

      }, function(err) {
        if (err) return res.serverError(err);
        if (redirectTo) return res.redirect(redirectTo);
        res.send();
      });
    }).catch(res.queryError);
  }
};