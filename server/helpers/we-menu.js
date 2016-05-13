/**
 * We menu helper
 *
 * render one menu
 *
 * usage:  {{{we-menu menuObject}}}
 */

module.exports = function(we) {
  return function weMenuHelper(menu) {
    if (!menu) return '';

    var options = arguments[arguments.length-1];
    // get res.locals
    var locals = options.hash.locals || options.data.root.locals || options.data.root;
    // get req
    var req = locals.req;

    if (!(menu instanceof we.class.Menu) )
      menu = new we.class.Menu(menu);
    // check permission access
    if (menu.roles) {
      var can = false;
      for (var i = 0; i < req.userRoleNames.length; i++) {
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
