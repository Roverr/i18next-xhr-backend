(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global.i18nextXHRBackend = factory());
}(this, function () { 'use strict';

  var arr = [];
  var each = arr.forEach;

  function defaults(obj) {
    for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
      args[_key - 1] = arguments[_key];
    }

    each.call(args, function (source) {
      if (!source) {
        return;
      }
      for (var prop in source) {
        // eslint-disable-line no-restricted-syntax
        if (obj[prop] === undefined) {
          obj[prop] = source[prop]; // eslint-disable-line no-param-reassign
        }
      }
    });
    return obj;
  }

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj;
  };

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  function open(x, url, data) {
    var method = 'GET';
    if (data) {
      method = 'POST';
    }
    x.open(method, url, 1);
  }

  function ajax(url, options, callback, data, cache) {
    var dataObject = (typeof data === 'undefined' ? 'undefined' : _typeof(data)) === 'object';
    var isValid = data && dataObject;
    var workData = data && JSON.parse(JSON.stringify(data));
    if (isValid) {
      var y = '';
      /* eslint-disable */
      for (var m in data) {
        y += '&' + encodeURIComponent(m) + '=' + encodeURIComponent(workData[m]);
      }
      /* eslint-enable */
      workData = y.slice(1);
      if (!cache) {
        workData += '&_t=' + new Date();
      }
    }

    try {
      (function () {
        var x = new (XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0'); // eslint-disable-line no-undef
        open(x, url, workData);
        if (!options.crossDomain) {
          x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        }
        if (data) {
          x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        x.onreadystatechange = function onReadyStateChange() {
          var correctState = x.readyState > 3;
          if (correctState && callback) {
            return callback(x.responseText, x);
          }
          return null;
        };
        x.send(data);
      })();
    } catch (e) {
      if (window.console) {
        return console.error(e); // eslint-disable-line no-console
      }
    }
    return null;
  }

  function getDefaults() {
    return {
      loadPath: '/locales/{{lng}}/{{ns}}.json',
      addPath: 'locales/add/{{lng}}/{{ns}}',
      allowMultiLoading: false,
      parse: JSON.parse,
      crossDomain: false,
      ajax: ajax
    };
  }

  var Backend = function () {
    function Backend(services) {
      var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];
      classCallCheck(this, Backend);

      this.init(services, options);

      this.type = 'backend';
    }

    createClass(Backend, [{
      key: 'init',
      value: function init(services) {
        var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

        this.services = services;
        this.options = defaults(options, this.options || {}, getDefaults());
      }
    }, {
      key: 'readMulti',
      value: function readMulti(languages, namespaces, callback) {
        var loadPath = this.options.loadPath;
        if (typeof this.options.loadPath === 'function') {
          loadPath = this.options.loadPath(languages, namespaces);
        }

        var url = this.services.interpolator.interpolate(loadPath, { lng: languages.join('+'), ns: namespaces.join('+') });

        this.loadUrl(url, callback);
      }
    }, {
      key: 'read',
      value: function read(language, namespace, callback) {
        var loadPath = this.options.loadPath;
        if (typeof this.options.loadPath === 'function') {
          loadPath = this.options.loadPath([language], [namespace]);
        }

        var url = this.services.interpolator.interpolate(loadPath, { lng: language, ns: namespace });

        this.loadUrl(url, callback);
      }
    }, {
      key: 'loadUrl',
      value: function loadUrl(url, callback) {
        var _this = this;

        this.options.ajax(url, this.options, function (data, xhr) {
          if (xhr.status >= 500 && xhr.status < 600) {
            return callback('failed loading ' + url, true /* retry */);
          }
          if (xhr.status >= 400 && xhr.status < 500) {
            return callback('failed loading ' + url, false /* no retry */);
          }

          var ret = void 0;
          try {
            ret = _this.options.parse(data, url);
          } catch (e) {
            var err = 'failed parsing ' + url + ' to json';
            return callback(err, false);
          }
          return callback(null, ret);
        });
      }
    }, {
      key: 'create',
      value: function create(recievedLanguages, ns, key, fallbackValue) {
        var _this2 = this;

        var languages = recievedLanguages;
        if (typeof recievedLanguages === 'string') {
          languages = [recievedLanguages];
        }

        var payload = {};
        payload[key] = fallbackValue || '';

        languages.forEach(function (lng) {
          var interpolater = { lng: lng, ns: ns };
          var url = _this2.services.interpolator.interpolate(_this2.options.addPath, interpolater);

          _this2.options.ajax(url, _this2.options, function (data, xhr) {
            // const statusCode = xhr.status.toString();
            // TODO: if statusCode === 4xx do log
          }, payload);
        });
      }
    }]);
    return Backend;
  }();

  Backend.type = 'backend';

  return Backend;

}));