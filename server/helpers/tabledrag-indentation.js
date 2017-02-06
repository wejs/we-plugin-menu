/**
 * Dragable indentation helper
 *
 * usage:  {{tabledrag-indentation depth=depthCount}}
 */

module.exports = function(we) {
  return function tabledragIndentationHelper() {
    const options = arguments[arguments.length-1];

    if (!options.hash.depth || !Number(options.hash.depth) ) return '';

    let html = '';

    for (let i = 0; i < options.hash.depth; i++) {
      html += '<div class="indentation"> </div>';
    }

    return new we.hbs.SafeString(html);
  };
};