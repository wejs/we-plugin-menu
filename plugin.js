/**
 * We.js we-plugin-menu main file
 */

module.exports = function loadPlugin(projectPath, Plugin) {
  var plugin = new Plugin(__dirname);

  // set plugin configs
  plugin.setConfigs({
    menu: {
      linkSortAttrs: ['weight', 'id', 'depth', 'parent'],
      adminMenu: function(req) {
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
      authenticatedUserMenu: function(req) {
        return {
          class: 'nav navbar-nav navbar-right',
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
      unAuthenticatedUserMenu: function(req) {
        var links = [];

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

  // admin menu resource
  plugin.setResource({
    name: 'menu',
    namespace: '/admin'
  });
  plugin.setResource({
    parent: 'menu',
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

  //metis menu
  plugin.addJs('metismenu', {
    type: 'plugin', weight: 10, pluginName: 'we-plugin-menu',
    path: 'files/public/metismenu/metisMenu.js'
  });
  plugin.addCss('metismenu', {
    type: 'plugin', weight: 10, pluginName: 'we-plugin-menu',
    path: 'files/public/metismenu/metisMenu.css'
  });

  // set menu class after load menu
  plugin.events.on('we:after:load:plugins', function (we) {
    we.class.Menu = require('./lib/Menu');

    we.menu = {};

    we.events.emit('we-plugin-menu:after:set:menu:class', we);
  });

  plugin.hooks.on('we:router:request:after:load:context', function (data, done) {
    var res = data.res;
    var req = data.req;

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

  plugin.events.on('we:express:set:params', function(data) {
    // user pre-loader
    data.express.param('menuId', function (req, res, next, id) {
      if (!/^\d+$/.exec(String(id))) return res.notFound();

      if (req.method == 'POST') {
        req.body.menuId = id;
      }

      next();
    });
  });

  plugin.hooks.on('we:after:routes:bind', function (we, done) {

    we.db.models.menu.addHook('afterCreate', 'addToMenuCache', function (r, opts, done){
      we.menu[r.name] = r;
      done();
    });

    we.db.models.menu.addHook('afterUpdate', 'updateMenuCache', function (r, opts, done){
      we.menu[r.name] = r;
      done();
    });

    we.db.models.menu.addHook('afterDestroy', 'removeFromMenuCache', function (r, opts, done) {
      delete we.menu[r.name];
      done();
    });

    we.db.models.link.addHook('afterCreate', 'addToMenuCache', function (r, opts, done){
      // update the menu after create link
      we.db.models.menu.findOne({
        where: { id: r.menuId },
        include: [{ all: true }]
      })
      .then(function (r){
        we.menu[r.name] = r;
        done();
        return null;
      })
      .catch(done);
    });

    we.db.models.link.addHook('afterUpdate', 'updateLinkInMenuCache', function (r, opts, done){
      // update the menu link after update link
      // TODO change to only update this link inside the menu
      we.db.models.menu.findOne({
        where: { id: r.menuId },
        include: [{ all: true }]
      })
      .then(function (r){
        we.menu[r.name] = r;
        done();
        return null;
      })
      .catch(done);
    });

    we.db.models.link.addHook('afterDestroy', 'removeFromMenuCache', function (r, opts, done) {
     // update the menu after delete link
      we.db.models.menu.findOne({
        where: { id: r.menuId },
        include: [{ all: true }]
      })
      .then(function (r){
        we.menu[r.name] = r;
        done();
        return null;
      })
      .catch(done);
    });

    we.db.models.menu.findAll({
      include: [{ all:true }]
    })
    .then(function (r){
      if (!r) return done();

      for (var i = 0; i < r.length; i++) {
        we.menu[r[i].name] = r[i];
      }

      done();
      return null;
    })
    .catch(done);
  });

  return plugin;
};