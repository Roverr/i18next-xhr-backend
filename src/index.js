import * as utils from './utils';

function open(x, url, data) {
  let method = 'GET';
  if (data) {
    method = 'POST';
  }
  x.open(method, url, 1);
}

function ajax(url, options, callback, data, cache) {
  const dataObject = (typeof data === 'object');
  const isValid = data && dataObject;
  let workData = data;
  if (isValid) {
    let y = '';
    /* eslint-disable */
    for (const m in data) {
      y += `&${encodeURIComponent(m)}=${encodeURIComponent(workData[m])}`;
    }
    /* eslint-enable */
    workData = y.slice(1);
    if (!cache) {
      workData += `&_t=${new Date}`;
    }
  }

  try {
    const x = new (XMLHttpRequest || ActiveXObject)('MSXML2.XMLHTTP.3.0'); // eslint-disable-line no-undef
    open(x, url, workData);
    if (!options.crossDomain) {
      x.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
    }
    if (data) {
      x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
    }
    x.onreadystatechange = function onReadyStateChange() {
      const correctState = x.readyState > 3;
      if (correctState && callback) {
        return callback(x.responseText, x);
      }
      return null;
    };
    x.send(data);
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
    ajax
  };
}

class Backend {
  constructor(services, options = {}) {
    this.init(services, options);

    this.type = 'backend';
  }

  init(services, options = {}) {
    this.services = services;
    this.options = utils.defaults(options, this.options || {}, getDefaults());
  }

  readMulti(languages, namespaces, callback) {
    let loadPath = this.options.loadPath;
    if (typeof this.options.loadPath === 'function') {
      loadPath = this.options.loadPath(languages, namespaces);
    }

    const url = this.services.interpolator.interpolate(loadPath, { lng: languages.join('+'), ns: namespaces.join('+') });

    this.loadUrl(url, callback);
  }

  read(language, namespace, callback) {
    let loadPath = this.options.loadPath;
    if (typeof this.options.loadPath === 'function') {
      loadPath = this.options.loadPath([language], [namespace]);
    }

    const url = this.services.interpolator.interpolate(loadPath, { lng: language, ns: namespace });

    this.loadUrl(url, callback);
  }

  loadUrl(url, callback) {
    this.options.ajax(url, this.options, (data, xhr) => {
      if (xhr.status >= 500 && xhr.status < 600) {
        return callback(`failed loading ${url}`, true /* retry */);
      }
      if (xhr.status >= 400 && xhr.status < 500) {
        return callback(`failed loading ${url}`, false /* no retry */);
      }

      let ret;
      try {
        ret = this.options.parse(data, url);
      } catch (e) {
        const err = `failed parsing ${url} to json`;
        return callback(err, false);
      }
      return callback(null, ret);
    });
  }

  create(recievedLanguages, ns, key, fallbackValue) {
    let languages = recievedLanguages;
    if (typeof recievedLanguages === 'string') {
      languages = [recievedLanguages];
    }

    const payload = {};
    payload[key] = fallbackValue || '';

    languages.forEach((lng) => {
      const interpolater = { lng, ns };
      const url = this.services.interpolator.interpolate(this.options.addPath, interpolater);

      this.options.ajax(url, this.options, () => {}, payload);
    });
  }
}

Backend.type = 'backend';


export default Backend;
