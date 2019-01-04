(function (Vue$1) {
    'use strict';

    Vue$1 = Vue$1 && Vue$1.hasOwnProperty('default') ? Vue$1['default'] : Vue$1;

    /*!
     * vue-resource v1.5.1
     * https://github.com/pagekit/vue-resource
     * Released under the MIT License.
     */

    /**
     * Promises/A+ polyfill v1.1.4 (https://github.com/bramstein/promis)
     */

    var RESOLVED = 0;
    var REJECTED = 1;
    var PENDING = 2;

    function Promise$1(executor) {

        this.state = PENDING;
        this.value = undefined;
        this.deferred = [];

        var promise = this;

        try {
            executor(function (x) {
                promise.resolve(x);
            }, function (r) {
                promise.reject(r);
            });
        } catch (e) {
            promise.reject(e);
        }
    }

    Promise$1.reject = function (r) {
        return new Promise$1(function (resolve, reject) {
            reject(r);
        });
    };

    Promise$1.resolve = function (x) {
        return new Promise$1(function (resolve, reject) {
            resolve(x);
        });
    };

    Promise$1.all = function all(iterable) {
        return new Promise$1(function (resolve, reject) {
            var count = 0, result = [];

            if (iterable.length === 0) {
                resolve(result);
            }

            function resolver(i) {
                return function (x) {
                    result[i] = x;
                    count += 1;

                    if (count === iterable.length) {
                        resolve(result);
                    }
                };
            }

            for (var i = 0; i < iterable.length; i += 1) {
                Promise$1.resolve(iterable[i]).then(resolver(i), reject);
            }
        });
    };

    Promise$1.race = function race(iterable) {
        return new Promise$1(function (resolve, reject) {
            for (var i = 0; i < iterable.length; i += 1) {
                Promise$1.resolve(iterable[i]).then(resolve, reject);
            }
        });
    };

    var p = Promise$1.prototype;

    p.resolve = function resolve(x) {
        var promise = this;

        if (promise.state === PENDING) {
            if (x === promise) {
                throw new TypeError('Promise settled with itself.');
            }

            var called = false;

            try {
                var then = x && x['then'];

                if (x !== null && typeof x === 'object' && typeof then === 'function') {
                    then.call(x, function (x) {
                        if (!called) {
                            promise.resolve(x);
                        }
                        called = true;

                    }, function (r) {
                        if (!called) {
                            promise.reject(r);
                        }
                        called = true;
                    });
                    return;
                }
            } catch (e) {
                if (!called) {
                    promise.reject(e);
                }
                return;
            }

            promise.state = RESOLVED;
            promise.value = x;
            promise.notify();
        }
    };

    p.reject = function reject(reason) {
        var promise = this;

        if (promise.state === PENDING) {
            if (reason === promise) {
                throw new TypeError('Promise settled with itself.');
            }

            promise.state = REJECTED;
            promise.value = reason;
            promise.notify();
        }
    };

    p.notify = function notify() {
        var promise = this;

        nextTick(function () {
            if (promise.state !== PENDING) {
                while (promise.deferred.length) {
                    var deferred = promise.deferred.shift(),
                        onResolved = deferred[0],
                        onRejected = deferred[1],
                        resolve = deferred[2],
                        reject = deferred[3];

                    try {
                        if (promise.state === RESOLVED) {
                            if (typeof onResolved === 'function') {
                                resolve(onResolved.call(undefined, promise.value));
                            } else {
                                resolve(promise.value);
                            }
                        } else if (promise.state === REJECTED) {
                            if (typeof onRejected === 'function') {
                                resolve(onRejected.call(undefined, promise.value));
                            } else {
                                reject(promise.value);
                            }
                        }
                    } catch (e) {
                        reject(e);
                    }
                }
            }
        });
    };

    p.then = function then(onResolved, onRejected) {
        var promise = this;

        return new Promise$1(function (resolve, reject) {
            promise.deferred.push([onResolved, onRejected, resolve, reject]);
            promise.notify();
        });
    };

    p.catch = function (onRejected) {
        return this.then(undefined, onRejected);
    };

    /**
     * Promise adapter.
     */

    if (typeof Promise === 'undefined') {
        window.Promise = Promise$1;
    }

    function PromiseObj(executor, context) {

        if (executor instanceof Promise) {
            this.promise = executor;
        } else {
            this.promise = new Promise(executor.bind(context));
        }

        this.context = context;
    }

    PromiseObj.all = function (iterable, context) {
        return new PromiseObj(Promise.all(iterable), context);
    };

    PromiseObj.resolve = function (value, context) {
        return new PromiseObj(Promise.resolve(value), context);
    };

    PromiseObj.reject = function (reason, context) {
        return new PromiseObj(Promise.reject(reason), context);
    };

    PromiseObj.race = function (iterable, context) {
        return new PromiseObj(Promise.race(iterable), context);
    };

    var p$1 = PromiseObj.prototype;

    p$1.bind = function (context) {
        this.context = context;
        return this;
    };

    p$1.then = function (fulfilled, rejected) {

        if (fulfilled && fulfilled.bind && this.context) {
            fulfilled = fulfilled.bind(this.context);
        }

        if (rejected && rejected.bind && this.context) {
            rejected = rejected.bind(this.context);
        }

        return new PromiseObj(this.promise.then(fulfilled, rejected), this.context);
    };

    p$1.catch = function (rejected) {

        if (rejected && rejected.bind && this.context) {
            rejected = rejected.bind(this.context);
        }

        return new PromiseObj(this.promise.catch(rejected), this.context);
    };

    p$1.finally = function (callback) {

        return this.then(function (value) {
            callback.call(this);
            return value;
        }, function (reason) {
            callback.call(this);
            return Promise.reject(reason);
        }
        );
    };

    /**
     * Utility functions.
     */

    var ref = {};
    var hasOwnProperty = ref.hasOwnProperty;
    var ref$1 = [];
    var slice = ref$1.slice;
    var debug = false, ntick;

    var inBrowser = typeof window !== 'undefined';

    function Util (ref) {
        var config = ref.config;
        var nextTick = ref.nextTick;

        ntick = nextTick;
        debug = config.debug || !config.silent;
    }

    function warn(msg) {
        if (typeof console !== 'undefined' && debug) {
            console.warn('[VueResource warn]: ' + msg);
        }
    }

    function error(msg) {
        if (typeof console !== 'undefined') {
            console.error(msg);
        }
    }

    function nextTick(cb, ctx) {
        return ntick(cb, ctx);
    }

    function trim(str) {
        return str ? str.replace(/^\s*|\s*$/g, '') : '';
    }

    function trimEnd(str, chars) {

        if (str && chars === undefined) {
            return str.replace(/\s+$/, '');
        }

        if (!str || !chars) {
            return str;
        }

        return str.replace(new RegExp(("[" + chars + "]+$")), '');
    }

    function toLower(str) {
        return str ? str.toLowerCase() : '';
    }

    function toUpper(str) {
        return str ? str.toUpperCase() : '';
    }

    var isArray = Array.isArray;

    function isString(val) {
        return typeof val === 'string';
    }

    function isFunction(val) {
        return typeof val === 'function';
    }

    function isObject(obj) {
        return obj !== null && typeof obj === 'object';
    }

    function isPlainObject(obj) {
        return isObject(obj) && Object.getPrototypeOf(obj) == Object.prototype;
    }

    function isBlob(obj) {
        return typeof Blob !== 'undefined' && obj instanceof Blob;
    }

    function isFormData(obj) {
        return typeof FormData !== 'undefined' && obj instanceof FormData;
    }

    function when(value, fulfilled, rejected) {

        var promise = PromiseObj.resolve(value);

        if (arguments.length < 2) {
            return promise;
        }

        return promise.then(fulfilled, rejected);
    }

    function options(fn, obj, opts) {

        opts = opts || {};

        if (isFunction(opts)) {
            opts = opts.call(obj);
        }

        return merge(fn.bind({$vm: obj, $options: opts}), fn, {$options: opts});
    }

    function each(obj, iterator) {

        var i, key;

        if (isArray(obj)) {
            for (i = 0; i < obj.length; i++) {
                iterator.call(obj[i], obj[i], i);
            }
        } else if (isObject(obj)) {
            for (key in obj) {
                if (hasOwnProperty.call(obj, key)) {
                    iterator.call(obj[key], obj[key], key);
                }
            }
        }

        return obj;
    }

    var assign = Object.assign || _assign;

    function merge(target) {

        var args = slice.call(arguments, 1);

        args.forEach(function (source) {
            _merge(target, source, true);
        });

        return target;
    }

    function defaults(target) {

        var args = slice.call(arguments, 1);

        args.forEach(function (source) {

            for (var key in source) {
                if (target[key] === undefined) {
                    target[key] = source[key];
                }
            }

        });

        return target;
    }

    function _assign(target) {

        var args = slice.call(arguments, 1);

        args.forEach(function (source) {
            _merge(target, source);
        });

        return target;
    }

    function _merge(target, source, deep) {
        for (var key in source) {
            if (deep && (isPlainObject(source[key]) || isArray(source[key]))) {
                if (isPlainObject(source[key]) && !isPlainObject(target[key])) {
                    target[key] = {};
                }
                if (isArray(source[key]) && !isArray(target[key])) {
                    target[key] = [];
                }
                _merge(target[key], source[key], deep);
            } else if (source[key] !== undefined) {
                target[key] = source[key];
            }
        }
    }

    /**
     * Root Prefix Transform.
     */

    function root (options$$1, next) {

        var url = next(options$$1);

        if (isString(options$$1.root) && !/^(https?:)?\//.test(url)) {
            url = trimEnd(options$$1.root, '/') + '/' + url;
        }

        return url;
    }

    /**
     * Query Parameter Transform.
     */

    function query (options$$1, next) {

        var urlParams = Object.keys(Url.options.params), query = {}, url = next(options$$1);

        each(options$$1.params, function (value, key) {
            if (urlParams.indexOf(key) === -1) {
                query[key] = value;
            }
        });

        query = Url.params(query);

        if (query) {
            url += (url.indexOf('?') == -1 ? '?' : '&') + query;
        }

        return url;
    }

    /**
     * URL Template v2.0.6 (https://github.com/bramstein/url-template)
     */

    function expand(url, params, variables) {

        var tmpl = parse(url), expanded = tmpl.expand(params);

        if (variables) {
            variables.push.apply(variables, tmpl.vars);
        }

        return expanded;
    }

    function parse(template) {

        var operators = ['+', '#', '.', '/', ';', '?', '&'], variables = [];

        return {
            vars: variables,
            expand: function expand(context) {
                return template.replace(/\{([^{}]+)\}|([^{}]+)/g, function (_, expression, literal) {
                    if (expression) {

                        var operator = null, values = [];

                        if (operators.indexOf(expression.charAt(0)) !== -1) {
                            operator = expression.charAt(0);
                            expression = expression.substr(1);
                        }

                        expression.split(/,/g).forEach(function (variable) {
                            var tmp = /([^:*]*)(?::(\d+)|(\*))?/.exec(variable);
                            values.push.apply(values, getValues(context, operator, tmp[1], tmp[2] || tmp[3]));
                            variables.push(tmp[1]);
                        });

                        if (operator && operator !== '+') {

                            var separator = ',';

                            if (operator === '?') {
                                separator = '&';
                            } else if (operator !== '#') {
                                separator = operator;
                            }

                            return (values.length !== 0 ? operator : '') + values.join(separator);
                        } else {
                            return values.join(',');
                        }

                    } else {
                        return encodeReserved(literal);
                    }
                });
            }
        };
    }

    function getValues(context, operator, key, modifier) {

        var value = context[key], result = [];

        if (isDefined(value) && value !== '') {
            if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
                value = value.toString();

                if (modifier && modifier !== '*') {
                    value = value.substring(0, parseInt(modifier, 10));
                }

                result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : null));
            } else {
                if (modifier === '*') {
                    if (Array.isArray(value)) {
                        value.filter(isDefined).forEach(function (value) {
                            result.push(encodeValue(operator, value, isKeyOperator(operator) ? key : null));
                        });
                    } else {
                        Object.keys(value).forEach(function (k) {
                            if (isDefined(value[k])) {
                                result.push(encodeValue(operator, value[k], k));
                            }
                        });
                    }
                } else {
                    var tmp = [];

                    if (Array.isArray(value)) {
                        value.filter(isDefined).forEach(function (value) {
                            tmp.push(encodeValue(operator, value));
                        });
                    } else {
                        Object.keys(value).forEach(function (k) {
                            if (isDefined(value[k])) {
                                tmp.push(encodeURIComponent(k));
                                tmp.push(encodeValue(operator, value[k].toString()));
                            }
                        });
                    }

                    if (isKeyOperator(operator)) {
                        result.push(encodeURIComponent(key) + '=' + tmp.join(','));
                    } else if (tmp.length !== 0) {
                        result.push(tmp.join(','));
                    }
                }
            }
        } else {
            if (operator === ';') {
                result.push(encodeURIComponent(key));
            } else if (value === '' && (operator === '&' || operator === '?')) {
                result.push(encodeURIComponent(key) + '=');
            } else if (value === '') {
                result.push('');
            }
        }

        return result;
    }

    function isDefined(value) {
        return value !== undefined && value !== null;
    }

    function isKeyOperator(operator) {
        return operator === ';' || operator === '&' || operator === '?';
    }

    function encodeValue(operator, value, key) {

        value = (operator === '+' || operator === '#') ? encodeReserved(value) : encodeURIComponent(value);

        if (key) {
            return encodeURIComponent(key) + '=' + value;
        } else {
            return value;
        }
    }

    function encodeReserved(str) {
        return str.split(/(%[0-9A-Fa-f]{2})/g).map(function (part) {
            if (!/%[0-9A-Fa-f]/.test(part)) {
                part = encodeURI(part);
            }
            return part;
        }).join('');
    }

    /**
     * URL Template (RFC 6570) Transform.
     */

    function template (options) {

        var variables = [], url = expand(options.url, options.params, variables);

        variables.forEach(function (key) {
            delete options.params[key];
        });

        return url;
    }

    /**
     * Service for URL templating.
     */

    function Url(url, params) {

        var self = this || {}, options$$1 = url, transform;

        if (isString(url)) {
            options$$1 = {url: url, params: params};
        }

        options$$1 = merge({}, Url.options, self.$options, options$$1);

        Url.transforms.forEach(function (handler) {

            if (isString(handler)) {
                handler = Url.transform[handler];
            }

            if (isFunction(handler)) {
                transform = factory(handler, transform, self.$vm);
            }

        });

        return transform(options$$1);
    }

    /**
     * Url options.
     */

    Url.options = {
        url: '',
        root: null,
        params: {}
    };

    /**
     * Url transforms.
     */

    Url.transform = {template: template, query: query, root: root};
    Url.transforms = ['template', 'query', 'root'];

    /**
     * Encodes a Url parameter string.
     *
     * @param {Object} obj
     */

    Url.params = function (obj) {

        var params = [], escape = encodeURIComponent;

        params.add = function (key, value) {

            if (isFunction(value)) {
                value = value();
            }

            if (value === null) {
                value = '';
            }

            this.push(escape(key) + '=' + escape(value));
        };

        serialize(params, obj);

        return params.join('&').replace(/%20/g, '+');
    };

    /**
     * Parse a URL and return its components.
     *
     * @param {String} url
     */

    Url.parse = function (url) {

        var el = document.createElement('a');

        if (document.documentMode) {
            el.href = url;
            url = el.href;
        }

        el.href = url;

        return {
            href: el.href,
            protocol: el.protocol ? el.protocol.replace(/:$/, '') : '',
            port: el.port,
            host: el.host,
            hostname: el.hostname,
            pathname: el.pathname.charAt(0) === '/' ? el.pathname : '/' + el.pathname,
            search: el.search ? el.search.replace(/^\?/, '') : '',
            hash: el.hash ? el.hash.replace(/^#/, '') : ''
        };
    };

    function factory(handler, next, vm) {
        return function (options$$1) {
            return handler.call(vm, options$$1, next);
        };
    }

    function serialize(params, obj, scope) {

        var array = isArray(obj), plain = isPlainObject(obj), hash;

        each(obj, function (value, key) {

            hash = isObject(value) || isArray(value);

            if (scope) {
                key = scope + '[' + (plain || hash ? key : '') + ']';
            }

            if (!scope && array) {
                params.add(value.name, value.value);
            } else if (hash) {
                serialize(params, value, key);
            } else {
                params.add(key, value);
            }
        });
    }

    /**
     * XDomain client (Internet Explorer).
     */

    function xdrClient (request) {
        return new PromiseObj(function (resolve) {

            var xdr = new XDomainRequest(), handler = function (ref) {
                    var type = ref.type;


                    var status = 0;

                    if (type === 'load') {
                        status = 200;
                    } else if (type === 'error') {
                        status = 500;
                    }

                    resolve(request.respondWith(xdr.responseText, {status: status}));
                };

            request.abort = function () { return xdr.abort(); };

            xdr.open(request.method, request.getUrl());

            if (request.timeout) {
                xdr.timeout = request.timeout;
            }

            xdr.onload = handler;
            xdr.onabort = handler;
            xdr.onerror = handler;
            xdr.ontimeout = handler;
            xdr.onprogress = function () {};
            xdr.send(request.getBody());
        });
    }

    /**
     * CORS Interceptor.
     */

    var SUPPORTS_CORS = inBrowser && 'withCredentials' in new XMLHttpRequest();

    function cors (request) {

        if (inBrowser) {

            var orgUrl = Url.parse(location.href);
            var reqUrl = Url.parse(request.getUrl());

            if (reqUrl.protocol !== orgUrl.protocol || reqUrl.host !== orgUrl.host) {

                request.crossOrigin = true;
                request.emulateHTTP = false;

                if (!SUPPORTS_CORS) {
                    request.client = xdrClient;
                }
            }
        }

    }

    /**
     * Form data Interceptor.
     */

    function form (request) {

        if (isFormData(request.body)) {
            request.headers.delete('Content-Type');
        } else if (isObject(request.body) && request.emulateJSON) {
            request.body = Url.params(request.body);
            request.headers.set('Content-Type', 'application/x-www-form-urlencoded');
        }

    }

    /**
     * JSON Interceptor.
     */

    function json (request) {

        var type = request.headers.get('Content-Type') || '';

        if (isObject(request.body) && type.indexOf('application/json') === 0) {
            request.body = JSON.stringify(request.body);
        }

        return function (response) {

            return response.bodyText ? when(response.text(), function (text) {

                var type = response.headers.get('Content-Type') || '';

                if (type.indexOf('application/json') === 0 || isJson(text)) {

                    try {
                        response.body = JSON.parse(text);
                    } catch (e) {
                        response.body = null;
                    }

                } else {
                    response.body = text;
                }

                return response;

            }) : response;

        };
    }

    function isJson(str) {

        var start = str.match(/^\s*(\[|\{)/);
        var end = {'[': /]\s*$/, '{': /}\s*$/};

        return start && end[start[1]].test(str);
    }

    /**
     * JSONP client (Browser).
     */

    function jsonpClient (request) {
        return new PromiseObj(function (resolve) {

            var name = request.jsonp || 'callback', callback = request.jsonpCallback || '_jsonp' + Math.random().toString(36).substr(2), body = null, handler, script;

            handler = function (ref) {
                var type = ref.type;


                var status = 0;

                if (type === 'load' && body !== null) {
                    status = 200;
                } else if (type === 'error') {
                    status = 500;
                }

                if (status && window[callback]) {
                    delete window[callback];
                    document.body.removeChild(script);
                }

                resolve(request.respondWith(body, {status: status}));
            };

            window[callback] = function (result) {
                body = JSON.stringify(result);
            };

            request.abort = function () {
                handler({type: 'abort'});
            };

            request.params[name] = callback;

            if (request.timeout) {
                setTimeout(request.abort, request.timeout);
            }

            script = document.createElement('script');
            script.src = request.getUrl();
            script.type = 'text/javascript';
            script.async = true;
            script.onload = handler;
            script.onerror = handler;

            document.body.appendChild(script);
        });
    }

    /**
     * JSONP Interceptor.
     */

    function jsonp (request) {

        if (request.method == 'JSONP') {
            request.client = jsonpClient;
        }

    }

    /**
     * Before Interceptor.
     */

    function before (request) {

        if (isFunction(request.before)) {
            request.before.call(this, request);
        }

    }

    /**
     * HTTP method override Interceptor.
     */

    function method (request) {

        if (request.emulateHTTP && /^(PUT|PATCH|DELETE)$/i.test(request.method)) {
            request.headers.set('X-HTTP-Method-Override', request.method);
            request.method = 'POST';
        }

    }

    /**
     * Header Interceptor.
     */

    function header (request) {

        var headers = assign({}, Http.headers.common,
            !request.crossOrigin ? Http.headers.custom : {},
            Http.headers[toLower(request.method)]
        );

        each(headers, function (value, name) {
            if (!request.headers.has(name)) {
                request.headers.set(name, value);
            }
        });

    }

    /**
     * XMLHttp client (Browser).
     */

    function xhrClient (request) {
        return new PromiseObj(function (resolve) {

            var xhr = new XMLHttpRequest(), handler = function (event) {

                    var response = request.respondWith(
                    'response' in xhr ? xhr.response : xhr.responseText, {
                        status: xhr.status === 1223 ? 204 : xhr.status, // IE9 status bug
                        statusText: xhr.status === 1223 ? 'No Content' : trim(xhr.statusText)
                    });

                    each(trim(xhr.getAllResponseHeaders()).split('\n'), function (row) {
                        response.headers.append(row.slice(0, row.indexOf(':')), row.slice(row.indexOf(':') + 1));
                    });

                    resolve(response);
                };

            request.abort = function () { return xhr.abort(); };

            xhr.open(request.method, request.getUrl(), true);

            if (request.timeout) {
                xhr.timeout = request.timeout;
            }

            if (request.responseType && 'responseType' in xhr) {
                xhr.responseType = request.responseType;
            }

            if (request.withCredentials || request.credentials) {
                xhr.withCredentials = true;
            }

            if (!request.crossOrigin) {
                request.headers.set('X-Requested-With', 'XMLHttpRequest');
            }

            // deprecated use downloadProgress
            if (isFunction(request.progress) && request.method === 'GET') {
                xhr.addEventListener('progress', request.progress);
            }

            if (isFunction(request.downloadProgress)) {
                xhr.addEventListener('progress', request.downloadProgress);
            }

            // deprecated use uploadProgress
            if (isFunction(request.progress) && /^(POST|PUT)$/i.test(request.method)) {
                xhr.upload.addEventListener('progress', request.progress);
            }

            if (isFunction(request.uploadProgress) && xhr.upload) {
                xhr.upload.addEventListener('progress', request.uploadProgress);
            }

            request.headers.forEach(function (value, name) {
                xhr.setRequestHeader(name, value);
            });

            xhr.onload = handler;
            xhr.onabort = handler;
            xhr.onerror = handler;
            xhr.ontimeout = handler;
            xhr.send(request.getBody());
        });
    }

    /**
     * Http client (Node).
     */

    function nodeClient (request) {

        var client = require('got');

        return new PromiseObj(function (resolve) {

            var url = request.getUrl();
            var body = request.getBody();
            var method = request.method;
            var headers = {}, handler;

            request.headers.forEach(function (value, name) {
                headers[name] = value;
            });

            client(url, {body: body, method: method, headers: headers}).then(handler = function (resp) {

                var response = request.respondWith(resp.body, {
                    status: resp.statusCode,
                    statusText: trim(resp.statusMessage)
                });

                each(resp.headers, function (value, name) {
                    response.headers.set(name, value);
                });

                resolve(response);

            }, function (error$$1) { return handler(error$$1.response); });
        });
    }

    /**
     * Base client.
     */

    function Client (context) {

        var reqHandlers = [sendRequest], resHandlers = [];

        if (!isObject(context)) {
            context = null;
        }

        function Client(request) {
            while (reqHandlers.length) {

                var handler = reqHandlers.pop();

                if (isFunction(handler)) {

                    var response = (void 0), next = (void 0);

                    response = handler.call(context, request, function (val) { return next = val; }) || next;

                    if (isObject(response)) {
                        return new PromiseObj(function (resolve, reject) {

                            resHandlers.forEach(function (handler) {
                                response = when(response, function (response) {
                                    return handler.call(context, response) || response;
                                }, reject);
                            });

                            when(response, resolve, reject);

                        }, context);
                    }

                    if (isFunction(response)) {
                        resHandlers.unshift(response);
                    }

                } else {
                    warn(("Invalid interceptor of type " + (typeof handler) + ", must be a function"));
                }
            }
        }

        Client.use = function (handler) {
            reqHandlers.push(handler);
        };

        return Client;
    }

    function sendRequest(request) {

        var client = request.client || (inBrowser ? xhrClient : nodeClient);

        return client(request);
    }

    /**
     * HTTP Headers.
     */

    var Headers = function Headers(headers) {
        var this$1 = this;


        this.map = {};

        each(headers, function (value, name) { return this$1.append(name, value); });
    };

    Headers.prototype.has = function has (name) {
        return getName(this.map, name) !== null;
    };

    Headers.prototype.get = function get (name) {

        var list = this.map[getName(this.map, name)];

        return list ? list.join() : null;
    };

    Headers.prototype.getAll = function getAll (name) {
        return this.map[getName(this.map, name)] || [];
    };

    Headers.prototype.set = function set (name, value) {
        this.map[normalizeName(getName(this.map, name) || name)] = [trim(value)];
    };

    Headers.prototype.append = function append (name, value) {

        var list = this.map[getName(this.map, name)];

        if (list) {
            list.push(trim(value));
        } else {
            this.set(name, value);
        }
    };

    Headers.prototype.delete = function delete$1 (name) {
        delete this.map[getName(this.map, name)];
    };

    Headers.prototype.deleteAll = function deleteAll () {
        this.map = {};
    };

    Headers.prototype.forEach = function forEach (callback, thisArg) {
            var this$1 = this;

        each(this.map, function (list, name) {
            each(list, function (value) { return callback.call(thisArg, value, name, this$1); });
        });
    };

    function getName(map, name) {
        return Object.keys(map).reduce(function (prev, curr) {
            return toLower(name) === toLower(curr) ? curr : prev;
        }, null);
    }

    function normalizeName(name) {

        if (/[^a-z0-9\-#$%&'*+.^_`|~]/i.test(name)) {
            throw new TypeError('Invalid character in header field name');
        }

        return trim(name);
    }

    /**
     * HTTP Response.
     */

    var Response = function Response(body, ref) {
        var url = ref.url;
        var headers = ref.headers;
        var status = ref.status;
        var statusText = ref.statusText;


        this.url = url;
        this.ok = status >= 200 && status < 300;
        this.status = status || 0;
        this.statusText = statusText || '';
        this.headers = new Headers(headers);
        this.body = body;

        if (isString(body)) {

            this.bodyText = body;

        } else if (isBlob(body)) {

            this.bodyBlob = body;

            if (isBlobText(body)) {
                this.bodyText = blobText(body);
            }
        }
    };

    Response.prototype.blob = function blob () {
        return when(this.bodyBlob);
    };

    Response.prototype.text = function text () {
        return when(this.bodyText);
    };

    Response.prototype.json = function json () {
        return when(this.text(), function (text) { return JSON.parse(text); });
    };

    Object.defineProperty(Response.prototype, 'data', {

        get: function get() {
            return this.body;
        },

        set: function set(body) {
            this.body = body;
        }

    });

    function blobText(body) {
        return new PromiseObj(function (resolve) {

            var reader = new FileReader();

            reader.readAsText(body);
            reader.onload = function () {
                resolve(reader.result);
            };

        });
    }

    function isBlobText(body) {
        return body.type.indexOf('text') === 0 || body.type.indexOf('json') !== -1;
    }

    /**
     * HTTP Request.
     */

    var Request = function Request(options$$1) {

        this.body = null;
        this.params = {};

        assign(this, options$$1, {
            method: toUpper(options$$1.method || 'GET')
        });

        if (!(this.headers instanceof Headers)) {
            this.headers = new Headers(this.headers);
        }
    };

    Request.prototype.getUrl = function getUrl () {
        return Url(this);
    };

    Request.prototype.getBody = function getBody () {
        return this.body;
    };

    Request.prototype.respondWith = function respondWith (body, options$$1) {
        return new Response(body, assign(options$$1 || {}, {url: this.getUrl()}));
    };

    /**
     * Service for sending network requests.
     */

    var COMMON_HEADERS = {'Accept': 'application/json, text/plain, */*'};
    var JSON_CONTENT_TYPE = {'Content-Type': 'application/json;charset=utf-8'};

    function Http(options$$1) {

        var self = this || {}, client = Client(self.$vm);

        defaults(options$$1 || {}, self.$options, Http.options);

        Http.interceptors.forEach(function (handler) {

            if (isString(handler)) {
                handler = Http.interceptor[handler];
            }

            if (isFunction(handler)) {
                client.use(handler);
            }

        });

        return client(new Request(options$$1)).then(function (response) {

            return response.ok ? response : PromiseObj.reject(response);

        }, function (response) {

            if (response instanceof Error) {
                error(response);
            }

            return PromiseObj.reject(response);
        });
    }

    Http.options = {};

    Http.headers = {
        put: JSON_CONTENT_TYPE,
        post: JSON_CONTENT_TYPE,
        patch: JSON_CONTENT_TYPE,
        delete: JSON_CONTENT_TYPE,
        common: COMMON_HEADERS,
        custom: {}
    };

    Http.interceptor = {before: before, method: method, jsonp: jsonp, json: json, form: form, header: header, cors: cors};
    Http.interceptors = ['before', 'method', 'jsonp', 'json', 'form', 'header', 'cors'];

    ['get', 'delete', 'head', 'jsonp'].forEach(function (method$$1) {

        Http[method$$1] = function (url, options$$1) {
            return this(assign(options$$1 || {}, {url: url, method: method$$1}));
        };

    });

    ['post', 'put', 'patch'].forEach(function (method$$1) {

        Http[method$$1] = function (url, body, options$$1) {
            return this(assign(options$$1 || {}, {url: url, method: method$$1, body: body}));
        };

    });

    /**
     * Service for interacting with RESTful services.
     */

    function Resource(url, params, actions, options$$1) {

        var self = this || {}, resource = {};

        actions = assign({},
            Resource.actions,
            actions
        );

        each(actions, function (action, name) {

            action = merge({url: url, params: assign({}, params)}, options$$1, action);

            resource[name] = function () {
                return (self.$http || Http)(opts(action, arguments));
            };
        });

        return resource;
    }

    function opts(action, args) {

        var options$$1 = assign({}, action), params = {}, body;

        switch (args.length) {

            case 2:

                params = args[0];
                body = args[1];

                break;

            case 1:

                if (/^(POST|PUT|PATCH)$/i.test(options$$1.method)) {
                    body = args[0];
                } else {
                    params = args[0];
                }

                break;

            case 0:

                break;

            default:

                throw 'Expected up to 2 arguments [params, body], got ' + args.length + ' arguments';
        }

        options$$1.body = body;
        options$$1.params = assign({}, options$$1.params, params);

        return options$$1;
    }

    Resource.actions = {

        get: {method: 'GET'},
        save: {method: 'POST'},
        query: {method: 'GET'},
        update: {method: 'PUT'},
        remove: {method: 'DELETE'},
        delete: {method: 'DELETE'}

    };

    /**
     * Install plugin.
     */

    function plugin(Vue) {

        if (plugin.installed) {
            return;
        }

        Util(Vue);

        Vue.url = Url;
        Vue.http = Http;
        Vue.resource = Resource;
        Vue.Promise = PromiseObj;

        Object.defineProperties(Vue.prototype, {

            $url: {
                get: function get() {
                    return options(Vue.url, this, this.$options.url);
                }
            },

            $http: {
                get: function get() {
                    return options(Vue.http, this, this.$options.http);
                }
            },

            $resource: {
                get: function get() {
                    return Vue.resource.bind(this);
                }
            },

            $promise: {
                get: function get() {
                    var this$1 = this;

                    return function (executor) { return new Vue.Promise(executor, this$1); };
                }
            }

        });
    }

    if (typeof window !== 'undefined' && window.Vue) {
        window.Vue.use(plugin);
    }

    var commonjsGlobal = typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};

    function unwrapExports (x) {
    	return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x.default : x;
    }

    function createCommonjsModule(fn, module) {
    	return module = { exports: {} }, fn(module, module.exports), module.exports;
    }

    var vueWait = createCommonjsModule(function (module, exports) {
    !function(t,n){module.exports=n();}("undefined"!=typeof self?self:commonjsGlobal,function(){return function(t){var n={};function e(r){if(n[r])return n[r].exports;var o=n[r]={i:r,l:!1,exports:{}};return t[r].call(o.exports,o,o.exports,e),o.l=!0,o.exports}return e.m=t,e.c=n,e.d=function(t,n,r){e.o(t,n)||Object.defineProperty(t,n,{enumerable:!0,get:r});},e.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0});},e.t=function(t,n){if(1&n&&(t=e(t)),8&n)return t;if(4&n&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(e.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&n&&"string"!=typeof t)for(var o in t)e.d(r,o,function(n){return t[n]}.bind(null,o));return r},e.n=function(t){var n=t&&t.__esModule?function(){return t.default}:function(){return t};return e.d(n,"a",n),n},e.o=function(t,n){return Object.prototype.hasOwnProperty.call(t,n)},e.p="",e(e.s=167)}([function(t,n){var e=t.exports={version:"2.5.7"};"number"==typeof __e&&(__e=e);},function(t,n,e){var r=e(46)("wks"),o=e(28),i=e(2).Symbol,u="function"==typeof i;(t.exports=function(t){return r[t]||(r[t]=u&&i[t]||(u?i:o)("Symbol."+t))}).store=r;},function(t,n){var e=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=e);},function(t,n,e){var r=e(2),o=e(0),i=e(9),u=e(8),c=e(12),a=function(t,n,e){var s,f,l,p=t&a.F,v=t&a.G,h=t&a.S,d=t&a.P,y=t&a.B,g=t&a.W,m=v?o:o[n]||(o[n]={}),x=m.prototype,w=v?r:h?r[n]:(r[n]||{}).prototype;for(s in v&&(e=n),e)(f=!p&&w&&void 0!==w[s])&&c(m,s)||(l=f?w[s]:e[s],m[s]=v&&"function"!=typeof w[s]?e[s]:y&&f?i(l,r):g&&w[s]==l?function(t){var n=function(n,e,r){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(n);case 2:return new t(n,e)}return new t(n,e,r)}return t.apply(this,arguments)};return n.prototype=t.prototype,n}(l):d&&"function"==typeof l?i(Function.call,l):l,d&&((m.virtual||(m.virtual={}))[s]=l,t&a.R&&x&&!x[s]&&u(x,s,l)));};a.F=1,a.G=2,a.S=4,a.P=8,a.B=16,a.W=32,a.U=64,a.R=128,t.exports=a;},function(t,n,e){var r=e(7),o=e(76),i=e(49),u=Object.defineProperty;n.f=e(5)?Object.defineProperty:function(t,n,e){if(r(t),n=i(n,!0),r(e),o)try{return u(t,n,e)}catch(t){}if("get"in e||"set"in e)throw TypeError("Accessors not supported!");return "value"in e&&(t[n]=e.value),t};},function(t,n,e){t.exports=!e(11)(function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a});},function(t,n){t.exports=function(t){return "object"==typeof t?null!==t:"function"==typeof t};},function(t,n,e){var r=e(6);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t};},function(t,n,e){var r=e(4),o=e(23);t.exports=e(5)?function(t,n,e){return r.f(t,n,o(1,e))}:function(t,n,e){return t[n]=e,t};},function(t,n,e){var r=e(22);t.exports=function(t,n,e){if(r(t),void 0===n)return t;switch(e){case 1:return function(e){return t.call(n,e)};case 2:return function(e,r){return t.call(n,e,r)};case 3:return function(e,r,o){return t.call(n,e,r,o)}}return function(){return t.apply(n,arguments)}};},function(t,n,e){var r=e(51),o=e(50);t.exports=function(t){return r(o(t))};},function(t,n){t.exports=function(t){try{return !!t()}catch(t){return !0}};},function(t,n){var e={}.hasOwnProperty;t.exports=function(t,n){return e.call(t,n)};},function(t,n){t.exports={};},function(t,n,e){var r=e(145)(!0);e(36)(String,"String",function(t){this._t=String(t),this._i=0;},function(){var t,n=this._t,e=this._i;return e>=n.length?{value:void 0,done:!0}:(t=r(n,e),this._i+=t.length,{value:t,done:!1})});},function(t,n,e){var r=e(71),o=e(41);t.exports=Object.keys||function(t){return r(t,o)};},function(t,n){t.exports=function(t){return t&&t.__esModule?t:{default:t}};},function(t,n,e){var r=e(9),o=e(64),i=e(63),u=e(7),c=e(27),a=e(35),s={},f={};(n=t.exports=function(t,n,e,l,p){var v,h,d,y,g=p?function(){return t}:a(t),m=r(e,l,n?2:1),x=0;if("function"!=typeof g)throw TypeError(t+" is not iterable!");if(i(g)){for(v=c(t.length);v>x;x++)if((y=n?m(u(h=t[x])[0],h[1]):m(t[x]))===s||y===f)return y}else for(d=g.call(t);!(h=d.next()).done;)if((y=o(d,m,h.value,n))===s||y===f)return y}).BREAK=s,n.RETURN=f;},function(t,n,e){e(138);for(var r=e(2),o=e(8),i=e(13),u=e(1)("toStringTag"),c="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),a=0;a<c.length;a++){var s=c[a],f=r[s],l=f&&f.prototype;l&&!l[u]&&o(l,u,s),i[s]=i.Array;}},function(t,n,e){var r=e(50);t.exports=function(t){return Object(r(t))};},function(t,n,e){var r=e(4).f,o=e(12),i=e(1)("toStringTag");t.exports=function(t,n,e){t&&!o(t=e?t:t.prototype,i)&&r(t,i,{configurable:!0,value:n});};},function(t,n){t.exports=!0;},function(t,n){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t};},function(t,n){t.exports=function(t,n){return {enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:n}};},function(t,n){n.f={}.propertyIsEnumerable;},function(t,n){var e={}.toString;t.exports=function(t){return e.call(t).slice(8,-1)};},function(t,n,e){var r=e(25),o=e(1)("toStringTag"),i="Arguments"==r(function(){return arguments}());t.exports=function(t){var n,e,u;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(e=function(t,n){try{return t[n]}catch(t){}}(n=Object(t),o))?e:i?r(n):"Object"==(u=r(n))&&"function"==typeof n.callee?"Arguments":u};},function(t,n,e){var r=e(43),o=Math.min;t.exports=function(t){return t>0?o(r(t),9007199254740991):0};},function(t,n){var e=0,r=Math.random();t.exports=function(t){return "Symbol(".concat(void 0===t?"":t,")_",(++e+r).toString(36))};},function(t,n,e){Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var r={props:{visible:Boolean,for:String,message:String},computed:{waitsFor:function(){return this.visible?this.visible:this.for?this.__$waitInstance.is(this.for):this.__$waitInstance.any}}};n.default=r;},function(t,n,e){e.r(n);var r=e(29),o=e.n(r);for(var i in r)"default"!==i&&function(t){e.d(n,t,function(){return r[t]});}(i);n.default=o.a;},function(t,n,e){var r=e(22);t.exports.f=function(t){return new function(t){var n,e;this.promise=new t(function(t,r){if(void 0!==n||void 0!==e)throw TypeError("Bad Promise constructor");n=t,e=r;}),this.resolve=r(n),this.reject=r(e);}(t)};},function(t,n){t.exports=function(t,n,e,r){if(!(t instanceof n)||void 0!==r&&r in t)throw TypeError(e+": incorrect invocation!");return t};},function(t,n,e){var r=e(8);t.exports=function(t,n,e){for(var o in n)e&&t[o]?t[o]=n[o]:r(t,o,n[o]);return t};},function(t,n){},function(t,n,e){var r=e(26),o=e(1)("iterator"),i=e(13);t.exports=e(0).getIteratorMethod=function(t){if(void 0!=t)return t[o]||t["@@iterator"]||i[r(t)]};},function(t,n,e){var r=e(21),o=e(3),i=e(72),u=e(8),c=e(13),a=e(144),s=e(20),f=e(143),l=e(1)("iterator"),p=!([].keys&&"next"in[].keys()),v=function(){return this};t.exports=function(t,n,e,h,d,y,g){a(e,n,h);var m,x,w,_=function(t){if(!p&&t in j)return j[t];switch(t){case"keys":case"values":return function(){return new e(this,t)}}return function(){return new e(this,t)}},b=n+" Iterator",O="values"==d,S=!1,j=t.prototype,E=j[l]||j["@@iterator"]||d&&j[d],P=E||_(d),k=d?O?_("entries"):P:void 0,L="Array"==n&&j.entries||E;if(L&&(w=f(L.call(new t)))!==Object.prototype&&w.next&&(s(w,b,!0),r||"function"==typeof w[l]||u(w,l,v)),O&&E&&"values"!==E.name&&(S=!0,P=function(){return E.call(this)}),r&&!g||!p&&!S&&j[l]||u(j,l,P),c[n]=P,c[b]=v,d)if(m={values:O?P:_("values"),keys:y?P:_("keys"),entries:k},g)for(x in m)x in j||i(j,x,m[x]);else o(o.P+o.F*(p||S),n,m);return m};},function(t,n,e){var r=e(67);t.exports=function(t,n,e){return n in t?r(t,n,{value:e,enumerable:!0,configurable:!0,writable:!0}):t[n]=e,t};},function(t,n,e){t.exports=e(156);},function(t,n,e){var r=e(7),o=e(158),i=e(41),u=e(42)("IE_PROTO"),c=function(){},a=function(){var t,n=e(48)("iframe"),r=i.length;for(n.style.display="none",e(69).appendChild(n),n.src="javascript:",(t=n.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),a=t.F;r--;)delete a.prototype[i[r]];return a()};t.exports=Object.create||function(t,n){var e;return null!==t?(c.prototype=r(t),e=new c,c.prototype=null,e[u]=t):e=a(),void 0===n?e:o(e,n)};},function(t,n){n.f=Object.getOwnPropertySymbols;},function(t,n){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",");},function(t,n,e){var r=e(46)("keys"),o=e(28);t.exports=function(t){return r[t]||(r[t]=o(t))};},function(t,n){var e=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:e)(t)};},function(t,n,e){var r=e(2),o=e(0),i=e(21),u=e(45),c=e(4).f;t.exports=function(t){var n=o.Symbol||(o.Symbol=i?{}:r.Symbol||{});"_"==t.charAt(0)||t in n||c(n,t,{value:u.f(t)});};},function(t,n,e){n.f=e(1);},function(t,n,e){var r=e(0),o=e(2),i=o["__core-js_shared__"]||(o["__core-js_shared__"]={});(t.exports=function(t,n){return i[t]||(i[t]=void 0!==n?n:{})})("versions",[]).push({version:r.version,mode:e(21)?"pure":"global",copyright:"© 2018 Denis Pushkarev (zloirock.ru)"});},function(t,n,e){var r=e(28)("meta"),o=e(6),i=e(12),u=e(4).f,c=0,a=Object.isExtensible||function(){return !0},s=!e(11)(function(){return a(Object.preventExtensions({}))}),f=function(t){u(t,r,{value:{i:"O"+ ++c,w:{}}});},l=t.exports={KEY:r,NEED:!1,fastKey:function(t,n){if(!o(t))return "symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!i(t,r)){if(!a(t))return "F";if(!n)return "E";f(t);}return t[r].i},getWeak:function(t,n){if(!i(t,r)){if(!a(t))return !0;if(!n)return !1;f(t);}return t[r].w},onFreeze:function(t){return s&&l.NEED&&a(t)&&!i(t,r)&&f(t),t}};},function(t,n,e){var r=e(6),o=e(2).document,i=r(o)&&r(o.createElement);t.exports=function(t){return i?o.createElement(t):{}};},function(t,n,e){var r=e(6);t.exports=function(t,n){if(!r(t))return t;var e,o;if(n&&"function"==typeof(e=t.toString)&&!r(o=e.call(t)))return o;if("function"==typeof(e=t.valueOf)&&!r(o=e.call(t)))return o;if(!n&&"function"==typeof(e=t.toString)&&!r(o=e.call(t)))return o;throw TypeError("Can't convert object to primitive value")};},function(t,n){t.exports=function(t){if(void 0==t)throw TypeError("Can't call method on  "+t);return t};},function(t,n,e){var r=e(25);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return "String"==r(t)?t.split(""):Object(t)};},function(t,n,e){var r=function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("div",[t.waitsFor?e("span",[t._t("waiting"),t._v(" "),t.message?e("span",[t._v(t._s(t.message))]):t._e()],2):t._t("default")],2)},o=[];e.d(n,"a",function(){return r}),e.d(n,"b",function(){return o});},function(t,n,e){var r=e(7),o=e(6),i=e(31);t.exports=function(t,n){if(r(t),o(n)&&n.constructor===t)return n;var e=i.f(t);return (0, e.resolve)(n),e.promise};},function(t,n){t.exports=function(t){try{return {e:!1,v:t()}}catch(t){return {e:!0,v:t}}};},function(t,n,e){var r,o,i,u=e(9),c=e(95),a=e(69),s=e(48),f=e(2),l=f.process,p=f.setImmediate,v=f.clearImmediate,h=f.MessageChannel,d=f.Dispatch,y=0,g={},m=function(){var t=+this;if(g.hasOwnProperty(t)){var n=g[t];delete g[t],n();}},x=function(t){m.call(t.data);};p&&v||(p=function(t){for(var n=[],e=1;arguments.length>e;)n.push(arguments[e++]);return g[++y]=function(){c("function"==typeof t?t:Function(t),n);},r(y),y},v=function(t){delete g[t];},"process"==e(25)(l)?r=function(t){l.nextTick(u(m,t,1));}:d&&d.now?r=function(t){d.now(u(m,t,1));}:h?(i=(o=new h).port2,o.port1.onmessage=x,r=u(i.postMessage,i,1)):f.addEventListener&&"function"==typeof postMessage&&!f.importScripts?(r=function(t){f.postMessage(t+"","*");},f.addEventListener("message",x,!1)):r="onreadystatechange"in s("script")?function(t){a.appendChild(s("script")).onreadystatechange=function(){a.removeChild(this),m.call(t);};}:function(t){setTimeout(u(m,t,1),0);}),t.exports={set:p,clear:v};},function(t,n,e){var r=e(7),o=e(22),i=e(1)("species");t.exports=function(t,n){var e,u=r(t).constructor;return void 0===u||void 0==(e=r(u)[i])?n:o(e)};},function(t,n,e){var r=e(6);t.exports=function(t,n){if(!r(t)||t._t!==n)throw TypeError("Incompatible receiver, "+n+" required!");return t};},function(t,n,e){var r=e(2),o=e(0),i=e(4),u=e(5),c=e(1)("species");t.exports=function(t){var n="function"==typeof o[t]?o[t]:r[t];u&&n&&!n[c]&&i.f(n,c,{configurable:!0,get:function(){return this}});};},function(t,n,e){var r=e(131),o=e(129);function i(t){return (i="function"==typeof o&&"symbol"==typeof r?function(t){return typeof t}:function(t){return t&&"function"==typeof o&&t.constructor===o&&t!==o.prototype?"symbol":typeof t})(t)}function u(n){return "function"==typeof o&&"symbol"===i(r)?t.exports=u=function(t){return i(t)}:t.exports=u=function(t){return t&&"function"==typeof o&&t.constructor===o&&t!==o.prototype?"symbol":i(t)},u(n)}t.exports=u;},function(t,n,e){t.exports=e(133);},function(t,n){t.exports=function(t,n){return {value:n,done:!!t}};},function(t,n,e){var r=e(1)("iterator"),o=!1;try{var i=[7][r]();i.return=function(){o=!0;},Array.from(i,function(){throw 2});}catch(t){}t.exports=function(t,n){if(!n&&!o)return !1;var e=!1;try{var i=[7],u=i[r]();u.next=function(){return {done:e=!0}},i[r]=function(){return u},t(i);}catch(t){}return e};},function(t,n,e){var r=e(13),o=e(1)("iterator"),i=Array.prototype;t.exports=function(t){return void 0!==t&&(r.Array===t||i[o]===t)};},function(t,n,e){var r=e(7);t.exports=function(t,n,e,o){try{return o?n(r(e)[0],e[1]):n(e)}catch(n){var i=t.return;throw void 0!==i&&r(i.call(t)),n}};},function(t,n,e){var r=e(149),o=e(148),i=e(135);t.exports=function(t){return r(t)||o(t)||i()};},function(t,n,e){var r=e(16);Object.defineProperty(n,"__esModule",{value:!0}),n.is=function t(n,e){if("string"==typeof e&&e.match(/[\*\!]/))return n.filter(function(t){return (0, a.isMatch)(t,e)}).length>0;return Array.isArray(e)?n.some(function(n){return t(e,n)}):n.includes(e)},n.any=function(t){return t.length>0},n.start=function(t,n){return s((0, c.default)(t).concat([n]))},n.end=function(t,n){return s(t).filter(function(t){return t!==n})},n.progress=function(t,n,e){var r=arguments.length>3&&void 0!==arguments[3]?arguments[3]:100;if(e>r)return f(t,n);return (0, u.default)({},t,(0, i.default)({},n,{current:e,total:r,percent:100*e/r}))},n.endProgress=f,n.percent=function(t,n){var e=t[n];return e?e.percent:0},n.nodeIsDebug=function(){return !1};var o=r(e(150)),i=r(e(37)),u=r(e(78)),c=r(e(65)),a=e(134);function s(t){return t.filter(function(t,n,e){return n==e.indexOf(t)})}function f(t,n){t[n];return (0, o.default)(t,[n])}},function(t,n,e){t.exports=e(154);},function(t,n,e){var r=e(71),o=e(41).concat("length","prototype");n.f=Object.getOwnPropertyNames||function(t){return r(t,o)};},function(t,n,e){var r=e(2).document;t.exports=r&&r.documentElement;},function(t,n,e){var r=e(25);t.exports=Array.isArray||function(t){return "Array"==r(t)};},function(t,n,e){var r=e(12),o=e(10),i=e(160)(!1),u=e(42)("IE_PROTO");t.exports=function(t,n){var e,c=o(t),a=0,s=[];for(e in c)e!=u&&r(c,e)&&s.push(e);for(;n.length>a;)r(c,e=n[a++])&&(~i(s,e)||s.push(e));return s};},function(t,n,e){t.exports=e(8);},function(t,n,e){var r=e(2),o=e(12),i=e(5),u=e(3),c=e(72),a=e(47).KEY,s=e(11),f=e(46),l=e(20),p=e(28),v=e(1),h=e(45),d=e(44),y=e(161),g=e(70),m=e(7),x=e(6),w=e(10),_=e(49),b=e(23),O=e(39),S=e(157),j=e(77),E=e(4),P=e(15),k=j.f,L=E.f,A=S.f,T=r.Symbol,F=r.JSON,M=F&&F.stringify,N=v("_hidden"),I=v("toPrimitive"),R={}.propertyIsEnumerable,C=f("symbol-registry"),$=f("symbols"),G=f("op-symbols"),W=Object.prototype,D="function"==typeof T,V=r.QObject,H=!V||!V.prototype||!V.prototype.findChild,z=i&&s(function(){return 7!=O(L({},"a",{get:function(){return L(this,"a",{value:7}).a}})).a})?function(t,n,e){var r=k(W,n);r&&delete W[n],L(t,n,e),r&&t!==W&&L(W,n,r);}:L,J=function(t){var n=$[t]=O(T.prototype);return n._k=t,n},B=D&&"symbol"==typeof T.iterator?function(t){return "symbol"==typeof t}:function(t){return t instanceof T},K=function(t,n,e){return t===W&&K(G,n,e),m(t),n=_(n,!0),m(e),o($,n)?(e.enumerable?(o(t,N)&&t[N][n]&&(t[N][n]=!1),e=O(e,{enumerable:b(0,!1)})):(o(t,N)||L(t,N,b(1,{})),t[N][n]=!0),z(t,n,e)):L(t,n,e)},U=function(t,n){m(t);for(var e,r=y(n=w(n)),o=0,i=r.length;i>o;)K(t,e=r[o++],n[e]);return t},Y=function(t){var n=R.call(this,t=_(t,!0));return !(this===W&&o($,t)&&!o(G,t))&&(!(n||!o(this,t)||!o($,t)||o(this,N)&&this[N][t])||n)},q=function(t,n){if(t=w(t),n=_(n,!0),t!==W||!o($,n)||o(G,n)){var e=k(t,n);return !e||!o($,n)||o(t,N)&&t[N][n]||(e.enumerable=!0),e}},X=function(t){for(var n,e=A(w(t)),r=[],i=0;e.length>i;)o($,n=e[i++])||n==N||n==a||r.push(n);return r},Q=function(t){for(var n,e=t===W,r=A(e?G:w(t)),i=[],u=0;r.length>u;)!o($,n=r[u++])||e&&!o(W,n)||i.push($[n]);return i};D||(c((T=function(){if(this instanceof T)throw TypeError("Symbol is not a constructor!");var t=p(arguments.length>0?arguments[0]:void 0),n=function(e){this===W&&n.call(G,e),o(this,N)&&o(this[N],t)&&(this[N][t]=!1),z(this,t,b(1,e));};return i&&H&&z(W,t,{configurable:!0,set:n}),J(t)}).prototype,"toString",function(){return this._k}),j.f=q,E.f=K,e(68).f=S.f=X,e(24).f=Y,e(40).f=Q,i&&!e(21)&&c(W,"propertyIsEnumerable",Y,!0),h.f=function(t){return J(v(t))}),u(u.G+u.W+u.F*!D,{Symbol:T});for(var Z="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),tt=0;Z.length>tt;)v(Z[tt++]);for(var nt=P(v.store),et=0;nt.length>et;)d(nt[et++]);u(u.S+u.F*!D,"Symbol",{for:function(t){return o(C,t+="")?C[t]:C[t]=T(t)},keyFor:function(t){if(!B(t))throw TypeError(t+" is not a symbol!");for(var n in C)if(C[n]===t)return n},useSetter:function(){H=!0;},useSimple:function(){H=!1;}}),u(u.S+u.F*!D,"Object",{create:function(t,n){return void 0===n?O(t):U(O(t),n)},defineProperty:K,defineProperties:U,getOwnPropertyDescriptor:q,getOwnPropertyNames:X,getOwnPropertySymbols:Q}),F&&u(u.S+u.F*(!D||s(function(){var t=T();return "[null]"!=M([t])||"{}"!=M({a:t})||"{}"!=M(Object(t))})),"JSON",{stringify:function(t){for(var n,e,r=[t],o=1;arguments.length>o;)r.push(arguments[o++]);if(e=n=r[1],(x(n)||void 0!==t)&&!B(t))return g(n)||(n=function(t,n){if("function"==typeof e&&(n=e.call(this,t,n)),!B(n))return n}),r[1]=n,M.apply(F,r)}}),T.prototype[I]||e(8)(T.prototype,I,T.prototype.valueOf),l(T,"Symbol"),l(Math,"Math",!0),l(r.JSON,"JSON",!0);},function(t,n,e){t.exports=e(162);},function(t,n,e){var r=e(3),o=e(0),i=e(11);t.exports=function(t,n){var e=(o.Object||{})[t]||Object[t],u={};u[t]=n(e),r(r.S+r.F*i(function(){e(1);}),"Object",u);};},function(t,n,e){t.exports=!e(5)&&!e(11)(function(){return 7!=Object.defineProperty(e(48)("div"),"a",{get:function(){return 7}}).a});},function(t,n,e){var r=e(24),o=e(23),i=e(10),u=e(49),c=e(12),a=e(76),s=Object.getOwnPropertyDescriptor;n.f=e(5)?s:function(t,n){if(t=i(t),n=u(n,!0),a)try{return s(t,n)}catch(t){}if(c(t,n))return o(!r.f.call(t,n),t[n])};},function(t,n,e){var r=e(165),o=e(74),i=e(38),u=e(37);t.exports=function(t){for(var n=1;n<arguments.length;n++){var e=null!=arguments[n]?arguments[n]:{},c=i(e);"function"==typeof o&&(c=c.concat(o(e).filter(function(t){return r(e,t).enumerable}))),c.forEach(function(n){u(t,n,e[n]);});}return t};},function(t,n,e){function r(t,n,e,r,o,i,u,c){var a,s="function"==typeof t?t.options:t;if(n&&(s.render=n,s.staticRenderFns=e,s._compiled=!0),r&&(s.functional=!0),i&&(s._scopeId="data-v-"+i),u?(a=function(t){(t=t||this.$vnode&&this.$vnode.ssrContext||this.parent&&this.parent.$vnode&&this.parent.$vnode.ssrContext)||"undefined"==typeof __VUE_SSR_CONTEXT__||(t=__VUE_SSR_CONTEXT__),o&&o.call(this,t),t&&t._registeredComponents&&t._registeredComponents.add(u);},s._ssrRegister=a):o&&(a=c?function(){o.call(this,this.$root.$options.shadowRoot);}:o),a)if(s.functional){s._injectStyles=a;var f=s.render;s.render=function(t,n){return a.call(n),f(t,n)};}else{var l=s.beforeCreate;s.beforeCreate=l?[].concat(l,a):[a];}return {exports:t,options:s}}e.d(n,"a",function(){return r});},function(t,n,e){var r=e(16);Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var o=r(e(65));function i(t,n,e,r){var o=n.arg,i=n.modifiers,u=n.value,c=e.context.__$waitInstance.is(u);(i.not||["hidden","enabled"].includes(o))&&(c=!c);var a="none"===t.style.display?"":t.style.display;switch(o){case"visible":case"hidden":t.style.display=c?a:"none";break;case"enabled":case"disabled":c?t.setAttribute("disabled",!0):t.removeAttribute("disabled");}}var u={bind:function(t,n,e,r){var u=n.arg,c=n.modifiers,a=n.value,s=e.context.__$waitInstance;switch(u){case"click":if(c.start){t.addEventListener("click",function(){return s.start(a)},!1);break}if(c.end){t.addEventListener("click",function(){return s.end(a)},!1);break}if(c.progress){t.addEventListener("click",function(){return s.progress.apply(s,(0, o.default)(a))},!1);break}break;case"toggle":t.addEventListener("click",function(){s.is(a)?s.end(a):s.start(a);},!1);}i(t,n,e);},update:i};n.default=u;},function(t,n,e){e.r(n);var r=e(52),o=e(30);for(var i in o)"default"!==i&&function(t){e.d(n,t,function(){return o[t]});}(i);var u=e(79),c=Object(u.a)(o.default,r.a,r.b,!1,null,null,null);n.default=c.exports;},function(t,n,e){var r=e(16);Object.defineProperty(n,"__esModule",{value:!0}),n.default=void 0;var o,i=r(e(37)),u=e(66),c="START",a="END",s="PROGRESS",f={namespaced:!0,state:{waitingFor:[],progresses:{}},getters:{is:function(t){return function(n){return (0, u.is)(t.waitingFor,n)}},any:function(t){return (0, u.any)(t.waitingFor)},percent:function(t){return function(n){return (0, u.percent)(t.progresses,n)}}},actions:{start:function(t,n){return (0, t.commit)(c,n)},end:function(t,n){return (0, t.commit)(a,n)},progress:function(t,n){return (0, t.commit)(s,n)}},mutations:(o={},(0, i.default)(o,c,function(t,n){t.waitingFor=(0, u.start)(t.waitingFor,n);}),(0, i.default)(o,a,function(t,n){t.waitingFor=(0, u.end)(t.waitingFor,n),t.progresses=(0, u.endProgress)(t.progresses,n);}),(0, i.default)(o,s,function(t,n){var e=n.waiter,r=n.current,o=n.total;t.progresses=(0, u.progress)(t.progresses,e,r,o);}),o)};n.default=f;},function(t,n,e){var r=e(15),o=e(10),i=e(24).f;t.exports=function(t){return function(n){for(var e,u=o(n),c=r(u),a=c.length,s=0,f=[];a>s;)i.call(u,e=c[s++])&&f.push(t?[e,u[e]]:u[e]);return f}};},function(t,n,e){var r=e(3),o=e(83)(!0);r(r.S,"Object",{entries:function(t){return o(t)}});},function(t,n,e){e(84),t.exports=e(0).Object.entries;},function(t,n,e){t.exports=e(85);},function(t,n){t.exports=function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")};},function(t,n,e){var r=e(60);t.exports=function(t,n){var e=[],o=!0,i=!1,u=void 0;try{for(var c,a=r(t);!(o=(c=a.next()).done)&&(e.push(c.value),!n||e.length!==n);o=!0);}catch(t){i=!0,u=t;}finally{try{o||null==a.return||a.return();}finally{if(i)throw u}}return e};},function(t,n){t.exports=function(t){if(Array.isArray(t))return t};},function(t,n,e){var r=e(89),o=e(88),i=e(87);t.exports=function(t,n){return r(t)||o(t,n)||i()};},function(t,n,e){var r=e(3),o=e(31),i=e(54);r(r.S,"Promise",{try:function(t){var n=o.f(this),e=i(t);return (e.e?n.reject:n.resolve)(e.v),n.promise}});},function(t,n,e){var r=e(3),o=e(0),i=e(2),u=e(56),c=e(53);r(r.P+r.R,"Promise",{finally:function(t){var n=u(this,o.Promise||i.Promise),e="function"==typeof t;return this.then(e?function(e){return c(n,t()).then(function(){return e})}:t,e?function(e){return c(n,t()).then(function(){throw e})}:t)}});},function(t,n,e){var r=e(2).navigator;t.exports=r&&r.userAgent||"";},function(t,n,e){var r=e(2),o=e(55).set,i=r.MutationObserver||r.WebKitMutationObserver,u=r.process,c=r.Promise,a="process"==e(25)(u);t.exports=function(){var t,n,e,s=function(){var r,o;for(a&&(r=u.domain)&&r.exit();t;){o=t.fn,t=t.next;try{o();}catch(r){throw t?e():n=void 0,r}}n=void 0,r&&r.enter();};if(a)e=function(){u.nextTick(s);};else if(!i||r.navigator&&r.navigator.standalone)if(c&&c.resolve){var f=c.resolve(void 0);e=function(){f.then(s);};}else e=function(){o.call(r,s);};else{var l=!0,p=document.createTextNode("");new i(s).observe(p,{characterData:!0}),e=function(){p.data=l=!l;};}return function(r){var o={fn:r,next:void 0};n&&(n.next=o),t||(t=o,e()),n=o;}};},function(t,n){t.exports=function(t,n,e){var r=void 0===e;switch(n.length){case 0:return r?t():t.call(e);case 1:return r?t(n[0]):t.call(e,n[0]);case 2:return r?t(n[0],n[1]):t.call(e,n[0],n[1]);case 3:return r?t(n[0],n[1],n[2]):t.call(e,n[0],n[1],n[2]);case 4:return r?t(n[0],n[1],n[2],n[3]):t.call(e,n[0],n[1],n[2],n[3])}return t.apply(e,n)};},function(t,n,e){var r,o,i,u,c=e(21),a=e(2),s=e(9),f=e(26),l=e(3),p=e(6),v=e(22),h=e(32),d=e(17),y=e(56),g=e(55).set,m=e(94)(),x=e(31),w=e(54),_=e(93),b=e(53),O=a.TypeError,S=a.process,j=S&&S.versions,E=j&&j.v8||"",P=a.Promise,k="process"==f(S),L=function(){},A=o=x.f,T=!!function(){try{var t=P.resolve(1),n=(t.constructor={})[e(1)("species")]=function(t){t(L,L);};return (k||"function"==typeof PromiseRejectionEvent)&&t.then(L)instanceof n&&0!==E.indexOf("6.6")&&-1===_.indexOf("Chrome/66")}catch(t){}}(),F=function(t){var n;return !(!p(t)||"function"!=typeof(n=t.then))&&n},M=function(t,n){if(!t._n){t._n=!0;var e=t._c;m(function(){for(var r=t._v,o=1==t._s,i=0,u=function(n){var e,i,u,c=o?n.ok:n.fail,a=n.resolve,s=n.reject,f=n.domain;try{c?(o||(2==t._h&&R(t),t._h=1),!0===c?e=r:(f&&f.enter(),e=c(r),f&&(f.exit(),u=!0)),e===n.promise?s(O("Promise-chain cycle")):(i=F(e))?i.call(e,a,s):a(e)):s(r);}catch(t){f&&!u&&f.exit(),s(t);}};e.length>i;)u(e[i++]);t._c=[],t._n=!1,n&&!t._h&&N(t);});}},N=function(t){g.call(a,function(){var n,e,r,o=t._v,i=I(t);if(i&&(n=w(function(){k?S.emit("unhandledRejection",o,t):(e=a.onunhandledrejection)?e({promise:t,reason:o}):(r=a.console)&&r.error&&r.error("Unhandled promise rejection",o);}),t._h=k||I(t)?2:1),t._a=void 0,i&&n.e)throw n.v});},I=function(t){return 1!==t._h&&0===(t._a||t._c).length},R=function(t){g.call(a,function(){var n;k?S.emit("rejectionHandled",t):(n=a.onrejectionhandled)&&n({promise:t,reason:t._v});});},C=function(t){var n=this;n._d||(n._d=!0,(n=n._w||n)._v=t,n._s=2,n._a||(n._a=n._c.slice()),M(n,!0));},$=function(t){var n,e=this;if(!e._d){e._d=!0,e=e._w||e;try{if(e===t)throw O("Promise can't be resolved itself");(n=F(t))?m(function(){var r={_w:e,_d:!1};try{n.call(t,s($,r,1),s(C,r,1));}catch(t){C.call(r,t);}}):(e._v=t,e._s=1,M(e,!1));}catch(t){C.call({_w:e,_d:!1},t);}}};T||(P=function(t){h(this,P,"Promise","_h"),v(t),r.call(this);try{t(s($,this,1),s(C,this,1));}catch(t){C.call(this,t);}},(r=function(t){this._c=[],this._a=void 0,this._s=0,this._d=!1,this._v=void 0,this._h=0,this._n=!1;}).prototype=e(33)(P.prototype,{then:function(t,n){var e=A(y(this,P));return e.ok="function"!=typeof t||t,e.fail="function"==typeof n&&n,e.domain=k?S.domain:void 0,this._c.push(e),this._a&&this._a.push(e),this._s&&M(this,!1),e.promise},catch:function(t){return this.then(void 0,t)}}),i=function(){var t=new r;this.promise=t,this.resolve=s($,t,1),this.reject=s(C,t,1);},x.f=A=function(t){return t===P||t===u?new i(t):o(t)}),l(l.G+l.W+l.F*!T,{Promise:P}),e(20)(P,"Promise"),e(58)("Promise"),u=e(0).Promise,l(l.S+l.F*!T,"Promise",{reject:function(t){var n=A(this);return (0, n.reject)(t),n.promise}}),l(l.S+l.F*(c||!T),"Promise",{resolve:function(t){return b(c&&this===u?P:this,t)}}),l(l.S+l.F*!(T&&e(62)(function(t){P.all(t).catch(L);})),"Promise",{all:function(t){var n=this,e=A(n),r=e.resolve,o=e.reject,i=w(function(){var e=[],i=0,u=1;d(t,!1,function(t){var c=i++,a=!1;e.push(void 0),u++,n.resolve(t).then(function(t){a||(a=!0,e[c]=t,--u||r(e));},o);}),--u||r(e);});return i.e&&o(i.v),e.promise},race:function(t){var n=this,e=A(n),r=e.reject,o=w(function(){d(t,!1,function(t){n.resolve(t).then(e.resolve,r);});});return o.e&&r(o.v),e.promise}});},function(t,n,e){e(34),e(14),e(18),e(96),e(92),e(91),t.exports=e(0).Promise;},function(t,n,e){t.exports=e(97);},function(t,n,e){var r=e(98);t.exports=function(t){return function(){var n=this,e=arguments;return new r(function(o,i){var u=t.apply(n,e);function c(t,n){try{var e=u[t](n),c=e.value;}catch(t){return void i(t)}e.done?o(c):r.resolve(c).then(a,s);}function a(t){c("next",t);}function s(t){c("throw",t);}a();})}};},function(t,n){!function(n){var e,r=Object.prototype,o=r.hasOwnProperty,i="function"==typeof Symbol?Symbol:{},u=i.iterator||"@@iterator",c=i.asyncIterator||"@@asyncIterator",a=i.toStringTag||"@@toStringTag",s="object"==typeof t,f=n.regeneratorRuntime;if(f)s&&(t.exports=f);else{(f=n.regeneratorRuntime=s?t.exports:{}).wrap=w;var l="suspendedStart",p="suspendedYield",v="executing",h="completed",d={},y={};y[u]=function(){return this};var g=Object.getPrototypeOf,m=g&&g(g(T([])));m&&m!==r&&o.call(m,u)&&(y=m);var x=S.prototype=b.prototype=Object.create(y);O.prototype=x.constructor=S,S.constructor=O,S[a]=O.displayName="GeneratorFunction",f.isGeneratorFunction=function(t){var n="function"==typeof t&&t.constructor;return !!n&&(n===O||"GeneratorFunction"===(n.displayName||n.name))},f.mark=function(t){return Object.setPrototypeOf?Object.setPrototypeOf(t,S):(t.__proto__=S,a in t||(t[a]="GeneratorFunction")),t.prototype=Object.create(x),t},f.awrap=function(t){return {__await:t}},j(E.prototype),E.prototype[c]=function(){return this},f.AsyncIterator=E,f.async=function(t,n,e,r){var o=new E(w(t,n,e,r));return f.isGeneratorFunction(n)?o:o.next().then(function(t){return t.done?t.value:o.next()})},j(x),x[a]="Generator",x[u]=function(){return this},x.toString=function(){return "[object Generator]"},f.keys=function(t){var n=[];for(var e in t)n.push(e);return n.reverse(),function e(){for(;n.length;){var r=n.pop();if(r in t)return e.value=r,e.done=!1,e}return e.done=!0,e}},f.values=T,A.prototype={constructor:A,reset:function(t){if(this.prev=0,this.next=0,this.sent=this._sent=e,this.done=!1,this.delegate=null,this.method="next",this.arg=e,this.tryEntries.forEach(L),!t)for(var n in this)"t"===n.charAt(0)&&o.call(this,n)&&!isNaN(+n.slice(1))&&(this[n]=e);},stop:function(){this.done=!0;var t=this.tryEntries[0].completion;if("throw"===t.type)throw t.arg;return this.rval},dispatchException:function(t){if(this.done)throw t;var n=this;function r(r,o){return c.type="throw",c.arg=t,n.next=r,o&&(n.method="next",n.arg=e),!!o}for(var i=this.tryEntries.length-1;i>=0;--i){var u=this.tryEntries[i],c=u.completion;if("root"===u.tryLoc)return r("end");if(u.tryLoc<=this.prev){var a=o.call(u,"catchLoc"),s=o.call(u,"finallyLoc");if(a&&s){if(this.prev<u.catchLoc)return r(u.catchLoc,!0);if(this.prev<u.finallyLoc)return r(u.finallyLoc)}else if(a){if(this.prev<u.catchLoc)return r(u.catchLoc,!0)}else{if(!s)throw new Error("try statement without catch or finally");if(this.prev<u.finallyLoc)return r(u.finallyLoc)}}}},abrupt:function(t,n){for(var e=this.tryEntries.length-1;e>=0;--e){var r=this.tryEntries[e];if(r.tryLoc<=this.prev&&o.call(r,"finallyLoc")&&this.prev<r.finallyLoc){var i=r;break}}i&&("break"===t||"continue"===t)&&i.tryLoc<=n&&n<=i.finallyLoc&&(i=null);var u=i?i.completion:{};return u.type=t,u.arg=n,i?(this.method="next",this.next=i.finallyLoc,d):this.complete(u)},complete:function(t,n){if("throw"===t.type)throw t.arg;return "break"===t.type||"continue"===t.type?this.next=t.arg:"return"===t.type?(this.rval=this.arg=t.arg,this.method="return",this.next="end"):"normal"===t.type&&n&&(this.next=n),d},finish:function(t){for(var n=this.tryEntries.length-1;n>=0;--n){var e=this.tryEntries[n];if(e.finallyLoc===t)return this.complete(e.completion,e.afterLoc),L(e),d}},catch:function(t){for(var n=this.tryEntries.length-1;n>=0;--n){var e=this.tryEntries[n];if(e.tryLoc===t){var r=e.completion;if("throw"===r.type){var o=r.arg;L(e);}return o}}throw new Error("illegal catch attempt")},delegateYield:function(t,n,r){return this.delegate={iterator:T(t),resultName:n,nextLoc:r},"next"===this.method&&(this.arg=e),d}};}function w(t,n,e,r){var o=n&&n.prototype instanceof b?n:b,i=Object.create(o.prototype),u=new A(r||[]);return i._invoke=function(t,n,e){var r=l;return function(o,i){if(r===v)throw new Error("Generator is already running");if(r===h){if("throw"===o)throw i;return F()}for(e.method=o,e.arg=i;;){var u=e.delegate;if(u){var c=P(u,e);if(c){if(c===d)continue;return c}}if("next"===e.method)e.sent=e._sent=e.arg;else if("throw"===e.method){if(r===l)throw r=h,e.arg;e.dispatchException(e.arg);}else"return"===e.method&&e.abrupt("return",e.arg);r=v;var a=_(t,n,e);if("normal"===a.type){if(r=e.done?h:p,a.arg===d)continue;return {value:a.arg,done:e.done}}"throw"===a.type&&(r=h,e.method="throw",e.arg=a.arg);}}}(t,e,u),i}function _(t,n,e){try{return {type:"normal",arg:t.call(n,e)}}catch(t){return {type:"throw",arg:t}}}function b(){}function O(){}function S(){}function j(t){["next","throw","return"].forEach(function(n){t[n]=function(t){return this._invoke(n,t)};});}function E(t){var n;this._invoke=function(e,r){function i(){return new Promise(function(n,i){!function n(e,r,i,u){var c=_(t[e],t,r);if("throw"!==c.type){var a=c.arg,s=a.value;return s&&"object"==typeof s&&o.call(s,"__await")?Promise.resolve(s.__await).then(function(t){n("next",t,i,u);},function(t){n("throw",t,i,u);}):Promise.resolve(s).then(function(t){a.value=t,i(a);},u)}u(c.arg);}(e,r,n,i);})}return n=n?n.then(i,i):i()};}function P(t,n){var r=t.iterator[n.method];if(r===e){if(n.delegate=null,"throw"===n.method){if(t.iterator.return&&(n.method="return",n.arg=e,P(t,n),"throw"===n.method))return d;n.method="throw",n.arg=new TypeError("The iterator does not provide a 'throw' method");}return d}var o=_(r,t.iterator,n.arg);if("throw"===o.type)return n.method="throw",n.arg=o.arg,n.delegate=null,d;var i=o.arg;return i?i.done?(n[t.resultName]=i.value,n.next=t.nextLoc,"return"!==n.method&&(n.method="next",n.arg=e),n.delegate=null,d):i:(n.method="throw",n.arg=new TypeError("iterator result is not an object"),n.delegate=null,d)}function k(t){var n={tryLoc:t[0]};1 in t&&(n.catchLoc=t[1]),2 in t&&(n.finallyLoc=t[2],n.afterLoc=t[3]),this.tryEntries.push(n);}function L(t){var n=t.completion||{};n.type="normal",delete n.arg,t.completion=n;}function A(t){this.tryEntries=[{tryLoc:"root"}],t.forEach(k,this),this.reset(!0);}function T(t){if(t){var n=t[u];if(n)return n.call(t);if("function"==typeof t.next)return t;if(!isNaN(t.length)){var r=-1,i=function n(){for(;++r<t.length;)if(o.call(t,r))return n.value=t[r],n.done=!1,n;return n.value=e,n.done=!0,n};return i.next=i}}return {next:F}}function F(){return {value:e,done:!0}}}(function(){return this}()||Function("return this")());},function(t,n,e){var r=function(){return this}()||Function("return this")(),o=r.regeneratorRuntime&&Object.getOwnPropertyNames(r).indexOf("regeneratorRuntime")>=0,i=o&&r.regeneratorRuntime;if(r.regeneratorRuntime=void 0,t.exports=e(100),o)r.regeneratorRuntime=i;else try{delete r.regeneratorRuntime;}catch(t){r.regeneratorRuntime=void 0;}},function(t,n,e){t.exports=e(101);},function(t,n,e){var r=e(16);Object.defineProperty(n,"__esModule",{value:!0}),n.mapWaitingActions=function(t,n){var e={};"object"===(0, s.default)(t)&&(n=t,t=null);for(var r=Array.isArray(n),o=(0, a.default)(n),f=function(){var n=(0, c.default)(o[l],2),a=n[0],s=n[1],f=void 0,p=void 0,v=void 0;s===Object(s)?(r?(f=s.action,void 0!==s.method&&(f=s.method)):f=a,p=s.action,v=s.loader):r?(f=p=s,v=s):(f=p=a,v=s),v||(v=p),p&&(e[f]=(0, u.default)(i.default.mark(function n(){var e,r,o,u,c=arguments;return i.default.wrap(function(n){for(;;)switch(n.prev=n.next){case 0:for(n.prev=0,this.__$waitInstance.start(v),r=c.length,o=new Array(r),u=0;u<r;u++)o[u]=c[u];return n.next=5,(e=this.$store).dispatch.apply(e,[t?"".concat(t,"/").concat(p):p].concat(o));case 5:return n.abrupt("return",n.sent);case 6:return n.prev=6,this.__$waitInstance.end(v),n.finish(6);case 9:case"end":return n.stop()}},n,this,[[0,,6,9]])})));},l=0;l<o.length;l++)f();return e},n.mapWaitingGetters=function(t){var n={};return (0, o.default)(t).forEach(function(e){var r=t[e];n[e]=function(){return this.__$waitInstance.is(r)};}),n},n.waitFor=function(t,n){var e=arguments.length>2&&void 0!==arguments[2]&&arguments[2];if("function"!=typeof n)return console.warn("[vue-wait] waitFor second argument must be a function"),n;if(!0===e)return function(){try{this.__$waitInstance.start(t);for(var e=arguments.length,r=new Array(e),o=0;o<e;o++)r[o]=arguments[o];return n.apply(this,r)}finally{this.__$waitInstance.end(t);}};return (0, u.default)(i.default.mark(function e(){var r,o,u,c=arguments;return i.default.wrap(function(e){for(;;)switch(e.prev=e.next){case 0:for(e.prev=0,this.__$waitInstance.start(t),r=c.length,o=new Array(r),u=0;u<r;u++)o[u]=c[u];return e.next=5,n.apply(this,o);case 5:return e.abrupt("return",e.sent);case 6:return e.prev=6,this.__$waitInstance.end(t),e.finish(6);case 9:case"end":return e.stop()}},e,this,[[0,,6,9]])}))};var o=r(e(38)),i=r(e(102)),u=r(e(99)),c=r(e(90)),a=r(e(86)),s=r(e(59));},function(t,n,e){var r=/[|\\{}()[\]^$+*?.]/g;t.exports=function(t){if("string"!=typeof t)throw new TypeError("Expected a string");return t.replace(r,"\\$&")};},function(t,n,e){var r=e(3),o=e(22),i=e(9),u=e(17);t.exports=function(t){r(r.S,t,{from:function(t){var n,e,r,c,a=arguments[1];return o(this),(n=void 0!==a)&&o(a),void 0==t?new this:(e=[],n?(r=0,c=i(a,arguments[2],2),u(t,!1,function(t){e.push(c(t,r++));})):u(t,!1,e.push,e),new this(e))}});};},function(t,n,e){e(105)("Map");},function(t,n,e){var r=e(3);t.exports=function(t){r(r.S,t,{of:function(){for(var t=arguments.length,n=new Array(t);t--;)n[t]=arguments[t];return new this(n)}});};},function(t,n,e){e(107)("Map");},function(t,n,e){var r=e(17);t.exports=function(t,n){var e=[];return r(t,!1,e.push,e,n),e};},function(t,n,e){var r=e(26),o=e(109);t.exports=function(t){return function(){if(r(this)!=t)throw TypeError(t+"#toJSON isn't generic");return o(this)}};},function(t,n,e){var r=e(3);r(r.P+r.R,"Map",{toJSON:e(110)("Map")});},function(t,n,e){var r=e(6),o=e(70),i=e(1)("species");t.exports=function(t){var n;return o(t)&&("function"!=typeof(n=t.constructor)||n!==Array&&!o(n.prototype)||(n=void 0),r(n)&&null===(n=n[i])&&(n=void 0)),void 0===n?Array:n};},function(t,n,e){var r=e(112);t.exports=function(t,n){return new(r(t))(n)};},function(t,n,e){var r=e(9),o=e(51),i=e(19),u=e(27),c=e(113);t.exports=function(t,n){var e=1==t,a=2==t,s=3==t,f=4==t,l=6==t,p=5==t||l,v=n||c;return function(n,c,h){for(var d,y,g=i(n),m=o(g),x=r(c,h,3),w=u(m.length),_=0,b=e?v(n,w):a?v(n,0):void 0;w>_;_++)if((p||_ in m)&&(y=x(d=m[_],_,g),t))if(e)b[_]=y;else if(y)switch(t){case 3:return !0;case 5:return d;case 6:return _;case 2:b.push(d);}else if(f)return !1;return l?-1:s||f?f:b}};},function(t,n,e){var r=e(2),o=e(3),i=e(47),u=e(11),c=e(8),a=e(33),s=e(17),f=e(32),l=e(6),p=e(20),v=e(4).f,h=e(114)(0),d=e(5);t.exports=function(t,n,e,y,g,m){var x=r[t],w=x,_=g?"set":"add",b=w&&w.prototype,O={};return d&&"function"==typeof w&&(m||b.forEach&&!u(function(){(new w).entries().next();}))?(w=n(function(n,e){f(n,w,t,"_c"),n._c=new x,void 0!=e&&s(e,g,n[_],n);}),h("add,clear,delete,forEach,get,has,set,keys,values,entries,toJSON".split(","),function(t){var n="add"==t||"set"==t;t in b&&(!m||"clear"!=t)&&c(w.prototype,t,function(e,r){if(f(this,w,t),!n&&m&&!l(e))return "get"==t&&void 0;var o=this._c[t](0===e?0:e,r);return n?this:o});}),m||v(w.prototype,"size",{get:function(){return this._c.size}})):(w=y.getConstructor(n,t,g,_),a(w.prototype,e),i.NEED=!0),p(w,t),O[t]=w,o(o.G+o.W+o.F,O),m||y.setStrong(w,t,g),w};},function(t,n,e){var r=e(4).f,o=e(39),i=e(33),u=e(9),c=e(32),a=e(17),s=e(36),f=e(61),l=e(58),p=e(5),v=e(47).fastKey,h=e(57),d=p?"_s":"size",y=function(t,n){var e,r=v(n);if("F"!==r)return t._i[r];for(e=t._f;e;e=e.n)if(e.k==n)return e};t.exports={getConstructor:function(t,n,e,s){var f=t(function(t,r){c(t,f,n,"_i"),t._t=n,t._i=o(null),t._f=void 0,t._l=void 0,t[d]=0,void 0!=r&&a(r,e,t[s],t);});return i(f.prototype,{clear:function(){for(var t=h(this,n),e=t._i,r=t._f;r;r=r.n)r.r=!0,r.p&&(r.p=r.p.n=void 0),delete e[r.i];t._f=t._l=void 0,t[d]=0;},delete:function(t){var e=h(this,n),r=y(e,t);if(r){var o=r.n,i=r.p;delete e._i[r.i],r.r=!0,i&&(i.n=o),o&&(o.p=i),e._f==r&&(e._f=o),e._l==r&&(e._l=i),e[d]--;}return !!r},forEach:function(t){h(this,n);for(var e,r=u(t,arguments.length>1?arguments[1]:void 0,3);e=e?e.n:this._f;)for(r(e.v,e.k,this);e&&e.r;)e=e.p;},has:function(t){return !!y(h(this,n),t)}}),p&&r(f.prototype,"size",{get:function(){return h(this,n)[d]}}),f},def:function(t,n,e){var r,o,i=y(t,n);return i?i.v=e:(t._l=i={i:o=v(n,!0),k:n,v:e,p:r=t._l,n:void 0,r:!1},t._f||(t._f=i),r&&(r.n=i),t[d]++,"F"!==o&&(t._i[o]=i)),t},getEntry:y,setStrong:function(t,n,e){s(t,n,function(t,e){this._t=h(t,n),this._k=e,this._l=void 0;},function(){for(var t=this._k,n=this._l;n&&n.r;)n=n.p;return this._t&&(this._l=n=n?n.n:this._t._f)?f(0,"keys"==t?n.k:"values"==t?n.v:[n.k,n.v]):(this._t=void 0,f(1))},e?"entries":"values",!e,!0),l(n);}};},function(t,n,e){var r=e(116),o=e(57);t.exports=e(115)("Map",function(t){return function(){return t(this,arguments.length>0?arguments[0]:void 0)}},{get:function(t){var n=r.getEntry(o(this,"Map"),t);return n&&n.v},set:function(t,n){return r.def(o(this,"Map"),0===t?0:t,n)}},r,!0);},function(t,n,e){e(34),e(14),e(18),e(117),e(111),e(108),e(106),t.exports=e(0).Map;},function(t,n,e){t.exports=e(118);},function(t,n,e){var r=e(15),o=e(40),i=e(24),u=e(19),c=e(51),a=Object.assign;t.exports=!a||e(11)(function(){var t={},n={},e=Symbol(),r="abcdefghijklmnopqrst";return t[e]=7,r.split("").forEach(function(t){n[t]=t;}),7!=a({},t)[e]||Object.keys(a({},n)).join("")!=r})?function(t,n){for(var e=u(t),a=arguments.length,s=1,f=o.f,l=i.f;a>s;)for(var p,v=c(arguments[s++]),h=f?r(v).concat(f(v)):r(v),d=h.length,y=0;d>y;)l.call(v,p=h[y++])&&(e[p]=v[p]);return e}:a;},function(t,n,e){var r=e(3);r(r.S+r.F,"Object",{assign:e(120)});},function(t,n,e){e(121),t.exports=e(0).Object.assign;},function(t,n,e){t.exports=e(122);},function(t,n,e){var r=e(0),o=r.JSON||(r.JSON={stringify:JSON.stringify});t.exports=function(t){return o.stringify.apply(o,arguments)};},function(t,n,e){t.exports=e(124);},function(t,n,e){e(44)("observable");},function(t,n,e){e(44)("asyncIterator");},function(t,n,e){e(73),e(34),e(127),e(126),t.exports=e(0).Symbol;},function(t,n,e){t.exports=e(128);},function(t,n,e){e(14),e(18),t.exports=e(45).f("iterator");},function(t,n,e){t.exports=e(130);},function(t,n,e){var r=e(7),o=e(35);t.exports=e(0).getIterator=function(t){var n=o(t);if("function"!=typeof n)throw TypeError(t+" is not iterable!");return r(n.call(t))};},function(t,n,e){e(18),e(14),t.exports=e(132);},function(t,n,e){var r=e(16),o=r(e(60)),i=r(e(59)),u=r(e(125)),c=r(e(123)),a=r(e(119)),s=e(104),f=new a.default;function l(t,n){var e=(0, c.default)({caseSensitive:!1},n),r=t+(0, u.default)(e);if(f.has(r))return f.get(r);var o="!"===t[0];o&&(t=t.slice(1)),t=s(t).replace(/\\\*/g,".*");var i=new RegExp("^".concat(t,"$"),e.caseSensitive?"":"i");return i.negated=o,f.set(r,i),i}t.exports=function(t,n,e){if(!Array.isArray(t)||!Array.isArray(n))throw new TypeError("Expected two arrays, got ".concat((0, i.default)(t)," ").concat((0, i.default)(n)));if(0===n.length)return t;var r="!"===n[0][0];n=n.map(function(t){return l(t,e)});var u=[],c=!0,a=!1,s=void 0;try{for(var f,p=(0, o.default)(t);!(c=(f=p.next()).done);c=!0){var v=f.value,h=r,d=!0,y=!1,g=void 0;try{for(var m,x=(0, o.default)(n);!(d=(m=x.next()).done);d=!0){var w=m.value;w.test(v)&&(h=!w.negated);}}catch(t){y=!0,g=t;}finally{try{d||null==x.return||x.return();}finally{if(y)throw g}}h&&u.push(v);}}catch(t){a=!0,s=t;}finally{try{c||null==p.return||p.return();}finally{if(a)throw s}}return u},t.exports.isMatch=function(t,n,e){var r=l(n,e),o=r.test(t);return r.negated?!o:o};},function(t,n){t.exports=function(){throw new TypeError("Invalid attempt to spread non-iterable instance")};},function(t,n,e){var r=e(26),o=e(1)("iterator"),i=e(13);t.exports=e(0).isIterable=function(t){var n=Object(t);return void 0!==n[o]||"@@iterator"in n||i.hasOwnProperty(r(n))};},function(t,n){t.exports=function(){};},function(t,n,e){var r=e(137),o=e(61),i=e(13),u=e(10);t.exports=e(36)(Array,"Array",function(t,n){this._t=u(t),this._i=0,this._k=n;},function(){var t=this._t,n=this._k,e=this._i++;return !t||e>=t.length?(this._t=void 0,o(1)):o(0,"keys"==n?e:"values"==n?t[e]:[e,t[e]])},"values"),i.Arguments=i.Array,r("keys"),r("values"),r("entries");},function(t,n,e){e(18),e(14),t.exports=e(136);},function(t,n,e){t.exports=e(139);},function(t,n,e){var r=e(4),o=e(23);t.exports=function(t,n,e){n in t?r.f(t,n,o(0,e)):t[n]=e;};},function(t,n,e){var r=e(9),o=e(3),i=e(19),u=e(64),c=e(63),a=e(27),s=e(141),f=e(35);o(o.S+o.F*!e(62)(function(t){}),"Array",{from:function(t){var n,e,o,l,p=i(t),v="function"==typeof this?this:Array,h=arguments.length,d=h>1?arguments[1]:void 0,y=void 0!==d,g=0,m=f(p);if(y&&(d=r(d,h>2?arguments[2]:void 0,2)),void 0==m||v==Array&&c(m))for(e=new v(n=a(p.length));n>g;g++)s(e,g,y?d(p[g],g):p[g]);else for(l=m.call(p),e=new v;!(o=l.next()).done;g++)s(e,g,y?u(l,d,[o.value,g],!0):o.value);return e.length=g,e}});},function(t,n,e){var r=e(12),o=e(19),i=e(42)("IE_PROTO"),u=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=o(t),r(t,i)?t[i]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?u:null};},function(t,n,e){var r=e(39),o=e(23),i=e(20),u={};e(8)(u,e(1)("iterator"),function(){return this}),t.exports=function(t,n,e){t.prototype=r(u,{next:o(1,e)}),i(t,n+" Iterator");};},function(t,n,e){var r=e(43),o=e(50);t.exports=function(t){return function(n,e){var i,u,c=String(o(n)),a=r(e),s=c.length;return a<0||a>=s?t?"":void 0:(i=c.charCodeAt(a))<55296||i>56319||a+1===s||(u=c.charCodeAt(a+1))<56320||u>57343?t?c.charAt(a):i:t?c.slice(a,a+2):u-56320+(i-55296<<10)+65536}};},function(t,n,e){e(14),e(142),t.exports=e(0).Array.from;},function(t,n,e){t.exports=e(146);},function(t,n,e){var r=e(147),o=e(140);t.exports=function(t){if(o(Object(t))||"[object Arguments]"===Object.prototype.toString.call(t))return r(t)};},function(t,n){t.exports=function(t){if(Array.isArray(t)){for(var n=0,e=new Array(t.length);n<t.length;n++)e[n]=t[n];return e}};},function(t,n,e){var r=e(74),o=e(38);t.exports=function(t,n){if(null==t)return {};var e,i,u={},c=o(t);for(i=0;i<c.length;i++)e=c[i],n.indexOf(e)>=0||(u[e]=t[e]);if(r){var a=r(t);for(i=0;i<a.length;i++)e=a[i],n.indexOf(e)>=0||Object.prototype.propertyIsEnumerable.call(t,e)&&(u[e]=t[e]);}return u};},function(t,n,e){var r=e(67);function o(t,n){for(var e=0;e<n.length;e++){var o=n[e];o.enumerable=o.enumerable||!1,o.configurable=!0,"value"in o&&(o.writable=!0),r(t,o.key,o);}}t.exports=function(t,n,e){return n&&o(t.prototype,n),e&&o(t,e),t};},function(t,n){t.exports=function(t,n){if(!(t instanceof n))throw new TypeError("Cannot call a class as a function")};},function(t,n,e){var r=e(3);r(r.S+r.F*!e(5),"Object",{defineProperty:e(4).f});},function(t,n,e){e(153);var r=e(0).Object;t.exports=function(t,n,e){return r.defineProperty(t,n,e)};},function(t,n,e){var r=e(19),o=e(15);e(75)("keys",function(){return function(t){return o(r(t))}});},function(t,n,e){e(155),t.exports=e(0).Object.keys;},function(t,n,e){var r=e(10),o=e(68).f,i={}.toString,u="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[];t.exports.f=function(t){return u&&"[object Window]"==i.call(t)?function(t){try{return o(t)}catch(t){return u.slice()}}(t):o(r(t))};},function(t,n,e){var r=e(4),o=e(7),i=e(15);t.exports=e(5)?Object.defineProperties:function(t,n){o(t);for(var e,u=i(n),c=u.length,a=0;c>a;)r.f(t,e=u[a++],n[e]);return t};},function(t,n,e){var r=e(43),o=Math.max,i=Math.min;t.exports=function(t,n){return (t=r(t))<0?o(t+n,0):i(t,n)};},function(t,n,e){var r=e(10),o=e(27),i=e(159);t.exports=function(t){return function(n,e,u){var c,a=r(n),s=o(a.length),f=i(u,s);if(t&&e!=e){for(;s>f;)if((c=a[f++])!=c)return !0}else for(;s>f;f++)if((t||f in a)&&a[f]===e)return t||f||0;return !t&&-1}};},function(t,n,e){var r=e(15),o=e(40),i=e(24);t.exports=function(t){var n=r(t),e=o.f;if(e)for(var u,c=e(t),a=i.f,s=0;c.length>s;)a.call(t,u=c[s++])&&n.push(u);return n};},function(t,n,e){e(73),t.exports=e(0).Object.getOwnPropertySymbols;},function(t,n,e){var r=e(10),o=e(77).f;e(75)("getOwnPropertyDescriptor",function(){return function(t,n){return o(r(t),n)}});},function(t,n,e){e(163);var r=e(0).Object;t.exports=function(t,n){return r.getOwnPropertyDescriptor(t,n)};},function(t,n,e){t.exports=e(164);},function(t,n,e){var r=e(16);Object.defineProperty(n,"__esModule",{value:!0}),n.install=v,Object.defineProperty(n,"mapWaitingActions",{enumerable:!0,get:function(){return a.mapWaitingActions}}),Object.defineProperty(n,"mapWaitingGetters",{enumerable:!0,get:function(){return a.mapWaitingGetters}}),Object.defineProperty(n,"waitFor",{enumerable:!0,get:function(){return a.waitFor}}),n.default=void 0;var o=r(e(78)),i=r(e(152)),u=r(e(151)),c=e(66),a=e(103),s=r(e(82)),f=r(e(81)),l=r(e(80)),p=function(){function t(){var n=arguments.length>0&&void 0!==arguments[0]?arguments[0]:{};(0, i.default)(this,t);this.options=(0, o.default)({},{accessorName:"$wait",useVuex:!1,vuexModuleName:"wait",registerComponent:!0,componentName:"v-wait",registerDirective:!0,directiveName:"wait"},n),this.initialized=!1;}return (0, u.default)(t,[{key:"init",value:function(t,n){if((0, c.nodeIsDebug)()&&!v.installed&&console.warn("[vue-wait] not installed. Make sure to call `Vue.use(VueWait)` before init root instance."),!this.initialized){if(this.options.registerComponent&&t.component(this.options.componentName,f.default),this.options.registerDirective&&t.directive(this.options.directiveName,l.default),this.options.useVuex){var e=this.options.vuexModuleName;if(!n)throw new Error("[vue-wait] Vuex not initialized.");this.store=n,n._modules.get([e])||n.registerModule(e,s.default),this.stateHandler=new t({computed:{is:function(){return function(t){return n.getters["".concat(e,"/is")](t)}},any:function(){return n.getters["".concat(e,"/any")]},percent:function(){return function(t){return n.getters["".concat(e,"/percent")](t)}}}});}else this.stateHandler=new t({data:function(){return {waitingFor:[],progresses:{}}},computed:{is:function(){var t=this;return function(n){return (0, c.is)(t.waitingFor,n)}},any:function(){return (0, c.any)(this.waitingFor)},percent:function(){var t=this;return function(n){return (0, c.percent)(t.progresses,n)}}},methods:{start:function(t){this.waitingFor=(0, c.start)(this.waitingFor,t);},end:function(t){this.waitingFor=(0, c.end)(this.waitingFor,t),this.progresses=(0, c.endProgress)(this.progresses,t);},progress:function(t){var n=t.waiter,e=t.current,r=t.total;this.progresses=(0, c.progress)(this.progresses,n,e,r);}}});this.initialized=!0;}}},{key:"is",value:function(t){return this.stateHandler.is(t)}},{key:"waiting",value:function(t){return this.is(t)}},{key:"percent",value:function(t){return this.stateHandler.percent(t)}},{key:"dispatchWaitingAction",value:function(t,n){var e=this.options.vuexModuleName;this.store.dispatch("".concat(e,"/").concat(t),n,{root:!0});}},{key:"start",value:function(t){this.options.useVuex?this.dispatchWaitingAction("start",t):this.stateHandler.start(t);}},{key:"end",value:function(t){this.options.useVuex?this.dispatchWaitingAction("end",t):this.stateHandler.end(t);}},{key:"progress",value:function(t,n){var e=arguments.length>2&&void 0!==arguments[2]?arguments[2]:100;this.is(t)||this.start(t),n>e?this.end(t):this.options.useVuex?this.dispatchWaitingAction("progress",{waiter:t,current:n,total:e}):this.stateHandler.progress({waiter:t,current:n,total:e});}},{key:"any",get:function(){return this.stateHandler.any}}]),t}();function v(t){v.installed&&t?(0, c.nodeIsDebug)()&&console.warn("[vue-wait] already installed. Vue.use(VueWait) should be called only once."):(t.mixin({beforeCreate:function(){var n=this.$options,e=n.wait,r=n.store,o=n.parent,i=null;e?(i="function"==typeof e?new e:e).init(t,r):o&&o.__$waitInstance&&(i=o.__$waitInstance).init(t,o.$store),i&&(this.__$waitInstance=i,this[i.options.accessorName]=i);}}),v.installed=!0);}n.default=p,p.install=v;},function(t,n,e){t.exports=e(166);}])});
    });

    var VueWait = unwrapExports(vueWait);
    var vueWait_1 = vueWait.VueWait;

    var global$1 = (typeof global !== "undefined" ? global :
                typeof self !== "undefined" ? self :
                typeof window !== "undefined" ? window : {});

    // shim for using process in browser
    // based off https://github.com/defunctzombie/node-process/blob/master/browser.js

    function defaultSetTimout() {
        throw new Error('setTimeout has not been defined');
    }
    function defaultClearTimeout () {
        throw new Error('clearTimeout has not been defined');
    }
    var cachedSetTimeout = defaultSetTimout;
    var cachedClearTimeout = defaultClearTimeout;
    if (typeof global$1.setTimeout === 'function') {
        cachedSetTimeout = setTimeout;
    }
    if (typeof global$1.clearTimeout === 'function') {
        cachedClearTimeout = clearTimeout;
    }

    function runTimeout(fun) {
        if (cachedSetTimeout === setTimeout) {
            //normal enviroments in sane situations
            return setTimeout(fun, 0);
        }
        // if setTimeout wasn't available but was latter defined
        if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
            cachedSetTimeout = setTimeout;
            return setTimeout(fun, 0);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedSetTimeout(fun, 0);
        } catch(e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
                return cachedSetTimeout.call(null, fun, 0);
            } catch(e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
                return cachedSetTimeout.call(this, fun, 0);
            }
        }


    }
    function runClearTimeout(marker) {
        if (cachedClearTimeout === clearTimeout) {
            //normal enviroments in sane situations
            return clearTimeout(marker);
        }
        // if clearTimeout wasn't available but was latter defined
        if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
            cachedClearTimeout = clearTimeout;
            return clearTimeout(marker);
        }
        try {
            // when when somebody has screwed with setTimeout but no I.E. maddness
            return cachedClearTimeout(marker);
        } catch (e){
            try {
                // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
                return cachedClearTimeout.call(null, marker);
            } catch (e){
                // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
                // Some versions of I.E. have different rules for clearTimeout vs setTimeout
                return cachedClearTimeout.call(this, marker);
            }
        }



    }
    var queue = [];
    var draining = false;
    var currentQueue;
    var queueIndex = -1;

    function cleanUpNextTick() {
        if (!draining || !currentQueue) {
            return;
        }
        draining = false;
        if (currentQueue.length) {
            queue = currentQueue.concat(queue);
        } else {
            queueIndex = -1;
        }
        if (queue.length) {
            drainQueue();
        }
    }

    function drainQueue() {
        if (draining) {
            return;
        }
        var timeout = runTimeout(cleanUpNextTick);
        draining = true;

        var len = queue.length;
        while(len) {
            currentQueue = queue;
            queue = [];
            while (++queueIndex < len) {
                if (currentQueue) {
                    currentQueue[queueIndex].run();
                }
            }
            queueIndex = -1;
            len = queue.length;
        }
        currentQueue = null;
        draining = false;
        runClearTimeout(timeout);
    }
    function nextTick$1(fun) {
        var args = new Array(arguments.length - 1);
        if (arguments.length > 1) {
            for (var i = 1; i < arguments.length; i++) {
                args[i - 1] = arguments[i];
            }
        }
        queue.push(new Item(fun, args));
        if (queue.length === 1 && !draining) {
            runTimeout(drainQueue);
        }
    }
    // v8 likes predictible objects
    function Item(fun, array) {
        this.fun = fun;
        this.array = array;
    }
    Item.prototype.run = function () {
        this.fun.apply(null, this.array);
    };
    var title = 'browser';
    var platform = 'browser';
    var browser = true;
    var env = {};
    var argv = [];
    var version = ''; // empty string to avoid regexp issues
    var versions = {};
    var release = {};
    var config = {};

    function noop() {}

    var on = noop;
    var addListener = noop;
    var once = noop;
    var off = noop;
    var removeListener = noop;
    var removeAllListeners = noop;
    var emit = noop;

    function binding(name) {
        throw new Error('process.binding is not supported');
    }

    function cwd () { return '/' }
    function chdir (dir) {
        throw new Error('process.chdir is not supported');
    }function umask() { return 0; }

    // from https://github.com/kumavis/browser-process-hrtime/blob/master/index.js
    var performance = global$1.performance || {};
    var performanceNow =
      performance.now        ||
      performance.mozNow     ||
      performance.msNow      ||
      performance.oNow       ||
      performance.webkitNow  ||
      function(){ return (new Date()).getTime() };

    // generate timestamp or delta
    // see http://nodejs.org/api/process.html#process_process_hrtime
    function hrtime(previousTimestamp){
      var clocktime = performanceNow.call(performance)*1e-3;
      var seconds = Math.floor(clocktime);
      var nanoseconds = Math.floor((clocktime%1)*1e9);
      if (previousTimestamp) {
        seconds = seconds - previousTimestamp[0];
        nanoseconds = nanoseconds - previousTimestamp[1];
        if (nanoseconds<0) {
          seconds--;
          nanoseconds += 1e9;
        }
      }
      return [seconds,nanoseconds]
    }

    var startTime = new Date();
    function uptime() {
      var currentTime = new Date();
      var dif = currentTime - startTime;
      return dif / 1000;
    }

    var process = {
      nextTick: nextTick$1,
      title: title,
      browser: browser,
      env: env,
      argv: argv,
      version: version,
      versions: versions,
      on: on,
      addListener: addListener,
      once: once,
      off: off,
      removeListener: removeListener,
      removeAllListeners: removeAllListeners,
      emit: emit,
      binding: binding,
      cwd: cwd,
      chdir: chdir,
      umask: umask,
      hrtime: hrtime,
      platform: platform,
      release: release,
      config: config,
      uptime: uptime
    };

    /**
     * vuex v3.0.1
     * (c) 2017 Evan You
     * @license MIT
     */
    var applyMixin = function (Vue) {
      var version$$1 = Number(Vue.version.split('.')[0]);

      if (version$$1 >= 2) {
        Vue.mixin({ beforeCreate: vuexInit });
      } else {
        // override init and inject vuex init procedure
        // for 1.x backwards compatibility.
        var _init = Vue.prototype._init;
        Vue.prototype._init = function (options) {
          if ( options === void 0 ) options = {};

          options.init = options.init
            ? [vuexInit].concat(options.init)
            : vuexInit;
          _init.call(this, options);
        };
      }

      /**
       * Vuex init hook, injected into each instances init hooks list.
       */

      function vuexInit () {
        var options = this.$options;
        // store injection
        if (options.store) {
          this.$store = typeof options.store === 'function'
            ? options.store()
            : options.store;
        } else if (options.parent && options.parent.$store) {
          this.$store = options.parent.$store;
        }
      }
    };

    var devtoolHook =
      typeof window !== 'undefined' &&
      window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

    function devtoolPlugin (store) {
      if (!devtoolHook) { return }

      store._devtoolHook = devtoolHook;

      devtoolHook.emit('vuex:init', store);

      devtoolHook.on('vuex:travel-to-state', function (targetState) {
        store.replaceState(targetState);
      });

      store.subscribe(function (mutation, state) {
        devtoolHook.emit('vuex:mutation', mutation, state);
      });
    }

    /**
     * Get the first item that pass the test
     * by second argument function
     *
     * @param {Array} list
     * @param {Function} f
     * @return {*}
     */
    /**
     * Deep copy the given object considering circular structure.
     * This function caches all nested objects and its copies.
     * If it detects circular structure, use cached copy to avoid infinite loop.
     *
     * @param {*} obj
     * @param {Array<Object>} cache
     * @return {*}
     */


    /**
     * forEach for object
     */
    function forEachValue (obj, fn) {
      Object.keys(obj).forEach(function (key) { return fn(obj[key], key); });
    }

    function isObject$1 (obj) {
      return obj !== null && typeof obj === 'object'
    }

    function isPromise (val) {
      return val && typeof val.then === 'function'
    }

    function assert (condition, msg) {
      if (!condition) { throw new Error(("[vuex] " + msg)) }
    }

    var Module = function Module (rawModule, runtime) {
      this.runtime = runtime;
      this._children = Object.create(null);
      this._rawModule = rawModule;
      var rawState = rawModule.state;
      this.state = (typeof rawState === 'function' ? rawState() : rawState) || {};
    };

    var prototypeAccessors$1 = { namespaced: { configurable: true } };

    prototypeAccessors$1.namespaced.get = function () {
      return !!this._rawModule.namespaced
    };

    Module.prototype.addChild = function addChild (key, module) {
      this._children[key] = module;
    };

    Module.prototype.removeChild = function removeChild (key) {
      delete this._children[key];
    };

    Module.prototype.getChild = function getChild (key) {
      return this._children[key]
    };

    Module.prototype.update = function update (rawModule) {
      this._rawModule.namespaced = rawModule.namespaced;
      if (rawModule.actions) {
        this._rawModule.actions = rawModule.actions;
      }
      if (rawModule.mutations) {
        this._rawModule.mutations = rawModule.mutations;
      }
      if (rawModule.getters) {
        this._rawModule.getters = rawModule.getters;
      }
    };

    Module.prototype.forEachChild = function forEachChild (fn) {
      forEachValue(this._children, fn);
    };

    Module.prototype.forEachGetter = function forEachGetter (fn) {
      if (this._rawModule.getters) {
        forEachValue(this._rawModule.getters, fn);
      }
    };

    Module.prototype.forEachAction = function forEachAction (fn) {
      if (this._rawModule.actions) {
        forEachValue(this._rawModule.actions, fn);
      }
    };

    Module.prototype.forEachMutation = function forEachMutation (fn) {
      if (this._rawModule.mutations) {
        forEachValue(this._rawModule.mutations, fn);
      }
    };

    Object.defineProperties( Module.prototype, prototypeAccessors$1 );

    var ModuleCollection = function ModuleCollection (rawRootModule) {
      // register root module (Vuex.Store options)
      this.register([], rawRootModule, false);
    };

    ModuleCollection.prototype.get = function get (path) {
      return path.reduce(function (module, key) {
        return module.getChild(key)
      }, this.root)
    };

    ModuleCollection.prototype.getNamespace = function getNamespace (path) {
      var module = this.root;
      return path.reduce(function (namespace, key) {
        module = module.getChild(key);
        return namespace + (module.namespaced ? key + '/' : '')
      }, '')
    };

    ModuleCollection.prototype.update = function update$1 (rawRootModule) {
      update([], this.root, rawRootModule);
    };

    ModuleCollection.prototype.register = function register (path, rawModule, runtime) {
        var this$1 = this;
        if ( runtime === void 0 ) runtime = true;

      if (process.env.NODE_ENV !== 'production') {
        assertRawModule(path, rawModule);
      }

      var newModule = new Module(rawModule, runtime);
      if (path.length === 0) {
        this.root = newModule;
      } else {
        var parent = this.get(path.slice(0, -1));
        parent.addChild(path[path.length - 1], newModule);
      }

      // register nested modules
      if (rawModule.modules) {
        forEachValue(rawModule.modules, function (rawChildModule, key) {
          this$1.register(path.concat(key), rawChildModule, runtime);
        });
      }
    };

    ModuleCollection.prototype.unregister = function unregister (path) {
      var parent = this.get(path.slice(0, -1));
      var key = path[path.length - 1];
      if (!parent.getChild(key).runtime) { return }

      parent.removeChild(key);
    };

    function update (path, targetModule, newModule) {
      if (process.env.NODE_ENV !== 'production') {
        assertRawModule(path, newModule);
      }

      // update target module
      targetModule.update(newModule);

      // update nested modules
      if (newModule.modules) {
        for (var key in newModule.modules) {
          if (!targetModule.getChild(key)) {
            if (process.env.NODE_ENV !== 'production') {
              console.warn(
                "[vuex] trying to add a new module '" + key + "' on hot reloading, " +
                'manual reload is needed'
              );
            }
            return
          }
          update(
            path.concat(key),
            targetModule.getChild(key),
            newModule.modules[key]
          );
        }
      }
    }

    var functionAssert = {
      assert: function (value) { return typeof value === 'function'; },
      expected: 'function'
    };

    var objectAssert = {
      assert: function (value) { return typeof value === 'function' ||
        (typeof value === 'object' && typeof value.handler === 'function'); },
      expected: 'function or object with "handler" function'
    };

    var assertTypes = {
      getters: functionAssert,
      mutations: functionAssert,
      actions: objectAssert
    };

    function assertRawModule (path, rawModule) {
      Object.keys(assertTypes).forEach(function (key) {
        if (!rawModule[key]) { return }

        var assertOptions = assertTypes[key];

        forEachValue(rawModule[key], function (value, type) {
          assert(
            assertOptions.assert(value),
            makeAssertionMessage(path, key, type, value, assertOptions.expected)
          );
        });
      });
    }

    function makeAssertionMessage (path, key, type, value, expected) {
      var buf = key + " should be " + expected + " but \"" + key + "." + type + "\"";
      if (path.length > 0) {
        buf += " in module \"" + (path.join('.')) + "\"";
      }
      buf += " is " + (JSON.stringify(value)) + ".";
      return buf
    }

    var Vue$2; // bind on install

    var Store = function Store (options) {
      var this$1 = this;
      if ( options === void 0 ) options = {};

      // Auto install if it is not done yet and `window` has `Vue`.
      // To allow users to avoid auto-installation in some cases,
      // this code should be placed here. See #731
      if (!Vue$2 && typeof window !== 'undefined' && window.Vue) {
        install(window.Vue);
      }

      if (process.env.NODE_ENV !== 'production') {
        assert(Vue$2, "must call Vue.use(Vuex) before creating a store instance.");
        assert(typeof Promise !== 'undefined', "vuex requires a Promise polyfill in this browser.");
        assert(this instanceof Store, "Store must be called with the new operator.");
      }

      var plugins = options.plugins; if ( plugins === void 0 ) plugins = [];
      var strict = options.strict; if ( strict === void 0 ) strict = false;

      var state = options.state; if ( state === void 0 ) state = {};
      if (typeof state === 'function') {
        state = state() || {};
      }

      // store internal state
      this._committing = false;
      this._actions = Object.create(null);
      this._actionSubscribers = [];
      this._mutations = Object.create(null);
      this._wrappedGetters = Object.create(null);
      this._modules = new ModuleCollection(options);
      this._modulesNamespaceMap = Object.create(null);
      this._subscribers = [];
      this._watcherVM = new Vue$2();

      // bind commit and dispatch to self
      var store = this;
      var ref = this;
      var dispatch = ref.dispatch;
      var commit = ref.commit;
      this.dispatch = function boundDispatch (type, payload) {
        return dispatch.call(store, type, payload)
      };
      this.commit = function boundCommit (type, payload, options) {
        return commit.call(store, type, payload, options)
      };

      // strict mode
      this.strict = strict;

      // init root module.
      // this also recursively registers all sub-modules
      // and collects all module getters inside this._wrappedGetters
      installModule(this, state, [], this._modules.root);

      // initialize the store vm, which is responsible for the reactivity
      // (also registers _wrappedGetters as computed properties)
      resetStoreVM(this, state);

      // apply plugins
      plugins.forEach(function (plugin) { return plugin(this$1); });

      if (Vue$2.config.devtools) {
        devtoolPlugin(this);
      }
    };

    var prototypeAccessors = { state: { configurable: true } };

    prototypeAccessors.state.get = function () {
      return this._vm._data.$$state
    };

    prototypeAccessors.state.set = function (v) {
      if (process.env.NODE_ENV !== 'production') {
        assert(false, "Use store.replaceState() to explicit replace store state.");
      }
    };

    Store.prototype.commit = function commit (_type, _payload, _options) {
        var this$1 = this;

      // check object-style commit
      var ref = unifyObjectStyle(_type, _payload, _options);
        var type = ref.type;
        var payload = ref.payload;
        var options = ref.options;

      var mutation = { type: type, payload: payload };
      var entry = this._mutations[type];
      if (!entry) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(("[vuex] unknown mutation type: " + type));
        }
        return
      }
      this._withCommit(function () {
        entry.forEach(function commitIterator (handler) {
          handler(payload);
        });
      });
      this._subscribers.forEach(function (sub) { return sub(mutation, this$1.state); });

      if (
        process.env.NODE_ENV !== 'production' &&
        options && options.silent
      ) {
        console.warn(
          "[vuex] mutation type: " + type + ". Silent option has been removed. " +
          'Use the filter functionality in the vue-devtools'
        );
      }
    };

    Store.prototype.dispatch = function dispatch (_type, _payload) {
        var this$1 = this;

      // check object-style dispatch
      var ref = unifyObjectStyle(_type, _payload);
        var type = ref.type;
        var payload = ref.payload;

      var action = { type: type, payload: payload };
      var entry = this._actions[type];
      if (!entry) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(("[vuex] unknown action type: " + type));
        }
        return
      }

      this._actionSubscribers.forEach(function (sub) { return sub(action, this$1.state); });

      return entry.length > 1
        ? Promise.all(entry.map(function (handler) { return handler(payload); }))
        : entry[0](payload)
    };

    Store.prototype.subscribe = function subscribe (fn) {
      return genericSubscribe(fn, this._subscribers)
    };

    Store.prototype.subscribeAction = function subscribeAction (fn) {
      return genericSubscribe(fn, this._actionSubscribers)
    };

    Store.prototype.watch = function watch (getter, cb, options) {
        var this$1 = this;

      if (process.env.NODE_ENV !== 'production') {
        assert(typeof getter === 'function', "store.watch only accepts a function.");
      }
      return this._watcherVM.$watch(function () { return getter(this$1.state, this$1.getters); }, cb, options)
    };

    Store.prototype.replaceState = function replaceState (state) {
        var this$1 = this;

      this._withCommit(function () {
        this$1._vm._data.$$state = state;
      });
    };

    Store.prototype.registerModule = function registerModule (path, rawModule, options) {
        if ( options === void 0 ) options = {};

      if (typeof path === 'string') { path = [path]; }

      if (process.env.NODE_ENV !== 'production') {
        assert(Array.isArray(path), "module path must be a string or an Array.");
        assert(path.length > 0, 'cannot register the root module by using registerModule.');
      }

      this._modules.register(path, rawModule);
      installModule(this, this.state, path, this._modules.get(path), options.preserveState);
      // reset store to update getters...
      resetStoreVM(this, this.state);
    };

    Store.prototype.unregisterModule = function unregisterModule (path) {
        var this$1 = this;

      if (typeof path === 'string') { path = [path]; }

      if (process.env.NODE_ENV !== 'production') {
        assert(Array.isArray(path), "module path must be a string or an Array.");
      }

      this._modules.unregister(path);
      this._withCommit(function () {
        var parentState = getNestedState(this$1.state, path.slice(0, -1));
        Vue$2.delete(parentState, path[path.length - 1]);
      });
      resetStore(this);
    };

    Store.prototype.hotUpdate = function hotUpdate (newOptions) {
      this._modules.update(newOptions);
      resetStore(this, true);
    };

    Store.prototype._withCommit = function _withCommit (fn) {
      var committing = this._committing;
      this._committing = true;
      fn();
      this._committing = committing;
    };

    Object.defineProperties( Store.prototype, prototypeAccessors );

    function genericSubscribe (fn, subs) {
      if (subs.indexOf(fn) < 0) {
        subs.push(fn);
      }
      return function () {
        var i = subs.indexOf(fn);
        if (i > -1) {
          subs.splice(i, 1);
        }
      }
    }

    function resetStore (store, hot) {
      store._actions = Object.create(null);
      store._mutations = Object.create(null);
      store._wrappedGetters = Object.create(null);
      store._modulesNamespaceMap = Object.create(null);
      var state = store.state;
      // init all modules
      installModule(store, state, [], store._modules.root, true);
      // reset vm
      resetStoreVM(store, state, hot);
    }

    function resetStoreVM (store, state, hot) {
      var oldVm = store._vm;

      // bind store public getters
      store.getters = {};
      var wrappedGetters = store._wrappedGetters;
      var computed = {};
      forEachValue(wrappedGetters, function (fn, key) {
        // use computed to leverage its lazy-caching mechanism
        computed[key] = function () { return fn(store); };
        Object.defineProperty(store.getters, key, {
          get: function () { return store._vm[key]; },
          enumerable: true // for local getters
        });
      });

      // use a Vue instance to store the state tree
      // suppress warnings just in case the user has added
      // some funky global mixins
      var silent = Vue$2.config.silent;
      Vue$2.config.silent = true;
      store._vm = new Vue$2({
        data: {
          $$state: state
        },
        computed: computed
      });
      Vue$2.config.silent = silent;

      // enable strict mode for new vm
      if (store.strict) {
        enableStrictMode(store);
      }

      if (oldVm) {
        if (hot) {
          // dispatch changes in all subscribed watchers
          // to force getter re-evaluation for hot reloading.
          store._withCommit(function () {
            oldVm._data.$$state = null;
          });
        }
        Vue$2.nextTick(function () { return oldVm.$destroy(); });
      }
    }

    function installModule (store, rootState, path, module, hot) {
      var isRoot = !path.length;
      var namespace = store._modules.getNamespace(path);

      // register in namespace map
      if (module.namespaced) {
        store._modulesNamespaceMap[namespace] = module;
      }

      // set state
      if (!isRoot && !hot) {
        var parentState = getNestedState(rootState, path.slice(0, -1));
        var moduleName = path[path.length - 1];
        store._withCommit(function () {
          Vue$2.set(parentState, moduleName, module.state);
        });
      }

      var local = module.context = makeLocalContext(store, namespace, path);

      module.forEachMutation(function (mutation, key) {
        var namespacedType = namespace + key;
        registerMutation(store, namespacedType, mutation, local);
      });

      module.forEachAction(function (action, key) {
        var type = action.root ? key : namespace + key;
        var handler = action.handler || action;
        registerAction(store, type, handler, local);
      });

      module.forEachGetter(function (getter, key) {
        var namespacedType = namespace + key;
        registerGetter(store, namespacedType, getter, local);
      });

      module.forEachChild(function (child, key) {
        installModule(store, rootState, path.concat(key), child, hot);
      });
    }

    /**
     * make localized dispatch, commit, getters and state
     * if there is no namespace, just use root ones
     */
    function makeLocalContext (store, namespace, path) {
      var noNamespace = namespace === '';

      var local = {
        dispatch: noNamespace ? store.dispatch : function (_type, _payload, _options) {
          var args = unifyObjectStyle(_type, _payload, _options);
          var payload = args.payload;
          var options = args.options;
          var type = args.type;

          if (!options || !options.root) {
            type = namespace + type;
            if (process.env.NODE_ENV !== 'production' && !store._actions[type]) {
              console.error(("[vuex] unknown local action type: " + (args.type) + ", global type: " + type));
              return
            }
          }

          return store.dispatch(type, payload)
        },

        commit: noNamespace ? store.commit : function (_type, _payload, _options) {
          var args = unifyObjectStyle(_type, _payload, _options);
          var payload = args.payload;
          var options = args.options;
          var type = args.type;

          if (!options || !options.root) {
            type = namespace + type;
            if (process.env.NODE_ENV !== 'production' && !store._mutations[type]) {
              console.error(("[vuex] unknown local mutation type: " + (args.type) + ", global type: " + type));
              return
            }
          }

          store.commit(type, payload, options);
        }
      };

      // getters and state object must be gotten lazily
      // because they will be changed by vm update
      Object.defineProperties(local, {
        getters: {
          get: noNamespace
            ? function () { return store.getters; }
            : function () { return makeLocalGetters(store, namespace); }
        },
        state: {
          get: function () { return getNestedState(store.state, path); }
        }
      });

      return local
    }

    function makeLocalGetters (store, namespace) {
      var gettersProxy = {};

      var splitPos = namespace.length;
      Object.keys(store.getters).forEach(function (type) {
        // skip if the target getter is not match this namespace
        if (type.slice(0, splitPos) !== namespace) { return }

        // extract local getter type
        var localType = type.slice(splitPos);

        // Add a port to the getters proxy.
        // Define as getter property because
        // we do not want to evaluate the getters in this time.
        Object.defineProperty(gettersProxy, localType, {
          get: function () { return store.getters[type]; },
          enumerable: true
        });
      });

      return gettersProxy
    }

    function registerMutation (store, type, handler, local) {
      var entry = store._mutations[type] || (store._mutations[type] = []);
      entry.push(function wrappedMutationHandler (payload) {
        handler.call(store, local.state, payload);
      });
    }

    function registerAction (store, type, handler, local) {
      var entry = store._actions[type] || (store._actions[type] = []);
      entry.push(function wrappedActionHandler (payload, cb) {
        var res = handler.call(store, {
          dispatch: local.dispatch,
          commit: local.commit,
          getters: local.getters,
          state: local.state,
          rootGetters: store.getters,
          rootState: store.state
        }, payload, cb);
        if (!isPromise(res)) {
          res = Promise.resolve(res);
        }
        if (store._devtoolHook) {
          return res.catch(function (err) {
            store._devtoolHook.emit('vuex:error', err);
            throw err
          })
        } else {
          return res
        }
      });
    }

    function registerGetter (store, type, rawGetter, local) {
      if (store._wrappedGetters[type]) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(("[vuex] duplicate getter key: " + type));
        }
        return
      }
      store._wrappedGetters[type] = function wrappedGetter (store) {
        return rawGetter(
          local.state, // local state
          local.getters, // local getters
          store.state, // root state
          store.getters // root getters
        )
      };
    }

    function enableStrictMode (store) {
      store._vm.$watch(function () { return this._data.$$state }, function () {
        if (process.env.NODE_ENV !== 'production') {
          assert(store._committing, "Do not mutate vuex store state outside mutation handlers.");
        }
      }, { deep: true, sync: true });
    }

    function getNestedState (state, path) {
      return path.length
        ? path.reduce(function (state, key) { return state[key]; }, state)
        : state
    }

    function unifyObjectStyle (type, payload, options) {
      if (isObject$1(type) && type.type) {
        options = payload;
        payload = type;
        type = type.type;
      }

      if (process.env.NODE_ENV !== 'production') {
        assert(typeof type === 'string', ("Expects string as the type, but found " + (typeof type) + "."));
      }

      return { type: type, payload: payload, options: options }
    }

    function install (_Vue) {
      if (Vue$2 && _Vue === Vue$2) {
        if (process.env.NODE_ENV !== 'production') {
          console.error(
            '[vuex] already installed. Vue.use(Vuex) should be called only once.'
          );
        }
        return
      }
      Vue$2 = _Vue;
      applyMixin(Vue$2);
    }

    var mapState = normalizeNamespace(function (namespace, states) {
      var res = {};
      normalizeMap(states).forEach(function (ref) {
        var key = ref.key;
        var val = ref.val;

        res[key] = function mappedState () {
          var state = this.$store.state;
          var getters = this.$store.getters;
          if (namespace) {
            var module = getModuleByNamespace(this.$store, 'mapState', namespace);
            if (!module) {
              return
            }
            state = module.context.state;
            getters = module.context.getters;
          }
          return typeof val === 'function'
            ? val.call(this, state, getters)
            : state[val]
        };
        // mark vuex getter for devtools
        res[key].vuex = true;
      });
      return res
    });

    var mapMutations = normalizeNamespace(function (namespace, mutations) {
      var res = {};
      normalizeMap(mutations).forEach(function (ref) {
        var key = ref.key;
        var val = ref.val;

        res[key] = function mappedMutation () {
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          var commit = this.$store.commit;
          if (namespace) {
            var module = getModuleByNamespace(this.$store, 'mapMutations', namespace);
            if (!module) {
              return
            }
            commit = module.context.commit;
          }
          return typeof val === 'function'
            ? val.apply(this, [commit].concat(args))
            : commit.apply(this.$store, [val].concat(args))
        };
      });
      return res
    });

    var mapGetters = normalizeNamespace(function (namespace, getters) {
      var res = {};
      normalizeMap(getters).forEach(function (ref) {
        var key = ref.key;
        var val = ref.val;

        val = namespace + val;
        res[key] = function mappedGetter () {
          if (namespace && !getModuleByNamespace(this.$store, 'mapGetters', namespace)) {
            return
          }
          if (process.env.NODE_ENV !== 'production' && !(val in this.$store.getters)) {
            console.error(("[vuex] unknown getter: " + val));
            return
          }
          return this.$store.getters[val]
        };
        // mark vuex getter for devtools
        res[key].vuex = true;
      });
      return res
    });

    var mapActions = normalizeNamespace(function (namespace, actions) {
      var res = {};
      normalizeMap(actions).forEach(function (ref) {
        var key = ref.key;
        var val = ref.val;

        res[key] = function mappedAction () {
          var args = [], len = arguments.length;
          while ( len-- ) args[ len ] = arguments[ len ];

          var dispatch = this.$store.dispatch;
          if (namespace) {
            var module = getModuleByNamespace(this.$store, 'mapActions', namespace);
            if (!module) {
              return
            }
            dispatch = module.context.dispatch;
          }
          return typeof val === 'function'
            ? val.apply(this, [dispatch].concat(args))
            : dispatch.apply(this.$store, [val].concat(args))
        };
      });
      return res
    });

    var createNamespacedHelpers = function (namespace) { return ({
      mapState: mapState.bind(null, namespace),
      mapGetters: mapGetters.bind(null, namespace),
      mapMutations: mapMutations.bind(null, namespace),
      mapActions: mapActions.bind(null, namespace)
    }); };

    function normalizeMap (map) {
      return Array.isArray(map)
        ? map.map(function (key) { return ({ key: key, val: key }); })
        : Object.keys(map).map(function (key) { return ({ key: key, val: map[key] }); })
    }

    function normalizeNamespace (fn) {
      return function (namespace, map) {
        if (typeof namespace !== 'string') {
          map = namespace;
          namespace = '';
        } else if (namespace.charAt(namespace.length - 1) !== '/') {
          namespace += '/';
        }
        return fn(namespace, map)
      }
    }

    function getModuleByNamespace (store, helper, namespace) {
      var module = store._modulesNamespaceMap[namespace];
      if (process.env.NODE_ENV !== 'production' && !module) {
        console.error(("[vuex] module namespace not found in " + helper + "(): " + namespace));
      }
      return module
    }

    var index_esm = {
      Store: Store,
      install: install,
      version: '3.0.1',
      mapState: mapState,
      mapMutations: mapMutations,
      mapGetters: mapGetters,
      mapActions: mapActions,
      createNamespacedHelpers: createNamespacedHelpers
    };

    /**
     * Search for results in global index.
     */
    let doSearchGlobal = (context, data) => {
      let options = {
        params: {
          _format: 'json',
          text: data,
        },
      };

      return Vue.http.get('/api/search/global', options)
        .then(
          response => {
            return response.body;
          },
          response => {
            console.log(response);
          });
    };

    var actions = {
      doSearchGlobal,
    };

    var getters = {};

    var mutations = {};

    const state = {

    };

    var api = {
      namespaced: true,
      state,
      actions,
      getters,
      mutations,
    };

    Vue$1.use(index_esm);

    var Store$1 = new index_esm.Store({
      modules: {
        api,
      },
    });

    let clickOutside = {
      bind: function(el, binding, vnode) {
        binding.event = function(event) {
          if (!(el == event.target || el.contains(event.target))) {
            vnode.context[binding.expression](event);
          }
        };
        document.body.addEventListener('click', binding.event);
      },
      unbind: function(el, binding) {
        document.body.removeEventListener('click', binding.event);
      },
    };

    var Plugins = {
      install(Vue) {
        Vue.directive('click-outside', clickOutside);
      },
    };

    /**
     * Checks if `value` is the
     * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
     * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is an object, else `false`.
     * @example
     *
     * _.isObject({});
     * // => true
     *
     * _.isObject([1, 2, 3]);
     * // => true
     *
     * _.isObject(_.noop);
     * // => true
     *
     * _.isObject(null);
     * // => false
     */
    function isObject$2(value) {
      var type = typeof value;
      return value != null && (type == 'object' || type == 'function');
    }

    /** Detect free variable `global` from Node.js. */
    var freeGlobal = typeof global$1 == 'object' && global$1 && global$1.Object === Object && global$1;

    /** Detect free variable `self`. */
    var freeSelf = typeof self == 'object' && self && self.Object === Object && self;

    /** Used as a reference to the global object. */
    var root$1 = freeGlobal || freeSelf || Function('return this')();

    /**
     * Gets the timestamp of the number of milliseconds that have elapsed since
     * the Unix epoch (1 January 1970 00:00:00 UTC).
     *
     * @static
     * @memberOf _
     * @since 2.4.0
     * @category Date
     * @returns {number} Returns the timestamp.
     * @example
     *
     * _.defer(function(stamp) {
     *   console.log(_.now() - stamp);
     * }, _.now());
     * // => Logs the number of milliseconds it took for the deferred invocation.
     */
    var now = function() {
      return root$1.Date.now();
    };

    /** Built-in value references. */
    var Symbol$1 = root$1.Symbol;

    /** Used for built-in method references. */
    var objectProto = Object.prototype;

    /** Used to check objects for own properties. */
    var hasOwnProperty$1 = objectProto.hasOwnProperty;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString = objectProto.toString;

    /** Built-in value references. */
    var symToStringTag = Symbol$1 ? Symbol$1.toStringTag : undefined;

    /**
     * A specialized version of `baseGetTag` which ignores `Symbol.toStringTag` values.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the raw `toStringTag`.
     */
    function getRawTag(value) {
      var isOwn = hasOwnProperty$1.call(value, symToStringTag),
          tag = value[symToStringTag];

      try {
        value[symToStringTag] = undefined;
      } catch (e) {}

      var result = nativeObjectToString.call(value);
      {
        if (isOwn) {
          value[symToStringTag] = tag;
        } else {
          delete value[symToStringTag];
        }
      }
      return result;
    }

    /** Used for built-in method references. */
    var objectProto$1 = Object.prototype;

    /**
     * Used to resolve the
     * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
     * of values.
     */
    var nativeObjectToString$1 = objectProto$1.toString;

    /**
     * Converts `value` to a string using `Object.prototype.toString`.
     *
     * @private
     * @param {*} value The value to convert.
     * @returns {string} Returns the converted string.
     */
    function objectToString(value) {
      return nativeObjectToString$1.call(value);
    }

    /** `Object#toString` result references. */
    var nullTag = '[object Null]',
        undefinedTag = '[object Undefined]';

    /** Built-in value references. */
    var symToStringTag$1 = Symbol$1 ? Symbol$1.toStringTag : undefined;

    /**
     * The base implementation of `getTag` without fallbacks for buggy environments.
     *
     * @private
     * @param {*} value The value to query.
     * @returns {string} Returns the `toStringTag`.
     */
    function baseGetTag(value) {
      if (value == null) {
        return value === undefined ? undefinedTag : nullTag;
      }
      return (symToStringTag$1 && symToStringTag$1 in Object(value))
        ? getRawTag(value)
        : objectToString(value);
    }

    /**
     * Checks if `value` is object-like. A value is object-like if it's not `null`
     * and has a `typeof` result of "object".
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
     * @example
     *
     * _.isObjectLike({});
     * // => true
     *
     * _.isObjectLike([1, 2, 3]);
     * // => true
     *
     * _.isObjectLike(_.noop);
     * // => false
     *
     * _.isObjectLike(null);
     * // => false
     */
    function isObjectLike(value) {
      return value != null && typeof value == 'object';
    }

    /** `Object#toString` result references. */
    var symbolTag = '[object Symbol]';

    /**
     * Checks if `value` is classified as a `Symbol` primitive or object.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to check.
     * @returns {boolean} Returns `true` if `value` is a symbol, else `false`.
     * @example
     *
     * _.isSymbol(Symbol.iterator);
     * // => true
     *
     * _.isSymbol('abc');
     * // => false
     */
    function isSymbol(value) {
      return typeof value == 'symbol' ||
        (isObjectLike(value) && baseGetTag(value) == symbolTag);
    }

    /** Used as references for various `Number` constants. */
    var NAN = 0 / 0;

    /** Used to match leading and trailing whitespace. */
    var reTrim = /^\s+|\s+$/g;

    /** Used to detect bad signed hexadecimal string values. */
    var reIsBadHex = /^[-+]0x[0-9a-f]+$/i;

    /** Used to detect binary string values. */
    var reIsBinary = /^0b[01]+$/i;

    /** Used to detect octal string values. */
    var reIsOctal = /^0o[0-7]+$/i;

    /** Built-in method references without a dependency on `root`. */
    var freeParseInt = parseInt;

    /**
     * Converts `value` to a number.
     *
     * @static
     * @memberOf _
     * @since 4.0.0
     * @category Lang
     * @param {*} value The value to process.
     * @returns {number} Returns the number.
     * @example
     *
     * _.toNumber(3.2);
     * // => 3.2
     *
     * _.toNumber(Number.MIN_VALUE);
     * // => 5e-324
     *
     * _.toNumber(Infinity);
     * // => Infinity
     *
     * _.toNumber('3.2');
     * // => 3.2
     */
    function toNumber(value) {
      if (typeof value == 'number') {
        return value;
      }
      if (isSymbol(value)) {
        return NAN;
      }
      if (isObject$2(value)) {
        var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
        value = isObject$2(other) ? (other + '') : other;
      }
      if (typeof value != 'string') {
        return value === 0 ? value : +value;
      }
      value = value.replace(reTrim, '');
      var isBinary = reIsBinary.test(value);
      return (isBinary || reIsOctal.test(value))
        ? freeParseInt(value.slice(2), isBinary ? 2 : 8)
        : (reIsBadHex.test(value) ? NAN : +value);
    }

    /** Error message constants. */
    var FUNC_ERROR_TEXT = 'Expected a function';

    /* Built-in method references for those with the same name as other `lodash` methods. */
    var nativeMax = Math.max,
        nativeMin = Math.min;

    /**
     * Creates a debounced function that delays invoking `func` until after `wait`
     * milliseconds have elapsed since the last time the debounced function was
     * invoked. The debounced function comes with a `cancel` method to cancel
     * delayed `func` invocations and a `flush` method to immediately invoke them.
     * Provide `options` to indicate whether `func` should be invoked on the
     * leading and/or trailing edge of the `wait` timeout. The `func` is invoked
     * with the last arguments provided to the debounced function. Subsequent
     * calls to the debounced function return the result of the last `func`
     * invocation.
     *
     * **Note:** If `leading` and `trailing` options are `true`, `func` is
     * invoked on the trailing edge of the timeout only if the debounced function
     * is invoked more than once during the `wait` timeout.
     *
     * If `wait` is `0` and `leading` is `false`, `func` invocation is deferred
     * until to the next tick, similar to `setTimeout` with a timeout of `0`.
     *
     * See [David Corbacho's article](https://css-tricks.com/debouncing-throttling-explained-examples/)
     * for details over the differences between `_.debounce` and `_.throttle`.
     *
     * @static
     * @memberOf _
     * @since 0.1.0
     * @category Function
     * @param {Function} func The function to debounce.
     * @param {number} [wait=0] The number of milliseconds to delay.
     * @param {Object} [options={}] The options object.
     * @param {boolean} [options.leading=false]
     *  Specify invoking on the leading edge of the timeout.
     * @param {number} [options.maxWait]
     *  The maximum time `func` is allowed to be delayed before it's invoked.
     * @param {boolean} [options.trailing=true]
     *  Specify invoking on the trailing edge of the timeout.
     * @returns {Function} Returns the new debounced function.
     * @example
     *
     * // Avoid costly calculations while the window size is in flux.
     * jQuery(window).on('resize', _.debounce(calculateLayout, 150));
     *
     * // Invoke `sendMail` when clicked, debouncing subsequent calls.
     * jQuery(element).on('click', _.debounce(sendMail, 300, {
     *   'leading': true,
     *   'trailing': false
     * }));
     *
     * // Ensure `batchLog` is invoked once after 1 second of debounced calls.
     * var debounced = _.debounce(batchLog, 250, { 'maxWait': 1000 });
     * var source = new EventSource('/stream');
     * jQuery(source).on('message', debounced);
     *
     * // Cancel the trailing debounced invocation.
     * jQuery(window).on('popstate', debounced.cancel);
     */
    function debounce(func, wait, options) {
      var lastArgs,
          lastThis,
          maxWait,
          result,
          timerId,
          lastCallTime,
          lastInvokeTime = 0,
          leading = false,
          maxing = false,
          trailing = true;

      if (typeof func != 'function') {
        throw new TypeError(FUNC_ERROR_TEXT);
      }
      wait = toNumber(wait) || 0;
      if (isObject$2(options)) {
        leading = !!options.leading;
        maxing = 'maxWait' in options;
        maxWait = maxing ? nativeMax(toNumber(options.maxWait) || 0, wait) : maxWait;
        trailing = 'trailing' in options ? !!options.trailing : trailing;
      }

      function invokeFunc(time) {
        var args = lastArgs,
            thisArg = lastThis;

        lastArgs = lastThis = undefined;
        lastInvokeTime = time;
        result = func.apply(thisArg, args);
        return result;
      }

      function leadingEdge(time) {
        // Reset any `maxWait` timer.
        lastInvokeTime = time;
        // Start the timer for the trailing edge.
        timerId = setTimeout(timerExpired, wait);
        // Invoke the leading edge.
        return leading ? invokeFunc(time) : result;
      }

      function remainingWait(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime,
            timeWaiting = wait - timeSinceLastCall;

        return maxing
          ? nativeMin(timeWaiting, maxWait - timeSinceLastInvoke)
          : timeWaiting;
      }

      function shouldInvoke(time) {
        var timeSinceLastCall = time - lastCallTime,
            timeSinceLastInvoke = time - lastInvokeTime;

        // Either this is the first call, activity has stopped and we're at the
        // trailing edge, the system time has gone backwards and we're treating
        // it as the trailing edge, or we've hit the `maxWait` limit.
        return (lastCallTime === undefined || (timeSinceLastCall >= wait) ||
          (timeSinceLastCall < 0) || (maxing && timeSinceLastInvoke >= maxWait));
      }

      function timerExpired() {
        var time = now();
        if (shouldInvoke(time)) {
          return trailingEdge(time);
        }
        // Restart the timer.
        timerId = setTimeout(timerExpired, remainingWait(time));
      }

      function trailingEdge(time) {
        timerId = undefined;

        // Only invoke if we have `lastArgs` which means `func` has been
        // debounced at least once.
        if (trailing && lastArgs) {
          return invokeFunc(time);
        }
        lastArgs = lastThis = undefined;
        return result;
      }

      function cancel() {
        if (timerId !== undefined) {
          clearTimeout(timerId);
        }
        lastInvokeTime = 0;
        lastArgs = lastCallTime = lastThis = timerId = undefined;
      }

      function flush() {
        return timerId === undefined ? result : trailingEdge(now());
      }

      function debounced() {
        var time = now(),
            isInvoking = shouldInvoke(time);

        lastArgs = arguments;
        lastThis = this;
        lastCallTime = time;

        if (isInvoking) {
          if (timerId === undefined) {
            return leadingEdge(lastCallTime);
          }
          if (maxing) {
            // Handle invocations in a tight loop.
            timerId = setTimeout(timerExpired, wait);
            return invokeFunc(lastCallTime);
          }
        }
        if (timerId === undefined) {
          timerId = setTimeout(timerExpired, wait);
        }
        return result;
      }
      debounced.cancel = cancel;
      debounced.flush = flush;
      return debounced;
    }

    //

    var script = {
      data() {
        return {
          text: '',
          searchResults: {},
          resultsHidden: false,
        };
      },

      watch: {
        text(newValue, oldValue) {
          if (newValue.length > 2) {
            this.$store.dispatch('api/doSearchGlobal', newValue)
              .then(result => this.searchResults = result.items);
          }
          else {
            this.searchResults = {};
          }
        },
      },

      methods: {
        onTextInput: debounce(function(e) {
          this.text = e.target.value;
        }, 300),

        onTextFocus: function(e) {
          this.resultsHidden = false;
        },

        onButtonClick: function() {
          let url = new URL('/search', window.location.origin);
          url.searchParams.append('text', this.text);
          window.location.href = url.href;
        },

        onClickOutside: function(event) {
          this.resultsHidden = true;
        },
      },
    };

    /* script */
                const __vue_script__ = script;
                
    /* template */
    var __vue_render__ = function() {
      var _vm = this;
      var _h = _vm.$createElement;
      var _c = _vm._self._c || _h;
      return _c(
        "div",
        {
          directives: [
            {
              name: "click-outside",
              rawName: "v-click-outside",
              value: _vm.onClickOutside,
              expression: "onClickOutside"
            }
          ],
          staticClass: "frontpage-global-search"
        },
        [
          _c(
            "div",
            {
              staticClass: "frontpage-global-search__form",
              class: {
                "frontpage-global-search__form--has-results":
                  _vm.searchResults.length
              }
            },
            [
              _c("input", {
                staticClass: "frontpage-global-search__search-input",
                attrs: {
                  type: "text",
                  autocomplete: "off",
                  placeholder: "Поиск по материалам сайта"
                },
                on: {
                  input: _vm.onTextInput,
                  focus: _vm.onTextFocus,
                  keypress: function($event) {
                    if (
                      !("button" in $event) &&
                      _vm._k($event.keyCode, "enter", 13, $event.key, "Enter")
                    ) {
                      return null
                    }
                    return _vm.onButtonClick($event)
                  }
                }
              }),
              _vm._v(" "),
              _c(
                "button",
                {
                  staticClass: "frontpage-global-search__search-submit",
                  on: { click: _vm.onButtonClick }
                },
                [_vm._v("Поиск\n    ")]
              )
            ]
          ),
          _vm._v(" "),
          _vm.searchResults.length && !_vm.resultsHidden
            ? _c(
                "div",
                { staticClass: "frontpage-global-search__results" },
                _vm._l(_vm.searchResults, function(value) {
                  return _c(
                    "div",
                    { staticClass: "frontpage-global-search__result" },
                    [
                      _c("a", { attrs: { href: value.url } }, [
                        _vm._v(_vm._s(value.label))
                      ])
                    ]
                  )
                }),
                0
              )
            : _vm._e()
        ]
      )
    };
    var __vue_staticRenderFns__ = [];
    __vue_render__._withStripped = true;

      /* style */
      const __vue_inject_styles__ = function (inject) {
        if (!inject) return
        inject("data-v-5c1c3670_0", { source: ".frontpage-global-search[data-v-5c1c3670] {\n  position: relative;\n}\n.frontpage-global-search__search-input[data-v-5c1c3670] {\n    padding: 16px !important;\n    border-radius: 4px 0 0 4px !important;\n}\n.frontpage-global-search__search-submit[data-v-5c1c3670] {\n    color: white;\n    background-color: #3f5efb;\n    background-image: none;\n    border-color: transparent;\n    transition: all .15s ease-in-out;\n    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.125);\n    border-radius: 0 4px 4px 0;\n    padding: 0 32px;\n    text-transform: uppercase;\n    font-weight: bold;\n}\n.frontpage-global-search__form[data-v-5c1c3670] {\n    position: relative;\n    z-index: 50;\n    display: flex;\n    box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);\n}\n.frontpage-global-search__form--has-results[data-v-5c1c3670] {\n    box-shadow: none;\n}\n.frontpage-global-search__results[data-v-5c1c3670] {\n    position: absolute;\n    z-index: 40;\n    top: 54px;\n    width: 100%;\n    background-color: white;\n    border: 1px solid #cccccc;\n    border-radius: 0 0 4px 4px;\n    box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);\n}\n.frontpage-global-search__result[data-v-5c1c3670] {\n    padding: 8px 16px;\n    border-bottom: 1px solid #cccccc;\n}\n.frontpage-global-search__result[data-v-5c1c3670]:hover {\n      background-color: #3f5efb;\n}\n.frontpage-global-search__result:hover a[data-v-5c1c3670] {\n        color: white;\n}\n.frontpage-global-search__result[data-v-5c1c3670]:last-child {\n      border-bottom: unset;\n}\n@media (max-width: 751px) {\n.frontpage-global-search__search-submit[data-v-5c1c3670] {\n      padding: 0 8px;\n      font-size: 18px;\n      width: 130px;\n}\n}\n\n/*# sourceMappingURL=FrontpageGlobalSearch.vue.map */", map: {"version":3,"sources":["/home/nikita/Projects/local/dlog.niklan.net/code/web/modules/custom/dlog_vue/assets/js/src/components/FrontpageGlobalSearch.vue","FrontpageGlobalSearch.vue"],"names":[],"mappings":"AAyEA;EACA,mBAAA;CAkEA;AAhEA;IACA,yBAAA;IACA,sCAAA;CACA;AAEA;IACA,aAAA;IACA,0BAAA;IACA,uBAAA;IACA,0BAAA;IACA,iCAAA;IACA,2CAAA;IACA,2BAAA;IACA,gBAAA;IACA,0BAAA;IACA,kBAAA;CACA;AAEA;IACA,mBAAA;IACA,YAAA;IACA,cAAA;IACA,wCAAA;CACA;AAEA;IACA,iBAAA;CACA;AAEA;IACA,mBAAA;IACA,YAAA;IACA,UAAA;IACA,YAAA;IACA,wBAAA;IACA,0BAAA;IACA,2BAAA;IACA,wCAAA;CACA;AAEA;IACA,kBAAA;IACA,iCAAA;CAaA;AAfA;MAKA,0BAAA;CAKA;AAVA;QAQA,aAAA;CACA;AATA;MAaA,qBAAA;CACA;AAGA;AACA;MACA,eAAA;MACA,gBAAA;MACA,aAAA;CACA;CAAA;;AC3FA,qDAAqD","file":"FrontpageGlobalSearch.vue","sourcesContent":[null,".frontpage-global-search {\n  position: relative; }\n  .frontpage-global-search__search-input {\n    padding: 16px !important;\n    border-radius: 4px 0 0 4px !important; }\n  .frontpage-global-search__search-submit {\n    color: white;\n    background-color: #3f5efb;\n    background-image: none;\n    border-color: transparent;\n    transition: all .15s ease-in-out;\n    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.125);\n    border-radius: 0 4px 4px 0;\n    padding: 0 32px;\n    text-transform: uppercase;\n    font-weight: bold; }\n  .frontpage-global-search__form {\n    position: relative;\n    z-index: 50;\n    display: flex;\n    box-shadow: 0 0 50px rgba(0, 0, 0, 0.2); }\n  .frontpage-global-search__form--has-results {\n    box-shadow: none; }\n  .frontpage-global-search__results {\n    position: absolute;\n    z-index: 40;\n    top: 54px;\n    width: 100%;\n    background-color: white;\n    border: 1px solid #cccccc;\n    border-radius: 0 0 4px 4px;\n    box-shadow: 0 0 50px rgba(0, 0, 0, 0.2); }\n  .frontpage-global-search__result {\n    padding: 8px 16px;\n    border-bottom: 1px solid #cccccc; }\n    .frontpage-global-search__result:hover {\n      background-color: #3f5efb; }\n      .frontpage-global-search__result:hover a {\n        color: white; }\n    .frontpage-global-search__result:last-child {\n      border-bottom: unset; }\n  @media (max-width: 751px) {\n    .frontpage-global-search__search-submit {\n      padding: 0 8px;\n      font-size: 18px;\n      width: 130px; } }\n\n/*# sourceMappingURL=FrontpageGlobalSearch.vue.map */"]}, media: undefined });

      };
      /* scoped */
      const __vue_scope_id__ = "data-v-5c1c3670";
      /* module identifier */
      const __vue_module_identifier__ = undefined;
      /* functional template */
      const __vue_is_functional_template__ = false;
      /* component normalizer */
      function __vue_normalize__(
        template, style, script$$1,
        scope, functional, moduleIdentifier,
        createInjector, createInjectorSSR
      ) {
        const component = (typeof script$$1 === 'function' ? script$$1.options : script$$1) || {};

        // For security concerns, we use only base name in production mode.
        component.__file = "/home/nikita/Projects/local/dlog.niklan.net/code/web/modules/custom/dlog_vue/assets/js/src/components/FrontpageGlobalSearch.vue";

        if (!component.render) {
          component.render = template.render;
          component.staticRenderFns = template.staticRenderFns;
          component._compiled = true;

          if (functional) component.functional = true;
        }

        component._scopeId = scope;

        {
          let hook;
          if (style) {
            hook = function(context) {
              style.call(this, createInjector(context));
            };
          }

          if (hook !== undefined) {
            if (component.functional) {
              // register for functional component in vue file
              const originalRender = component.render;
              component.render = function renderWithStyleInjection(h, context) {
                hook.call(context);
                return originalRender(h, context)
              };
            } else {
              // inject component registration as beforeCreate hook
              const existing = component.beforeCreate;
              component.beforeCreate = existing ? [].concat(existing, hook) : [hook];
            }
          }
        }

        return component
      }
      /* style inject */
      function __vue_create_injector__() {
        const head = document.head || document.getElementsByTagName('head')[0];
        const styles = __vue_create_injector__.styles || (__vue_create_injector__.styles = {});
        const isOldIE =
          typeof navigator !== 'undefined' &&
          /msie [6-9]\\b/.test(navigator.userAgent.toLowerCase());

        return function addStyle(id, css) {
          if (document.querySelector('style[data-vue-ssr-id~="' + id + '"]')) return // SSR styles are present.

          const group = isOldIE ? css.media || 'default' : id;
          const style = styles[group] || (styles[group] = { ids: [], parts: [], element: undefined });

          if (!style.ids.includes(id)) {
            let code = css.source;
            let index = style.ids.length;

            style.ids.push(id);

            if (isOldIE) {
              style.element = style.element || document.querySelector('style[data-group=' + group + ']');
            }

            if (!style.element) {
              const el = style.element = document.createElement('style');
              el.type = 'text/css';

              if (css.media) el.setAttribute('media', css.media);
              if (isOldIE) {
                el.setAttribute('data-group', group);
                el.setAttribute('data-next-index', '0');
              }

              head.appendChild(el);
            }

            if (isOldIE) {
              index = parseInt(style.element.getAttribute('data-next-index'));
              style.element.setAttribute('data-next-index', index + 1);
            }

            if (style.element.styleSheet) {
              style.parts.push(code);
              style.element.styleSheet.cssText = style.parts
                .filter(Boolean)
                .join('\n');
            } else {
              const textNode = document.createTextNode(code);
              const nodes = style.element.childNodes;
              if (nodes[index]) style.element.removeChild(nodes[index]);
              if (nodes.length) style.element.insertBefore(textNode, nodes[index]);
              else style.element.appendChild(textNode);
            }
          }
        }
      }
      /* style inject SSR */
      

      
      var FrontpageGlobalSearch = __vue_normalize__(
        { render: __vue_render__, staticRenderFns: __vue_staticRenderFns__ },
        __vue_inject_styles__,
        __vue_script__,
        __vue_scope_id__,
        __vue_is_functional_template__,
        __vue_module_identifier__,
        __vue_create_injector__,
        undefined
      );

    Vue$1.use(plugin);
    Vue$1.use(VueWait);
    Vue$1.use(Plugins);

    new Vue$1({
      el: '#frontpage-global-search',
      render(h) {
        return h(FrontpageGlobalSearch);
      },
      store: Store$1,
      wait: new VueWait({
        useVuex: true,
      }),
    });

}(Vue));
