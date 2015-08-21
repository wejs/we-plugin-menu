/**
 * We.js we-plugin-menu main file
 */

module.exports = function loadPlugin(projectPath, Plugin) {
  var plugin = new Plugin(__dirname);

  // set plugin configs
  plugin.setConfigs({
    menu: {
      adminMenu: function(req) {
        return {
          class: 'nav',
          permission: 'access_admin',
          links: [
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
            text: '<i class="glyphicon glyphicon-pencil text-primary"></i> '+
              req.__('user.profile.edit'),
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
        return {
          class: 'nav navbar-nav navbar-right',
          links: [{
            id: 'login',
            href: '/login',
            text: req.__('Login'),
            class: null,
            weight: 4
          }, {
            id: 'register',
            href: '/signup',
            text: req.__('Register'),
            class: null,
            weight: 5
          }]
        };
      }
    },
  });

  // set admin menu resource
  plugin.setResource({
    name: 'menu',
    namespace: '/admin'
  });

  // set menu class after load menu
  plugin.events.on('we:after:load:plugins', function (we) {
    we.class.Menu = require('./lib/Menu');
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

    done();
  });

  return plugin;
};