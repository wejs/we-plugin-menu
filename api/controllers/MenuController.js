/**
 * MenuController
 *
 * @module    :: Controller
 * @description :: Contains logic for handling requests.
 */

// we.js controller utils
// var actionUtil = require('we-helpers').actionUtil;
// var util = require('util');

module.exports = {
  _config: {
    rest: false
  },
  // add your plugin controllers here
  findOne: function findOneRecord (req, res) {
    var sails = req._sails;
    var menuName = req.param('id');

    if (!sails.config.menu[menuName] ) {
      res.notFound('Menu not found');
    }

    return res.send(sails.config.menu[menuName]);
  }
};
