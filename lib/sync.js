const fs = require('fs'),
  chokidar = require('chokidar');

module.exports = {
  init(plugin) {
    plugin.syncFile = plugin.we.projectPath+'/files/sync-menu.txt';

    plugin.createSyncFileIfNotExists = function createSyncFileIfNotExists(we, done) {
      fs.writeFile(plugin.syncFile, '1', { flag: 'wx' }, function () {
        done();
      });
    };

    plugin.publishUpdate = function publishUpdate(cb) {
      plugin.writeSyncFile(cb);
    };

    plugin.writeSyncFile = function writeSyncFile(cb) {
      if (!cb) cb = function(){};

      fs.writeFile(plugin.syncFile, new Date().getTime(), {
        flag: 'w'
      }, cb);
    };

    plugin.watchConfigFile = function watchConfigFile(done) {
      plugin.configWatcher = chokidar.watch(plugin.syncFile, {
        persistent: true
      });

      plugin.configWatcher.on('change', ()=> {
        setTimeout(()=> {
          plugin.reloadAllCachedMenus();
        }, 50);
      });

      done();
    };

    plugin.reloadAllCachedMenus = function reloadAllCachedMenus(done) {
      if (!done) done = function(){};

      plugin.we.db.models.menu
      .findAll({
        include: [{ all:true }]
      })
      .then( (r)=> {
        if (!r) {
          done();
          return null;
        }

        for (let i = 0; i < r.length; i++) {
          plugin.we.menu[r[i].name] = r[i];
        }

        done();
        return null;
      })
      .catch(done);
    };

    plugin.hooks.on('we:check:requirements', plugin.createSyncFileIfNotExists);

    plugin.hooks.on('we:server:after:start', (we, done)=> {
      plugin.watchConfigFile(done);
    });
  }
};