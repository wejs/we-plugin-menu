/**
 * We menu helper
 *
 * render one menu
 *
 * usage:  {{#we-menu 'menuName'}} {{/we-menu}}
 */

module.exports = function(we) {
  return function weMenuHelper(menu) {
    var options = arguments[arguments.length-1];
    var req = options.data.root.req || options.data.root.locals.req;

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

    return new we.hbs.SafeString( menu.render( req ) );
  };
};
