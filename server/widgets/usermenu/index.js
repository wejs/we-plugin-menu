/**
 * Widget usermenu main file
 *
 * See https://github.com/wejs/we-core/blob/master/lib/class/Widget.js for all Widget prototype functions
 */

module.exports = function (projectPath, Widget) {
  var widget = new Widget('usermenu', __dirname);

  // custom widget method
  widget.checkIfIsValidContext = function checkIfIsValidContext(context) {
    if (!context || context.indexOf('user-') !== 0) {
      return false;
    } else {
      return true
    }
  }

  widget.isAvaibleForSelection = function isAvaibleForSelection(req) {
    if (!req.header) return false;

    var reqContext = req.header('wejs-context');

    if (widget.checkIfIsValidContext(reqContext)) {
      return true;
    } else {
      return false;
    }
  }

  widget.beforeSave = function widgetBeforeSave(req, res, next) {
    // check context in create
    if (res.locals.id || widget.checkIfIsValidContext(req.body.context)) {
      next();
    } else {
      next(new Error(res.locals.__('widget.invalid.context')));
    }
  };


  widget.renderVisibilityField = function renderVisibilityField(widget, context, req, res) {
    var field = '';

    // visibility field
    field += '<div class="form-group"><div class="row">' +
      '<label class="col-sm-4 control-label">'+
      res.locals.__('widget.visibility') + '</label>'+
    '<div class="col-sm-8"><select name="visibility" class="form-control">';

    field +=
    '<option value="in-context" selected value="'+context+'">'+
      res.locals.__('widget.in-context')+
    '</option>'+
    '</select></div></div>'+
    '</div><hr>';

    return field;
  };

  return widget;
};