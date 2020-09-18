const eventName = 'menu-updated';

module.exports = {
  lastUpdateTime: new Date().getTime(),

  init(plugin) {
    const we = plugin.we;
    const self = this;

    plugin.publishUpdate = function publishUpdate(cb) {
      we.sysPubsub.publish(eventName, {
        updateTime: new Date().getTime()
      });

      cb();
    };

    plugin.reloadAllCachedMenus = function (done) {
      if (!done) done = function(){};

      plugin.we.db.models.menu
      .findAll({
        include: [{ all:true }]
      })
      .then( (r)=> {
        if (!r) {
          return done();
        }

        for (let i = 0; i < r.length; i++) {
          plugin.we.menu[r[i].name] = r[i];
        }

        done();
      })
      .catch(done);
    };

    plugin.hooks.on('we:server:after:start', (we, done)=> {
      we.sysPubsub.subscribe(eventName, function(data) {
        if (data.updateTime == self.lastUpdateTime) {
          // updated, skip
          return;
        }

        self.lastUpdateTime = data.updateTime;

        plugin.reloadAllCachedMenus((err)=> {
          if (err) {
            we.log.error('we-plugin-menu error on reload cached menu', {
              error: err
            });
          }
        });
      });

      done();
    });
  }
};