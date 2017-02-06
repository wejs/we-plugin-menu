/**
 * Dragable menu table
 *
 * usage:
 *   {{#tabledrag id='yourTableId' menu=menuRecord}}
 *     ... your tr html for each row
 *   {{/tabledrag}}
 */

module.exports = function(we) {
  return function tabledragHelper() {
    let menu, options = arguments[arguments.length-1];
    let id = options.hash.id || 'datatableLinkTable';

    let html = '<table id="'+id+'" class="table table-striped table-hover"><thead>'+
      '<tr><th we-model-attr="name">' + 'text' + '</th>'+
        '<th we-model-attr="weight">' + 'weight' + '</th>'+
        '<th we-model-attr="parent">' + 'parent' + '</th>'+
        '<th we-model-attr="actions">' + 'actions' +  '</th>'+
      '</tr>'+
    '</thead><tbody>';

    if (options.hash.menu) {
      if (!(menu instanceof we.class.Menu) )
        menu = new we.class.Menu(options.hash.menu);

      const links = menu.getLinksList();

      for (let i = 0; i < links.length; i++) {
        html += options.fn(links[i]);
      }
    } else {
      html += options.inverse(this);
    }

    html += '</tbody></table>'+
      '<script>$(document).ready(function() {'+
        'we.components.tableDrag(\'#'+id+'\');'+
      '});</script>';

    return new we.hbs.SafeString(html);
  };
};