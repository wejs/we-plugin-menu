/**
 * We.js menu plugin main file
 */

const sync = require('./lib/sync.js');

module.exports = function loadPlugin(projectPath, Plugin) {
  const plugin = new Plugin(__dirname);

  // set plugin configs
  plugin.setConfigs({
    menu: {
      linkSortAttrs: ['weight', 'id', 'depth', 'parent'],
      adminMenu(req) {
        return {
          class: 'nav',
          permission: 'access_admin',
          links: [
            {
              id: 'adminMenu',
              text: '<i class="fa fa-bars"></i> '+req.__('menu.find'),
              href: '/admin/menu',
              class: null,
              weight: 2,
              name: 'admin.menu.find'
            },
            {
              id: 'adminUser',
              text: '<i class="fa fa-users"></i> '+req.__('users.link'),
              href: '/admin/user',
              class: null,
              weight: 3,
              name: 'admin.user.find'
            },
            {
              id: 'adminPermissions',
              text: '<i class="fa fa-unlock-alt"></i> '+req.__('permission.link'),
              href: '/admin/permission',
              class: null,
              weight: 5
            },
            {
              id: 'adminUrlAlias',
              text: '<i class="fa fa-random"></i> '+req.__('urlAlias.find'),
              href: '/admin/urlAlias',
              class: null,
              weight: 7
            }
          ]
        };
      },
      authenticatedUserMenu(req) {
        return {
          links: [{
            id: 'user',
            href: '/user/' + req.user.id,
            text: req.user.displayName || '#'+req.user.id,
            class: null,
            weight: 3
          },
          {
            id: 'userProfileView',
            href: '/user/' + req.user.id,
            text: '<i class="glyphicon glyphicon-user"></i> '+
              req.__('user.profile.view'),
            class: null,
            weight: 3,
            parent: 'user'
          },
          {
            id: 'userProfileEdit',
            href: '/user/' + req.user.id + '/edit',
            text: '<i class="glyphicon glyphicon-pencil"></i> '+
              req.__('user.profile.edit'),
            class: null,
            weight: 5,
            parent: 'user'
          },
          {
            id: 'userProfileEditPrivacity',
            href: '/user/' + req.user.id + '/edit/privacity',
            text: '<i class="glyphicon glyphicon-alert"></i> '+
              req.__('Privacity'),
            class: null,
            weight: 5,
            parent: 'user'
          },
          {
            id: 'userChangePassword',
            href: '/auth/change-password',
            text: '<i class="glyphicon glyphicon-lock text-warning"></i> '+
              req.__('auth.change-password'),
            class: null,
            weight: 7,
            parent: 'user',
            dividerAfter: true
          },
          {
            id: 'logout',
            href: '/auth/logout',
            text: '<i class="glyphicon glyphicon-log-out text-danger"></i> '+
              req.__('Logout'),
            class: null,
            weight: 9,
            parent: 'user',
            dividerAfter: true
          }
          ]
        };
      },
      unAuthenticatedUserMenu(req) {
        const links = [];

        if (req.we.config.auth.allowLogin) {
          links.push({
            id: 'login',
            href: '/login',
            text: req.__('Login'),
            class: 'login-link',
            weight: 3
          });
        }

        if (req.we.config.auth.allowRegister) {
          links.push({
            id: 'register',
            href: '/signup',
            text: req.__('Register'),
            class: 'register-link',
            weight: 5
          });
        }

        return {
          class: 'nav navbar-nav navbar-right',
          links: links
        };
      }
    },
  });

  // menu resource:
  plugin.setResource({
    name: 'menu'
  });
  // menu link resource:
  plugin.setResource({
    name: 'link'
  });

  plugin.setRoutes({
    'post /admin/menu/:menuId([0-9]+)/sort-links': {
      controller    : 'menu',
      action        : 'sortLinks',
      model         : 'menu',
      permission    : 'update_menu',
      responseType  : 'json'
    }
  });
  /**
   * Preload menus selected with systemSettings configuration
   *
   * @param  {Object}   req  Express.js request
   * @param  {Object}   res  Express.js response
   * @param  {Function} next Callback
   */
  plugin.preloadMenus = function preloadMenus(req, res, next) {
    const ss = req.we.systemSettings;
    const l = res.locals;

    l.menuMain = plugin.getMenuWithID(ss.menuMainId);
    l.menuSecondary = plugin.getMenuWithID(ss.menuSecondaryId);
    l.menuFooter = plugin.getMenuWithID(ss.menuFooterId);
    l.menuSocial = plugin.getMenuWithID(ss.menuSocialId);
    l.menuAuthenticated = plugin.getMenuWithID(ss.menuAuthenticatedId);

    next();
  };
  plugin.getMenuWithID = function getMenuWithID(id) {
    if (!id) return null;

    for (let name in plugin.we.menu) {
      if (plugin.we.menu[name].id == id) {
        return plugin.we.menu[name];
      }
    }

    return null;
  };

  // set menu class after load menu
  plugin.events.on('we:after:load:plugins', function (we) {
    we.class.Menu = require('./lib/Menu');

    we.menu = {};

    we.events.emit('we-plugin-menu:after:set:menu:class', we);
  });


  plugin.events.on('we:after:load:express', (we)=> {
    if (we.plugins['we-plugin-db-system-settings']) {
      we.express.use(plugin.preloadMenus);
    }
  });

  plugin.hooks.on('we:router:request:after:load:context', function (data, done) {
    const res = data.res,
      req = data.req;

    // set user menu
    if (req.isAuthenticated()) {
      res.locals.userMenu = new req.we.class.Menu(
        req.we.config.menu.authenticatedUserMenu(req)
      );
    } else {
      res.locals.userMenu = new req.we.class.Menu(
        req.we.config.menu.unAuthenticatedUserMenu(req)
      );
    }

    if (res.locals.isAdmin) {
      // set admin menu
      res.locals.adminMenu = new req.we.class.Menu(
        req.we.config.menu.adminMenu(req)
      );
    }

    if (res.locals.user) {
      res.locals.currentUserMenu =  new req.we.class.Menu({
        class: 'nav nav-stacked nav-pills', permission: 'find_user',
        links: [
          {
            id: 'view',
            text: '<i class="fa fa-eye"></i> '+req.__('menu.user.view'),
            href: res.locals.user.getUrlPathAlias(),
            class: null,
            weight: 2,
            name: 'menu.user.view'
          }
        ]
      });

      if (req.we.acl && req.we.acl.canStatic('update_user', req.userRoleNames)) {
        res.locals.currentUserMenu.addLink({
          id: 'edit',
          text: '<i class="fa fa-edit"></i> '+req.__('menu.user.edit'),
          href: '/user/'+res.locals.user.id+'/edit',
          class: null,
          weight: 4,
          name: 'menu.user.edit'
        });
      }
    }

    req.we.hooks.trigger('we-plugin-menu:after:set:core:menus', data, done);
  });

  plugin.hooks.on('we:after:routes:bind', function (we, done) {
    // skip menu cache if views plugin dont are instaled:
    if (!we.plugins['we-plugin-view']) return done();

    we.db.models.menu.addHook('afterCreate', 'addToMenuCache', function (r) {
      we.menu[r.name] = r;
    });

    we.db.models.menu.addHook('afterUpdate', 'updateMenuCache', function (r) {
      we.menu[r.name] = r;
    });

    we.db.models.menu.addHook('afterDestroy', 'removeFromMenuCache', function (r) {
      delete we.menu[r.name];
    });

    we.db.models.link.addHook('afterCreate', 'addToMenuCache', function (r) {
      return new Promise( (resolve, reject)=> {
        // update the menu after create link
        we.db.models.menu
        .findOne({
          where: { id: r.menuId },
          include: [{ all: true }]
        })
        .then( (r)=> {
          we.menu[r.name] = r;
          resolve();
          return null;
        })
        .catch(reject);
      });
    });

    we.db.models.link.addHook('afterUpdate', 'updateLinkInMenuCache', function (r) {
      return new Promise( (resolve, reject)=> {
        // update the menu link after update link
        // TODO change to only update this link inside the menu
        we.db.models.menu
        .findOne({
          where: { id: r.menuId },
          include: [{ all: true }]
        })
        .then( (r)=> {
          we.menu[r.name] = r;
          resolve();
          return null;
        })
        .catch(reject);
      });
    });

    we.db.models.link.addHook('afterDestroy', 'removeFromMenuCache', function (r) {
      return new Promise( (resolve, reject)=> {
        // update the menu after delete link
        we.db.models.menu
        .findOne({
          where: { id: r.menuId },
          include: [{ all: true }]
        })
        .then( (r)=> {
          we.menu[r.name] = r;
          resolve();
          return null;
        })
        .catch(reject);
      });
    });

    plugin.reloadAllCachedMenus(done);
  });

  sync.init(plugin);

  return plugin;
};