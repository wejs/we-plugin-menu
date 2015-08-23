/**
 * Dragable indentation helper
 *
 * usage:  {{tabledrag-indentation depth=depthCount}}
 */

module.exports = function(we) {
  return function tabledragIndentationHelper() {
    var options = arguments[arguments.length-1];

    if (!options.hash.depth || !Number(options.hash.depth) ) return '';

    var html = '';

    for (var i = 0; i < options.hash.depth; i++) {
      html += '<div class="indentation"> </div>';
    }

    return new we.hbs.SafeString(html);
  }
};