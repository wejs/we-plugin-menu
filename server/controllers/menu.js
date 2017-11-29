/**
 * menu controller
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

module.exports = {
  sortLinks(req, res) {
    let redirectTo = req.we.utils.getRedirectUrl(req, res);
    if (redirectTo) res.locals.redirectTo = redirectTo;

    if (!req.body) {
      if (redirectTo) return res.redirect(redirectTo);
      return res.send();
    }

    const plugin = req.we.plugins['we-plugin-menu'];

    req.we.db.models.menu
    .findOne({
      where: { id: req.params.menuId}, include: { all: true }
    })
    .then( (menu)=> {
      if (!menu) {
        res.notFound();
        return null;
      }

      let itensToSave = {},
        linkAttrs;

      for (let item in req.body) {
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

      req.we.utils.async.each(menu.links, (link, next)=> {
        if (!itensToSave[link.id]) return next();

        link.updateAttributes(itensToSave[link.id])
        .then( ()=> {
          next();
          return null;
        })
        .catch(next);

      }, (err)=> {
        if (err) return res.serverError(err);

        // update the menu after sort links
        req.we.db.models.menu
        .findOne({
          where: { id: menu.id },
          include: [{ all: true }]
        })
        .then( (r)=> {
          req.we.menu[r.name] = r;

          plugin.publishUpdate( ()=> {
            if (redirectTo) {
              res.redirect(redirectTo);
              return null;
            }

            res.send();

            return null;
          });

        })
        .catch(res.queryError);
      });

      return null;
    })
    .catch(res.queryError);
  }
};