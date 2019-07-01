/**
 * We menu helper
 *
 * render one menu
 *
 * usage:  {{{we-menu menuObject class="" liClass="" aClass="" submenuTemplate="" locals=locals}}}
 */

module.exports = function(we) {
  return function weMenuHelper(menu) {
    if (!menu) return '';

    const options = arguments[arguments.length-1];
    // get res.locals
    let locals = options.hash.locals || options.data.root.locals || options.data.root;
    // get req
    const req = locals.req;

    if (!(menu instanceof we.class.Menu) ) {
      menu = new we.class.Menu(menu);
      menu.liClass = options.hash.liClass;
      menu.aClass = options.hash.aClass;
    }

    if (options.hash.submenuTemplate) {
      menu.submenuTemplate = options.hash.submenuTemplate;
    }

    // check permission access
    if (menu.roles) {
      let can = false;
      for (let i = 0; i < req.userRoleNames.length; i++) {
        if (menu.roles.indexOf(req.userRoleNames[i]) > -1 ) {
          can = true;
          break;
        }
      }
      if (!can) return '';
    }
    // check permission with permission string
    if (menu.permission) {
      if (!we.acl.canStatic(menu.permission, req.userRoleNames))
        return '';
    }

    return new we.hbs.SafeString( menu.render( req, options.hash ) );
  };
};
