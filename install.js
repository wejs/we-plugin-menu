module.exports = {
  /**
   * Return a list of updates
   *
   * @param  {Object} we we.js object
   * @return {Array}    a list of update objects
   */
  updates() {
    return [{
      version: '1.4.1',
      update(we, done) {
        const sql = 'ALTER TABLE `links` '+
          ' ADD COLUMN `modelName` VARCHAR(200) NULL DEFAULT NULL, '+
          ' ADD COLUMN `modelId` VARCHAR(42) NULL DEFAULT NULL, '+
          ' ADD COLUMN `userRole` VARCHAR(255) NULL DEFAULT NULL, '+
          ' ADD COLUMN `type` VARCHAR(200) NULL DEFAULT NULL;';
        we.db.defaultConnection
        .query(sql)
        .then( ()=> {
          done();
          return null;
        })
        .catch(done);
      }
    }];
  }
};
