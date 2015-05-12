'use strict';

SwaggerUi.Views.CurlView = Backbone.View.extend({

  // operation.url
  // operation.model
  // operation.el
  initialize: function(opts) {
    opts = opts || {};
    this.url = opts.url;
    this.model = opts.operation.model;
    this.parent = opts.operation.el;

    this._extractParameters();
    return this;
  },

  render: function() {

    $(this.el).text('curl -v -X ' + this.model.method.toUpperCase() +
      this._getParams('header') + ' "' + this.url + '"' +
      this._getParams('body') +
      this._getParams('form'));

    return this;
  },

  _extractParameters: function() {

    this.params = {header: [], form: [], body: []};

    var contentType = $('div select[name=parameterContentType]', $(this.parent)).val();

    if(contentType) {
      this.params.header.push('-H "Content-Type:' + contentType + '"');
    }

    _.each(this.model.parameters, function(parameter) {

      // console.log('> processing parameter: ', parameter);

      var field = $('input[name='+parameter.name+'], textarea[name='+parameter.name+']', $(this.parent));

      // console.log('> got field: ', field);

      if(field.length && field[0] !== 'undefined' && $.trim(field[0].value) !== '') {

        var name  = _.escape(parameter.name);
        // escape " and strip newlines and non-printable
        var value = field[0].value.replace(/[\\"]/g, '\\$&').replace(/\u0000/g, '\\0').replace(/\s/g, '');

        if(parameter.in.toLowerCase() === 'body') {
          this.params.body.push('-d "' + value + '"');
        }
        else if(parameter.in.toLowerCase() === 'formdata') {
          if(parameter.type.toLowerCase() === 'file') {
            this.params.form.push('-F ' + name + '=@"' + value + '"');
          } else {
            this.params.form.push('-d ' + name + '="' + value + '"');
          }
        }
        else if(parameter.in.toLowerCase() === 'header') {
          this.params.header.push('-H "' + name + ':' + value + '"');
        } // else {
          // console.log('> skip parameter.in: ' + parameter.in);
        // }
      }
    }, this);
  },

  _getParams: function(type) {
    if (this.params[type].length === 0) {
      return '';
    } else {
      return ' ' + this.params[type].join(' ');
    }
  }
});

