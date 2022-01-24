// Date Modified: 2020/03/25
// Modified by: Daniel Jo<daniel@novramedia.com>
// throw out IE <7 compatibility
// TODO feature check Promise
var Ajax = {
  xhr: function (method, path, params, opts) {
    var r, q;
    r = new XMLHttpRequest();
    q = '';

    if (params) {
      q = typeof params === 'string' ? params : Object.keys(params).map(function (key) {
        return encodeURIComponent(key)+'='+encodeURIComponent(params[key])
      }).join('&');
      if (method === 'GET') {
        path += '?'+q;
        q = '';
      }
    }

    return new Promise(function (resolve, reject) {
      r.onreadystatechange = function () {
        if (this.readyState === XMLHttpRequest.DONE) {
          if (this.status >= 200 && this.status < 300) {
            // test for JSON
            try {
              let j = JSON.parse(this.response);
              return resolve(j);
            } catch (e) {
              // not JSON or deformed
              resolve(this.response);
            }
          } else {
            reject(this.statusText);
          }
        }
      };
      r.onerror = function (err) {
        reject(this.statusText);
      };
      r.open(method, path);
      if (method === 'POST') {
        //r.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
        // TODO application/json is not an allowed value for CORS requests
        r.setRequestHeader('Content-Type', 'application/json');
        //r.setRequestHeader('Content-Length', q.length);
      }
      if (opts && opts.timeout) {
        r.timeout = opts.timeout;
        r.ontimeout = function () {
          reject('timeout');
        }
      }
      if (opts && opts.headers) {
        Object.keys(opts.headers).forEach(function (key) {
          r.setRequestHeader(key, this[key]);
        }, opts.headers);
      }
      r.send(q);
    });
  },
  get: function (path, params, opts) { return Ajax.xhr('GET', path, params, opts) },
  post: function (path, params, opts) { return Ajax.xhr('POST', path, params, opts) }
};
