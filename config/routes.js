module.exports.routes = {
  'get /menu/:id': {
    controller    : 'MenuController',
    action        : 'findOne',
    model         : 'menu'
  }
}