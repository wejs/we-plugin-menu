module.exports = function menuWidget(projectPath, Widget) {
  const widget = new Widget('menu', __dirname);

  widget.beforeSave = function widgetBeforeSave(req, res, next) {
    if (!req.body.configuration) {
      req.body.configuration = {};
    }
    req.body.configuration.menu = req.body.menu;
    return next();
  };

  widget.formMiddleware = function formMiddleware(req, res, next) {
    const we = req.getWe();
    res.locals.menu = we.menu;
    next();
  };

  widget.viewMiddleware = function viewMiddleware(widget, req, res, next) {

    const menuId = widget.configuration.menu;

    for(let name in req.we.menu) {
      if (
        req.we.menu[name] &&
        ( req.we.menu[name].id == menuId)
      ) {
        widget.menu =  req.we.menu[name];
      }
    }

    next();
  };

  return widget;
};