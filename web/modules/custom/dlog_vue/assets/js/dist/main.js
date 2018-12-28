(function () {
            'use strict';

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
            function nextTick(fun) {
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
              nextTick: nextTick,
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

            /*!
             * Vue.js v2.5.21
             * (c) 2014-2018 Evan You
             * Released under the MIT License.
             */
            /*  */

            var emptyObject = Object.freeze({});

            // These helpers produce better VM code in JS engines due to their
            // explicitness and function inlining.
            function isUndef (v) {
              return v === undefined || v === null
            }

            function isDef (v) {
              return v !== undefined && v !== null
            }

            function isTrue (v) {
              return v === true
            }

            function isFalse (v) {
              return v === false
            }

            /**
             * Check if value is primitive.
             */
            function isPrimitive (value) {
              return (
                typeof value === 'string' ||
                typeof value === 'number' ||
                // $flow-disable-line
                typeof value === 'symbol' ||
                typeof value === 'boolean'
              )
            }

            /**
             * Quick object check - this is primarily used to tell
             * Objects from primitive values when we know the value
             * is a JSON-compliant type.
             */
            function isObject (obj) {
              return obj !== null && typeof obj === 'object'
            }

            /**
             * Get the raw type string of a value, e.g., [object Object].
             */
            var _toString = Object.prototype.toString;

            function toRawType (value) {
              return _toString.call(value).slice(8, -1)
            }

            /**
             * Strict object type check. Only returns true
             * for plain JavaScript objects.
             */
            function isPlainObject (obj) {
              return _toString.call(obj) === '[object Object]'
            }

            function isRegExp (v) {
              return _toString.call(v) === '[object RegExp]'
            }

            /**
             * Check if val is a valid array index.
             */
            function isValidArrayIndex (val) {
              var n = parseFloat(String(val));
              return n >= 0 && Math.floor(n) === n && isFinite(val)
            }

            /**
             * Convert a value to a string that is actually rendered.
             */
            function toString (val) {
              return val == null
                ? ''
                : typeof val === 'object'
                  ? JSON.stringify(val, null, 2)
                  : String(val)
            }

            /**
             * Convert an input value to a number for persistence.
             * If the conversion fails, return original string.
             */
            function toNumber (val) {
              var n = parseFloat(val);
              return isNaN(n) ? val : n
            }

            /**
             * Make a map and return a function for checking if a key
             * is in that map.
             */
            function makeMap (
              str,
              expectsLowerCase
            ) {
              var map = Object.create(null);
              var list = str.split(',');
              for (var i = 0; i < list.length; i++) {
                map[list[i]] = true;
              }
              return expectsLowerCase
                ? function (val) { return map[val.toLowerCase()]; }
                : function (val) { return map[val]; }
            }

            /**
             * Check if a tag is a built-in tag.
             */
            var isBuiltInTag = makeMap('slot,component', true);

            /**
             * Check if an attribute is a reserved attribute.
             */
            var isReservedAttribute = makeMap('key,ref,slot,slot-scope,is');

            /**
             * Remove an item from an array.
             */
            function remove (arr, item) {
              if (arr.length) {
                var index = arr.indexOf(item);
                if (index > -1) {
                  return arr.splice(index, 1)
                }
              }
            }

            /**
             * Check whether an object has the property.
             */
            var hasOwnProperty = Object.prototype.hasOwnProperty;
            function hasOwn (obj, key) {
              return hasOwnProperty.call(obj, key)
            }

            /**
             * Create a cached version of a pure function.
             */
            function cached (fn) {
              var cache = Object.create(null);
              return (function cachedFn (str) {
                var hit = cache[str];
                return hit || (cache[str] = fn(str))
              })
            }

            /**
             * Camelize a hyphen-delimited string.
             */
            var camelizeRE = /-(\w)/g;
            var camelize = cached(function (str) {
              return str.replace(camelizeRE, function (_, c) { return c ? c.toUpperCase() : ''; })
            });

            /**
             * Capitalize a string.
             */
            var capitalize = cached(function (str) {
              return str.charAt(0).toUpperCase() + str.slice(1)
            });

            /**
             * Hyphenate a camelCase string.
             */
            var hyphenateRE = /\B([A-Z])/g;
            var hyphenate = cached(function (str) {
              return str.replace(hyphenateRE, '-$1').toLowerCase()
            });

            /**
             * Simple bind polyfill for environments that do not support it,
             * e.g., PhantomJS 1.x. Technically, we don't need this anymore
             * since native bind is now performant enough in most browsers.
             * But removing it would mean breaking code that was able to run in
             * PhantomJS 1.x, so this must be kept for backward compatibility.
             */

            /* istanbul ignore next */
            function polyfillBind (fn, ctx) {
              function boundFn (a) {
                var l = arguments.length;
                return l
                  ? l > 1
                    ? fn.apply(ctx, arguments)
                    : fn.call(ctx, a)
                  : fn.call(ctx)
              }

              boundFn._length = fn.length;
              return boundFn
            }

            function nativeBind (fn, ctx) {
              return fn.bind(ctx)
            }

            var bind = Function.prototype.bind
              ? nativeBind
              : polyfillBind;

            /**
             * Convert an Array-like object to a real Array.
             */
            function toArray (list, start) {
              start = start || 0;
              var i = list.length - start;
              var ret = new Array(i);
              while (i--) {
                ret[i] = list[i + start];
              }
              return ret
            }

            /**
             * Mix properties into target object.
             */
            function extend (to, _from) {
              for (var key in _from) {
                to[key] = _from[key];
              }
              return to
            }

            /**
             * Merge an Array of Objects into a single Object.
             */
            function toObject (arr) {
              var res = {};
              for (var i = 0; i < arr.length; i++) {
                if (arr[i]) {
                  extend(res, arr[i]);
                }
              }
              return res
            }

            /* eslint-disable no-unused-vars */

            /**
             * Perform no operation.
             * Stubbing args to make Flow happy without leaving useless transpiled code
             * with ...rest (https://flow.org/blog/2017/05/07/Strict-Function-Call-Arity/).
             */
            function noop$1 (a, b, c) {}

            /**
             * Always return false.
             */
            var no = function (a, b, c) { return false; };

            /* eslint-enable no-unused-vars */

            /**
             * Return the same value.
             */
            var identity = function (_) { return _; };

            /**
             * Check if two values are loosely equal - that is,
             * if they are plain objects, do they have the same shape?
             */
            function looseEqual (a, b) {
              if (a === b) { return true }
              var isObjectA = isObject(a);
              var isObjectB = isObject(b);
              if (isObjectA && isObjectB) {
                try {
                  var isArrayA = Array.isArray(a);
                  var isArrayB = Array.isArray(b);
                  if (isArrayA && isArrayB) {
                    return a.length === b.length && a.every(function (e, i) {
                      return looseEqual(e, b[i])
                    })
                  } else if (a instanceof Date && b instanceof Date) {
                    return a.getTime() === b.getTime()
                  } else if (!isArrayA && !isArrayB) {
                    var keysA = Object.keys(a);
                    var keysB = Object.keys(b);
                    return keysA.length === keysB.length && keysA.every(function (key) {
                      return looseEqual(a[key], b[key])
                    })
                  } else {
                    /* istanbul ignore next */
                    return false
                  }
                } catch (e) {
                  /* istanbul ignore next */
                  return false
                }
              } else if (!isObjectA && !isObjectB) {
                return String(a) === String(b)
              } else {
                return false
              }
            }

            /**
             * Return the first index at which a loosely equal value can be
             * found in the array (if value is a plain object, the array must
             * contain an object of the same shape), or -1 if it is not present.
             */
            function looseIndexOf (arr, val) {
              for (var i = 0; i < arr.length; i++) {
                if (looseEqual(arr[i], val)) { return i }
              }
              return -1
            }

            /**
             * Ensure a function is called only once.
             */
            function once$1 (fn) {
              var called = false;
              return function () {
                if (!called) {
                  called = true;
                  fn.apply(this, arguments);
                }
              }
            }

            var SSR_ATTR = 'data-server-rendered';

            var ASSET_TYPES = [
              'component',
              'directive',
              'filter'
            ];

            var LIFECYCLE_HOOKS = [
              'beforeCreate',
              'created',
              'beforeMount',
              'mounted',
              'beforeUpdate',
              'updated',
              'beforeDestroy',
              'destroyed',
              'activated',
              'deactivated',
              'errorCaptured'
            ];

            /*  */



            var config$1 = ({
              /**
               * Option merge strategies (used in core/util/options)
               */
              // $flow-disable-line
              optionMergeStrategies: Object.create(null),

              /**
               * Whether to suppress warnings.
               */
              silent: false,

              /**
               * Show production mode tip message on boot?
               */
              productionTip: process.env.NODE_ENV !== 'production',

              /**
               * Whether to enable devtools
               */
              devtools: process.env.NODE_ENV !== 'production',

              /**
               * Whether to record perf
               */
              performance: false,

              /**
               * Error handler for watcher errors
               */
              errorHandler: null,

              /**
               * Warn handler for watcher warns
               */
              warnHandler: null,

              /**
               * Ignore certain custom elements
               */
              ignoredElements: [],

              /**
               * Custom user key aliases for v-on
               */
              // $flow-disable-line
              keyCodes: Object.create(null),

              /**
               * Check if a tag is reserved so that it cannot be registered as a
               * component. This is platform-dependent and may be overwritten.
               */
              isReservedTag: no,

              /**
               * Check if an attribute is reserved so that it cannot be used as a component
               * prop. This is platform-dependent and may be overwritten.
               */
              isReservedAttr: no,

              /**
               * Check if a tag is an unknown element.
               * Platform-dependent.
               */
              isUnknownElement: no,

              /**
               * Get the namespace of an element
               */
              getTagNamespace: noop$1,

              /**
               * Parse the real tag name for the specific platform.
               */
              parsePlatformTagName: identity,

              /**
               * Check if an attribute must be bound using property, e.g. value
               * Platform-dependent.
               */
              mustUseProp: no,

              /**
               * Perform updates asynchronously. Intended to be used by Vue Test Utils
               * This will significantly reduce performance if set to false.
               */
              async: true,

              /**
               * Exposed for legacy reasons
               */
              _lifecycleHooks: LIFECYCLE_HOOKS
            });

            /*  */

            /**
             * Check if a string starts with $ or _
             */
            function isReserved (str) {
              var c = (str + '').charCodeAt(0);
              return c === 0x24 || c === 0x5F
            }

            /**
             * Define a property.
             */
            function def (obj, key, val, enumerable) {
              Object.defineProperty(obj, key, {
                value: val,
                enumerable: !!enumerable,
                writable: true,
                configurable: true
              });
            }

            /**
             * Parse simple path.
             */
            var bailRE = /[^\w.$]/;
            function parsePath (path) {
              if (bailRE.test(path)) {
                return
              }
              var segments = path.split('.');
              return function (obj) {
                for (var i = 0; i < segments.length; i++) {
                  if (!obj) { return }
                  obj = obj[segments[i]];
                }
                return obj
              }
            }

            /*  */

            // can we use __proto__?
            var hasProto = '__proto__' in {};

            // Browser environment sniffing
            var inBrowser = typeof window !== 'undefined';
            var inWeex = typeof WXEnvironment !== 'undefined' && !!WXEnvironment.platform;
            var weexPlatform = inWeex && WXEnvironment.platform.toLowerCase();
            var UA = inBrowser && window.navigator.userAgent.toLowerCase();
            var isIE = UA && /msie|trident/.test(UA);
            var isIE9 = UA && UA.indexOf('msie 9.0') > 0;
            var isEdge = UA && UA.indexOf('edge/') > 0;
            var isAndroid = (UA && UA.indexOf('android') > 0) || (weexPlatform === 'android');
            var isIOS = (UA && /iphone|ipad|ipod|ios/.test(UA)) || (weexPlatform === 'ios');
            var isChrome = UA && /chrome\/\d+/.test(UA) && !isEdge;

            // Firefox has a "watch" function on Object.prototype...
            var nativeWatch = ({}).watch;

            var supportsPassive = false;
            if (inBrowser) {
              try {
                var opts = {};
                Object.defineProperty(opts, 'passive', ({
                  get: function get () {
                    /* istanbul ignore next */
                    supportsPassive = true;
                  }
                })); // https://github.com/facebook/flow/issues/285
                window.addEventListener('test-passive', null, opts);
              } catch (e) {}
            }

            // this needs to be lazy-evaled because vue may be required before
            // vue-server-renderer can set VUE_ENV
            var _isServer;
            var isServerRendering = function () {
              if (_isServer === undefined) {
                /* istanbul ignore if */
                if (!inBrowser && !inWeex && typeof global$1 !== 'undefined') {
                  // detect presence of vue-server-renderer and avoid
                  // Webpack shimming the process
                  _isServer = global$1['process'] && global$1['process'].env.VUE_ENV === 'server';
                } else {
                  _isServer = false;
                }
              }
              return _isServer
            };

            // detect devtools
            var devtools = inBrowser && window.__VUE_DEVTOOLS_GLOBAL_HOOK__;

            /* istanbul ignore next */
            function isNative (Ctor) {
              return typeof Ctor === 'function' && /native code/.test(Ctor.toString())
            }

            var hasSymbol =
              typeof Symbol !== 'undefined' && isNative(Symbol) &&
              typeof Reflect !== 'undefined' && isNative(Reflect.ownKeys);

            var _Set;
            /* istanbul ignore if */ // $flow-disable-line
            if (typeof Set !== 'undefined' && isNative(Set)) {
              // use native Set when available.
              _Set = Set;
            } else {
              // a non-standard Set polyfill that only works with primitive keys.
              _Set = /*@__PURE__*/(function () {
                function Set () {
                  this.set = Object.create(null);
                }
                Set.prototype.has = function has (key) {
                  return this.set[key] === true
                };
                Set.prototype.add = function add (key) {
                  this.set[key] = true;
                };
                Set.prototype.clear = function clear () {
                  this.set = Object.create(null);
                };

                return Set;
              }());
            }

            /*  */

            var warn = noop$1;
            var tip = noop$1;
            var generateComponentTrace = (noop$1); // work around flow check
            var formatComponentName = (noop$1);

            if (process.env.NODE_ENV !== 'production') {
              var hasConsole = typeof console !== 'undefined';
              var classifyRE = /(?:^|[-_])(\w)/g;
              var classify = function (str) { return str
                .replace(classifyRE, function (c) { return c.toUpperCase(); })
                .replace(/[-_]/g, ''); };

              warn = function (msg, vm) {
                var trace = vm ? generateComponentTrace(vm) : '';

                if (config$1.warnHandler) {
                  config$1.warnHandler.call(null, msg, vm, trace);
                } else if (hasConsole && (!config$1.silent)) {
                  console.error(("[Vue warn]: " + msg + trace));
                }
              };

              tip = function (msg, vm) {
                if (hasConsole && (!config$1.silent)) {
                  console.warn("[Vue tip]: " + msg + (
                    vm ? generateComponentTrace(vm) : ''
                  ));
                }
              };

              formatComponentName = function (vm, includeFile) {
                if (vm.$root === vm) {
                  return '<Root>'
                }
                var options = typeof vm === 'function' && vm.cid != null
                  ? vm.options
                  : vm._isVue
                    ? vm.$options || vm.constructor.options
                    : vm || {};
                var name = options.name || options._componentTag;
                var file = options.__file;
                if (!name && file) {
                  var match = file.match(/([^/\\]+)\.vue$/);
                  name = match && match[1];
                }

                return (
                  (name ? ("<" + (classify(name)) + ">") : "<Anonymous>") +
                  (file && includeFile !== false ? (" at " + file) : '')
                )
              };

              var repeat = function (str, n) {
                var res = '';
                while (n) {
                  if (n % 2 === 1) { res += str; }
                  if (n > 1) { str += str; }
                  n >>= 1;
                }
                return res
              };

              generateComponentTrace = function (vm) {
                if (vm._isVue && vm.$parent) {
                  var tree = [];
                  var currentRecursiveSequence = 0;
                  while (vm) {
                    if (tree.length > 0) {
                      var last = tree[tree.length - 1];
                      if (last.constructor === vm.constructor) {
                        currentRecursiveSequence++;
                        vm = vm.$parent;
                        continue
                      } else if (currentRecursiveSequence > 0) {
                        tree[tree.length - 1] = [last, currentRecursiveSequence];
                        currentRecursiveSequence = 0;
                      }
                    }
                    tree.push(vm);
                    vm = vm.$parent;
                  }
                  return '\n\nfound in\n\n' + tree
                    .map(function (vm, i) { return ("" + (i === 0 ? '---> ' : repeat(' ', 5 + i * 2)) + (Array.isArray(vm)
                        ? ((formatComponentName(vm[0])) + "... (" + (vm[1]) + " recursive calls)")
                        : formatComponentName(vm))); })
                    .join('\n')
                } else {
                  return ("\n\n(found in " + (formatComponentName(vm)) + ")")
                }
              };
            }

            /*  */

            var uid = 0;

            /**
             * A dep is an observable that can have multiple
             * directives subscribing to it.
             */
            var Dep = function Dep () {
              this.id = uid++;
              this.subs = [];
            };

            Dep.prototype.addSub = function addSub (sub) {
              this.subs.push(sub);
            };

            Dep.prototype.removeSub = function removeSub (sub) {
              remove(this.subs, sub);
            };

            Dep.prototype.depend = function depend () {
              if (Dep.target) {
                Dep.target.addDep(this);
              }
            };

            Dep.prototype.notify = function notify () {
              // stabilize the subscriber list first
              var subs = this.subs.slice();
              if (process.env.NODE_ENV !== 'production' && !config$1.async) {
                // subs aren't sorted in scheduler if not running async
                // we need to sort them now to make sure they fire in correct
                // order
                subs.sort(function (a, b) { return a.id - b.id; });
              }
              for (var i = 0, l = subs.length; i < l; i++) {
                subs[i].update();
              }
            };

            // the current target watcher being evaluated.
            // this is globally unique because there could be only one
            // watcher being evaluated at any time.
            Dep.target = null;
            var targetStack = [];

            function pushTarget (target) {
              targetStack.push(target);
              Dep.target = target;
            }

            function popTarget () {
              targetStack.pop();
              Dep.target = targetStack[targetStack.length - 1];
            }

            /*  */

            var VNode = function VNode (
              tag,
              data,
              children,
              text,
              elm,
              context,
              componentOptions,
              asyncFactory
            ) {
              this.tag = tag;
              this.data = data;
              this.children = children;
              this.text = text;
              this.elm = elm;
              this.ns = undefined;
              this.context = context;
              this.fnContext = undefined;
              this.fnOptions = undefined;
              this.fnScopeId = undefined;
              this.key = data && data.key;
              this.componentOptions = componentOptions;
              this.componentInstance = undefined;
              this.parent = undefined;
              this.raw = false;
              this.isStatic = false;
              this.isRootInsert = true;
              this.isComment = false;
              this.isCloned = false;
              this.isOnce = false;
              this.asyncFactory = asyncFactory;
              this.asyncMeta = undefined;
              this.isAsyncPlaceholder = false;
            };

            var prototypeAccessors = { child: { configurable: true } };

            // DEPRECATED: alias for componentInstance for backwards compat.
            /* istanbul ignore next */
            prototypeAccessors.child.get = function () {
              return this.componentInstance
            };

            Object.defineProperties( VNode.prototype, prototypeAccessors );

            var createEmptyVNode = function (text) {
              if ( text === void 0 ) text = '';

              var node = new VNode();
              node.text = text;
              node.isComment = true;
              return node
            };

            function createTextVNode (val) {
              return new VNode(undefined, undefined, undefined, String(val))
            }

            // optimized shallow clone
            // used for static nodes and slot nodes because they may be reused across
            // multiple renders, cloning them avoids errors when DOM manipulations rely
            // on their elm reference.
            function cloneVNode (vnode) {
              var cloned = new VNode(
                vnode.tag,
                vnode.data,
                // #7975
                // clone children array to avoid mutating original in case of cloning
                // a child.
                vnode.children && vnode.children.slice(),
                vnode.text,
                vnode.elm,
                vnode.context,
                vnode.componentOptions,
                vnode.asyncFactory
              );
              cloned.ns = vnode.ns;
              cloned.isStatic = vnode.isStatic;
              cloned.key = vnode.key;
              cloned.isComment = vnode.isComment;
              cloned.fnContext = vnode.fnContext;
              cloned.fnOptions = vnode.fnOptions;
              cloned.fnScopeId = vnode.fnScopeId;
              cloned.asyncMeta = vnode.asyncMeta;
              cloned.isCloned = true;
              return cloned
            }

            /*
             * not type checking this file because flow doesn't play well with
             * dynamically accessing methods on Array prototype
             */

            var arrayProto = Array.prototype;
            var arrayMethods = Object.create(arrayProto);

            var methodsToPatch = [
              'push',
              'pop',
              'shift',
              'unshift',
              'splice',
              'sort',
              'reverse'
            ];

            /**
             * Intercept mutating methods and emit events
             */
            methodsToPatch.forEach(function (method) {
              // cache original method
              var original = arrayProto[method];
              def(arrayMethods, method, function mutator () {
                var args = [], len = arguments.length;
                while ( len-- ) args[ len ] = arguments[ len ];

                var result = original.apply(this, args);
                var ob = this.__ob__;
                var inserted;
                switch (method) {
                  case 'push':
                  case 'unshift':
                    inserted = args;
                    break
                  case 'splice':
                    inserted = args.slice(2);
                    break
                }
                if (inserted) { ob.observeArray(inserted); }
                // notify change
                ob.dep.notify();
                return result
              });
            });

            /*  */

            var arrayKeys = Object.getOwnPropertyNames(arrayMethods);

            /**
             * In some cases we may want to disable observation inside a component's
             * update computation.
             */
            var shouldObserve = true;

            function toggleObserving (value) {
              shouldObserve = value;
            }

            /**
             * Observer class that is attached to each observed
             * object. Once attached, the observer converts the target
             * object's property keys into getter/setters that
             * collect dependencies and dispatch updates.
             */
            var Observer = function Observer (value) {
              this.value = value;
              this.dep = new Dep();
              this.vmCount = 0;
              def(value, '__ob__', this);
              if (Array.isArray(value)) {
                if (hasProto) {
                  protoAugment(value, arrayMethods);
                } else {
                  copyAugment(value, arrayMethods, arrayKeys);
                }
                this.observeArray(value);
              } else {
                this.walk(value);
              }
            };

            /**
             * Walk through all properties and convert them into
             * getter/setters. This method should only be called when
             * value type is Object.
             */
            Observer.prototype.walk = function walk (obj) {
              var keys = Object.keys(obj);
              for (var i = 0; i < keys.length; i++) {
                defineReactive$$1(obj, keys[i]);
              }
            };

            /**
             * Observe a list of Array items.
             */
            Observer.prototype.observeArray = function observeArray (items) {
              for (var i = 0, l = items.length; i < l; i++) {
                observe(items[i]);
              }
            };

            // helpers

            /**
             * Augment a target Object or Array by intercepting
             * the prototype chain using __proto__
             */
            function protoAugment (target, src) {
              /* eslint-disable no-proto */
              target.__proto__ = src;
              /* eslint-enable no-proto */
            }

            /**
             * Augment a target Object or Array by defining
             * hidden properties.
             */
            /* istanbul ignore next */
            function copyAugment (target, src, keys) {
              for (var i = 0, l = keys.length; i < l; i++) {
                var key = keys[i];
                def(target, key, src[key]);
              }
            }

            /**
             * Attempt to create an observer instance for a value,
             * returns the new observer if successfully observed,
             * or the existing observer if the value already has one.
             */
            function observe (value, asRootData) {
              if (!isObject(value) || value instanceof VNode) {
                return
              }
              var ob;
              if (hasOwn(value, '__ob__') && value.__ob__ instanceof Observer) {
                ob = value.__ob__;
              } else if (
                shouldObserve &&
                !isServerRendering() &&
                (Array.isArray(value) || isPlainObject(value)) &&
                Object.isExtensible(value) &&
                !value._isVue
              ) {
                ob = new Observer(value);
              }
              if (asRootData && ob) {
                ob.vmCount++;
              }
              return ob
            }

            /**
             * Define a reactive property on an Object.
             */
            function defineReactive$$1 (
              obj,
              key,
              val,
              customSetter,
              shallow
            ) {
              var dep = new Dep();

              var property = Object.getOwnPropertyDescriptor(obj, key);
              if (property && property.configurable === false) {
                return
              }

              // cater for pre-defined getter/setters
              var getter = property && property.get;
              var setter = property && property.set;
              if ((!getter || setter) && arguments.length === 2) {
                val = obj[key];
              }

              var childOb = !shallow && observe(val);
              Object.defineProperty(obj, key, {
                enumerable: true,
                configurable: true,
                get: function reactiveGetter () {
                  var value = getter ? getter.call(obj) : val;
                  if (Dep.target) {
                    dep.depend();
                    if (childOb) {
                      childOb.dep.depend();
                      if (Array.isArray(value)) {
                        dependArray(value);
                      }
                    }
                  }
                  return value
                },
                set: function reactiveSetter (newVal) {
                  var value = getter ? getter.call(obj) : val;
                  /* eslint-disable no-self-compare */
                  if (newVal === value || (newVal !== newVal && value !== value)) {
                    return
                  }
                  /* eslint-enable no-self-compare */
                  if (process.env.NODE_ENV !== 'production' && customSetter) {
                    customSetter();
                  }
                  // #7981: for accessor properties without setter
                  if (getter && !setter) { return }
                  if (setter) {
                    setter.call(obj, newVal);
                  } else {
                    val = newVal;
                  }
                  childOb = !shallow && observe(newVal);
                  dep.notify();
                }
              });
            }

            /**
             * Set a property on an object. Adds the new property and
             * triggers change notification if the property doesn't
             * already exist.
             */
            function set (target, key, val) {
              if (process.env.NODE_ENV !== 'production' &&
                (isUndef(target) || isPrimitive(target))
              ) {
                warn(("Cannot set reactive property on undefined, null, or primitive value: " + ((target))));
              }
              if (Array.isArray(target) && isValidArrayIndex(key)) {
                target.length = Math.max(target.length, key);
                target.splice(key, 1, val);
                return val
              }
              if (key in target && !(key in Object.prototype)) {
                target[key] = val;
                return val
              }
              var ob = (target).__ob__;
              if (target._isVue || (ob && ob.vmCount)) {
                process.env.NODE_ENV !== 'production' && warn(
                  'Avoid adding reactive properties to a Vue instance or its root $data ' +
                  'at runtime - declare it upfront in the data option.'
                );
                return val
              }
              if (!ob) {
                target[key] = val;
                return val
              }
              defineReactive$$1(ob.value, key, val);
              ob.dep.notify();
              return val
            }

            /**
             * Delete a property and trigger change if necessary.
             */
            function del (target, key) {
              if (process.env.NODE_ENV !== 'production' &&
                (isUndef(target) || isPrimitive(target))
              ) {
                warn(("Cannot delete reactive property on undefined, null, or primitive value: " + ((target))));
              }
              if (Array.isArray(target) && isValidArrayIndex(key)) {
                target.splice(key, 1);
                return
              }
              var ob = (target).__ob__;
              if (target._isVue || (ob && ob.vmCount)) {
                process.env.NODE_ENV !== 'production' && warn(
                  'Avoid deleting properties on a Vue instance or its root $data ' +
                  '- just set it to null.'
                );
                return
              }
              if (!hasOwn(target, key)) {
                return
              }
              delete target[key];
              if (!ob) {
                return
              }
              ob.dep.notify();
            }

            /**
             * Collect dependencies on array elements when the array is touched, since
             * we cannot intercept array element access like property getters.
             */
            function dependArray (value) {
              for (var e = (void 0), i = 0, l = value.length; i < l; i++) {
                e = value[i];
                e && e.__ob__ && e.__ob__.dep.depend();
                if (Array.isArray(e)) {
                  dependArray(e);
                }
              }
            }

            /*  */

            /**
             * Option overwriting strategies are functions that handle
             * how to merge a parent option value and a child option
             * value into the final value.
             */
            var strats = config$1.optionMergeStrategies;

            /**
             * Options with restrictions
             */
            if (process.env.NODE_ENV !== 'production') {
              strats.el = strats.propsData = function (parent, child, vm, key) {
                if (!vm) {
                  warn(
                    "option \"" + key + "\" can only be used during instance " +
                    'creation with the `new` keyword.'
                  );
                }
                return defaultStrat(parent, child)
              };
            }

            /**
             * Helper that recursively merges two data objects together.
             */
            function mergeData (to, from) {
              if (!from) { return to }
              var key, toVal, fromVal;
              var keys = Object.keys(from);
              for (var i = 0; i < keys.length; i++) {
                key = keys[i];
                toVal = to[key];
                fromVal = from[key];
                if (!hasOwn(to, key)) {
                  set(to, key, fromVal);
                } else if (
                  toVal !== fromVal &&
                  isPlainObject(toVal) &&
                  isPlainObject(fromVal)
                ) {
                  mergeData(toVal, fromVal);
                }
              }
              return to
            }

            /**
             * Data
             */
            function mergeDataOrFn (
              parentVal,
              childVal,
              vm
            ) {
              if (!vm) {
                // in a Vue.extend merge, both should be functions
                if (!childVal) {
                  return parentVal
                }
                if (!parentVal) {
                  return childVal
                }
                // when parentVal & childVal are both present,
                // we need to return a function that returns the
                // merged result of both functions... no need to
                // check if parentVal is a function here because
                // it has to be a function to pass previous merges.
                return function mergedDataFn () {
                  return mergeData(
                    typeof childVal === 'function' ? childVal.call(this, this) : childVal,
                    typeof parentVal === 'function' ? parentVal.call(this, this) : parentVal
                  )
                }
              } else {
                return function mergedInstanceDataFn () {
                  // instance merge
                  var instanceData = typeof childVal === 'function'
                    ? childVal.call(vm, vm)
                    : childVal;
                  var defaultData = typeof parentVal === 'function'
                    ? parentVal.call(vm, vm)
                    : parentVal;
                  if (instanceData) {
                    return mergeData(instanceData, defaultData)
                  } else {
                    return defaultData
                  }
                }
              }
            }

            strats.data = function (
              parentVal,
              childVal,
              vm
            ) {
              if (!vm) {
                if (childVal && typeof childVal !== 'function') {
                  process.env.NODE_ENV !== 'production' && warn(
                    'The "data" option should be a function ' +
                    'that returns a per-instance value in component ' +
                    'definitions.',
                    vm
                  );

                  return parentVal
                }
                return mergeDataOrFn(parentVal, childVal)
              }

              return mergeDataOrFn(parentVal, childVal, vm)
            };

            /**
             * Hooks and props are merged as arrays.
             */
            function mergeHook (
              parentVal,
              childVal
            ) {
              return childVal
                ? parentVal
                  ? parentVal.concat(childVal)
                  : Array.isArray(childVal)
                    ? childVal
                    : [childVal]
                : parentVal
            }

            LIFECYCLE_HOOKS.forEach(function (hook) {
              strats[hook] = mergeHook;
            });

            /**
             * Assets
             *
             * When a vm is present (instance creation), we need to do
             * a three-way merge between constructor options, instance
             * options and parent options.
             */
            function mergeAssets (
              parentVal,
              childVal,
              vm,
              key
            ) {
              var res = Object.create(parentVal || null);
              if (childVal) {
                process.env.NODE_ENV !== 'production' && assertObjectType(key, childVal, vm);
                return extend(res, childVal)
              } else {
                return res
              }
            }

            ASSET_TYPES.forEach(function (type) {
              strats[type + 's'] = mergeAssets;
            });

            /**
             * Watchers.
             *
             * Watchers hashes should not overwrite one
             * another, so we merge them as arrays.
             */
            strats.watch = function (
              parentVal,
              childVal,
              vm,
              key
            ) {
              // work around Firefox's Object.prototype.watch...
              if (parentVal === nativeWatch) { parentVal = undefined; }
              if (childVal === nativeWatch) { childVal = undefined; }
              /* istanbul ignore if */
              if (!childVal) { return Object.create(parentVal || null) }
              if (process.env.NODE_ENV !== 'production') {
                assertObjectType(key, childVal, vm);
              }
              if (!parentVal) { return childVal }
              var ret = {};
              extend(ret, parentVal);
              for (var key$1 in childVal) {
                var parent = ret[key$1];
                var child = childVal[key$1];
                if (parent && !Array.isArray(parent)) {
                  parent = [parent];
                }
                ret[key$1] = parent
                  ? parent.concat(child)
                  : Array.isArray(child) ? child : [child];
              }
              return ret
            };

            /**
             * Other object hashes.
             */
            strats.props =
            strats.methods =
            strats.inject =
            strats.computed = function (
              parentVal,
              childVal,
              vm,
              key
            ) {
              if (childVal && process.env.NODE_ENV !== 'production') {
                assertObjectType(key, childVal, vm);
              }
              if (!parentVal) { return childVal }
              var ret = Object.create(null);
              extend(ret, parentVal);
              if (childVal) { extend(ret, childVal); }
              return ret
            };
            strats.provide = mergeDataOrFn;

            /**
             * Default strategy.
             */
            var defaultStrat = function (parentVal, childVal) {
              return childVal === undefined
                ? parentVal
                : childVal
            };

            /**
             * Validate component names
             */
            function checkComponents (options) {
              for (var key in options.components) {
                validateComponentName(key);
              }
            }

            function validateComponentName (name) {
              if (!/^[a-zA-Z][\w-]*$/.test(name)) {
                warn(
                  'Invalid component name: "' + name + '". Component names ' +
                  'can only contain alphanumeric characters and the hyphen, ' +
                  'and must start with a letter.'
                );
              }
              if (isBuiltInTag(name) || config$1.isReservedTag(name)) {
                warn(
                  'Do not use built-in or reserved HTML elements as component ' +
                  'id: ' + name
                );
              }
            }

            /**
             * Ensure all props option syntax are normalized into the
             * Object-based format.
             */
            function normalizeProps (options, vm) {
              var props = options.props;
              if (!props) { return }
              var res = {};
              var i, val, name;
              if (Array.isArray(props)) {
                i = props.length;
                while (i--) {
                  val = props[i];
                  if (typeof val === 'string') {
                    name = camelize(val);
                    res[name] = { type: null };
                  } else if (process.env.NODE_ENV !== 'production') {
                    warn('props must be strings when using array syntax.');
                  }
                }
              } else if (isPlainObject(props)) {
                for (var key in props) {
                  val = props[key];
                  name = camelize(key);
                  res[name] = isPlainObject(val)
                    ? val
                    : { type: val };
                }
              } else if (process.env.NODE_ENV !== 'production') {
                warn(
                  "Invalid value for option \"props\": expected an Array or an Object, " +
                  "but got " + (toRawType(props)) + ".",
                  vm
                );
              }
              options.props = res;
            }

            /**
             * Normalize all injections into Object-based format
             */
            function normalizeInject (options, vm) {
              var inject = options.inject;
              if (!inject) { return }
              var normalized = options.inject = {};
              if (Array.isArray(inject)) {
                for (var i = 0; i < inject.length; i++) {
                  normalized[inject[i]] = { from: inject[i] };
                }
              } else if (isPlainObject(inject)) {
                for (var key in inject) {
                  var val = inject[key];
                  normalized[key] = isPlainObject(val)
                    ? extend({ from: key }, val)
                    : { from: val };
                }
              } else if (process.env.NODE_ENV !== 'production') {
                warn(
                  "Invalid value for option \"inject\": expected an Array or an Object, " +
                  "but got " + (toRawType(inject)) + ".",
                  vm
                );
              }
            }

            /**
             * Normalize raw function directives into object format.
             */
            function normalizeDirectives (options) {
              var dirs = options.directives;
              if (dirs) {
                for (var key in dirs) {
                  var def = dirs[key];
                  if (typeof def === 'function') {
                    dirs[key] = { bind: def, update: def };
                  }
                }
              }
            }

            function assertObjectType (name, value, vm) {
              if (!isPlainObject(value)) {
                warn(
                  "Invalid value for option \"" + name + "\": expected an Object, " +
                  "but got " + (toRawType(value)) + ".",
                  vm
                );
              }
            }

            /**
             * Merge two option objects into a new one.
             * Core utility used in both instantiation and inheritance.
             */
            function mergeOptions (
              parent,
              child,
              vm
            ) {
              if (process.env.NODE_ENV !== 'production') {
                checkComponents(child);
              }

              if (typeof child === 'function') {
                child = child.options;
              }

              normalizeProps(child, vm);
              normalizeInject(child, vm);
              normalizeDirectives(child);
              
              // Apply extends and mixins on the child options,
              // but only if it is a raw options object that isn't
              // the result of another mergeOptions call.
              // Only merged options has the _base property.
              if (!child._base) {
                if (child.extends) {
                  parent = mergeOptions(parent, child.extends, vm);
                }
                if (child.mixins) {
                  for (var i = 0, l = child.mixins.length; i < l; i++) {
                    parent = mergeOptions(parent, child.mixins[i], vm);
                  }
                }
              }

              var options = {};
              var key;
              for (key in parent) {
                mergeField(key);
              }
              for (key in child) {
                if (!hasOwn(parent, key)) {
                  mergeField(key);
                }
              }
              function mergeField (key) {
                var strat = strats[key] || defaultStrat;
                options[key] = strat(parent[key], child[key], vm, key);
              }
              return options
            }

            /**
             * Resolve an asset.
             * This function is used because child instances need access
             * to assets defined in its ancestor chain.
             */
            function resolveAsset (
              options,
              type,
              id,
              warnMissing
            ) {
              /* istanbul ignore if */
              if (typeof id !== 'string') {
                return
              }
              var assets = options[type];
              // check local registration variations first
              if (hasOwn(assets, id)) { return assets[id] }
              var camelizedId = camelize(id);
              if (hasOwn(assets, camelizedId)) { return assets[camelizedId] }
              var PascalCaseId = capitalize(camelizedId);
              if (hasOwn(assets, PascalCaseId)) { return assets[PascalCaseId] }
              // fallback to prototype chain
              var res = assets[id] || assets[camelizedId] || assets[PascalCaseId];
              if (process.env.NODE_ENV !== 'production' && warnMissing && !res) {
                warn(
                  'Failed to resolve ' + type.slice(0, -1) + ': ' + id,
                  options
                );
              }
              return res
            }

            /*  */



            function validateProp (
              key,
              propOptions,
              propsData,
              vm
            ) {
              var prop = propOptions[key];
              var absent = !hasOwn(propsData, key);
              var value = propsData[key];
              // boolean casting
              var booleanIndex = getTypeIndex(Boolean, prop.type);
              if (booleanIndex > -1) {
                if (absent && !hasOwn(prop, 'default')) {
                  value = false;
                } else if (value === '' || value === hyphenate(key)) {
                  // only cast empty string / same name to boolean if
                  // boolean has higher priority
                  var stringIndex = getTypeIndex(String, prop.type);
                  if (stringIndex < 0 || booleanIndex < stringIndex) {
                    value = true;
                  }
                }
              }
              // check default value
              if (value === undefined) {
                value = getPropDefaultValue(vm, prop, key);
                // since the default value is a fresh copy,
                // make sure to observe it.
                var prevShouldObserve = shouldObserve;
                toggleObserving(true);
                observe(value);
                toggleObserving(prevShouldObserve);
              }
              if (
                process.env.NODE_ENV !== 'production' &&
                // skip validation for weex recycle-list child component props
                !(false)
              ) {
                assertProp(prop, key, value, vm, absent);
              }
              return value
            }

            /**
             * Get the default value of a prop.
             */
            function getPropDefaultValue (vm, prop, key) {
              // no default, return undefined
              if (!hasOwn(prop, 'default')) {
                return undefined
              }
              var def = prop.default;
              // warn against non-factory defaults for Object & Array
              if (process.env.NODE_ENV !== 'production' && isObject(def)) {
                warn(
                  'Invalid default value for prop "' + key + '": ' +
                  'Props with type Object/Array must use a factory function ' +
                  'to return the default value.',
                  vm
                );
              }
              // the raw prop value was also undefined from previous render,
              // return previous default value to avoid unnecessary watcher trigger
              if (vm && vm.$options.propsData &&
                vm.$options.propsData[key] === undefined &&
                vm._props[key] !== undefined
              ) {
                return vm._props[key]
              }
              // call factory function for non-Function types
              // a value is Function if its prototype is function even across different execution context
              return typeof def === 'function' && getType(prop.type) !== 'Function'
                ? def.call(vm)
                : def
            }

            /**
             * Assert whether a prop is valid.
             */
            function assertProp (
              prop,
              name,
              value,
              vm,
              absent
            ) {
              if (prop.required && absent) {
                warn(
                  'Missing required prop: "' + name + '"',
                  vm
                );
                return
              }
              if (value == null && !prop.required) {
                return
              }
              var type = prop.type;
              var valid = !type || type === true;
              var expectedTypes = [];
              if (type) {
                if (!Array.isArray(type)) {
                  type = [type];
                }
                for (var i = 0; i < type.length && !valid; i++) {
                  var assertedType = assertType(value, type[i]);
                  expectedTypes.push(assertedType.expectedType || '');
                  valid = assertedType.valid;
                }
              }

              if (!valid) {
                warn(
                  getInvalidTypeMessage(name, value, expectedTypes),
                  vm
                );
                return
              }
              var validator = prop.validator;
              if (validator) {
                if (!validator(value)) {
                  warn(
                    'Invalid prop: custom validator check failed for prop "' + name + '".',
                    vm
                  );
                }
              }
            }

            var simpleCheckRE = /^(String|Number|Boolean|Function|Symbol)$/;

            function assertType (value, type) {
              var valid;
              var expectedType = getType(type);
              if (simpleCheckRE.test(expectedType)) {
                var t = typeof value;
                valid = t === expectedType.toLowerCase();
                // for primitive wrapper objects
                if (!valid && t === 'object') {
                  valid = value instanceof type;
                }
              } else if (expectedType === 'Object') {
                valid = isPlainObject(value);
              } else if (expectedType === 'Array') {
                valid = Array.isArray(value);
              } else {
                valid = value instanceof type;
              }
              return {
                valid: valid,
                expectedType: expectedType
              }
            }

            /**
             * Use function string name to check built-in types,
             * because a simple equality check will fail when running
             * across different vms / iframes.
             */
            function getType (fn) {
              var match = fn && fn.toString().match(/^\s*function (\w+)/);
              return match ? match[1] : ''
            }

            function isSameType (a, b) {
              return getType(a) === getType(b)
            }

            function getTypeIndex (type, expectedTypes) {
              if (!Array.isArray(expectedTypes)) {
                return isSameType(expectedTypes, type) ? 0 : -1
              }
              for (var i = 0, len = expectedTypes.length; i < len; i++) {
                if (isSameType(expectedTypes[i], type)) {
                  return i
                }
              }
              return -1
            }

            function getInvalidTypeMessage (name, value, expectedTypes) {
              var message = "Invalid prop: type check failed for prop \"" + name + "\"." +
                " Expected " + (expectedTypes.map(capitalize).join(', '));
              var expectedType = expectedTypes[0];
              var receivedType = toRawType(value);
              var expectedValue = styleValue(value, expectedType);
              var receivedValue = styleValue(value, receivedType);
              // check if we need to specify expected value
              if (expectedTypes.length === 1 &&
                  isExplicable(expectedType) &&
                  !isBoolean(expectedType, receivedType)) {
                message += " with value " + expectedValue;
              }
              message += ", got " + receivedType + " ";
              // check if we need to specify received value
              if (isExplicable(receivedType)) {
                message += "with value " + receivedValue + ".";
              }
              return message
            }

            function styleValue (value, type) {
              if (type === 'String') {
                return ("\"" + value + "\"")
              } else if (type === 'Number') {
                return ("" + (Number(value)))
              } else {
                return ("" + value)
              }
            }

            function isExplicable (value) {
              var explicitTypes = ['string', 'number', 'boolean'];
              return explicitTypes.some(function (elem) { return value.toLowerCase() === elem; })
            }

            function isBoolean () {
              var args = [], len = arguments.length;
              while ( len-- ) args[ len ] = arguments[ len ];

              return args.some(function (elem) { return elem.toLowerCase() === 'boolean'; })
            }

            /*  */

            function handleError (err, vm, info) {
              if (vm) {
                var cur = vm;
                while ((cur = cur.$parent)) {
                  var hooks = cur.$options.errorCaptured;
                  if (hooks) {
                    for (var i = 0; i < hooks.length; i++) {
                      try {
                        var capture = hooks[i].call(cur, err, vm, info) === false;
                        if (capture) { return }
                      } catch (e) {
                        globalHandleError(e, cur, 'errorCaptured hook');
                      }
                    }
                  }
                }
              }
              globalHandleError(err, vm, info);
            }

            function globalHandleError (err, vm, info) {
              if (config$1.errorHandler) {
                try {
                  return config$1.errorHandler.call(null, err, vm, info)
                } catch (e) {
                  logError(e, null, 'config.errorHandler');
                }
              }
              logError(err, vm, info);
            }

            function logError (err, vm, info) {
              if (process.env.NODE_ENV !== 'production') {
                warn(("Error in " + info + ": \"" + (err.toString()) + "\""), vm);
              }
              /* istanbul ignore else */
              if ((inBrowser || inWeex) && typeof console !== 'undefined') {
                console.error(err);
              } else {
                throw err
              }
            }

            /*  */

            var callbacks = [];
            var pending = false;

            function flushCallbacks () {
              pending = false;
              var copies = callbacks.slice(0);
              callbacks.length = 0;
              for (var i = 0; i < copies.length; i++) {
                copies[i]();
              }
            }

            // Here we have async deferring wrappers using both microtasks and (macro) tasks.
            // In < 2.4 we used microtasks everywhere, but there are some scenarios where
            // microtasks have too high a priority and fire in between supposedly
            // sequential events (e.g. #4521, #6690) or even between bubbling of the same
            // event (#6566). However, using (macro) tasks everywhere also has subtle problems
            // when state is changed right before repaint (e.g. #6813, out-in transitions).
            // Here we use microtask by default, but expose a way to force (macro) task when
            // needed (e.g. in event handlers attached by v-on).
            var microTimerFunc;
            var macroTimerFunc;
            var useMacroTask = false;

            // Determine (macro) task defer implementation.
            // Technically setImmediate should be the ideal choice, but it's only available
            // in IE. The only polyfill that consistently queues the callback after all DOM
            // events triggered in the same loop is by using MessageChannel.
            /* istanbul ignore if */
            if (typeof setImmediate !== 'undefined' && isNative(setImmediate)) {
              macroTimerFunc = function () {
                setImmediate(flushCallbacks);
              };
            } else if (typeof MessageChannel !== 'undefined' && (
              isNative(MessageChannel) ||
              // PhantomJS
              MessageChannel.toString() === '[object MessageChannelConstructor]'
            )) {
              var channel = new MessageChannel();
              var port = channel.port2;
              channel.port1.onmessage = flushCallbacks;
              macroTimerFunc = function () {
                port.postMessage(1);
              };
            } else {
              /* istanbul ignore next */
              macroTimerFunc = function () {
                setTimeout(flushCallbacks, 0);
              };
            }

            // Determine microtask defer implementation.
            /* istanbul ignore next, $flow-disable-line */
            if (typeof Promise !== 'undefined' && isNative(Promise)) {
              var p = Promise.resolve();
              microTimerFunc = function () {
                p.then(flushCallbacks);
                // in problematic UIWebViews, Promise.then doesn't completely break, but
                // it can get stuck in a weird state where callbacks are pushed into the
                // microtask queue but the queue isn't being flushed, until the browser
                // needs to do some other work, e.g. handle a timer. Therefore we can
                // "force" the microtask queue to be flushed by adding an empty timer.
                if (isIOS) { setTimeout(noop$1); }
              };
            } else {
              // fallback to macro
              microTimerFunc = macroTimerFunc;
            }

            /**
             * Wrap a function so that if any code inside triggers state change,
             * the changes are queued using a (macro) task instead of a microtask.
             */
            function withMacroTask (fn) {
              return fn._withTask || (fn._withTask = function () {
                useMacroTask = true;
                try {
                  return fn.apply(null, arguments)
                } finally {
                  useMacroTask = false;    
                }
              })
            }

            function nextTick$1 (cb, ctx) {
              var _resolve;
              callbacks.push(function () {
                if (cb) {
                  try {
                    cb.call(ctx);
                  } catch (e) {
                    handleError(e, ctx, 'nextTick');
                  }
                } else if (_resolve) {
                  _resolve(ctx);
                }
              });
              if (!pending) {
                pending = true;
                if (useMacroTask) {
                  macroTimerFunc();
                } else {
                  microTimerFunc();
                }
              }
              // $flow-disable-line
              if (!cb && typeof Promise !== 'undefined') {
                return new Promise(function (resolve) {
                  _resolve = resolve;
                })
              }
            }

            /*  */

            /* not type checking this file because flow doesn't play well with Proxy */

            var initProxy;

            if (process.env.NODE_ENV !== 'production') {
              var allowedGlobals = makeMap(
                'Infinity,undefined,NaN,isFinite,isNaN,' +
                'parseFloat,parseInt,decodeURI,decodeURIComponent,encodeURI,encodeURIComponent,' +
                'Math,Number,Date,Array,Object,Boolean,String,RegExp,Map,Set,JSON,Intl,' +
                'require' // for Webpack/Browserify
              );

              var warnNonPresent = function (target, key) {
                warn(
                  "Property or method \"" + key + "\" is not defined on the instance but " +
                  'referenced during render. Make sure that this property is reactive, ' +
                  'either in the data option, or for class-based components, by ' +
                  'initializing the property. ' +
                  'See: https://vuejs.org/v2/guide/reactivity.html#Declaring-Reactive-Properties.',
                  target
                );
              };

              var warnReservedPrefix = function (target, key) {
                warn(
                  "Property \"" + key + "\" must be accessed with \"$data." + key + "\" because " +
                  'properties starting with "$" or "_" are not proxied in the Vue instance to ' +
                  'prevent conflicts with Vue internals' +
                  'See: https://vuejs.org/v2/api/#data',
                  target
                );
              };

              var hasProxy =
                typeof Proxy !== 'undefined' && isNative(Proxy);

              if (hasProxy) {
                var isBuiltInModifier = makeMap('stop,prevent,self,ctrl,shift,alt,meta,exact');
                config$1.keyCodes = new Proxy(config$1.keyCodes, {
                  set: function set (target, key, value) {
                    if (isBuiltInModifier(key)) {
                      warn(("Avoid overwriting built-in modifier in config.keyCodes: ." + key));
                      return false
                    } else {
                      target[key] = value;
                      return true
                    }
                  }
                });
              }

              var hasHandler = {
                has: function has (target, key) {
                  var has = key in target;
                  var isAllowed = allowedGlobals(key) ||
                    (typeof key === 'string' && key.charAt(0) === '_' && !(key in target.$data));
                  if (!has && !isAllowed) {
                    if (key in target.$data) { warnReservedPrefix(target, key); }
                    else { warnNonPresent(target, key); }
                  }
                  return has || !isAllowed
                }
              };

              var getHandler = {
                get: function get (target, key) {
                  if (typeof key === 'string' && !(key in target)) {
                    if (key in target.$data) { warnReservedPrefix(target, key); }
                    else { warnNonPresent(target, key); }
                  }
                  return target[key]
                }
              };

              initProxy = function initProxy (vm) {
                if (hasProxy) {
                  // determine which proxy handler to use
                  var options = vm.$options;
                  var handlers = options.render && options.render._withStripped
                    ? getHandler
                    : hasHandler;
                  vm._renderProxy = new Proxy(vm, handlers);
                } else {
                  vm._renderProxy = vm;
                }
              };
            }

            /*  */

            var seenObjects = new _Set();

            /**
             * Recursively traverse an object to evoke all converted
             * getters, so that every nested property inside the object
             * is collected as a "deep" dependency.
             */
            function traverse (val) {
              _traverse(val, seenObjects);
              seenObjects.clear();
            }

            function _traverse (val, seen) {
              var i, keys;
              var isA = Array.isArray(val);
              if ((!isA && !isObject(val)) || Object.isFrozen(val) || val instanceof VNode) {
                return
              }
              if (val.__ob__) {
                var depId = val.__ob__.dep.id;
                if (seen.has(depId)) {
                  return
                }
                seen.add(depId);
              }
              if (isA) {
                i = val.length;
                while (i--) { _traverse(val[i], seen); }
              } else {
                keys = Object.keys(val);
                i = keys.length;
                while (i--) { _traverse(val[keys[i]], seen); }
              }
            }

            var mark;
            var measure;

            if (process.env.NODE_ENV !== 'production') {
              var perf = inBrowser && window.performance;
              /* istanbul ignore if */
              if (
                perf &&
                perf.mark &&
                perf.measure &&
                perf.clearMarks &&
                perf.clearMeasures
              ) {
                mark = function (tag) { return perf.mark(tag); };
                measure = function (name, startTag, endTag) {
                  perf.measure(name, startTag, endTag);
                  perf.clearMarks(startTag);
                  perf.clearMarks(endTag);
                  perf.clearMeasures(name);
                };
              }
            }

            /*  */

            var normalizeEvent = cached(function (name) {
              var passive = name.charAt(0) === '&';
              name = passive ? name.slice(1) : name;
              var once$$1 = name.charAt(0) === '~'; // Prefixed last, checked first
              name = once$$1 ? name.slice(1) : name;
              var capture = name.charAt(0) === '!';
              name = capture ? name.slice(1) : name;
              return {
                name: name,
                once: once$$1,
                capture: capture,
                passive: passive
              }
            });

            function createFnInvoker (fns) {
              function invoker () {
                var arguments$1 = arguments;

                var fns = invoker.fns;
                if (Array.isArray(fns)) {
                  var cloned = fns.slice();
                  for (var i = 0; i < cloned.length; i++) {
                    cloned[i].apply(null, arguments$1);
                  }
                } else {
                  // return handler return value for single handlers
                  return fns.apply(null, arguments)
                }
              }
              invoker.fns = fns;
              return invoker
            }

            function updateListeners (
              on$$1,
              oldOn,
              add,
              remove$$1,
              createOnceHandler,
              vm
            ) {
              var name, def$$1, cur, old, event;
              for (name in on$$1) {
                def$$1 = cur = on$$1[name];
                old = oldOn[name];
                event = normalizeEvent(name);
                if (isUndef(cur)) {
                  process.env.NODE_ENV !== 'production' && warn(
                    "Invalid handler for event \"" + (event.name) + "\": got " + String(cur),
                    vm
                  );
                } else if (isUndef(old)) {
                  if (isUndef(cur.fns)) {
                    cur = on$$1[name] = createFnInvoker(cur);
                  }
                  if (isTrue(event.once)) {
                    cur = on$$1[name] = createOnceHandler(event.name, cur, event.capture);
                  }
                  add(event.name, cur, event.capture, event.passive, event.params);
                } else if (cur !== old) {
                  old.fns = cur;
                  on$$1[name] = old;
                }
              }
              for (name in oldOn) {
                if (isUndef(on$$1[name])) {
                  event = normalizeEvent(name);
                  remove$$1(event.name, oldOn[name], event.capture);
                }
              }
            }

            /*  */

            function mergeVNodeHook (def, hookKey, hook) {
              if (def instanceof VNode) {
                def = def.data.hook || (def.data.hook = {});
              }
              var invoker;
              var oldHook = def[hookKey];

              function wrappedHook () {
                hook.apply(this, arguments);
                // important: remove merged hook to ensure it's called only once
                // and prevent memory leak
                remove(invoker.fns, wrappedHook);
              }

              if (isUndef(oldHook)) {
                // no existing hook
                invoker = createFnInvoker([wrappedHook]);
              } else {
                /* istanbul ignore if */
                if (isDef(oldHook.fns) && isTrue(oldHook.merged)) {
                  // already a merged invoker
                  invoker = oldHook;
                  invoker.fns.push(wrappedHook);
                } else {
                  // existing plain hook
                  invoker = createFnInvoker([oldHook, wrappedHook]);
                }
              }

              invoker.merged = true;
              def[hookKey] = invoker;
            }

            /*  */

            function extractPropsFromVNodeData (
              data,
              Ctor,
              tag
            ) {
              // we are only extracting raw values here.
              // validation and default values are handled in the child
              // component itself.
              var propOptions = Ctor.options.props;
              if (isUndef(propOptions)) {
                return
              }
              var res = {};
              var attrs = data.attrs;
              var props = data.props;
              if (isDef(attrs) || isDef(props)) {
                for (var key in propOptions) {
                  var altKey = hyphenate(key);
                  if (process.env.NODE_ENV !== 'production') {
                    var keyInLowerCase = key.toLowerCase();
                    if (
                      key !== keyInLowerCase &&
                      attrs && hasOwn(attrs, keyInLowerCase)
                    ) {
                      tip(
                        "Prop \"" + keyInLowerCase + "\" is passed to component " +
                        (formatComponentName(tag || Ctor)) + ", but the declared prop name is" +
                        " \"" + key + "\". " +
                        "Note that HTML attributes are case-insensitive and camelCased " +
                        "props need to use their kebab-case equivalents when using in-DOM " +
                        "templates. You should probably use \"" + altKey + "\" instead of \"" + key + "\"."
                      );
                    }
                  }
                  checkProp(res, props, key, altKey, true) ||
                  checkProp(res, attrs, key, altKey, false);
                }
              }
              return res
            }

            function checkProp (
              res,
              hash,
              key,
              altKey,
              preserve
            ) {
              if (isDef(hash)) {
                if (hasOwn(hash, key)) {
                  res[key] = hash[key];
                  if (!preserve) {
                    delete hash[key];
                  }
                  return true
                } else if (hasOwn(hash, altKey)) {
                  res[key] = hash[altKey];
                  if (!preserve) {
                    delete hash[altKey];
                  }
                  return true
                }
              }
              return false
            }

            /*  */

            // The template compiler attempts to minimize the need for normalization by
            // statically analyzing the template at compile time.
            //
            // For plain HTML markup, normalization can be completely skipped because the
            // generated render function is guaranteed to return Array<VNode>. There are
            // two cases where extra normalization is needed:

            // 1. When the children contains components - because a functional component
            // may return an Array instead of a single root. In this case, just a simple
            // normalization is needed - if any child is an Array, we flatten the whole
            // thing with Array.prototype.concat. It is guaranteed to be only 1-level deep
            // because functional components already normalize their own children.
            function simpleNormalizeChildren (children) {
              for (var i = 0; i < children.length; i++) {
                if (Array.isArray(children[i])) {
                  return Array.prototype.concat.apply([], children)
                }
              }
              return children
            }

            // 2. When the children contains constructs that always generated nested Arrays,
            // e.g. <template>, <slot>, v-for, or when the children is provided by user
            // with hand-written render functions / JSX. In such cases a full normalization
            // is needed to cater to all possible types of children values.
            function normalizeChildren (children) {
              return isPrimitive(children)
                ? [createTextVNode(children)]
                : Array.isArray(children)
                  ? normalizeArrayChildren(children)
                  : undefined
            }

            function isTextNode (node) {
              return isDef(node) && isDef(node.text) && isFalse(node.isComment)
            }

            function normalizeArrayChildren (children, nestedIndex) {
              var res = [];
              var i, c, lastIndex, last;
              for (i = 0; i < children.length; i++) {
                c = children[i];
                if (isUndef(c) || typeof c === 'boolean') { continue }
                lastIndex = res.length - 1;
                last = res[lastIndex];
                //  nested
                if (Array.isArray(c)) {
                  if (c.length > 0) {
                    c = normalizeArrayChildren(c, ((nestedIndex || '') + "_" + i));
                    // merge adjacent text nodes
                    if (isTextNode(c[0]) && isTextNode(last)) {
                      res[lastIndex] = createTextVNode(last.text + (c[0]).text);
                      c.shift();
                    }
                    res.push.apply(res, c);
                  }
                } else if (isPrimitive(c)) {
                  if (isTextNode(last)) {
                    // merge adjacent text nodes
                    // this is necessary for SSR hydration because text nodes are
                    // essentially merged when rendered to HTML strings
                    res[lastIndex] = createTextVNode(last.text + c);
                  } else if (c !== '') {
                    // convert primitive to vnode
                    res.push(createTextVNode(c));
                  }
                } else {
                  if (isTextNode(c) && isTextNode(last)) {
                    // merge adjacent text nodes
                    res[lastIndex] = createTextVNode(last.text + c.text);
                  } else {
                    // default key for nested array children (likely generated by v-for)
                    if (isTrue(children._isVList) &&
                      isDef(c.tag) &&
                      isUndef(c.key) &&
                      isDef(nestedIndex)) {
                      c.key = "__vlist" + nestedIndex + "_" + i + "__";
                    }
                    res.push(c);
                  }
                }
              }
              return res
            }

            /*  */

            function ensureCtor (comp, base) {
              if (
                comp.__esModule ||
                (hasSymbol && comp[Symbol.toStringTag] === 'Module')
              ) {
                comp = comp.default;
              }
              return isObject(comp)
                ? base.extend(comp)
                : comp
            }

            function createAsyncPlaceholder (
              factory,
              data,
              context,
              children,
              tag
            ) {
              var node = createEmptyVNode();
              node.asyncFactory = factory;
              node.asyncMeta = { data: data, context: context, children: children, tag: tag };
              return node
            }

            function resolveAsyncComponent (
              factory,
              baseCtor,
              context
            ) {
              if (isTrue(factory.error) && isDef(factory.errorComp)) {
                return factory.errorComp
              }

              if (isDef(factory.resolved)) {
                return factory.resolved
              }

              if (isTrue(factory.loading) && isDef(factory.loadingComp)) {
                return factory.loadingComp
              }

              if (isDef(factory.contexts)) {
                // already pending
                factory.contexts.push(context);
              } else {
                var contexts = factory.contexts = [context];
                var sync = true;

                var forceRender = function (renderCompleted) {
                  for (var i = 0, l = contexts.length; i < l; i++) {
                    contexts[i].$forceUpdate();
                  }

                  if (renderCompleted) {
                    contexts.length = 0;
                  }
                };

                var resolve = once$1(function (res) {
                  // cache resolved
                  factory.resolved = ensureCtor(res, baseCtor);
                  // invoke callbacks only if this is not a synchronous resolve
                  // (async resolves are shimmed as synchronous during SSR)
                  if (!sync) {
                    forceRender(true);
                  }
                });

                var reject = once$1(function (reason) {
                  process.env.NODE_ENV !== 'production' && warn(
                    "Failed to resolve async component: " + (String(factory)) +
                    (reason ? ("\nReason: " + reason) : '')
                  );
                  if (isDef(factory.errorComp)) {
                    factory.error = true;
                    forceRender(true);
                  }
                });

                var res = factory(resolve, reject);

                if (isObject(res)) {
                  if (typeof res.then === 'function') {
                    // () => Promise
                    if (isUndef(factory.resolved)) {
                      res.then(resolve, reject);
                    }
                  } else if (isDef(res.component) && typeof res.component.then === 'function') {
                    res.component.then(resolve, reject);

                    if (isDef(res.error)) {
                      factory.errorComp = ensureCtor(res.error, baseCtor);
                    }

                    if (isDef(res.loading)) {
                      factory.loadingComp = ensureCtor(res.loading, baseCtor);
                      if (res.delay === 0) {
                        factory.loading = true;
                      } else {
                        setTimeout(function () {
                          if (isUndef(factory.resolved) && isUndef(factory.error)) {
                            factory.loading = true;
                            forceRender(false);
                          }
                        }, res.delay || 200);
                      }
                    }

                    if (isDef(res.timeout)) {
                      setTimeout(function () {
                        if (isUndef(factory.resolved)) {
                          reject(
                            process.env.NODE_ENV !== 'production'
                              ? ("timeout (" + (res.timeout) + "ms)")
                              : null
                          );
                        }
                      }, res.timeout);
                    }
                  }
                }

                sync = false;
                // return in case resolved synchronously
                return factory.loading
                  ? factory.loadingComp
                  : factory.resolved
              }
            }

            /*  */

            function isAsyncPlaceholder (node) {
              return node.isComment && node.asyncFactory
            }

            /*  */

            function getFirstComponentChild (children) {
              if (Array.isArray(children)) {
                for (var i = 0; i < children.length; i++) {
                  var c = children[i];
                  if (isDef(c) && (isDef(c.componentOptions) || isAsyncPlaceholder(c))) {
                    return c
                  }
                }
              }
            }

            /*  */

            /*  */

            function initEvents (vm) {
              vm._events = Object.create(null);
              vm._hasHookEvent = false;
              // init parent attached events
              var listeners = vm.$options._parentListeners;
              if (listeners) {
                updateComponentListeners(vm, listeners);
              }
            }

            var target;

            function add (event, fn) {
              target.$on(event, fn);
            }

            function remove$1 (event, fn) {
              target.$off(event, fn);
            }

            function createOnceHandler (event, fn) {
              var _target = target;
              return function onceHandler () {
                var res = fn.apply(null, arguments);
                if (res !== null) {
                  _target.$off(event, onceHandler);
                }
              }
            }

            function updateComponentListeners (
              vm,
              listeners,
              oldListeners
            ) {
              target = vm;
              updateListeners(listeners, oldListeners || {}, add, remove$1, createOnceHandler, vm);
              target = undefined;
            }

            function eventsMixin (Vue) {
              var hookRE = /^hook:/;
              Vue.prototype.$on = function (event, fn) {
                var vm = this;
                if (Array.isArray(event)) {
                  for (var i = 0, l = event.length; i < l; i++) {
                    vm.$on(event[i], fn);
                  }
                } else {
                  (vm._events[event] || (vm._events[event] = [])).push(fn);
                  // optimize hook:event cost by using a boolean flag marked at registration
                  // instead of a hash lookup
                  if (hookRE.test(event)) {
                    vm._hasHookEvent = true;
                  }
                }
                return vm
              };

              Vue.prototype.$once = function (event, fn) {
                var vm = this;
                function on$$1 () {
                  vm.$off(event, on$$1);
                  fn.apply(vm, arguments);
                }
                on$$1.fn = fn;
                vm.$on(event, on$$1);
                return vm
              };

              Vue.prototype.$off = function (event, fn) {
                var vm = this;
                // all
                if (!arguments.length) {
                  vm._events = Object.create(null);
                  return vm
                }
                // array of events
                if (Array.isArray(event)) {
                  for (var i = 0, l = event.length; i < l; i++) {
                    vm.$off(event[i], fn);
                  }
                  return vm
                }
                // specific event
                var cbs = vm._events[event];
                if (!cbs) {
                  return vm
                }
                if (!fn) {
                  vm._events[event] = null;
                  return vm
                }
                if (fn) {
                  // specific handler
                  var cb;
                  var i$1 = cbs.length;
                  while (i$1--) {
                    cb = cbs[i$1];
                    if (cb === fn || cb.fn === fn) {
                      cbs.splice(i$1, 1);
                      break
                    }
                  }
                }
                return vm
              };

              Vue.prototype.$emit = function (event) {
                var vm = this;
                if (process.env.NODE_ENV !== 'production') {
                  var lowerCaseEvent = event.toLowerCase();
                  if (lowerCaseEvent !== event && vm._events[lowerCaseEvent]) {
                    tip(
                      "Event \"" + lowerCaseEvent + "\" is emitted in component " +
                      (formatComponentName(vm)) + " but the handler is registered for \"" + event + "\". " +
                      "Note that HTML attributes are case-insensitive and you cannot use " +
                      "v-on to listen to camelCase events when using in-DOM templates. " +
                      "You should probably use \"" + (hyphenate(event)) + "\" instead of \"" + event + "\"."
                    );
                  }
                }
                var cbs = vm._events[event];
                if (cbs) {
                  cbs = cbs.length > 1 ? toArray(cbs) : cbs;
                  var args = toArray(arguments, 1);
                  for (var i = 0, l = cbs.length; i < l; i++) {
                    try {
                      cbs[i].apply(vm, args);
                    } catch (e) {
                      handleError(e, vm, ("event handler for \"" + event + "\""));
                    }
                  }
                }
                return vm
              };
            }

            /*  */



            /**
             * Runtime helper for resolving raw children VNodes into a slot object.
             */
            function resolveSlots (
              children,
              context
            ) {
              var slots = {};
              if (!children) {
                return slots
              }
              for (var i = 0, l = children.length; i < l; i++) {
                var child = children[i];
                var data = child.data;
                // remove slot attribute if the node is resolved as a Vue slot node
                if (data && data.attrs && data.attrs.slot) {
                  delete data.attrs.slot;
                }
                // named slots should only be respected if the vnode was rendered in the
                // same context.
                if ((child.context === context || child.fnContext === context) &&
                  data && data.slot != null
                ) {
                  var name = data.slot;
                  var slot = (slots[name] || (slots[name] = []));
                  if (child.tag === 'template') {
                    slot.push.apply(slot, child.children || []);
                  } else {
                    slot.push(child);
                  }
                } else {
                  (slots.default || (slots.default = [])).push(child);
                }
              }
              // ignore slots that contains only whitespace
              for (var name$1 in slots) {
                if (slots[name$1].every(isWhitespace)) {
                  delete slots[name$1];
                }
              }
              return slots
            }

            function isWhitespace (node) {
              return (node.isComment && !node.asyncFactory) || node.text === ' '
            }

            function resolveScopedSlots (
              fns, // see flow/vnode
              res
            ) {
              res = res || {};
              for (var i = 0; i < fns.length; i++) {
                if (Array.isArray(fns[i])) {
                  resolveScopedSlots(fns[i], res);
                } else {
                  res[fns[i].key] = fns[i].fn;
                }
              }
              return res
            }

            /*  */

            var activeInstance = null;
            var isUpdatingChildComponent = false;

            function setActiveInstance(vm) {
              var prevActiveInstance = activeInstance;
              activeInstance = vm;
              return function () {
                activeInstance = prevActiveInstance;
              }
            }

            function initLifecycle (vm) {
              var options = vm.$options;

              // locate first non-abstract parent
              var parent = options.parent;
              if (parent && !options.abstract) {
                while (parent.$options.abstract && parent.$parent) {
                  parent = parent.$parent;
                }
                parent.$children.push(vm);
              }

              vm.$parent = parent;
              vm.$root = parent ? parent.$root : vm;

              vm.$children = [];
              vm.$refs = {};

              vm._watcher = null;
              vm._inactive = null;
              vm._directInactive = false;
              vm._isMounted = false;
              vm._isDestroyed = false;
              vm._isBeingDestroyed = false;
            }

            function lifecycleMixin (Vue) {
              Vue.prototype._update = function (vnode, hydrating) {
                var vm = this;
                var prevEl = vm.$el;
                var prevVnode = vm._vnode;
                var restoreActiveInstance = setActiveInstance(vm);
                vm._vnode = vnode;
                // Vue.prototype.__patch__ is injected in entry points
                // based on the rendering backend used.
                if (!prevVnode) {
                  // initial render
                  vm.$el = vm.__patch__(vm.$el, vnode, hydrating, false /* removeOnly */);
                } else {
                  // updates
                  vm.$el = vm.__patch__(prevVnode, vnode);
                }
                restoreActiveInstance();
                // update __vue__ reference
                if (prevEl) {
                  prevEl.__vue__ = null;
                }
                if (vm.$el) {
                  vm.$el.__vue__ = vm;
                }
                // if parent is an HOC, update its $el as well
                if (vm.$vnode && vm.$parent && vm.$vnode === vm.$parent._vnode) {
                  vm.$parent.$el = vm.$el;
                }
                // updated hook is called by the scheduler to ensure that children are
                // updated in a parent's updated hook.
              };

              Vue.prototype.$forceUpdate = function () {
                var vm = this;
                if (vm._watcher) {
                  vm._watcher.update();
                }
              };

              Vue.prototype.$destroy = function () {
                var vm = this;
                if (vm._isBeingDestroyed) {
                  return
                }
                callHook(vm, 'beforeDestroy');
                vm._isBeingDestroyed = true;
                // remove self from parent
                var parent = vm.$parent;
                if (parent && !parent._isBeingDestroyed && !vm.$options.abstract) {
                  remove(parent.$children, vm);
                }
                // teardown watchers
                if (vm._watcher) {
                  vm._watcher.teardown();
                }
                var i = vm._watchers.length;
                while (i--) {
                  vm._watchers[i].teardown();
                }
                // remove reference from data ob
                // frozen object may not have observer.
                if (vm._data.__ob__) {
                  vm._data.__ob__.vmCount--;
                }
                // call the last hook...
                vm._isDestroyed = true;
                // invoke destroy hooks on current rendered tree
                vm.__patch__(vm._vnode, null);
                // fire destroyed hook
                callHook(vm, 'destroyed');
                // turn off all instance listeners.
                vm.$off();
                // remove __vue__ reference
                if (vm.$el) {
                  vm.$el.__vue__ = null;
                }
                // release circular reference (#6759)
                if (vm.$vnode) {
                  vm.$vnode.parent = null;
                }
              };
            }

            function mountComponent (
              vm,
              el,
              hydrating
            ) {
              vm.$el = el;
              if (!vm.$options.render) {
                vm.$options.render = createEmptyVNode;
                if (process.env.NODE_ENV !== 'production') {
                  /* istanbul ignore if */
                  if ((vm.$options.template && vm.$options.template.charAt(0) !== '#') ||
                    vm.$options.el || el) {
                    warn(
                      'You are using the runtime-only build of Vue where the template ' +
                      'compiler is not available. Either pre-compile the templates into ' +
                      'render functions, or use the compiler-included build.',
                      vm
                    );
                  } else {
                    warn(
                      'Failed to mount component: template or render function not defined.',
                      vm
                    );
                  }
                }
              }
              callHook(vm, 'beforeMount');

              var updateComponent;
              /* istanbul ignore if */
              if (process.env.NODE_ENV !== 'production' && config$1.performance && mark) {
                updateComponent = function () {
                  var name = vm._name;
                  var id = vm._uid;
                  var startTag = "vue-perf-start:" + id;
                  var endTag = "vue-perf-end:" + id;

                  mark(startTag);
                  var vnode = vm._render();
                  mark(endTag);
                  measure(("vue " + name + " render"), startTag, endTag);

                  mark(startTag);
                  vm._update(vnode, hydrating);
                  mark(endTag);
                  measure(("vue " + name + " patch"), startTag, endTag);
                };
              } else {
                updateComponent = function () {
                  vm._update(vm._render(), hydrating);
                };
              }

              // we set this to vm._watcher inside the watcher's constructor
              // since the watcher's initial patch may call $forceUpdate (e.g. inside child
              // component's mounted hook), which relies on vm._watcher being already defined
              new Watcher(vm, updateComponent, noop$1, {
                before: function before () {
                  if (vm._isMounted && !vm._isDestroyed) {
                    callHook(vm, 'beforeUpdate');
                  }
                }
              }, true /* isRenderWatcher */);
              hydrating = false;

              // manually mounted instance, call mounted on self
              // mounted is called for render-created child components in its inserted hook
              if (vm.$vnode == null) {
                vm._isMounted = true;
                callHook(vm, 'mounted');
              }
              return vm
            }

            function updateChildComponent (
              vm,
              propsData,
              listeners,
              parentVnode,
              renderChildren
            ) {
              if (process.env.NODE_ENV !== 'production') {
                isUpdatingChildComponent = true;
              }

              // determine whether component has slot children
              // we need to do this before overwriting $options._renderChildren
              var hasChildren = !!(
                renderChildren ||               // has new static slots
                vm.$options._renderChildren ||  // has old static slots
                parentVnode.data.scopedSlots || // has new scoped slots
                vm.$scopedSlots !== emptyObject // has old scoped slots
              );

              vm.$options._parentVnode = parentVnode;
              vm.$vnode = parentVnode; // update vm's placeholder node without re-render

              if (vm._vnode) { // update child tree's parent
                vm._vnode.parent = parentVnode;
              }
              vm.$options._renderChildren = renderChildren;

              // update $attrs and $listeners hash
              // these are also reactive so they may trigger child update if the child
              // used them during render
              vm.$attrs = parentVnode.data.attrs || emptyObject;
              vm.$listeners = listeners || emptyObject;

              // update props
              if (propsData && vm.$options.props) {
                toggleObserving(false);
                var props = vm._props;
                var propKeys = vm.$options._propKeys || [];
                for (var i = 0; i < propKeys.length; i++) {
                  var key = propKeys[i];
                  var propOptions = vm.$options.props; // wtf flow?
                  props[key] = validateProp(key, propOptions, propsData, vm);
                }
                toggleObserving(true);
                // keep a copy of raw propsData
                vm.$options.propsData = propsData;
              }

              // update listeners
              listeners = listeners || emptyObject;
              var oldListeners = vm.$options._parentListeners;
              vm.$options._parentListeners = listeners;
              updateComponentListeners(vm, listeners, oldListeners);

              // resolve slots + force update if has children
              if (hasChildren) {
                vm.$slots = resolveSlots(renderChildren, parentVnode.context);
                vm.$forceUpdate();
              }

              if (process.env.NODE_ENV !== 'production') {
                isUpdatingChildComponent = false;
              }
            }

            function isInInactiveTree (vm) {
              while (vm && (vm = vm.$parent)) {
                if (vm._inactive) { return true }
              }
              return false
            }

            function activateChildComponent (vm, direct) {
              if (direct) {
                vm._directInactive = false;
                if (isInInactiveTree(vm)) {
                  return
                }
              } else if (vm._directInactive) {
                return
              }
              if (vm._inactive || vm._inactive === null) {
                vm._inactive = false;
                for (var i = 0; i < vm.$children.length; i++) {
                  activateChildComponent(vm.$children[i]);
                }
                callHook(vm, 'activated');
              }
            }

            function deactivateChildComponent (vm, direct) {
              if (direct) {
                vm._directInactive = true;
                if (isInInactiveTree(vm)) {
                  return
                }
              }
              if (!vm._inactive) {
                vm._inactive = true;
                for (var i = 0; i < vm.$children.length; i++) {
                  deactivateChildComponent(vm.$children[i]);
                }
                callHook(vm, 'deactivated');
              }
            }

            function callHook (vm, hook) {
              // #7573 disable dep collection when invoking lifecycle hooks
              pushTarget();
              var handlers = vm.$options[hook];
              if (handlers) {
                for (var i = 0, j = handlers.length; i < j; i++) {
                  try {
                    handlers[i].call(vm);
                  } catch (e) {
                    handleError(e, vm, (hook + " hook"));
                  }
                }
              }
              if (vm._hasHookEvent) {
                vm.$emit('hook:' + hook);
              }
              popTarget();
            }

            /*  */

            var MAX_UPDATE_COUNT = 100;

            var queue$1 = [];
            var activatedChildren = [];
            var has = {};
            var circular = {};
            var waiting = false;
            var flushing = false;
            var index = 0;

            /**
             * Reset the scheduler's state.
             */
            function resetSchedulerState () {
              index = queue$1.length = activatedChildren.length = 0;
              has = {};
              if (process.env.NODE_ENV !== 'production') {
                circular = {};
              }
              waiting = flushing = false;
            }

            /**
             * Flush both queues and run the watchers.
             */
            function flushSchedulerQueue () {
              flushing = true;
              var watcher, id;

              // Sort queue before flush.
              // This ensures that:
              // 1. Components are updated from parent to child. (because parent is always
              //    created before the child)
              // 2. A component's user watchers are run before its render watcher (because
              //    user watchers are created before the render watcher)
              // 3. If a component is destroyed during a parent component's watcher run,
              //    its watchers can be skipped.
              queue$1.sort(function (a, b) { return a.id - b.id; });

              // do not cache length because more watchers might be pushed
              // as we run existing watchers
              for (index = 0; index < queue$1.length; index++) {
                watcher = queue$1[index];
                if (watcher.before) {
                  watcher.before();
                }
                id = watcher.id;
                has[id] = null;
                watcher.run();
                // in dev build, check and stop circular updates.
                if (process.env.NODE_ENV !== 'production' && has[id] != null) {
                  circular[id] = (circular[id] || 0) + 1;
                  if (circular[id] > MAX_UPDATE_COUNT) {
                    warn(
                      'You may have an infinite update loop ' + (
                        watcher.user
                          ? ("in watcher with expression \"" + (watcher.expression) + "\"")
                          : "in a component render function."
                      ),
                      watcher.vm
                    );
                    break
                  }
                }
              }

              // keep copies of post queues before resetting state
              var activatedQueue = activatedChildren.slice();
              var updatedQueue = queue$1.slice();

              resetSchedulerState();

              // call component updated and activated hooks
              callActivatedHooks(activatedQueue);
              callUpdatedHooks(updatedQueue);

              // devtool hook
              /* istanbul ignore if */
              if (devtools && config$1.devtools) {
                devtools.emit('flush');
              }
            }

            function callUpdatedHooks (queue) {
              var i = queue.length;
              while (i--) {
                var watcher = queue[i];
                var vm = watcher.vm;
                if (vm._watcher === watcher && vm._isMounted && !vm._isDestroyed) {
                  callHook(vm, 'updated');
                }
              }
            }

            /**
             * Queue a kept-alive component that was activated during patch.
             * The queue will be processed after the entire tree has been patched.
             */
            function queueActivatedComponent (vm) {
              // setting _inactive to false here so that a render function can
              // rely on checking whether it's in an inactive tree (e.g. router-view)
              vm._inactive = false;
              activatedChildren.push(vm);
            }

            function callActivatedHooks (queue) {
              for (var i = 0; i < queue.length; i++) {
                queue[i]._inactive = true;
                activateChildComponent(queue[i], true /* true */);
              }
            }

            /**
             * Push a watcher into the watcher queue.
             * Jobs with duplicate IDs will be skipped unless it's
             * pushed when the queue is being flushed.
             */
            function queueWatcher (watcher) {
              var id = watcher.id;
              if (has[id] == null) {
                has[id] = true;
                if (!flushing) {
                  queue$1.push(watcher);
                } else {
                  // if already flushing, splice the watcher based on its id
                  // if already past its id, it will be run next immediately.
                  var i = queue$1.length - 1;
                  while (i > index && queue$1[i].id > watcher.id) {
                    i--;
                  }
                  queue$1.splice(i + 1, 0, watcher);
                }
                // queue the flush
                if (!waiting) {
                  waiting = true;

                  if (process.env.NODE_ENV !== 'production' && !config$1.async) {
                    flushSchedulerQueue();
                    return
                  }
                  nextTick$1(flushSchedulerQueue);
                }
              }
            }

            /*  */



            var uid$1 = 0;

            /**
             * A watcher parses an expression, collects dependencies,
             * and fires callback when the expression value changes.
             * This is used for both the $watch() api and directives.
             */
            var Watcher = function Watcher (
              vm,
              expOrFn,
              cb,
              options,
              isRenderWatcher
            ) {
              this.vm = vm;
              if (isRenderWatcher) {
                vm._watcher = this;
              }
              vm._watchers.push(this);
              // options
              if (options) {
                this.deep = !!options.deep;
                this.user = !!options.user;
                this.lazy = !!options.lazy;
                this.sync = !!options.sync;
                this.before = options.before;
              } else {
                this.deep = this.user = this.lazy = this.sync = false;
              }
              this.cb = cb;
              this.id = ++uid$1; // uid for batching
              this.active = true;
              this.dirty = this.lazy; // for lazy watchers
              this.deps = [];
              this.newDeps = [];
              this.depIds = new _Set();
              this.newDepIds = new _Set();
              this.expression = process.env.NODE_ENV !== 'production'
                ? expOrFn.toString()
                : '';
              // parse expression for getter
              if (typeof expOrFn === 'function') {
                this.getter = expOrFn;
              } else {
                this.getter = parsePath(expOrFn);
                if (!this.getter) {
                  this.getter = noop$1;
                  process.env.NODE_ENV !== 'production' && warn(
                    "Failed watching path: \"" + expOrFn + "\" " +
                    'Watcher only accepts simple dot-delimited paths. ' +
                    'For full control, use a function instead.',
                    vm
                  );
                }
              }
              this.value = this.lazy
                ? undefined
                : this.get();
            };

            /**
             * Evaluate the getter, and re-collect dependencies.
             */
            Watcher.prototype.get = function get () {
              pushTarget(this);
              var value;
              var vm = this.vm;
              try {
                value = this.getter.call(vm, vm);
              } catch (e) {
                if (this.user) {
                  handleError(e, vm, ("getter for watcher \"" + (this.expression) + "\""));
                } else {
                  throw e
                }
              } finally {
                // "touch" every property so they are all tracked as
                // dependencies for deep watching
                if (this.deep) {
                  traverse(value);
                }
                popTarget();
                this.cleanupDeps();
              }
              return value
            };

            /**
             * Add a dependency to this directive.
             */
            Watcher.prototype.addDep = function addDep (dep) {
              var id = dep.id;
              if (!this.newDepIds.has(id)) {
                this.newDepIds.add(id);
                this.newDeps.push(dep);
                if (!this.depIds.has(id)) {
                  dep.addSub(this);
                }
              }
            };

            /**
             * Clean up for dependency collection.
             */
            Watcher.prototype.cleanupDeps = function cleanupDeps () {
              var i = this.deps.length;
              while (i--) {
                var dep = this.deps[i];
                if (!this.newDepIds.has(dep.id)) {
                  dep.removeSub(this);
                }
              }
              var tmp = this.depIds;
              this.depIds = this.newDepIds;
              this.newDepIds = tmp;
              this.newDepIds.clear();
              tmp = this.deps;
              this.deps = this.newDeps;
              this.newDeps = tmp;
              this.newDeps.length = 0;
            };

            /**
             * Subscriber interface.
             * Will be called when a dependency changes.
             */
            Watcher.prototype.update = function update () {
              /* istanbul ignore else */
              if (this.lazy) {
                this.dirty = true;
              } else if (this.sync) {
                this.run();
              } else {
                queueWatcher(this);
              }
            };

            /**
             * Scheduler job interface.
             * Will be called by the scheduler.
             */
            Watcher.prototype.run = function run () {
              if (this.active) {
                var value = this.get();
                if (
                  value !== this.value ||
                  // Deep watchers and watchers on Object/Arrays should fire even
                  // when the value is the same, because the value may
                  // have mutated.
                  isObject(value) ||
                  this.deep
                ) {
                  // set new value
                  var oldValue = this.value;
                  this.value = value;
                  if (this.user) {
                    try {
                      this.cb.call(this.vm, value, oldValue);
                    } catch (e) {
                      handleError(e, this.vm, ("callback for watcher \"" + (this.expression) + "\""));
                    }
                  } else {
                    this.cb.call(this.vm, value, oldValue);
                  }
                }
              }
            };

            /**
             * Evaluate the value of the watcher.
             * This only gets called for lazy watchers.
             */
            Watcher.prototype.evaluate = function evaluate () {
              this.value = this.get();
              this.dirty = false;
            };

            /**
             * Depend on all deps collected by this watcher.
             */
            Watcher.prototype.depend = function depend () {
              var i = this.deps.length;
              while (i--) {
                this.deps[i].depend();
              }
            };

            /**
             * Remove self from all dependencies' subscriber list.
             */
            Watcher.prototype.teardown = function teardown () {
              if (this.active) {
                // remove self from vm's watcher list
                // this is a somewhat expensive operation so we skip it
                // if the vm is being destroyed.
                if (!this.vm._isBeingDestroyed) {
                  remove(this.vm._watchers, this);
                }
                var i = this.deps.length;
                while (i--) {
                  this.deps[i].removeSub(this);
                }
                this.active = false;
              }
            };

            /*  */

            var sharedPropertyDefinition = {
              enumerable: true,
              configurable: true,
              get: noop$1,
              set: noop$1
            };

            function proxy (target, sourceKey, key) {
              sharedPropertyDefinition.get = function proxyGetter () {
                return this[sourceKey][key]
              };
              sharedPropertyDefinition.set = function proxySetter (val) {
                this[sourceKey][key] = val;
              };
              Object.defineProperty(target, key, sharedPropertyDefinition);
            }

            function initState (vm) {
              vm._watchers = [];
              var opts = vm.$options;
              if (opts.props) { initProps(vm, opts.props); }
              if (opts.methods) { initMethods(vm, opts.methods); }
              if (opts.data) {
                initData(vm);
              } else {
                observe(vm._data = {}, true /* asRootData */);
              }
              if (opts.computed) { initComputed(vm, opts.computed); }
              if (opts.watch && opts.watch !== nativeWatch) {
                initWatch(vm, opts.watch);
              }
            }

            function initProps (vm, propsOptions) {
              var propsData = vm.$options.propsData || {};
              var props = vm._props = {};
              // cache prop keys so that future props updates can iterate using Array
              // instead of dynamic object key enumeration.
              var keys = vm.$options._propKeys = [];
              var isRoot = !vm.$parent;
              // root instance props should be converted
              if (!isRoot) {
                toggleObserving(false);
              }
              var loop = function ( key ) {
                keys.push(key);
                var value = validateProp(key, propsOptions, propsData, vm);
                /* istanbul ignore else */
                if (process.env.NODE_ENV !== 'production') {
                  var hyphenatedKey = hyphenate(key);
                  if (isReservedAttribute(hyphenatedKey) ||
                      config$1.isReservedAttr(hyphenatedKey)) {
                    warn(
                      ("\"" + hyphenatedKey + "\" is a reserved attribute and cannot be used as component prop."),
                      vm
                    );
                  }
                  defineReactive$$1(props, key, value, function () {
                    if (!isRoot && !isUpdatingChildComponent) {
                      warn(
                        "Avoid mutating a prop directly since the value will be " +
                        "overwritten whenever the parent component re-renders. " +
                        "Instead, use a data or computed property based on the prop's " +
                        "value. Prop being mutated: \"" + key + "\"",
                        vm
                      );
                    }
                  });
                } else {
                  defineReactive$$1(props, key, value);
                }
                // static props are already proxied on the component's prototype
                // during Vue.extend(). We only need to proxy props defined at
                // instantiation here.
                if (!(key in vm)) {
                  proxy(vm, "_props", key);
                }
              };

              for (var key in propsOptions) loop( key );
              toggleObserving(true);
            }

            function initData (vm) {
              var data = vm.$options.data;
              data = vm._data = typeof data === 'function'
                ? getData(data, vm)
                : data || {};
              if (!isPlainObject(data)) {
                data = {};
                process.env.NODE_ENV !== 'production' && warn(
                  'data functions should return an object:\n' +
                  'https://vuejs.org/v2/guide/components.html#data-Must-Be-a-Function',
                  vm
                );
              }
              // proxy data on instance
              var keys = Object.keys(data);
              var props = vm.$options.props;
              var methods = vm.$options.methods;
              var i = keys.length;
              while (i--) {
                var key = keys[i];
                if (process.env.NODE_ENV !== 'production') {
                  if (methods && hasOwn(methods, key)) {
                    warn(
                      ("Method \"" + key + "\" has already been defined as a data property."),
                      vm
                    );
                  }
                }
                if (props && hasOwn(props, key)) {
                  process.env.NODE_ENV !== 'production' && warn(
                    "The data property \"" + key + "\" is already declared as a prop. " +
                    "Use prop default value instead.",
                    vm
                  );
                } else if (!isReserved(key)) {
                  proxy(vm, "_data", key);
                }
              }
              // observe data
              observe(data, true /* asRootData */);
            }

            function getData (data, vm) {
              // #7573 disable dep collection when invoking data getters
              pushTarget();
              try {
                return data.call(vm, vm)
              } catch (e) {
                handleError(e, vm, "data()");
                return {}
              } finally {
                popTarget();
              }
            }

            var computedWatcherOptions = { lazy: true };

            function initComputed (vm, computed) {
              // $flow-disable-line
              var watchers = vm._computedWatchers = Object.create(null);
              // computed properties are just getters during SSR
              var isSSR = isServerRendering();

              for (var key in computed) {
                var userDef = computed[key];
                var getter = typeof userDef === 'function' ? userDef : userDef.get;
                if (process.env.NODE_ENV !== 'production' && getter == null) {
                  warn(
                    ("Getter is missing for computed property \"" + key + "\"."),
                    vm
                  );
                }

                if (!isSSR) {
                  // create internal watcher for the computed property.
                  watchers[key] = new Watcher(
                    vm,
                    getter || noop$1,
                    noop$1,
                    computedWatcherOptions
                  );
                }

                // component-defined computed properties are already defined on the
                // component prototype. We only need to define computed properties defined
                // at instantiation here.
                if (!(key in vm)) {
                  defineComputed(vm, key, userDef);
                } else if (process.env.NODE_ENV !== 'production') {
                  if (key in vm.$data) {
                    warn(("The computed property \"" + key + "\" is already defined in data."), vm);
                  } else if (vm.$options.props && key in vm.$options.props) {
                    warn(("The computed property \"" + key + "\" is already defined as a prop."), vm);
                  }
                }
              }
            }

            function defineComputed (
              target,
              key,
              userDef
            ) {
              var shouldCache = !isServerRendering();
              if (typeof userDef === 'function') {
                sharedPropertyDefinition.get = shouldCache
                  ? createComputedGetter(key)
                  : createGetterInvoker(userDef);
                sharedPropertyDefinition.set = noop$1;
              } else {
                sharedPropertyDefinition.get = userDef.get
                  ? shouldCache && userDef.cache !== false
                    ? createComputedGetter(key)
                    : createGetterInvoker(userDef.get)
                  : noop$1;
                sharedPropertyDefinition.set = userDef.set || noop$1;
              }
              if (process.env.NODE_ENV !== 'production' &&
                  sharedPropertyDefinition.set === noop$1) {
                sharedPropertyDefinition.set = function () {
                  warn(
                    ("Computed property \"" + key + "\" was assigned to but it has no setter."),
                    this
                  );
                };
              }
              Object.defineProperty(target, key, sharedPropertyDefinition);
            }

            function createComputedGetter (key) {
              return function computedGetter () {
                var watcher = this._computedWatchers && this._computedWatchers[key];
                if (watcher) {
                  if (watcher.dirty) {
                    watcher.evaluate();
                  }
                  if (Dep.target) {
                    watcher.depend();
                  }
                  return watcher.value
                }
              }
            }

            function createGetterInvoker(fn) {
              return function computedGetter () {
                return fn.call(this, this)
              }
            }

            function initMethods (vm, methods) {
              var props = vm.$options.props;
              for (var key in methods) {
                if (process.env.NODE_ENV !== 'production') {
                  if (typeof methods[key] !== 'function') {
                    warn(
                      "Method \"" + key + "\" has type \"" + (typeof methods[key]) + "\" in the component definition. " +
                      "Did you reference the function correctly?",
                      vm
                    );
                  }
                  if (props && hasOwn(props, key)) {
                    warn(
                      ("Method \"" + key + "\" has already been defined as a prop."),
                      vm
                    );
                  }
                  if ((key in vm) && isReserved(key)) {
                    warn(
                      "Method \"" + key + "\" conflicts with an existing Vue instance method. " +
                      "Avoid defining component methods that start with _ or $."
                    );
                  }
                }
                vm[key] = typeof methods[key] !== 'function' ? noop$1 : bind(methods[key], vm);
              }
            }

            function initWatch (vm, watch) {
              for (var key in watch) {
                var handler = watch[key];
                if (Array.isArray(handler)) {
                  for (var i = 0; i < handler.length; i++) {
                    createWatcher(vm, key, handler[i]);
                  }
                } else {
                  createWatcher(vm, key, handler);
                }
              }
            }

            function createWatcher (
              vm,
              expOrFn,
              handler,
              options
            ) {
              if (isPlainObject(handler)) {
                options = handler;
                handler = handler.handler;
              }
              if (typeof handler === 'string') {
                handler = vm[handler];
              }
              return vm.$watch(expOrFn, handler, options)
            }

            function stateMixin (Vue) {
              // flow somehow has problems with directly declared definition object
              // when using Object.defineProperty, so we have to procedurally build up
              // the object here.
              var dataDef = {};
              dataDef.get = function () { return this._data };
              var propsDef = {};
              propsDef.get = function () { return this._props };
              if (process.env.NODE_ENV !== 'production') {
                dataDef.set = function () {
                  warn(
                    'Avoid replacing instance root $data. ' +
                    'Use nested data properties instead.',
                    this
                  );
                };
                propsDef.set = function () {
                  warn("$props is readonly.", this);
                };
              }
              Object.defineProperty(Vue.prototype, '$data', dataDef);
              Object.defineProperty(Vue.prototype, '$props', propsDef);

              Vue.prototype.$set = set;
              Vue.prototype.$delete = del;

              Vue.prototype.$watch = function (
                expOrFn,
                cb,
                options
              ) {
                var vm = this;
                if (isPlainObject(cb)) {
                  return createWatcher(vm, expOrFn, cb, options)
                }
                options = options || {};
                options.user = true;
                var watcher = new Watcher(vm, expOrFn, cb, options);
                if (options.immediate) {
                  try {
                    cb.call(vm, watcher.value);
                  } catch (error) {
                    handleError(error, vm, ("callback for immediate watcher \"" + (watcher.expression) + "\""));
                  }
                }
                return function unwatchFn () {
                  watcher.teardown();
                }
              };
            }

            /*  */

            function initProvide (vm) {
              var provide = vm.$options.provide;
              if (provide) {
                vm._provided = typeof provide === 'function'
                  ? provide.call(vm)
                  : provide;
              }
            }

            function initInjections (vm) {
              var result = resolveInject(vm.$options.inject, vm);
              if (result) {
                toggleObserving(false);
                Object.keys(result).forEach(function (key) {
                  /* istanbul ignore else */
                  if (process.env.NODE_ENV !== 'production') {
                    defineReactive$$1(vm, key, result[key], function () {
                      warn(
                        "Avoid mutating an injected value directly since the changes will be " +
                        "overwritten whenever the provided component re-renders. " +
                        "injection being mutated: \"" + key + "\"",
                        vm
                      );
                    });
                  } else {
                    defineReactive$$1(vm, key, result[key]);
                  }
                });
                toggleObserving(true);
              }
            }

            function resolveInject (inject, vm) {
              if (inject) {
                // inject is :any because flow is not smart enough to figure out cached
                var result = Object.create(null);
                var keys = hasSymbol
                  ? Reflect.ownKeys(inject).filter(function (key) {
                    /* istanbul ignore next */
                    return Object.getOwnPropertyDescriptor(inject, key).enumerable
                  })
                  : Object.keys(inject);

                for (var i = 0; i < keys.length; i++) {
                  var key = keys[i];
                  var provideKey = inject[key].from;
                  var source = vm;
                  while (source) {
                    if (source._provided && hasOwn(source._provided, provideKey)) {
                      result[key] = source._provided[provideKey];
                      break
                    }
                    source = source.$parent;
                  }
                  if (!source) {
                    if ('default' in inject[key]) {
                      var provideDefault = inject[key].default;
                      result[key] = typeof provideDefault === 'function'
                        ? provideDefault.call(vm)
                        : provideDefault;
                    } else if (process.env.NODE_ENV !== 'production') {
                      warn(("Injection \"" + key + "\" not found"), vm);
                    }
                  }
                }
                return result
              }
            }

            /*  */

            /**
             * Runtime helper for rendering v-for lists.
             */
            function renderList (
              val,
              render
            ) {
              var ret, i, l, keys, key;
              if (Array.isArray(val) || typeof val === 'string') {
                ret = new Array(val.length);
                for (i = 0, l = val.length; i < l; i++) {
                  ret[i] = render(val[i], i);
                }
              } else if (typeof val === 'number') {
                ret = new Array(val);
                for (i = 0; i < val; i++) {
                  ret[i] = render(i + 1, i);
                }
              } else if (isObject(val)) {
                keys = Object.keys(val);
                ret = new Array(keys.length);
                for (i = 0, l = keys.length; i < l; i++) {
                  key = keys[i];
                  ret[i] = render(val[key], key, i);
                }
              }
              if (!isDef(ret)) {
                ret = [];
              }
              (ret)._isVList = true;
              return ret
            }

            /*  */

            /**
             * Runtime helper for rendering <slot>
             */
            function renderSlot (
              name,
              fallback,
              props,
              bindObject
            ) {
              var scopedSlotFn = this.$scopedSlots[name];
              var nodes;
              if (scopedSlotFn) { // scoped slot
                props = props || {};
                if (bindObject) {
                  if (process.env.NODE_ENV !== 'production' && !isObject(bindObject)) {
                    warn(
                      'slot v-bind without argument expects an Object',
                      this
                    );
                  }
                  props = extend(extend({}, bindObject), props);
                }
                nodes = scopedSlotFn(props) || fallback;
              } else {
                nodes = this.$slots[name] || fallback;
              }

              var target = props && props.slot;
              if (target) {
                return this.$createElement('template', { slot: target }, nodes)
              } else {
                return nodes
              }
            }

            /*  */

            /**
             * Runtime helper for resolving filters
             */
            function resolveFilter (id) {
              return resolveAsset(this.$options, 'filters', id, true) || identity
            }

            /*  */

            function isKeyNotMatch (expect, actual) {
              if (Array.isArray(expect)) {
                return expect.indexOf(actual) === -1
              } else {
                return expect !== actual
              }
            }

            /**
             * Runtime helper for checking keyCodes from config.
             * exposed as Vue.prototype._k
             * passing in eventKeyName as last argument separately for backwards compat
             */
            function checkKeyCodes (
              eventKeyCode,
              key,
              builtInKeyCode,
              eventKeyName,
              builtInKeyName
            ) {
              var mappedKeyCode = config$1.keyCodes[key] || builtInKeyCode;
              if (builtInKeyName && eventKeyName && !config$1.keyCodes[key]) {
                return isKeyNotMatch(builtInKeyName, eventKeyName)
              } else if (mappedKeyCode) {
                return isKeyNotMatch(mappedKeyCode, eventKeyCode)
              } else if (eventKeyName) {
                return hyphenate(eventKeyName) !== key
              }
            }

            /*  */

            /**
             * Runtime helper for merging v-bind="object" into a VNode's data.
             */
            function bindObjectProps (
              data,
              tag,
              value,
              asProp,
              isSync
            ) {
              if (value) {
                if (!isObject(value)) {
                  process.env.NODE_ENV !== 'production' && warn(
                    'v-bind without argument expects an Object or Array value',
                    this
                  );
                } else {
                  if (Array.isArray(value)) {
                    value = toObject(value);
                  }
                  var hash;
                  var loop = function ( key ) {
                    if (
                      key === 'class' ||
                      key === 'style' ||
                      isReservedAttribute(key)
                    ) {
                      hash = data;
                    } else {
                      var type = data.attrs && data.attrs.type;
                      hash = asProp || config$1.mustUseProp(tag, type, key)
                        ? data.domProps || (data.domProps = {})
                        : data.attrs || (data.attrs = {});
                    }
                    var camelizedKey = camelize(key);
                    if (!(key in hash) && !(camelizedKey in hash)) {
                      hash[key] = value[key];

                      if (isSync) {
                        var on$$1 = data.on || (data.on = {});
                        on$$1[("update:" + camelizedKey)] = function ($event) {
                          value[key] = $event;
                        };
                      }
                    }
                  };

                  for (var key in value) loop( key );
                }
              }
              return data
            }

            /*  */

            /**
             * Runtime helper for rendering static trees.
             */
            function renderStatic (
              index,
              isInFor
            ) {
              var cached = this._staticTrees || (this._staticTrees = []);
              var tree = cached[index];
              // if has already-rendered static tree and not inside v-for,
              // we can reuse the same tree.
              if (tree && !isInFor) {
                return tree
              }
              // otherwise, render a fresh tree.
              tree = cached[index] = this.$options.staticRenderFns[index].call(
                this._renderProxy,
                null,
                this // for render fns generated for functional component templates
              );
              markStatic(tree, ("__static__" + index), false);
              return tree
            }

            /**
             * Runtime helper for v-once.
             * Effectively it means marking the node as static with a unique key.
             */
            function markOnce (
              tree,
              index,
              key
            ) {
              markStatic(tree, ("__once__" + index + (key ? ("_" + key) : "")), true);
              return tree
            }

            function markStatic (
              tree,
              key,
              isOnce
            ) {
              if (Array.isArray(tree)) {
                for (var i = 0; i < tree.length; i++) {
                  if (tree[i] && typeof tree[i] !== 'string') {
                    markStaticNode(tree[i], (key + "_" + i), isOnce);
                  }
                }
              } else {
                markStaticNode(tree, key, isOnce);
              }
            }

            function markStaticNode (node, key, isOnce) {
              node.isStatic = true;
              node.key = key;
              node.isOnce = isOnce;
            }

            /*  */

            function bindObjectListeners (data, value) {
              if (value) {
                if (!isPlainObject(value)) {
                  process.env.NODE_ENV !== 'production' && warn(
                    'v-on without argument expects an Object value',
                    this
                  );
                } else {
                  var on$$1 = data.on = data.on ? extend({}, data.on) : {};
                  for (var key in value) {
                    var existing = on$$1[key];
                    var ours = value[key];
                    on$$1[key] = existing ? [].concat(existing, ours) : ours;
                  }
                }
              }
              return data
            }

            /*  */

            function installRenderHelpers (target) {
              target._o = markOnce;
              target._n = toNumber;
              target._s = toString;
              target._l = renderList;
              target._t = renderSlot;
              target._q = looseEqual;
              target._i = looseIndexOf;
              target._m = renderStatic;
              target._f = resolveFilter;
              target._k = checkKeyCodes;
              target._b = bindObjectProps;
              target._v = createTextVNode;
              target._e = createEmptyVNode;
              target._u = resolveScopedSlots;
              target._g = bindObjectListeners;
            }

            /*  */

            function FunctionalRenderContext (
              data,
              props,
              children,
              parent,
              Ctor
            ) {
              var options = Ctor.options;
              // ensure the createElement function in functional components
              // gets a unique context - this is necessary for correct named slot check
              var contextVm;
              if (hasOwn(parent, '_uid')) {
                contextVm = Object.create(parent);
                // $flow-disable-line
                contextVm._original = parent;
              } else {
                // the context vm passed in is a functional context as well.
                // in this case we want to make sure we are able to get a hold to the
                // real context instance.
                contextVm = parent;
                // $flow-disable-line
                parent = parent._original;
              }
              var isCompiled = isTrue(options._compiled);
              var needNormalization = !isCompiled;

              this.data = data;
              this.props = props;
              this.children = children;
              this.parent = parent;
              this.listeners = data.on || emptyObject;
              this.injections = resolveInject(options.inject, parent);
              this.slots = function () { return resolveSlots(children, parent); };

              // support for compiled functional template
              if (isCompiled) {
                // exposing $options for renderStatic()
                this.$options = options;
                // pre-resolve slots for renderSlot()
                this.$slots = this.slots();
                this.$scopedSlots = data.scopedSlots || emptyObject;
              }

              if (options._scopeId) {
                this._c = function (a, b, c, d) {
                  var vnode = createElement(contextVm, a, b, c, d, needNormalization);
                  if (vnode && !Array.isArray(vnode)) {
                    vnode.fnScopeId = options._scopeId;
                    vnode.fnContext = parent;
                  }
                  return vnode
                };
              } else {
                this._c = function (a, b, c, d) { return createElement(contextVm, a, b, c, d, needNormalization); };
              }
            }

            installRenderHelpers(FunctionalRenderContext.prototype);

            function createFunctionalComponent (
              Ctor,
              propsData,
              data,
              contextVm,
              children
            ) {
              var options = Ctor.options;
              var props = {};
              var propOptions = options.props;
              if (isDef(propOptions)) {
                for (var key in propOptions) {
                  props[key] = validateProp(key, propOptions, propsData || emptyObject);
                }
              } else {
                if (isDef(data.attrs)) { mergeProps(props, data.attrs); }
                if (isDef(data.props)) { mergeProps(props, data.props); }
              }

              var renderContext = new FunctionalRenderContext(
                data,
                props,
                children,
                contextVm,
                Ctor
              );

              var vnode = options.render.call(null, renderContext._c, renderContext);

              if (vnode instanceof VNode) {
                return cloneAndMarkFunctionalResult(vnode, data, renderContext.parent, options, renderContext)
              } else if (Array.isArray(vnode)) {
                var vnodes = normalizeChildren(vnode) || [];
                var res = new Array(vnodes.length);
                for (var i = 0; i < vnodes.length; i++) {
                  res[i] = cloneAndMarkFunctionalResult(vnodes[i], data, renderContext.parent, options, renderContext);
                }
                return res
              }
            }

            function cloneAndMarkFunctionalResult (vnode, data, contextVm, options, renderContext) {
              // #7817 clone node before setting fnContext, otherwise if the node is reused
              // (e.g. it was from a cached normal slot) the fnContext causes named slots
              // that should not be matched to match.
              var clone = cloneVNode(vnode);
              clone.fnContext = contextVm;
              clone.fnOptions = options;
              if (process.env.NODE_ENV !== 'production') {
                (clone.devtoolsMeta = clone.devtoolsMeta || {}).renderContext = renderContext;
              }
              if (data.slot) {
                (clone.data || (clone.data = {})).slot = data.slot;
              }
              return clone
            }

            function mergeProps (to, from) {
              for (var key in from) {
                to[camelize(key)] = from[key];
              }
            }

            /*  */

            /*  */

            /*  */

            /*  */

            // inline hooks to be invoked on component VNodes during patch
            var componentVNodeHooks = {
              init: function init (vnode, hydrating) {
                if (
                  vnode.componentInstance &&
                  !vnode.componentInstance._isDestroyed &&
                  vnode.data.keepAlive
                ) {
                  // kept-alive components, treat as a patch
                  var mountedNode = vnode; // work around flow
                  componentVNodeHooks.prepatch(mountedNode, mountedNode);
                } else {
                  var child = vnode.componentInstance = createComponentInstanceForVnode(
                    vnode,
                    activeInstance
                  );
                  child.$mount(hydrating ? vnode.elm : undefined, hydrating);
                }
              },

              prepatch: function prepatch (oldVnode, vnode) {
                var options = vnode.componentOptions;
                var child = vnode.componentInstance = oldVnode.componentInstance;
                updateChildComponent(
                  child,
                  options.propsData, // updated props
                  options.listeners, // updated listeners
                  vnode, // new parent vnode
                  options.children // new children
                );
              },

              insert: function insert (vnode) {
                var context = vnode.context;
                var componentInstance = vnode.componentInstance;
                if (!componentInstance._isMounted) {
                  componentInstance._isMounted = true;
                  callHook(componentInstance, 'mounted');
                }
                if (vnode.data.keepAlive) {
                  if (context._isMounted) {
                    // vue-router#1212
                    // During updates, a kept-alive component's child components may
                    // change, so directly walking the tree here may call activated hooks
                    // on incorrect children. Instead we push them into a queue which will
                    // be processed after the whole patch process ended.
                    queueActivatedComponent(componentInstance);
                  } else {
                    activateChildComponent(componentInstance, true /* direct */);
                  }
                }
              },

              destroy: function destroy (vnode) {
                var componentInstance = vnode.componentInstance;
                if (!componentInstance._isDestroyed) {
                  if (!vnode.data.keepAlive) {
                    componentInstance.$destroy();
                  } else {
                    deactivateChildComponent(componentInstance, true /* direct */);
                  }
                }
              }
            };

            var hooksToMerge = Object.keys(componentVNodeHooks);

            function createComponent (
              Ctor,
              data,
              context,
              children,
              tag
            ) {
              if (isUndef(Ctor)) {
                return
              }

              var baseCtor = context.$options._base;

              // plain options object: turn it into a constructor
              if (isObject(Ctor)) {
                Ctor = baseCtor.extend(Ctor);
              }

              // if at this stage it's not a constructor or an async component factory,
              // reject.
              if (typeof Ctor !== 'function') {
                if (process.env.NODE_ENV !== 'production') {
                  warn(("Invalid Component definition: " + (String(Ctor))), context);
                }
                return
              }

              // async component
              var asyncFactory;
              if (isUndef(Ctor.cid)) {
                asyncFactory = Ctor;
                Ctor = resolveAsyncComponent(asyncFactory, baseCtor, context);
                if (Ctor === undefined) {
                  // return a placeholder node for async component, which is rendered
                  // as a comment node but preserves all the raw information for the node.
                  // the information will be used for async server-rendering and hydration.
                  return createAsyncPlaceholder(
                    asyncFactory,
                    data,
                    context,
                    children,
                    tag
                  )
                }
              }

              data = data || {};

              // resolve constructor options in case global mixins are applied after
              // component constructor creation
              resolveConstructorOptions(Ctor);

              // transform component v-model data into props & events
              if (isDef(data.model)) {
                transformModel(Ctor.options, data);
              }

              // extract props
              var propsData = extractPropsFromVNodeData(data, Ctor, tag);

              // functional component
              if (isTrue(Ctor.options.functional)) {
                return createFunctionalComponent(Ctor, propsData, data, context, children)
              }

              // extract listeners, since these needs to be treated as
              // child component listeners instead of DOM listeners
              var listeners = data.on;
              // replace with listeners with .native modifier
              // so it gets processed during parent component patch.
              data.on = data.nativeOn;

              if (isTrue(Ctor.options.abstract)) {
                // abstract components do not keep anything
                // other than props & listeners & slot

                // work around flow
                var slot = data.slot;
                data = {};
                if (slot) {
                  data.slot = slot;
                }
              }

              // install component management hooks onto the placeholder node
              installComponentHooks(data);

              // return a placeholder vnode
              var name = Ctor.options.name || tag;
              var vnode = new VNode(
                ("vue-component-" + (Ctor.cid) + (name ? ("-" + name) : '')),
                data, undefined, undefined, undefined, context,
                { Ctor: Ctor, propsData: propsData, listeners: listeners, tag: tag, children: children },
                asyncFactory
              );

              return vnode
            }

            function createComponentInstanceForVnode (
              vnode, // we know it's MountedComponentVNode but flow doesn't
              parent // activeInstance in lifecycle state
            ) {
              var options = {
                _isComponent: true,
                _parentVnode: vnode,
                parent: parent
              };
              // check inline-template render functions
              var inlineTemplate = vnode.data.inlineTemplate;
              if (isDef(inlineTemplate)) {
                options.render = inlineTemplate.render;
                options.staticRenderFns = inlineTemplate.staticRenderFns;
              }
              return new vnode.componentOptions.Ctor(options)
            }

            function installComponentHooks (data) {
              var hooks = data.hook || (data.hook = {});
              for (var i = 0; i < hooksToMerge.length; i++) {
                var key = hooksToMerge[i];
                var existing = hooks[key];
                var toMerge = componentVNodeHooks[key];
                if (existing !== toMerge && !(existing && existing._merged)) {
                  hooks[key] = existing ? mergeHook$1(toMerge, existing) : toMerge;
                }
              }
            }

            function mergeHook$1 (f1, f2) {
              var merged = function (a, b) {
                // flow complains about extra args which is why we use any
                f1(a, b);
                f2(a, b);
              };
              merged._merged = true;
              return merged
            }

            // transform component v-model info (value and callback) into
            // prop and event handler respectively.
            function transformModel (options, data) {
              var prop = (options.model && options.model.prop) || 'value';
              var event = (options.model && options.model.event) || 'input'
              ;(data.props || (data.props = {}))[prop] = data.model.value;
              var on$$1 = data.on || (data.on = {});
              var existing = on$$1[event];
              var callback = data.model.callback;
              if (isDef(existing)) {
                if (
                  Array.isArray(existing)
                    ? existing.indexOf(callback) === -1
                    : existing !== callback
                ) {
                  on$$1[event] = [callback].concat(existing);
                }
              } else {
                on$$1[event] = callback;
              }
            }

            /*  */

            var SIMPLE_NORMALIZE = 1;
            var ALWAYS_NORMALIZE = 2;

            // wrapper function for providing a more flexible interface
            // without getting yelled at by flow
            function createElement (
              context,
              tag,
              data,
              children,
              normalizationType,
              alwaysNormalize
            ) {
              if (Array.isArray(data) || isPrimitive(data)) {
                normalizationType = children;
                children = data;
                data = undefined;
              }
              if (isTrue(alwaysNormalize)) {
                normalizationType = ALWAYS_NORMALIZE;
              }
              return _createElement(context, tag, data, children, normalizationType)
            }

            function _createElement (
              context,
              tag,
              data,
              children,
              normalizationType
            ) {
              if (isDef(data) && isDef((data).__ob__)) {
                process.env.NODE_ENV !== 'production' && warn(
                  "Avoid using observed data object as vnode data: " + (JSON.stringify(data)) + "\n" +
                  'Always create fresh vnode data objects in each render!',
                  context
                );
                return createEmptyVNode()
              }
              // object syntax in v-bind
              if (isDef(data) && isDef(data.is)) {
                tag = data.is;
              }
              if (!tag) {
                // in case of component :is set to falsy value
                return createEmptyVNode()
              }
              // warn against non-primitive key
              if (process.env.NODE_ENV !== 'production' &&
                isDef(data) && isDef(data.key) && !isPrimitive(data.key)
              ) {
                {
                  warn(
                    'Avoid using non-primitive value as key, ' +
                    'use string/number value instead.',
                    context
                  );
                }
              }
              // support single function children as default scoped slot
              if (Array.isArray(children) &&
                typeof children[0] === 'function'
              ) {
                data = data || {};
                data.scopedSlots = { default: children[0] };
                children.length = 0;
              }
              if (normalizationType === ALWAYS_NORMALIZE) {
                children = normalizeChildren(children);
              } else if (normalizationType === SIMPLE_NORMALIZE) {
                children = simpleNormalizeChildren(children);
              }
              var vnode, ns;
              if (typeof tag === 'string') {
                var Ctor;
                ns = (context.$vnode && context.$vnode.ns) || config$1.getTagNamespace(tag);
                if (config$1.isReservedTag(tag)) {
                  // platform built-in elements
                  vnode = new VNode(
                    config$1.parsePlatformTagName(tag), data, children,
                    undefined, undefined, context
                  );
                } else if ((!data || !data.pre) && isDef(Ctor = resolveAsset(context.$options, 'components', tag))) {
                  // component
                  vnode = createComponent(Ctor, data, context, children, tag);
                } else {
                  // unknown or unlisted namespaced elements
                  // check at runtime because it may get assigned a namespace when its
                  // parent normalizes children
                  vnode = new VNode(
                    tag, data, children,
                    undefined, undefined, context
                  );
                }
              } else {
                // direct component options / constructor
                vnode = createComponent(tag, data, context, children);
              }
              if (Array.isArray(vnode)) {
                return vnode
              } else if (isDef(vnode)) {
                if (isDef(ns)) { applyNS(vnode, ns); }
                if (isDef(data)) { registerDeepBindings(data); }
                return vnode
              } else {
                return createEmptyVNode()
              }
            }

            function applyNS (vnode, ns, force) {
              vnode.ns = ns;
              if (vnode.tag === 'foreignObject') {
                // use default namespace inside foreignObject
                ns = undefined;
                force = true;
              }
              if (isDef(vnode.children)) {
                for (var i = 0, l = vnode.children.length; i < l; i++) {
                  var child = vnode.children[i];
                  if (isDef(child.tag) && (
                    isUndef(child.ns) || (isTrue(force) && child.tag !== 'svg'))) {
                    applyNS(child, ns, force);
                  }
                }
              }
            }

            // ref #5318
            // necessary to ensure parent re-render when deep bindings like :style and
            // :class are used on slot nodes
            function registerDeepBindings (data) {
              if (isObject(data.style)) {
                traverse(data.style);
              }
              if (isObject(data.class)) {
                traverse(data.class);
              }
            }

            /*  */

            function initRender (vm) {
              vm._vnode = null; // the root of the child tree
              vm._staticTrees = null; // v-once cached trees
              var options = vm.$options;
              var parentVnode = vm.$vnode = options._parentVnode; // the placeholder node in parent tree
              var renderContext = parentVnode && parentVnode.context;
              vm.$slots = resolveSlots(options._renderChildren, renderContext);
              vm.$scopedSlots = emptyObject;
              // bind the createElement fn to this instance
              // so that we get proper render context inside it.
              // args order: tag, data, children, normalizationType, alwaysNormalize
              // internal version is used by render functions compiled from templates
              vm._c = function (a, b, c, d) { return createElement(vm, a, b, c, d, false); };
              // normalization is always applied for the public version, used in
              // user-written render functions.
              vm.$createElement = function (a, b, c, d) { return createElement(vm, a, b, c, d, true); };

              // $attrs & $listeners are exposed for easier HOC creation.
              // they need to be reactive so that HOCs using them are always updated
              var parentData = parentVnode && parentVnode.data;

              /* istanbul ignore else */
              if (process.env.NODE_ENV !== 'production') {
                defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, function () {
                  !isUpdatingChildComponent && warn("$attrs is readonly.", vm);
                }, true);
                defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, function () {
                  !isUpdatingChildComponent && warn("$listeners is readonly.", vm);
                }, true);
              } else {
                defineReactive$$1(vm, '$attrs', parentData && parentData.attrs || emptyObject, null, true);
                defineReactive$$1(vm, '$listeners', options._parentListeners || emptyObject, null, true);
              }
            }

            function renderMixin (Vue) {
              // install runtime convenience helpers
              installRenderHelpers(Vue.prototype);

              Vue.prototype.$nextTick = function (fn) {
                return nextTick$1(fn, this)
              };

              Vue.prototype._render = function () {
                var vm = this;
                var ref = vm.$options;
                var render = ref.render;
                var _parentVnode = ref._parentVnode;

                if (_parentVnode) {
                  vm.$scopedSlots = _parentVnode.data.scopedSlots || emptyObject;
                }

                // set parent vnode. this allows render functions to have access
                // to the data on the placeholder node.
                vm.$vnode = _parentVnode;
                // render self
                var vnode;
                try {
                  vnode = render.call(vm._renderProxy, vm.$createElement);
                } catch (e) {
                  handleError(e, vm, "render");
                  // return error render result,
                  // or previous vnode to prevent render error causing blank component
                  /* istanbul ignore else */
                  if (process.env.NODE_ENV !== 'production' && vm.$options.renderError) {
                    try {
                      vnode = vm.$options.renderError.call(vm._renderProxy, vm.$createElement, e);
                    } catch (e) {
                      handleError(e, vm, "renderError");
                      vnode = vm._vnode;
                    }
                  } else {
                    vnode = vm._vnode;
                  }
                }
                // return empty vnode in case the render function errored out
                if (!(vnode instanceof VNode)) {
                  if (process.env.NODE_ENV !== 'production' && Array.isArray(vnode)) {
                    warn(
                      'Multiple root nodes returned from render function. Render function ' +
                      'should return a single root node.',
                      vm
                    );
                  }
                  vnode = createEmptyVNode();
                }
                // set parent
                vnode.parent = _parentVnode;
                return vnode
              };
            }

            /*  */

            var uid$3 = 0;

            function initMixin (Vue) {
              Vue.prototype._init = function (options) {
                var vm = this;
                // a uid
                vm._uid = uid$3++;

                var startTag, endTag;
                /* istanbul ignore if */
                if (process.env.NODE_ENV !== 'production' && config$1.performance && mark) {
                  startTag = "vue-perf-start:" + (vm._uid);
                  endTag = "vue-perf-end:" + (vm._uid);
                  mark(startTag);
                }

                // a flag to avoid this being observed
                vm._isVue = true;
                // merge options
                if (options && options._isComponent) {
                  // optimize internal component instantiation
                  // since dynamic options merging is pretty slow, and none of the
                  // internal component options needs special treatment.
                  initInternalComponent(vm, options);
                } else {
                  vm.$options = mergeOptions(
                    resolveConstructorOptions(vm.constructor),
                    options || {},
                    vm
                  );
                }
                /* istanbul ignore else */
                if (process.env.NODE_ENV !== 'production') {
                  initProxy(vm);
                } else {
                  vm._renderProxy = vm;
                }
                // expose real self
                vm._self = vm;
                initLifecycle(vm);
                initEvents(vm);
                initRender(vm);
                callHook(vm, 'beforeCreate');
                initInjections(vm); // resolve injections before data/props
                initState(vm);
                initProvide(vm); // resolve provide after data/props
                callHook(vm, 'created');

                /* istanbul ignore if */
                if (process.env.NODE_ENV !== 'production' && config$1.performance && mark) {
                  vm._name = formatComponentName(vm, false);
                  mark(endTag);
                  measure(("vue " + (vm._name) + " init"), startTag, endTag);
                }

                if (vm.$options.el) {
                  vm.$mount(vm.$options.el);
                }
              };
            }

            function initInternalComponent (vm, options) {
              var opts = vm.$options = Object.create(vm.constructor.options);
              // doing this because it's faster than dynamic enumeration.
              var parentVnode = options._parentVnode;
              opts.parent = options.parent;
              opts._parentVnode = parentVnode;

              var vnodeComponentOptions = parentVnode.componentOptions;
              opts.propsData = vnodeComponentOptions.propsData;
              opts._parentListeners = vnodeComponentOptions.listeners;
              opts._renderChildren = vnodeComponentOptions.children;
              opts._componentTag = vnodeComponentOptions.tag;

              if (options.render) {
                opts.render = options.render;
                opts.staticRenderFns = options.staticRenderFns;
              }
            }

            function resolveConstructorOptions (Ctor) {
              var options = Ctor.options;
              if (Ctor.super) {
                var superOptions = resolveConstructorOptions(Ctor.super);
                var cachedSuperOptions = Ctor.superOptions;
                if (superOptions !== cachedSuperOptions) {
                  // super option changed,
                  // need to resolve new options.
                  Ctor.superOptions = superOptions;
                  // check if there are any late-modified/attached options (#4976)
                  var modifiedOptions = resolveModifiedOptions(Ctor);
                  // update base extend options
                  if (modifiedOptions) {
                    extend(Ctor.extendOptions, modifiedOptions);
                  }
                  options = Ctor.options = mergeOptions(superOptions, Ctor.extendOptions);
                  if (options.name) {
                    options.components[options.name] = Ctor;
                  }
                }
              }
              return options
            }

            function resolveModifiedOptions (Ctor) {
              var modified;
              var latest = Ctor.options;
              var extended = Ctor.extendOptions;
              var sealed = Ctor.sealedOptions;
              for (var key in latest) {
                if (latest[key] !== sealed[key]) {
                  if (!modified) { modified = {}; }
                  modified[key] = dedupe(latest[key], extended[key], sealed[key]);
                }
              }
              return modified
            }

            function dedupe (latest, extended, sealed) {
              // compare latest and sealed to ensure lifecycle hooks won't be duplicated
              // between merges
              if (Array.isArray(latest)) {
                var res = [];
                sealed = Array.isArray(sealed) ? sealed : [sealed];
                extended = Array.isArray(extended) ? extended : [extended];
                for (var i = 0; i < latest.length; i++) {
                  // push original options and not sealed options to exclude duplicated options
                  if (extended.indexOf(latest[i]) >= 0 || sealed.indexOf(latest[i]) < 0) {
                    res.push(latest[i]);
                  }
                }
                return res
              } else {
                return latest
              }
            }

            function Vue$1 (options) {
              if (process.env.NODE_ENV !== 'production' &&
                !(this instanceof Vue$1)
              ) {
                warn('Vue is a constructor and should be called with the `new` keyword');
              }
              this._init(options);
            }

            initMixin(Vue$1);
            stateMixin(Vue$1);
            eventsMixin(Vue$1);
            lifecycleMixin(Vue$1);
            renderMixin(Vue$1);

            /*  */

            function initUse (Vue) {
              Vue.use = function (plugin) {
                var installedPlugins = (this._installedPlugins || (this._installedPlugins = []));
                if (installedPlugins.indexOf(plugin) > -1) {
                  return this
                }

                // additional parameters
                var args = toArray(arguments, 1);
                args.unshift(this);
                if (typeof plugin.install === 'function') {
                  plugin.install.apply(plugin, args);
                } else if (typeof plugin === 'function') {
                  plugin.apply(null, args);
                }
                installedPlugins.push(plugin);
                return this
              };
            }

            /*  */

            function initMixin$1 (Vue) {
              Vue.mixin = function (mixin) {
                this.options = mergeOptions(this.options, mixin);
                return this
              };
            }

            /*  */

            function initExtend (Vue) {
              /**
               * Each instance constructor, including Vue, has a unique
               * cid. This enables us to create wrapped "child
               * constructors" for prototypal inheritance and cache them.
               */
              Vue.cid = 0;
              var cid = 1;

              /**
               * Class inheritance
               */
              Vue.extend = function (extendOptions) {
                extendOptions = extendOptions || {};
                var Super = this;
                var SuperId = Super.cid;
                var cachedCtors = extendOptions._Ctor || (extendOptions._Ctor = {});
                if (cachedCtors[SuperId]) {
                  return cachedCtors[SuperId]
                }

                var name = extendOptions.name || Super.options.name;
                if (process.env.NODE_ENV !== 'production' && name) {
                  validateComponentName(name);
                }

                var Sub = function VueComponent (options) {
                  this._init(options);
                };
                Sub.prototype = Object.create(Super.prototype);
                Sub.prototype.constructor = Sub;
                Sub.cid = cid++;
                Sub.options = mergeOptions(
                  Super.options,
                  extendOptions
                );
                Sub['super'] = Super;

                // For props and computed properties, we define the proxy getters on
                // the Vue instances at extension time, on the extended prototype. This
                // avoids Object.defineProperty calls for each instance created.
                if (Sub.options.props) {
                  initProps$1(Sub);
                }
                if (Sub.options.computed) {
                  initComputed$1(Sub);
                }

                // allow further extension/mixin/plugin usage
                Sub.extend = Super.extend;
                Sub.mixin = Super.mixin;
                Sub.use = Super.use;

                // create asset registers, so extended classes
                // can have their private assets too.
                ASSET_TYPES.forEach(function (type) {
                  Sub[type] = Super[type];
                });
                // enable recursive self-lookup
                if (name) {
                  Sub.options.components[name] = Sub;
                }

                // keep a reference to the super options at extension time.
                // later at instantiation we can check if Super's options have
                // been updated.
                Sub.superOptions = Super.options;
                Sub.extendOptions = extendOptions;
                Sub.sealedOptions = extend({}, Sub.options);

                // cache constructor
                cachedCtors[SuperId] = Sub;
                return Sub
              };
            }

            function initProps$1 (Comp) {
              var props = Comp.options.props;
              for (var key in props) {
                proxy(Comp.prototype, "_props", key);
              }
            }

            function initComputed$1 (Comp) {
              var computed = Comp.options.computed;
              for (var key in computed) {
                defineComputed(Comp.prototype, key, computed[key]);
              }
            }

            /*  */

            function initAssetRegisters (Vue) {
              /**
               * Create asset registration methods.
               */
              ASSET_TYPES.forEach(function (type) {
                Vue[type] = function (
                  id,
                  definition
                ) {
                  if (!definition) {
                    return this.options[type + 's'][id]
                  } else {
                    /* istanbul ignore if */
                    if (process.env.NODE_ENV !== 'production' && type === 'component') {
                      validateComponentName(id);
                    }
                    if (type === 'component' && isPlainObject(definition)) {
                      definition.name = definition.name || id;
                      definition = this.options._base.extend(definition);
                    }
                    if (type === 'directive' && typeof definition === 'function') {
                      definition = { bind: definition, update: definition };
                    }
                    this.options[type + 's'][id] = definition;
                    return definition
                  }
                };
              });
            }

            /*  */



            function getComponentName (opts) {
              return opts && (opts.Ctor.options.name || opts.tag)
            }

            function matches (pattern, name) {
              if (Array.isArray(pattern)) {
                return pattern.indexOf(name) > -1
              } else if (typeof pattern === 'string') {
                return pattern.split(',').indexOf(name) > -1
              } else if (isRegExp(pattern)) {
                return pattern.test(name)
              }
              /* istanbul ignore next */
              return false
            }

            function pruneCache (keepAliveInstance, filter) {
              var cache = keepAliveInstance.cache;
              var keys = keepAliveInstance.keys;
              var _vnode = keepAliveInstance._vnode;
              for (var key in cache) {
                var cachedNode = cache[key];
                if (cachedNode) {
                  var name = getComponentName(cachedNode.componentOptions);
                  if (name && !filter(name)) {
                    pruneCacheEntry(cache, key, keys, _vnode);
                  }
                }
              }
            }

            function pruneCacheEntry (
              cache,
              key,
              keys,
              current
            ) {
              var cached$$1 = cache[key];
              if (cached$$1 && (!current || cached$$1.tag !== current.tag)) {
                cached$$1.componentInstance.$destroy();
              }
              cache[key] = null;
              remove(keys, key);
            }

            var patternTypes = [String, RegExp, Array];

            var KeepAlive = {
              name: 'keep-alive',
              abstract: true,

              props: {
                include: patternTypes,
                exclude: patternTypes,
                max: [String, Number]
              },

              created: function created () {
                this.cache = Object.create(null);
                this.keys = [];
              },

              destroyed: function destroyed () {
                for (var key in this.cache) {
                  pruneCacheEntry(this.cache, key, this.keys);
                }
              },

              mounted: function mounted () {
                var this$1 = this;

                this.$watch('include', function (val) {
                  pruneCache(this$1, function (name) { return matches(val, name); });
                });
                this.$watch('exclude', function (val) {
                  pruneCache(this$1, function (name) { return !matches(val, name); });
                });
              },

              render: function render () {
                var slot = this.$slots.default;
                var vnode = getFirstComponentChild(slot);
                var componentOptions = vnode && vnode.componentOptions;
                if (componentOptions) {
                  // check pattern
                  var name = getComponentName(componentOptions);
                  var ref = this;
                  var include = ref.include;
                  var exclude = ref.exclude;
                  if (
                    // not included
                    (include && (!name || !matches(include, name))) ||
                    // excluded
                    (exclude && name && matches(exclude, name))
                  ) {
                    return vnode
                  }

                  var ref$1 = this;
                  var cache = ref$1.cache;
                  var keys = ref$1.keys;
                  var key = vnode.key == null
                    // same constructor may get registered as different local components
                    // so cid alone is not enough (#3269)
                    ? componentOptions.Ctor.cid + (componentOptions.tag ? ("::" + (componentOptions.tag)) : '')
                    : vnode.key;
                  if (cache[key]) {
                    vnode.componentInstance = cache[key].componentInstance;
                    // make current key freshest
                    remove(keys, key);
                    keys.push(key);
                  } else {
                    cache[key] = vnode;
                    keys.push(key);
                    // prune oldest entry
                    if (this.max && keys.length > parseInt(this.max)) {
                      pruneCacheEntry(cache, keys[0], keys, this._vnode);
                    }
                  }

                  vnode.data.keepAlive = true;
                }
                return vnode || (slot && slot[0])
              }
            };

            var builtInComponents = {
              KeepAlive: KeepAlive
            };

            /*  */

            function initGlobalAPI (Vue) {
              // config
              var configDef = {};
              configDef.get = function () { return config$1; };
              if (process.env.NODE_ENV !== 'production') {
                configDef.set = function () {
                  warn(
                    'Do not replace the Vue.config object, set individual fields instead.'
                  );
                };
              }
              Object.defineProperty(Vue, 'config', configDef);

              // exposed util methods.
              // NOTE: these are not considered part of the public API - avoid relying on
              // them unless you are aware of the risk.
              Vue.util = {
                warn: warn,
                extend: extend,
                mergeOptions: mergeOptions,
                defineReactive: defineReactive$$1
              };

              Vue.set = set;
              Vue.delete = del;
              Vue.nextTick = nextTick$1;

              Vue.options = Object.create(null);
              ASSET_TYPES.forEach(function (type) {
                Vue.options[type + 's'] = Object.create(null);
              });

              // this is used to identify the "base" constructor to extend all plain-object
              // components with in Weex's multi-instance scenarios.
              Vue.options._base = Vue;

              extend(Vue.options.components, builtInComponents);

              initUse(Vue);
              initMixin$1(Vue);
              initExtend(Vue);
              initAssetRegisters(Vue);
            }

            initGlobalAPI(Vue$1);

            Object.defineProperty(Vue$1.prototype, '$isServer', {
              get: isServerRendering
            });

            Object.defineProperty(Vue$1.prototype, '$ssrContext', {
              get: function get () {
                /* istanbul ignore next */
                return this.$vnode && this.$vnode.ssrContext
              }
            });

            // expose FunctionalRenderContext for ssr runtime helper installation
            Object.defineProperty(Vue$1, 'FunctionalRenderContext', {
              value: FunctionalRenderContext
            });

            Vue$1.version = '2.5.21';

            /*  */

            // these are reserved for web because they are directly compiled away
            // during template compilation
            var isReservedAttr = makeMap('style,class');

            // attributes that should be using props for binding
            var acceptValue = makeMap('input,textarea,option,select,progress');
            var mustUseProp = function (tag, type, attr) {
              return (
                (attr === 'value' && acceptValue(tag)) && type !== 'button' ||
                (attr === 'selected' && tag === 'option') ||
                (attr === 'checked' && tag === 'input') ||
                (attr === 'muted' && tag === 'video')
              )
            };

            var isEnumeratedAttr = makeMap('contenteditable,draggable,spellcheck');

            var isBooleanAttr = makeMap(
              'allowfullscreen,async,autofocus,autoplay,checked,compact,controls,declare,' +
              'default,defaultchecked,defaultmuted,defaultselected,defer,disabled,' +
              'enabled,formnovalidate,hidden,indeterminate,inert,ismap,itemscope,loop,multiple,' +
              'muted,nohref,noresize,noshade,novalidate,nowrap,open,pauseonexit,readonly,' +
              'required,reversed,scoped,seamless,selected,sortable,translate,' +
              'truespeed,typemustmatch,visible'
            );

            var xlinkNS = 'http://www.w3.org/1999/xlink';

            var isXlink = function (name) {
              return name.charAt(5) === ':' && name.slice(0, 5) === 'xlink'
            };

            var getXlinkProp = function (name) {
              return isXlink(name) ? name.slice(6, name.length) : ''
            };

            var isFalsyAttrValue = function (val) {
              return val == null || val === false
            };

            /*  */

            function genClassForVnode (vnode) {
              var data = vnode.data;
              var parentNode = vnode;
              var childNode = vnode;
              while (isDef(childNode.componentInstance)) {
                childNode = childNode.componentInstance._vnode;
                if (childNode && childNode.data) {
                  data = mergeClassData(childNode.data, data);
                }
              }
              while (isDef(parentNode = parentNode.parent)) {
                if (parentNode && parentNode.data) {
                  data = mergeClassData(data, parentNode.data);
                }
              }
              return renderClass(data.staticClass, data.class)
            }

            function mergeClassData (child, parent) {
              return {
                staticClass: concat(child.staticClass, parent.staticClass),
                class: isDef(child.class)
                  ? [child.class, parent.class]
                  : parent.class
              }
            }

            function renderClass (
              staticClass,
              dynamicClass
            ) {
              if (isDef(staticClass) || isDef(dynamicClass)) {
                return concat(staticClass, stringifyClass(dynamicClass))
              }
              /* istanbul ignore next */
              return ''
            }

            function concat (a, b) {
              return a ? b ? (a + ' ' + b) : a : (b || '')
            }

            function stringifyClass (value) {
              if (Array.isArray(value)) {
                return stringifyArray(value)
              }
              if (isObject(value)) {
                return stringifyObject(value)
              }
              if (typeof value === 'string') {
                return value
              }
              /* istanbul ignore next */
              return ''
            }

            function stringifyArray (value) {
              var res = '';
              var stringified;
              for (var i = 0, l = value.length; i < l; i++) {
                if (isDef(stringified = stringifyClass(value[i])) && stringified !== '') {
                  if (res) { res += ' '; }
                  res += stringified;
                }
              }
              return res
            }

            function stringifyObject (value) {
              var res = '';
              for (var key in value) {
                if (value[key]) {
                  if (res) { res += ' '; }
                  res += key;
                }
              }
              return res
            }

            /*  */

            var namespaceMap = {
              svg: 'http://www.w3.org/2000/svg',
              math: 'http://www.w3.org/1998/Math/MathML'
            };

            var isHTMLTag = makeMap(
              'html,body,base,head,link,meta,style,title,' +
              'address,article,aside,footer,header,h1,h2,h3,h4,h5,h6,hgroup,nav,section,' +
              'div,dd,dl,dt,figcaption,figure,picture,hr,img,li,main,ol,p,pre,ul,' +
              'a,b,abbr,bdi,bdo,br,cite,code,data,dfn,em,i,kbd,mark,q,rp,rt,rtc,ruby,' +
              's,samp,small,span,strong,sub,sup,time,u,var,wbr,area,audio,map,track,video,' +
              'embed,object,param,source,canvas,script,noscript,del,ins,' +
              'caption,col,colgroup,table,thead,tbody,td,th,tr,' +
              'button,datalist,fieldset,form,input,label,legend,meter,optgroup,option,' +
              'output,progress,select,textarea,' +
              'details,dialog,menu,menuitem,summary,' +
              'content,element,shadow,template,blockquote,iframe,tfoot'
            );

            // this map is intentionally selective, only covering SVG elements that may
            // contain child elements.
            var isSVG = makeMap(
              'svg,animate,circle,clippath,cursor,defs,desc,ellipse,filter,font-face,' +
              'foreignObject,g,glyph,image,line,marker,mask,missing-glyph,path,pattern,' +
              'polygon,polyline,rect,switch,symbol,text,textpath,tspan,use,view',
              true
            );

            var isReservedTag = function (tag) {
              return isHTMLTag(tag) || isSVG(tag)
            };

            function getTagNamespace (tag) {
              if (isSVG(tag)) {
                return 'svg'
              }
              // basic support for MathML
              // note it doesn't support other MathML elements being component roots
              if (tag === 'math') {
                return 'math'
              }
            }

            var unknownElementCache = Object.create(null);
            function isUnknownElement (tag) {
              /* istanbul ignore if */
              if (!inBrowser) {
                return true
              }
              if (isReservedTag(tag)) {
                return false
              }
              tag = tag.toLowerCase();
              /* istanbul ignore if */
              if (unknownElementCache[tag] != null) {
                return unknownElementCache[tag]
              }
              var el = document.createElement(tag);
              if (tag.indexOf('-') > -1) {
                // http://stackoverflow.com/a/28210364/1070244
                return (unknownElementCache[tag] = (
                  el.constructor === window.HTMLUnknownElement ||
                  el.constructor === window.HTMLElement
                ))
              } else {
                return (unknownElementCache[tag] = /HTMLUnknownElement/.test(el.toString()))
              }
            }

            var isTextInputType = makeMap('text,number,password,search,email,tel,url');

            /*  */

            /**
             * Query an element selector if it's not an element already.
             */
            function query (el) {
              if (typeof el === 'string') {
                var selected = document.querySelector(el);
                if (!selected) {
                  process.env.NODE_ENV !== 'production' && warn(
                    'Cannot find element: ' + el
                  );
                  return document.createElement('div')
                }
                return selected
              } else {
                return el
              }
            }

            /*  */

            function createElement$1 (tagName, vnode) {
              var elm = document.createElement(tagName);
              if (tagName !== 'select') {
                return elm
              }
              // false or null will remove the attribute but undefined will not
              if (vnode.data && vnode.data.attrs && vnode.data.attrs.multiple !== undefined) {
                elm.setAttribute('multiple', 'multiple');
              }
              return elm
            }

            function createElementNS (namespace, tagName) {
              return document.createElementNS(namespaceMap[namespace], tagName)
            }

            function createTextNode (text) {
              return document.createTextNode(text)
            }

            function createComment (text) {
              return document.createComment(text)
            }

            function insertBefore (parentNode, newNode, referenceNode) {
              parentNode.insertBefore(newNode, referenceNode);
            }

            function removeChild (node, child) {
              node.removeChild(child);
            }

            function appendChild (node, child) {
              node.appendChild(child);
            }

            function parentNode (node) {
              return node.parentNode
            }

            function nextSibling (node) {
              return node.nextSibling
            }

            function tagName (node) {
              return node.tagName
            }

            function setTextContent (node, text) {
              node.textContent = text;
            }

            function setStyleScope (node, scopeId) {
              node.setAttribute(scopeId, '');
            }

            var nodeOps = /*#__PURE__*/Object.freeze({
              createElement: createElement$1,
              createElementNS: createElementNS,
              createTextNode: createTextNode,
              createComment: createComment,
              insertBefore: insertBefore,
              removeChild: removeChild,
              appendChild: appendChild,
              parentNode: parentNode,
              nextSibling: nextSibling,
              tagName: tagName,
              setTextContent: setTextContent,
              setStyleScope: setStyleScope
            });

            /*  */

            var ref = {
              create: function create (_, vnode) {
                registerRef(vnode);
              },
              update: function update (oldVnode, vnode) {
                if (oldVnode.data.ref !== vnode.data.ref) {
                  registerRef(oldVnode, true);
                  registerRef(vnode);
                }
              },
              destroy: function destroy (vnode) {
                registerRef(vnode, true);
              }
            };

            function registerRef (vnode, isRemoval) {
              var key = vnode.data.ref;
              if (!isDef(key)) { return }

              var vm = vnode.context;
              var ref = vnode.componentInstance || vnode.elm;
              var refs = vm.$refs;
              if (isRemoval) {
                if (Array.isArray(refs[key])) {
                  remove(refs[key], ref);
                } else if (refs[key] === ref) {
                  refs[key] = undefined;
                }
              } else {
                if (vnode.data.refInFor) {
                  if (!Array.isArray(refs[key])) {
                    refs[key] = [ref];
                  } else if (refs[key].indexOf(ref) < 0) {
                    // $flow-disable-line
                    refs[key].push(ref);
                  }
                } else {
                  refs[key] = ref;
                }
              }
            }

            /**
             * Virtual DOM patching algorithm based on Snabbdom by
             * Simon Friis Vindum (@paldepind)
             * Licensed under the MIT License
             * https://github.com/paldepind/snabbdom/blob/master/LICENSE
             *
             * modified by Evan You (@yyx990803)
             *
             * Not type-checking this because this file is perf-critical and the cost
             * of making flow understand it is not worth it.
             */

            var emptyNode = new VNode('', {}, []);

            var hooks = ['create', 'activate', 'update', 'remove', 'destroy'];

            function sameVnode (a, b) {
              return (
                a.key === b.key && (
                  (
                    a.tag === b.tag &&
                    a.isComment === b.isComment &&
                    isDef(a.data) === isDef(b.data) &&
                    sameInputType(a, b)
                  ) || (
                    isTrue(a.isAsyncPlaceholder) &&
                    a.asyncFactory === b.asyncFactory &&
                    isUndef(b.asyncFactory.error)
                  )
                )
              )
            }

            function sameInputType (a, b) {
              if (a.tag !== 'input') { return true }
              var i;
              var typeA = isDef(i = a.data) && isDef(i = i.attrs) && i.type;
              var typeB = isDef(i = b.data) && isDef(i = i.attrs) && i.type;
              return typeA === typeB || isTextInputType(typeA) && isTextInputType(typeB)
            }

            function createKeyToOldIdx (children, beginIdx, endIdx) {
              var i, key;
              var map = {};
              for (i = beginIdx; i <= endIdx; ++i) {
                key = children[i].key;
                if (isDef(key)) { map[key] = i; }
              }
              return map
            }

            function createPatchFunction (backend) {
              var i, j;
              var cbs = {};

              var modules = backend.modules;
              var nodeOps = backend.nodeOps;

              for (i = 0; i < hooks.length; ++i) {
                cbs[hooks[i]] = [];
                for (j = 0; j < modules.length; ++j) {
                  if (isDef(modules[j][hooks[i]])) {
                    cbs[hooks[i]].push(modules[j][hooks[i]]);
                  }
                }
              }

              function emptyNodeAt (elm) {
                return new VNode(nodeOps.tagName(elm).toLowerCase(), {}, [], undefined, elm)
              }

              function createRmCb (childElm, listeners) {
                function remove$$1 () {
                  if (--remove$$1.listeners === 0) {
                    removeNode(childElm);
                  }
                }
                remove$$1.listeners = listeners;
                return remove$$1
              }

              function removeNode (el) {
                var parent = nodeOps.parentNode(el);
                // element may have already been removed due to v-html / v-text
                if (isDef(parent)) {
                  nodeOps.removeChild(parent, el);
                }
              }

              function isUnknownElement$$1 (vnode, inVPre) {
                return (
                  !inVPre &&
                  !vnode.ns &&
                  !(
                    config$1.ignoredElements.length &&
                    config$1.ignoredElements.some(function (ignore) {
                      return isRegExp(ignore)
                        ? ignore.test(vnode.tag)
                        : ignore === vnode.tag
                    })
                  ) &&
                  config$1.isUnknownElement(vnode.tag)
                )
              }

              var creatingElmInVPre = 0;

              function createElm (
                vnode,
                insertedVnodeQueue,
                parentElm,
                refElm,
                nested,
                ownerArray,
                index
              ) {
                if (isDef(vnode.elm) && isDef(ownerArray)) {
                  // This vnode was used in a previous render!
                  // now it's used as a new node, overwriting its elm would cause
                  // potential patch errors down the road when it's used as an insertion
                  // reference node. Instead, we clone the node on-demand before creating
                  // associated DOM element for it.
                  vnode = ownerArray[index] = cloneVNode(vnode);
                }

                vnode.isRootInsert = !nested; // for transition enter check
                if (createComponent(vnode, insertedVnodeQueue, parentElm, refElm)) {
                  return
                }

                var data = vnode.data;
                var children = vnode.children;
                var tag = vnode.tag;
                if (isDef(tag)) {
                  if (process.env.NODE_ENV !== 'production') {
                    if (data && data.pre) {
                      creatingElmInVPre++;
                    }
                    if (isUnknownElement$$1(vnode, creatingElmInVPre)) {
                      warn(
                        'Unknown custom element: <' + tag + '> - did you ' +
                        'register the component correctly? For recursive components, ' +
                        'make sure to provide the "name" option.',
                        vnode.context
                      );
                    }
                  }

                  vnode.elm = vnode.ns
                    ? nodeOps.createElementNS(vnode.ns, tag)
                    : nodeOps.createElement(tag, vnode);
                  setScope(vnode);

                  /* istanbul ignore if */
                  {
                    createChildren(vnode, children, insertedVnodeQueue);
                    if (isDef(data)) {
                      invokeCreateHooks(vnode, insertedVnodeQueue);
                    }
                    insert(parentElm, vnode.elm, refElm);
                  }

                  if (process.env.NODE_ENV !== 'production' && data && data.pre) {
                    creatingElmInVPre--;
                  }
                } else if (isTrue(vnode.isComment)) {
                  vnode.elm = nodeOps.createComment(vnode.text);
                  insert(parentElm, vnode.elm, refElm);
                } else {
                  vnode.elm = nodeOps.createTextNode(vnode.text);
                  insert(parentElm, vnode.elm, refElm);
                }
              }

              function createComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
                var i = vnode.data;
                if (isDef(i)) {
                  var isReactivated = isDef(vnode.componentInstance) && i.keepAlive;
                  if (isDef(i = i.hook) && isDef(i = i.init)) {
                    i(vnode, false /* hydrating */);
                  }
                  // after calling the init hook, if the vnode is a child component
                  // it should've created a child instance and mounted it. the child
                  // component also has set the placeholder vnode's elm.
                  // in that case we can just return the element and be done.
                  if (isDef(vnode.componentInstance)) {
                    initComponent(vnode, insertedVnodeQueue);
                    insert(parentElm, vnode.elm, refElm);
                    if (isTrue(isReactivated)) {
                      reactivateComponent(vnode, insertedVnodeQueue, parentElm, refElm);
                    }
                    return true
                  }
                }
              }

              function initComponent (vnode, insertedVnodeQueue) {
                if (isDef(vnode.data.pendingInsert)) {
                  insertedVnodeQueue.push.apply(insertedVnodeQueue, vnode.data.pendingInsert);
                  vnode.data.pendingInsert = null;
                }
                vnode.elm = vnode.componentInstance.$el;
                if (isPatchable(vnode)) {
                  invokeCreateHooks(vnode, insertedVnodeQueue);
                  setScope(vnode);
                } else {
                  // empty component root.
                  // skip all element-related modules except for ref (#3455)
                  registerRef(vnode);
                  // make sure to invoke the insert hook
                  insertedVnodeQueue.push(vnode);
                }
              }

              function reactivateComponent (vnode, insertedVnodeQueue, parentElm, refElm) {
                var i;
                // hack for #4339: a reactivated component with inner transition
                // does not trigger because the inner node's created hooks are not called
                // again. It's not ideal to involve module-specific logic in here but
                // there doesn't seem to be a better way to do it.
                var innerNode = vnode;
                while (innerNode.componentInstance) {
                  innerNode = innerNode.componentInstance._vnode;
                  if (isDef(i = innerNode.data) && isDef(i = i.transition)) {
                    for (i = 0; i < cbs.activate.length; ++i) {
                      cbs.activate[i](emptyNode, innerNode);
                    }
                    insertedVnodeQueue.push(innerNode);
                    break
                  }
                }
                // unlike a newly created component,
                // a reactivated keep-alive component doesn't insert itself
                insert(parentElm, vnode.elm, refElm);
              }

              function insert (parent, elm, ref$$1) {
                if (isDef(parent)) {
                  if (isDef(ref$$1)) {
                    if (nodeOps.parentNode(ref$$1) === parent) {
                      nodeOps.insertBefore(parent, elm, ref$$1);
                    }
                  } else {
                    nodeOps.appendChild(parent, elm);
                  }
                }
              }

              function createChildren (vnode, children, insertedVnodeQueue) {
                if (Array.isArray(children)) {
                  if (process.env.NODE_ENV !== 'production') {
                    checkDuplicateKeys(children);
                  }
                  for (var i = 0; i < children.length; ++i) {
                    createElm(children[i], insertedVnodeQueue, vnode.elm, null, true, children, i);
                  }
                } else if (isPrimitive(vnode.text)) {
                  nodeOps.appendChild(vnode.elm, nodeOps.createTextNode(String(vnode.text)));
                }
              }

              function isPatchable (vnode) {
                while (vnode.componentInstance) {
                  vnode = vnode.componentInstance._vnode;
                }
                return isDef(vnode.tag)
              }

              function invokeCreateHooks (vnode, insertedVnodeQueue) {
                for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                  cbs.create[i$1](emptyNode, vnode);
                }
                i = vnode.data.hook; // Reuse variable
                if (isDef(i)) {
                  if (isDef(i.create)) { i.create(emptyNode, vnode); }
                  if (isDef(i.insert)) { insertedVnodeQueue.push(vnode); }
                }
              }

              // set scope id attribute for scoped CSS.
              // this is implemented as a special case to avoid the overhead
              // of going through the normal attribute patching process.
              function setScope (vnode) {
                var i;
                if (isDef(i = vnode.fnScopeId)) {
                  nodeOps.setStyleScope(vnode.elm, i);
                } else {
                  var ancestor = vnode;
                  while (ancestor) {
                    if (isDef(i = ancestor.context) && isDef(i = i.$options._scopeId)) {
                      nodeOps.setStyleScope(vnode.elm, i);
                    }
                    ancestor = ancestor.parent;
                  }
                }
                // for slot content they should also get the scopeId from the host instance.
                if (isDef(i = activeInstance) &&
                  i !== vnode.context &&
                  i !== vnode.fnContext &&
                  isDef(i = i.$options._scopeId)
                ) {
                  nodeOps.setStyleScope(vnode.elm, i);
                }
              }

              function addVnodes (parentElm, refElm, vnodes, startIdx, endIdx, insertedVnodeQueue) {
                for (; startIdx <= endIdx; ++startIdx) {
                  createElm(vnodes[startIdx], insertedVnodeQueue, parentElm, refElm, false, vnodes, startIdx);
                }
              }

              function invokeDestroyHook (vnode) {
                var i, j;
                var data = vnode.data;
                if (isDef(data)) {
                  if (isDef(i = data.hook) && isDef(i = i.destroy)) { i(vnode); }
                  for (i = 0; i < cbs.destroy.length; ++i) { cbs.destroy[i](vnode); }
                }
                if (isDef(i = vnode.children)) {
                  for (j = 0; j < vnode.children.length; ++j) {
                    invokeDestroyHook(vnode.children[j]);
                  }
                }
              }

              function removeVnodes (parentElm, vnodes, startIdx, endIdx) {
                for (; startIdx <= endIdx; ++startIdx) {
                  var ch = vnodes[startIdx];
                  if (isDef(ch)) {
                    if (isDef(ch.tag)) {
                      removeAndInvokeRemoveHook(ch);
                      invokeDestroyHook(ch);
                    } else { // Text node
                      removeNode(ch.elm);
                    }
                  }
                }
              }

              function removeAndInvokeRemoveHook (vnode, rm) {
                if (isDef(rm) || isDef(vnode.data)) {
                  var i;
                  var listeners = cbs.remove.length + 1;
                  if (isDef(rm)) {
                    // we have a recursively passed down rm callback
                    // increase the listeners count
                    rm.listeners += listeners;
                  } else {
                    // directly removing
                    rm = createRmCb(vnode.elm, listeners);
                  }
                  // recursively invoke hooks on child component root node
                  if (isDef(i = vnode.componentInstance) && isDef(i = i._vnode) && isDef(i.data)) {
                    removeAndInvokeRemoveHook(i, rm);
                  }
                  for (i = 0; i < cbs.remove.length; ++i) {
                    cbs.remove[i](vnode, rm);
                  }
                  if (isDef(i = vnode.data.hook) && isDef(i = i.remove)) {
                    i(vnode, rm);
                  } else {
                    rm();
                  }
                } else {
                  removeNode(vnode.elm);
                }
              }

              function updateChildren (parentElm, oldCh, newCh, insertedVnodeQueue, removeOnly) {
                var oldStartIdx = 0;
                var newStartIdx = 0;
                var oldEndIdx = oldCh.length - 1;
                var oldStartVnode = oldCh[0];
                var oldEndVnode = oldCh[oldEndIdx];
                var newEndIdx = newCh.length - 1;
                var newStartVnode = newCh[0];
                var newEndVnode = newCh[newEndIdx];
                var oldKeyToIdx, idxInOld, vnodeToMove, refElm;

                // removeOnly is a special flag used only by <transition-group>
                // to ensure removed elements stay in correct relative positions
                // during leaving transitions
                var canMove = !removeOnly;

                if (process.env.NODE_ENV !== 'production') {
                  checkDuplicateKeys(newCh);
                }

                while (oldStartIdx <= oldEndIdx && newStartIdx <= newEndIdx) {
                  if (isUndef(oldStartVnode)) {
                    oldStartVnode = oldCh[++oldStartIdx]; // Vnode has been moved left
                  } else if (isUndef(oldEndVnode)) {
                    oldEndVnode = oldCh[--oldEndIdx];
                  } else if (sameVnode(oldStartVnode, newStartVnode)) {
                    patchVnode(oldStartVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                    oldStartVnode = oldCh[++oldStartIdx];
                    newStartVnode = newCh[++newStartIdx];
                  } else if (sameVnode(oldEndVnode, newEndVnode)) {
                    patchVnode(oldEndVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newEndVnode = newCh[--newEndIdx];
                  } else if (sameVnode(oldStartVnode, newEndVnode)) { // Vnode moved right
                    patchVnode(oldStartVnode, newEndVnode, insertedVnodeQueue, newCh, newEndIdx);
                    canMove && nodeOps.insertBefore(parentElm, oldStartVnode.elm, nodeOps.nextSibling(oldEndVnode.elm));
                    oldStartVnode = oldCh[++oldStartIdx];
                    newEndVnode = newCh[--newEndIdx];
                  } else if (sameVnode(oldEndVnode, newStartVnode)) { // Vnode moved left
                    patchVnode(oldEndVnode, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                    canMove && nodeOps.insertBefore(parentElm, oldEndVnode.elm, oldStartVnode.elm);
                    oldEndVnode = oldCh[--oldEndIdx];
                    newStartVnode = newCh[++newStartIdx];
                  } else {
                    if (isUndef(oldKeyToIdx)) { oldKeyToIdx = createKeyToOldIdx(oldCh, oldStartIdx, oldEndIdx); }
                    idxInOld = isDef(newStartVnode.key)
                      ? oldKeyToIdx[newStartVnode.key]
                      : findIdxInOld(newStartVnode, oldCh, oldStartIdx, oldEndIdx);
                    if (isUndef(idxInOld)) { // New element
                      createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
                    } else {
                      vnodeToMove = oldCh[idxInOld];
                      if (sameVnode(vnodeToMove, newStartVnode)) {
                        patchVnode(vnodeToMove, newStartVnode, insertedVnodeQueue, newCh, newStartIdx);
                        oldCh[idxInOld] = undefined;
                        canMove && nodeOps.insertBefore(parentElm, vnodeToMove.elm, oldStartVnode.elm);
                      } else {
                        // same key but different element. treat as new element
                        createElm(newStartVnode, insertedVnodeQueue, parentElm, oldStartVnode.elm, false, newCh, newStartIdx);
                      }
                    }
                    newStartVnode = newCh[++newStartIdx];
                  }
                }
                if (oldStartIdx > oldEndIdx) {
                  refElm = isUndef(newCh[newEndIdx + 1]) ? null : newCh[newEndIdx + 1].elm;
                  addVnodes(parentElm, refElm, newCh, newStartIdx, newEndIdx, insertedVnodeQueue);
                } else if (newStartIdx > newEndIdx) {
                  removeVnodes(parentElm, oldCh, oldStartIdx, oldEndIdx);
                }
              }

              function checkDuplicateKeys (children) {
                var seenKeys = {};
                for (var i = 0; i < children.length; i++) {
                  var vnode = children[i];
                  var key = vnode.key;
                  if (isDef(key)) {
                    if (seenKeys[key]) {
                      warn(
                        ("Duplicate keys detected: '" + key + "'. This may cause an update error."),
                        vnode.context
                      );
                    } else {
                      seenKeys[key] = true;
                    }
                  }
                }
              }

              function findIdxInOld (node, oldCh, start, end) {
                for (var i = start; i < end; i++) {
                  var c = oldCh[i];
                  if (isDef(c) && sameVnode(node, c)) { return i }
                }
              }

              function patchVnode (
                oldVnode,
                vnode,
                insertedVnodeQueue,
                ownerArray,
                index,
                removeOnly
              ) {
                if (oldVnode === vnode) {
                  return
                }

                if (isDef(vnode.elm) && isDef(ownerArray)) {
                  // clone reused vnode
                  vnode = ownerArray[index] = cloneVNode(vnode);
                }

                var elm = vnode.elm = oldVnode.elm;

                if (isTrue(oldVnode.isAsyncPlaceholder)) {
                  if (isDef(vnode.asyncFactory.resolved)) {
                    hydrate(oldVnode.elm, vnode, insertedVnodeQueue);
                  } else {
                    vnode.isAsyncPlaceholder = true;
                  }
                  return
                }

                // reuse element for static trees.
                // note we only do this if the vnode is cloned -
                // if the new node is not cloned it means the render functions have been
                // reset by the hot-reload-api and we need to do a proper re-render.
                if (isTrue(vnode.isStatic) &&
                  isTrue(oldVnode.isStatic) &&
                  vnode.key === oldVnode.key &&
                  (isTrue(vnode.isCloned) || isTrue(vnode.isOnce))
                ) {
                  vnode.componentInstance = oldVnode.componentInstance;
                  return
                }

                var i;
                var data = vnode.data;
                if (isDef(data) && isDef(i = data.hook) && isDef(i = i.prepatch)) {
                  i(oldVnode, vnode);
                }

                var oldCh = oldVnode.children;
                var ch = vnode.children;
                if (isDef(data) && isPatchable(vnode)) {
                  for (i = 0; i < cbs.update.length; ++i) { cbs.update[i](oldVnode, vnode); }
                  if (isDef(i = data.hook) && isDef(i = i.update)) { i(oldVnode, vnode); }
                }
                if (isUndef(vnode.text)) {
                  if (isDef(oldCh) && isDef(ch)) {
                    if (oldCh !== ch) { updateChildren(elm, oldCh, ch, insertedVnodeQueue, removeOnly); }
                  } else if (isDef(ch)) {
                    if (process.env.NODE_ENV !== 'production') {
                      checkDuplicateKeys(ch);
                    }
                    if (isDef(oldVnode.text)) { nodeOps.setTextContent(elm, ''); }
                    addVnodes(elm, null, ch, 0, ch.length - 1, insertedVnodeQueue);
                  } else if (isDef(oldCh)) {
                    removeVnodes(elm, oldCh, 0, oldCh.length - 1);
                  } else if (isDef(oldVnode.text)) {
                    nodeOps.setTextContent(elm, '');
                  }
                } else if (oldVnode.text !== vnode.text) {
                  nodeOps.setTextContent(elm, vnode.text);
                }
                if (isDef(data)) {
                  if (isDef(i = data.hook) && isDef(i = i.postpatch)) { i(oldVnode, vnode); }
                }
              }

              function invokeInsertHook (vnode, queue, initial) {
                // delay insert hooks for component root nodes, invoke them after the
                // element is really inserted
                if (isTrue(initial) && isDef(vnode.parent)) {
                  vnode.parent.data.pendingInsert = queue;
                } else {
                  for (var i = 0; i < queue.length; ++i) {
                    queue[i].data.hook.insert(queue[i]);
                  }
                }
              }

              var hydrationBailed = false;
              // list of modules that can skip create hook during hydration because they
              // are already rendered on the client or has no need for initialization
              // Note: style is excluded because it relies on initial clone for future
              // deep updates (#7063).
              var isRenderedModule = makeMap('attrs,class,staticClass,staticStyle,key');

              // Note: this is a browser-only function so we can assume elms are DOM nodes.
              function hydrate (elm, vnode, insertedVnodeQueue, inVPre) {
                var i;
                var tag = vnode.tag;
                var data = vnode.data;
                var children = vnode.children;
                inVPre = inVPre || (data && data.pre);
                vnode.elm = elm;

                if (isTrue(vnode.isComment) && isDef(vnode.asyncFactory)) {
                  vnode.isAsyncPlaceholder = true;
                  return true
                }
                // assert node match
                if (process.env.NODE_ENV !== 'production') {
                  if (!assertNodeMatch(elm, vnode, inVPre)) {
                    return false
                  }
                }
                if (isDef(data)) {
                  if (isDef(i = data.hook) && isDef(i = i.init)) { i(vnode, true /* hydrating */); }
                  if (isDef(i = vnode.componentInstance)) {
                    // child component. it should have hydrated its own tree.
                    initComponent(vnode, insertedVnodeQueue);
                    return true
                  }
                }
                if (isDef(tag)) {
                  if (isDef(children)) {
                    // empty element, allow client to pick up and populate children
                    if (!elm.hasChildNodes()) {
                      createChildren(vnode, children, insertedVnodeQueue);
                    } else {
                      // v-html and domProps: innerHTML
                      if (isDef(i = data) && isDef(i = i.domProps) && isDef(i = i.innerHTML)) {
                        if (i !== elm.innerHTML) {
                          /* istanbul ignore if */
                          if (process.env.NODE_ENV !== 'production' &&
                            typeof console !== 'undefined' &&
                            !hydrationBailed
                          ) {
                            hydrationBailed = true;
                            console.warn('Parent: ', elm);
                            console.warn('server innerHTML: ', i);
                            console.warn('client innerHTML: ', elm.innerHTML);
                          }
                          return false
                        }
                      } else {
                        // iterate and compare children lists
                        var childrenMatch = true;
                        var childNode = elm.firstChild;
                        for (var i$1 = 0; i$1 < children.length; i$1++) {
                          if (!childNode || !hydrate(childNode, children[i$1], insertedVnodeQueue, inVPre)) {
                            childrenMatch = false;
                            break
                          }
                          childNode = childNode.nextSibling;
                        }
                        // if childNode is not null, it means the actual childNodes list is
                        // longer than the virtual children list.
                        if (!childrenMatch || childNode) {
                          /* istanbul ignore if */
                          if (process.env.NODE_ENV !== 'production' &&
                            typeof console !== 'undefined' &&
                            !hydrationBailed
                          ) {
                            hydrationBailed = true;
                            console.warn('Parent: ', elm);
                            console.warn('Mismatching childNodes vs. VNodes: ', elm.childNodes, children);
                          }
                          return false
                        }
                      }
                    }
                  }
                  if (isDef(data)) {
                    var fullInvoke = false;
                    for (var key in data) {
                      if (!isRenderedModule(key)) {
                        fullInvoke = true;
                        invokeCreateHooks(vnode, insertedVnodeQueue);
                        break
                      }
                    }
                    if (!fullInvoke && data['class']) {
                      // ensure collecting deps for deep class bindings for future updates
                      traverse(data['class']);
                    }
                  }
                } else if (elm.data !== vnode.text) {
                  elm.data = vnode.text;
                }
                return true
              }

              function assertNodeMatch (node, vnode, inVPre) {
                if (isDef(vnode.tag)) {
                  return vnode.tag.indexOf('vue-component') === 0 || (
                    !isUnknownElement$$1(vnode, inVPre) &&
                    vnode.tag.toLowerCase() === (node.tagName && node.tagName.toLowerCase())
                  )
                } else {
                  return node.nodeType === (vnode.isComment ? 8 : 3)
                }
              }

              return function patch (oldVnode, vnode, hydrating, removeOnly) {
                if (isUndef(vnode)) {
                  if (isDef(oldVnode)) { invokeDestroyHook(oldVnode); }
                  return
                }

                var isInitialPatch = false;
                var insertedVnodeQueue = [];

                if (isUndef(oldVnode)) {
                  // empty mount (likely as component), create new root element
                  isInitialPatch = true;
                  createElm(vnode, insertedVnodeQueue);
                } else {
                  var isRealElement = isDef(oldVnode.nodeType);
                  if (!isRealElement && sameVnode(oldVnode, vnode)) {
                    // patch existing root node
                    patchVnode(oldVnode, vnode, insertedVnodeQueue, null, null, removeOnly);
                  } else {
                    if (isRealElement) {
                      // mounting to a real element
                      // check if this is server-rendered content and if we can perform
                      // a successful hydration.
                      if (oldVnode.nodeType === 1 && oldVnode.hasAttribute(SSR_ATTR)) {
                        oldVnode.removeAttribute(SSR_ATTR);
                        hydrating = true;
                      }
                      if (isTrue(hydrating)) {
                        if (hydrate(oldVnode, vnode, insertedVnodeQueue)) {
                          invokeInsertHook(vnode, insertedVnodeQueue, true);
                          return oldVnode
                        } else if (process.env.NODE_ENV !== 'production') {
                          warn(
                            'The client-side rendered virtual DOM tree is not matching ' +
                            'server-rendered content. This is likely caused by incorrect ' +
                            'HTML markup, for example nesting block-level elements inside ' +
                            '<p>, or missing <tbody>. Bailing hydration and performing ' +
                            'full client-side render.'
                          );
                        }
                      }
                      // either not server-rendered, or hydration failed.
                      // create an empty node and replace it
                      oldVnode = emptyNodeAt(oldVnode);
                    }

                    // replacing existing element
                    var oldElm = oldVnode.elm;
                    var parentElm = nodeOps.parentNode(oldElm);

                    // create new node
                    createElm(
                      vnode,
                      insertedVnodeQueue,
                      // extremely rare edge case: do not insert if old element is in a
                      // leaving transition. Only happens when combining transition +
                      // keep-alive + HOCs. (#4590)
                      oldElm._leaveCb ? null : parentElm,
                      nodeOps.nextSibling(oldElm)
                    );

                    // update parent placeholder node element, recursively
                    if (isDef(vnode.parent)) {
                      var ancestor = vnode.parent;
                      var patchable = isPatchable(vnode);
                      while (ancestor) {
                        for (var i = 0; i < cbs.destroy.length; ++i) {
                          cbs.destroy[i](ancestor);
                        }
                        ancestor.elm = vnode.elm;
                        if (patchable) {
                          for (var i$1 = 0; i$1 < cbs.create.length; ++i$1) {
                            cbs.create[i$1](emptyNode, ancestor);
                          }
                          // #6513
                          // invoke insert hooks that may have been merged by create hooks.
                          // e.g. for directives that uses the "inserted" hook.
                          var insert = ancestor.data.hook.insert;
                          if (insert.merged) {
                            // start at index 1 to avoid re-invoking component mounted hook
                            for (var i$2 = 1; i$2 < insert.fns.length; i$2++) {
                              insert.fns[i$2]();
                            }
                          }
                        } else {
                          registerRef(ancestor);
                        }
                        ancestor = ancestor.parent;
                      }
                    }

                    // destroy old node
                    if (isDef(parentElm)) {
                      removeVnodes(parentElm, [oldVnode], 0, 0);
                    } else if (isDef(oldVnode.tag)) {
                      invokeDestroyHook(oldVnode);
                    }
                  }
                }

                invokeInsertHook(vnode, insertedVnodeQueue, isInitialPatch);
                return vnode.elm
              }
            }

            /*  */

            var directives = {
              create: updateDirectives,
              update: updateDirectives,
              destroy: function unbindDirectives (vnode) {
                updateDirectives(vnode, emptyNode);
              }
            };

            function updateDirectives (oldVnode, vnode) {
              if (oldVnode.data.directives || vnode.data.directives) {
                _update(oldVnode, vnode);
              }
            }

            function _update (oldVnode, vnode) {
              var isCreate = oldVnode === emptyNode;
              var isDestroy = vnode === emptyNode;
              var oldDirs = normalizeDirectives$1(oldVnode.data.directives, oldVnode.context);
              var newDirs = normalizeDirectives$1(vnode.data.directives, vnode.context);

              var dirsWithInsert = [];
              var dirsWithPostpatch = [];

              var key, oldDir, dir;
              for (key in newDirs) {
                oldDir = oldDirs[key];
                dir = newDirs[key];
                if (!oldDir) {
                  // new directive, bind
                  callHook$1(dir, 'bind', vnode, oldVnode);
                  if (dir.def && dir.def.inserted) {
                    dirsWithInsert.push(dir);
                  }
                } else {
                  // existing directive, update
                  dir.oldValue = oldDir.value;
                  callHook$1(dir, 'update', vnode, oldVnode);
                  if (dir.def && dir.def.componentUpdated) {
                    dirsWithPostpatch.push(dir);
                  }
                }
              }

              if (dirsWithInsert.length) {
                var callInsert = function () {
                  for (var i = 0; i < dirsWithInsert.length; i++) {
                    callHook$1(dirsWithInsert[i], 'inserted', vnode, oldVnode);
                  }
                };
                if (isCreate) {
                  mergeVNodeHook(vnode, 'insert', callInsert);
                } else {
                  callInsert();
                }
              }

              if (dirsWithPostpatch.length) {
                mergeVNodeHook(vnode, 'postpatch', function () {
                  for (var i = 0; i < dirsWithPostpatch.length; i++) {
                    callHook$1(dirsWithPostpatch[i], 'componentUpdated', vnode, oldVnode);
                  }
                });
              }

              if (!isCreate) {
                for (key in oldDirs) {
                  if (!newDirs[key]) {
                    // no longer present, unbind
                    callHook$1(oldDirs[key], 'unbind', oldVnode, oldVnode, isDestroy);
                  }
                }
              }
            }

            var emptyModifiers = Object.create(null);

            function normalizeDirectives$1 (
              dirs,
              vm
            ) {
              var res = Object.create(null);
              if (!dirs) {
                // $flow-disable-line
                return res
              }
              var i, dir;
              for (i = 0; i < dirs.length; i++) {
                dir = dirs[i];
                if (!dir.modifiers) {
                  // $flow-disable-line
                  dir.modifiers = emptyModifiers;
                }
                res[getRawDirName(dir)] = dir;
                dir.def = resolveAsset(vm.$options, 'directives', dir.name, true);
              }
              // $flow-disable-line
              return res
            }

            function getRawDirName (dir) {
              return dir.rawName || ((dir.name) + "." + (Object.keys(dir.modifiers || {}).join('.')))
            }

            function callHook$1 (dir, hook, vnode, oldVnode, isDestroy) {
              var fn = dir.def && dir.def[hook];
              if (fn) {
                try {
                  fn(vnode.elm, dir, vnode, oldVnode, isDestroy);
                } catch (e) {
                  handleError(e, vnode.context, ("directive " + (dir.name) + " " + hook + " hook"));
                }
              }
            }

            var baseModules = [
              ref,
              directives
            ];

            /*  */

            function updateAttrs (oldVnode, vnode) {
              var opts = vnode.componentOptions;
              if (isDef(opts) && opts.Ctor.options.inheritAttrs === false) {
                return
              }
              if (isUndef(oldVnode.data.attrs) && isUndef(vnode.data.attrs)) {
                return
              }
              var key, cur, old;
              var elm = vnode.elm;
              var oldAttrs = oldVnode.data.attrs || {};
              var attrs = vnode.data.attrs || {};
              // clone observed objects, as the user probably wants to mutate it
              if (isDef(attrs.__ob__)) {
                attrs = vnode.data.attrs = extend({}, attrs);
              }

              for (key in attrs) {
                cur = attrs[key];
                old = oldAttrs[key];
                if (old !== cur) {
                  setAttr(elm, key, cur);
                }
              }
              // #4391: in IE9, setting type can reset value for input[type=radio]
              // #6666: IE/Edge forces progress value down to 1 before setting a max
              /* istanbul ignore if */
              if ((isIE || isEdge) && attrs.value !== oldAttrs.value) {
                setAttr(elm, 'value', attrs.value);
              }
              for (key in oldAttrs) {
                if (isUndef(attrs[key])) {
                  if (isXlink(key)) {
                    elm.removeAttributeNS(xlinkNS, getXlinkProp(key));
                  } else if (!isEnumeratedAttr(key)) {
                    elm.removeAttribute(key);
                  }
                }
              }
            }

            function setAttr (el, key, value) {
              if (el.tagName.indexOf('-') > -1) {
                baseSetAttr(el, key, value);
              } else if (isBooleanAttr(key)) {
                // set attribute for blank value
                // e.g. <option disabled>Select one</option>
                if (isFalsyAttrValue(value)) {
                  el.removeAttribute(key);
                } else {
                  // technically allowfullscreen is a boolean attribute for <iframe>,
                  // but Flash expects a value of "true" when used on <embed> tag
                  value = key === 'allowfullscreen' && el.tagName === 'EMBED'
                    ? 'true'
                    : key;
                  el.setAttribute(key, value);
                }
              } else if (isEnumeratedAttr(key)) {
                el.setAttribute(key, isFalsyAttrValue(value) || value === 'false' ? 'false' : 'true');
              } else if (isXlink(key)) {
                if (isFalsyAttrValue(value)) {
                  el.removeAttributeNS(xlinkNS, getXlinkProp(key));
                } else {
                  el.setAttributeNS(xlinkNS, key, value);
                }
              } else {
                baseSetAttr(el, key, value);
              }
            }

            function baseSetAttr (el, key, value) {
              if (isFalsyAttrValue(value)) {
                el.removeAttribute(key);
              } else {
                // #7138: IE10 & 11 fires input event when setting placeholder on
                // <textarea>... block the first input event and remove the blocker
                // immediately.
                /* istanbul ignore if */
                if (
                  isIE && !isIE9 &&
                  (el.tagName === 'TEXTAREA' || el.tagName === 'INPUT') &&
                  key === 'placeholder' && !el.__ieph
                ) {
                  var blocker = function (e) {
                    e.stopImmediatePropagation();
                    el.removeEventListener('input', blocker);
                  };
                  el.addEventListener('input', blocker);
                  // $flow-disable-line
                  el.__ieph = true; /* IE placeholder patched */
                }
                el.setAttribute(key, value);
              }
            }

            var attrs = {
              create: updateAttrs,
              update: updateAttrs
            };

            /*  */

            function updateClass (oldVnode, vnode) {
              var el = vnode.elm;
              var data = vnode.data;
              var oldData = oldVnode.data;
              if (
                isUndef(data.staticClass) &&
                isUndef(data.class) && (
                  isUndef(oldData) || (
                    isUndef(oldData.staticClass) &&
                    isUndef(oldData.class)
                  )
                )
              ) {
                return
              }

              var cls = genClassForVnode(vnode);

              // handle transition classes
              var transitionClass = el._transitionClasses;
              if (isDef(transitionClass)) {
                cls = concat(cls, stringifyClass(transitionClass));
              }

              // set the class
              if (cls !== el._prevClass) {
                el.setAttribute('class', cls);
                el._prevClass = cls;
              }
            }

            var klass = {
              create: updateClass,
              update: updateClass
            };

            /*  */

            /*  */

            /*  */

            /*  */

            // in some cases, the event used has to be determined at runtime
            // so we used some reserved tokens during compile.
            var RANGE_TOKEN = '__r';
            var CHECKBOX_RADIO_TOKEN = '__c';

            /*  */

            // normalize v-model event tokens that can only be determined at runtime.
            // it's important to place the event as the first in the array because
            // the whole point is ensuring the v-model callback gets called before
            // user-attached handlers.
            function normalizeEvents (on$$1) {
              /* istanbul ignore if */
              if (isDef(on$$1[RANGE_TOKEN])) {
                // IE input[type=range] only supports `change` event
                var event = isIE ? 'change' : 'input';
                on$$1[event] = [].concat(on$$1[RANGE_TOKEN], on$$1[event] || []);
                delete on$$1[RANGE_TOKEN];
              }
              // This was originally intended to fix #4521 but no longer necessary
              // after 2.5. Keeping it for backwards compat with generated code from < 2.4
              /* istanbul ignore if */
              if (isDef(on$$1[CHECKBOX_RADIO_TOKEN])) {
                on$$1.change = [].concat(on$$1[CHECKBOX_RADIO_TOKEN], on$$1.change || []);
                delete on$$1[CHECKBOX_RADIO_TOKEN];
              }
            }

            var target$1;

            function createOnceHandler$1 (event, handler, capture) {
              var _target = target$1; // save current target element in closure
              return function onceHandler () {
                var res = handler.apply(null, arguments);
                if (res !== null) {
                  remove$2(event, onceHandler, capture, _target);
                }
              }
            }

            function add$1 (
              event,
              handler,
              capture,
              passive
            ) {
              handler = withMacroTask(handler);
              target$1.addEventListener(
                event,
                handler,
                supportsPassive
                  ? { capture: capture, passive: passive }
                  : capture
              );
            }

            function remove$2 (
              event,
              handler,
              capture,
              _target
            ) {
              (_target || target$1).removeEventListener(
                event,
                handler._withTask || handler,
                capture
              );
            }

            function updateDOMListeners (oldVnode, vnode) {
              if (isUndef(oldVnode.data.on) && isUndef(vnode.data.on)) {
                return
              }
              var on$$1 = vnode.data.on || {};
              var oldOn = oldVnode.data.on || {};
              target$1 = vnode.elm;
              normalizeEvents(on$$1);
              updateListeners(on$$1, oldOn, add$1, remove$2, createOnceHandler$1, vnode.context);
              target$1 = undefined;
            }

            var events = {
              create: updateDOMListeners,
              update: updateDOMListeners
            };

            /*  */

            function updateDOMProps (oldVnode, vnode) {
              if (isUndef(oldVnode.data.domProps) && isUndef(vnode.data.domProps)) {
                return
              }
              var key, cur;
              var elm = vnode.elm;
              var oldProps = oldVnode.data.domProps || {};
              var props = vnode.data.domProps || {};
              // clone observed objects, as the user probably wants to mutate it
              if (isDef(props.__ob__)) {
                props = vnode.data.domProps = extend({}, props);
              }

              for (key in oldProps) {
                if (isUndef(props[key])) {
                  elm[key] = '';
                }
              }
              for (key in props) {
                cur = props[key];
                // ignore children if the node has textContent or innerHTML,
                // as these will throw away existing DOM nodes and cause removal errors
                // on subsequent patches (#3360)
                if (key === 'textContent' || key === 'innerHTML') {
                  if (vnode.children) { vnode.children.length = 0; }
                  if (cur === oldProps[key]) { continue }
                  // #6601 work around Chrome version <= 55 bug where single textNode
                  // replaced by innerHTML/textContent retains its parentNode property
                  if (elm.childNodes.length === 1) {
                    elm.removeChild(elm.childNodes[0]);
                  }
                }

                if (key === 'value') {
                  // store value as _value as well since
                  // non-string values will be stringified
                  elm._value = cur;
                  // avoid resetting cursor position when value is the same
                  var strCur = isUndef(cur) ? '' : String(cur);
                  if (shouldUpdateValue(elm, strCur)) {
                    elm.value = strCur;
                  }
                } else {
                  elm[key] = cur;
                }
              }
            }

            // check platforms/web/util/attrs.js acceptValue


            function shouldUpdateValue (elm, checkVal) {
              return (!elm.composing && (
                elm.tagName === 'OPTION' ||
                isNotInFocusAndDirty(elm, checkVal) ||
                isDirtyWithModifiers(elm, checkVal)
              ))
            }

            function isNotInFocusAndDirty (elm, checkVal) {
              // return true when textbox (.number and .trim) loses focus and its value is
              // not equal to the updated value
              var notInFocus = true;
              // #6157
              // work around IE bug when accessing document.activeElement in an iframe
              try { notInFocus = document.activeElement !== elm; } catch (e) {}
              return notInFocus && elm.value !== checkVal
            }

            function isDirtyWithModifiers (elm, newVal) {
              var value = elm.value;
              var modifiers = elm._vModifiers; // injected by v-model runtime
              if (isDef(modifiers)) {
                if (modifiers.lazy) {
                  // inputs with lazy should only be updated when not in focus
                  return false
                }
                if (modifiers.number) {
                  return toNumber(value) !== toNumber(newVal)
                }
                if (modifiers.trim) {
                  return value.trim() !== newVal.trim()
                }
              }
              return value !== newVal
            }

            var domProps = {
              create: updateDOMProps,
              update: updateDOMProps
            };

            /*  */

            var parseStyleText = cached(function (cssText) {
              var res = {};
              var listDelimiter = /;(?![^(]*\))/g;
              var propertyDelimiter = /:(.+)/;
              cssText.split(listDelimiter).forEach(function (item) {
                if (item) {
                  var tmp = item.split(propertyDelimiter);
                  tmp.length > 1 && (res[tmp[0].trim()] = tmp[1].trim());
                }
              });
              return res
            });

            // merge static and dynamic style data on the same vnode
            function normalizeStyleData (data) {
              var style = normalizeStyleBinding(data.style);
              // static style is pre-processed into an object during compilation
              // and is always a fresh object, so it's safe to merge into it
              return data.staticStyle
                ? extend(data.staticStyle, style)
                : style
            }

            // normalize possible array / string values into Object
            function normalizeStyleBinding (bindingStyle) {
              if (Array.isArray(bindingStyle)) {
                return toObject(bindingStyle)
              }
              if (typeof bindingStyle === 'string') {
                return parseStyleText(bindingStyle)
              }
              return bindingStyle
            }

            /**
             * parent component style should be after child's
             * so that parent component's style could override it
             */
            function getStyle (vnode, checkChild) {
              var res = {};
              var styleData;

              if (checkChild) {
                var childNode = vnode;
                while (childNode.componentInstance) {
                  childNode = childNode.componentInstance._vnode;
                  if (
                    childNode && childNode.data &&
                    (styleData = normalizeStyleData(childNode.data))
                  ) {
                    extend(res, styleData);
                  }
                }
              }

              if ((styleData = normalizeStyleData(vnode.data))) {
                extend(res, styleData);
              }

              var parentNode = vnode;
              while ((parentNode = parentNode.parent)) {
                if (parentNode.data && (styleData = normalizeStyleData(parentNode.data))) {
                  extend(res, styleData);
                }
              }
              return res
            }

            /*  */

            var cssVarRE = /^--/;
            var importantRE = /\s*!important$/;
            var setProp = function (el, name, val) {
              /* istanbul ignore if */
              if (cssVarRE.test(name)) {
                el.style.setProperty(name, val);
              } else if (importantRE.test(val)) {
                el.style.setProperty(name, val.replace(importantRE, ''), 'important');
              } else {
                var normalizedName = normalize(name);
                if (Array.isArray(val)) {
                  // Support values array created by autoprefixer, e.g.
                  // {display: ["-webkit-box", "-ms-flexbox", "flex"]}
                  // Set them one by one, and the browser will only set those it can recognize
                  for (var i = 0, len = val.length; i < len; i++) {
                    el.style[normalizedName] = val[i];
                  }
                } else {
                  el.style[normalizedName] = val;
                }
              }
            };

            var vendorNames = ['Webkit', 'Moz', 'ms'];

            var emptyStyle;
            var normalize = cached(function (prop) {
              emptyStyle = emptyStyle || document.createElement('div').style;
              prop = camelize(prop);
              if (prop !== 'filter' && (prop in emptyStyle)) {
                return prop
              }
              var capName = prop.charAt(0).toUpperCase() + prop.slice(1);
              for (var i = 0; i < vendorNames.length; i++) {
                var name = vendorNames[i] + capName;
                if (name in emptyStyle) {
                  return name
                }
              }
            });

            function updateStyle (oldVnode, vnode) {
              var data = vnode.data;
              var oldData = oldVnode.data;

              if (isUndef(data.staticStyle) && isUndef(data.style) &&
                isUndef(oldData.staticStyle) && isUndef(oldData.style)
              ) {
                return
              }

              var cur, name;
              var el = vnode.elm;
              var oldStaticStyle = oldData.staticStyle;
              var oldStyleBinding = oldData.normalizedStyle || oldData.style || {};

              // if static style exists, stylebinding already merged into it when doing normalizeStyleData
              var oldStyle = oldStaticStyle || oldStyleBinding;

              var style = normalizeStyleBinding(vnode.data.style) || {};

              // store normalized style under a different key for next diff
              // make sure to clone it if it's reactive, since the user likely wants
              // to mutate it.
              vnode.data.normalizedStyle = isDef(style.__ob__)
                ? extend({}, style)
                : style;

              var newStyle = getStyle(vnode, true);

              for (name in oldStyle) {
                if (isUndef(newStyle[name])) {
                  setProp(el, name, '');
                }
              }
              for (name in newStyle) {
                cur = newStyle[name];
                if (cur !== oldStyle[name]) {
                  // ie9 setting to null has no effect, must use empty string
                  setProp(el, name, cur == null ? '' : cur);
                }
              }
            }

            var style = {
              create: updateStyle,
              update: updateStyle
            };

            /*  */

            var whitespaceRE = /\s+/;

            /**
             * Add class with compatibility for SVG since classList is not supported on
             * SVG elements in IE
             */
            function addClass (el, cls) {
              /* istanbul ignore if */
              if (!cls || !(cls = cls.trim())) {
                return
              }

              /* istanbul ignore else */
              if (el.classList) {
                if (cls.indexOf(' ') > -1) {
                  cls.split(whitespaceRE).forEach(function (c) { return el.classList.add(c); });
                } else {
                  el.classList.add(cls);
                }
              } else {
                var cur = " " + (el.getAttribute('class') || '') + " ";
                if (cur.indexOf(' ' + cls + ' ') < 0) {
                  el.setAttribute('class', (cur + cls).trim());
                }
              }
            }

            /**
             * Remove class with compatibility for SVG since classList is not supported on
             * SVG elements in IE
             */
            function removeClass (el, cls) {
              /* istanbul ignore if */
              if (!cls || !(cls = cls.trim())) {
                return
              }

              /* istanbul ignore else */
              if (el.classList) {
                if (cls.indexOf(' ') > -1) {
                  cls.split(whitespaceRE).forEach(function (c) { return el.classList.remove(c); });
                } else {
                  el.classList.remove(cls);
                }
                if (!el.classList.length) {
                  el.removeAttribute('class');
                }
              } else {
                var cur = " " + (el.getAttribute('class') || '') + " ";
                var tar = ' ' + cls + ' ';
                while (cur.indexOf(tar) >= 0) {
                  cur = cur.replace(tar, ' ');
                }
                cur = cur.trim();
                if (cur) {
                  el.setAttribute('class', cur);
                } else {
                  el.removeAttribute('class');
                }
              }
            }

            /*  */

            function resolveTransition (def$$1) {
              if (!def$$1) {
                return
              }
              /* istanbul ignore else */
              if (typeof def$$1 === 'object') {
                var res = {};
                if (def$$1.css !== false) {
                  extend(res, autoCssTransition(def$$1.name || 'v'));
                }
                extend(res, def$$1);
                return res
              } else if (typeof def$$1 === 'string') {
                return autoCssTransition(def$$1)
              }
            }

            var autoCssTransition = cached(function (name) {
              return {
                enterClass: (name + "-enter"),
                enterToClass: (name + "-enter-to"),
                enterActiveClass: (name + "-enter-active"),
                leaveClass: (name + "-leave"),
                leaveToClass: (name + "-leave-to"),
                leaveActiveClass: (name + "-leave-active")
              }
            });

            var hasTransition = inBrowser && !isIE9;
            var TRANSITION = 'transition';
            var ANIMATION = 'animation';

            // Transition property/event sniffing
            var transitionProp = 'transition';
            var transitionEndEvent = 'transitionend';
            var animationProp = 'animation';
            var animationEndEvent = 'animationend';
            if (hasTransition) {
              /* istanbul ignore if */
              if (window.ontransitionend === undefined &&
                window.onwebkittransitionend !== undefined
              ) {
                transitionProp = 'WebkitTransition';
                transitionEndEvent = 'webkitTransitionEnd';
              }
              if (window.onanimationend === undefined &&
                window.onwebkitanimationend !== undefined
              ) {
                animationProp = 'WebkitAnimation';
                animationEndEvent = 'webkitAnimationEnd';
              }
            }

            // binding to window is necessary to make hot reload work in IE in strict mode
            var raf = inBrowser
              ? window.requestAnimationFrame
                ? window.requestAnimationFrame.bind(window)
                : setTimeout
              : /* istanbul ignore next */ function (fn) { return fn(); };

            function nextFrame (fn) {
              raf(function () {
                raf(fn);
              });
            }

            function addTransitionClass (el, cls) {
              var transitionClasses = el._transitionClasses || (el._transitionClasses = []);
              if (transitionClasses.indexOf(cls) < 0) {
                transitionClasses.push(cls);
                addClass(el, cls);
              }
            }

            function removeTransitionClass (el, cls) {
              if (el._transitionClasses) {
                remove(el._transitionClasses, cls);
              }
              removeClass(el, cls);
            }

            function whenTransitionEnds (
              el,
              expectedType,
              cb
            ) {
              var ref = getTransitionInfo(el, expectedType);
              var type = ref.type;
              var timeout = ref.timeout;
              var propCount = ref.propCount;
              if (!type) { return cb() }
              var event = type === TRANSITION ? transitionEndEvent : animationEndEvent;
              var ended = 0;
              var end = function () {
                el.removeEventListener(event, onEnd);
                cb();
              };
              var onEnd = function (e) {
                if (e.target === el) {
                  if (++ended >= propCount) {
                    end();
                  }
                }
              };
              setTimeout(function () {
                if (ended < propCount) {
                  end();
                }
              }, timeout + 1);
              el.addEventListener(event, onEnd);
            }

            var transformRE = /\b(transform|all)(,|$)/;

            function getTransitionInfo (el, expectedType) {
              var styles = window.getComputedStyle(el);
              // JSDOM may return undefined for transition properties
              var transitionDelays = (styles[transitionProp + 'Delay'] || '').split(', ');
              var transitionDurations = (styles[transitionProp + 'Duration'] || '').split(', ');
              var transitionTimeout = getTimeout(transitionDelays, transitionDurations);
              var animationDelays = (styles[animationProp + 'Delay'] || '').split(', ');
              var animationDurations = (styles[animationProp + 'Duration'] || '').split(', ');
              var animationTimeout = getTimeout(animationDelays, animationDurations);

              var type;
              var timeout = 0;
              var propCount = 0;
              /* istanbul ignore if */
              if (expectedType === TRANSITION) {
                if (transitionTimeout > 0) {
                  type = TRANSITION;
                  timeout = transitionTimeout;
                  propCount = transitionDurations.length;
                }
              } else if (expectedType === ANIMATION) {
                if (animationTimeout > 0) {
                  type = ANIMATION;
                  timeout = animationTimeout;
                  propCount = animationDurations.length;
                }
              } else {
                timeout = Math.max(transitionTimeout, animationTimeout);
                type = timeout > 0
                  ? transitionTimeout > animationTimeout
                    ? TRANSITION
                    : ANIMATION
                  : null;
                propCount = type
                  ? type === TRANSITION
                    ? transitionDurations.length
                    : animationDurations.length
                  : 0;
              }
              var hasTransform =
                type === TRANSITION &&
                transformRE.test(styles[transitionProp + 'Property']);
              return {
                type: type,
                timeout: timeout,
                propCount: propCount,
                hasTransform: hasTransform
              }
            }

            function getTimeout (delays, durations) {
              /* istanbul ignore next */
              while (delays.length < durations.length) {
                delays = delays.concat(delays);
              }

              return Math.max.apply(null, durations.map(function (d, i) {
                return toMs(d) + toMs(delays[i])
              }))
            }

            // Old versions of Chromium (below 61.0.3163.100) formats floating pointer numbers
            // in a locale-dependent way, using a comma instead of a dot.
            // If comma is not replaced with a dot, the input will be rounded down (i.e. acting
            // as a floor function) causing unexpected behaviors
            function toMs (s) {
              return Number(s.slice(0, -1).replace(',', '.')) * 1000
            }

            /*  */

            function enter (vnode, toggleDisplay) {
              var el = vnode.elm;

              // call leave callback now
              if (isDef(el._leaveCb)) {
                el._leaveCb.cancelled = true;
                el._leaveCb();
              }

              var data = resolveTransition(vnode.data.transition);
              if (isUndef(data)) {
                return
              }

              /* istanbul ignore if */
              if (isDef(el._enterCb) || el.nodeType !== 1) {
                return
              }

              var css = data.css;
              var type = data.type;
              var enterClass = data.enterClass;
              var enterToClass = data.enterToClass;
              var enterActiveClass = data.enterActiveClass;
              var appearClass = data.appearClass;
              var appearToClass = data.appearToClass;
              var appearActiveClass = data.appearActiveClass;
              var beforeEnter = data.beforeEnter;
              var enter = data.enter;
              var afterEnter = data.afterEnter;
              var enterCancelled = data.enterCancelled;
              var beforeAppear = data.beforeAppear;
              var appear = data.appear;
              var afterAppear = data.afterAppear;
              var appearCancelled = data.appearCancelled;
              var duration = data.duration;

              // activeInstance will always be the <transition> component managing this
              // transition. One edge case to check is when the <transition> is placed
              // as the root node of a child component. In that case we need to check
              // <transition>'s parent for appear check.
              var context = activeInstance;
              var transitionNode = activeInstance.$vnode;
              while (transitionNode && transitionNode.parent) {
                transitionNode = transitionNode.parent;
                context = transitionNode.context;
              }

              var isAppear = !context._isMounted || !vnode.isRootInsert;

              if (isAppear && !appear && appear !== '') {
                return
              }

              var startClass = isAppear && appearClass
                ? appearClass
                : enterClass;
              var activeClass = isAppear && appearActiveClass
                ? appearActiveClass
                : enterActiveClass;
              var toClass = isAppear && appearToClass
                ? appearToClass
                : enterToClass;

              var beforeEnterHook = isAppear
                ? (beforeAppear || beforeEnter)
                : beforeEnter;
              var enterHook = isAppear
                ? (typeof appear === 'function' ? appear : enter)
                : enter;
              var afterEnterHook = isAppear
                ? (afterAppear || afterEnter)
                : afterEnter;
              var enterCancelledHook = isAppear
                ? (appearCancelled || enterCancelled)
                : enterCancelled;

              var explicitEnterDuration = toNumber(
                isObject(duration)
                  ? duration.enter
                  : duration
              );

              if (process.env.NODE_ENV !== 'production' && explicitEnterDuration != null) {
                checkDuration(explicitEnterDuration, 'enter', vnode);
              }

              var expectsCSS = css !== false && !isIE9;
              var userWantsControl = getHookArgumentsLength(enterHook);

              var cb = el._enterCb = once$1(function () {
                if (expectsCSS) {
                  removeTransitionClass(el, toClass);
                  removeTransitionClass(el, activeClass);
                }
                if (cb.cancelled) {
                  if (expectsCSS) {
                    removeTransitionClass(el, startClass);
                  }
                  enterCancelledHook && enterCancelledHook(el);
                } else {
                  afterEnterHook && afterEnterHook(el);
                }
                el._enterCb = null;
              });

              if (!vnode.data.show) {
                // remove pending leave element on enter by injecting an insert hook
                mergeVNodeHook(vnode, 'insert', function () {
                  var parent = el.parentNode;
                  var pendingNode = parent && parent._pending && parent._pending[vnode.key];
                  if (pendingNode &&
                    pendingNode.tag === vnode.tag &&
                    pendingNode.elm._leaveCb
                  ) {
                    pendingNode.elm._leaveCb();
                  }
                  enterHook && enterHook(el, cb);
                });
              }

              // start enter transition
              beforeEnterHook && beforeEnterHook(el);
              if (expectsCSS) {
                addTransitionClass(el, startClass);
                addTransitionClass(el, activeClass);
                nextFrame(function () {
                  removeTransitionClass(el, startClass);
                  if (!cb.cancelled) {
                    addTransitionClass(el, toClass);
                    if (!userWantsControl) {
                      if (isValidDuration(explicitEnterDuration)) {
                        setTimeout(cb, explicitEnterDuration);
                      } else {
                        whenTransitionEnds(el, type, cb);
                      }
                    }
                  }
                });
              }

              if (vnode.data.show) {
                toggleDisplay && toggleDisplay();
                enterHook && enterHook(el, cb);
              }

              if (!expectsCSS && !userWantsControl) {
                cb();
              }
            }

            function leave (vnode, rm) {
              var el = vnode.elm;

              // call enter callback now
              if (isDef(el._enterCb)) {
                el._enterCb.cancelled = true;
                el._enterCb();
              }

              var data = resolveTransition(vnode.data.transition);
              if (isUndef(data) || el.nodeType !== 1) {
                return rm()
              }

              /* istanbul ignore if */
              if (isDef(el._leaveCb)) {
                return
              }

              var css = data.css;
              var type = data.type;
              var leaveClass = data.leaveClass;
              var leaveToClass = data.leaveToClass;
              var leaveActiveClass = data.leaveActiveClass;
              var beforeLeave = data.beforeLeave;
              var leave = data.leave;
              var afterLeave = data.afterLeave;
              var leaveCancelled = data.leaveCancelled;
              var delayLeave = data.delayLeave;
              var duration = data.duration;

              var expectsCSS = css !== false && !isIE9;
              var userWantsControl = getHookArgumentsLength(leave);

              var explicitLeaveDuration = toNumber(
                isObject(duration)
                  ? duration.leave
                  : duration
              );

              if (process.env.NODE_ENV !== 'production' && isDef(explicitLeaveDuration)) {
                checkDuration(explicitLeaveDuration, 'leave', vnode);
              }

              var cb = el._leaveCb = once$1(function () {
                if (el.parentNode && el.parentNode._pending) {
                  el.parentNode._pending[vnode.key] = null;
                }
                if (expectsCSS) {
                  removeTransitionClass(el, leaveToClass);
                  removeTransitionClass(el, leaveActiveClass);
                }
                if (cb.cancelled) {
                  if (expectsCSS) {
                    removeTransitionClass(el, leaveClass);
                  }
                  leaveCancelled && leaveCancelled(el);
                } else {
                  rm();
                  afterLeave && afterLeave(el);
                }
                el._leaveCb = null;
              });

              if (delayLeave) {
                delayLeave(performLeave);
              } else {
                performLeave();
              }

              function performLeave () {
                // the delayed leave may have already been cancelled
                if (cb.cancelled) {
                  return
                }
                // record leaving element
                if (!vnode.data.show && el.parentNode) {
                  (el.parentNode._pending || (el.parentNode._pending = {}))[(vnode.key)] = vnode;
                }
                beforeLeave && beforeLeave(el);
                if (expectsCSS) {
                  addTransitionClass(el, leaveClass);
                  addTransitionClass(el, leaveActiveClass);
                  nextFrame(function () {
                    removeTransitionClass(el, leaveClass);
                    if (!cb.cancelled) {
                      addTransitionClass(el, leaveToClass);
                      if (!userWantsControl) {
                        if (isValidDuration(explicitLeaveDuration)) {
                          setTimeout(cb, explicitLeaveDuration);
                        } else {
                          whenTransitionEnds(el, type, cb);
                        }
                      }
                    }
                  });
                }
                leave && leave(el, cb);
                if (!expectsCSS && !userWantsControl) {
                  cb();
                }
              }
            }

            // only used in dev mode
            function checkDuration (val, name, vnode) {
              if (typeof val !== 'number') {
                warn(
                  "<transition> explicit " + name + " duration is not a valid number - " +
                  "got " + (JSON.stringify(val)) + ".",
                  vnode.context
                );
              } else if (isNaN(val)) {
                warn(
                  "<transition> explicit " + name + " duration is NaN - " +
                  'the duration expression might be incorrect.',
                  vnode.context
                );
              }
            }

            function isValidDuration (val) {
              return typeof val === 'number' && !isNaN(val)
            }

            /**
             * Normalize a transition hook's argument length. The hook may be:
             * - a merged hook (invoker) with the original in .fns
             * - a wrapped component method (check ._length)
             * - a plain function (.length)
             */
            function getHookArgumentsLength (fn) {
              if (isUndef(fn)) {
                return false
              }
              var invokerFns = fn.fns;
              if (isDef(invokerFns)) {
                // invoker
                return getHookArgumentsLength(
                  Array.isArray(invokerFns)
                    ? invokerFns[0]
                    : invokerFns
                )
              } else {
                return (fn._length || fn.length) > 1
              }
            }

            function _enter (_, vnode) {
              if (vnode.data.show !== true) {
                enter(vnode);
              }
            }

            var transition = inBrowser ? {
              create: _enter,
              activate: _enter,
              remove: function remove$$1 (vnode, rm) {
                /* istanbul ignore else */
                if (vnode.data.show !== true) {
                  leave(vnode, rm);
                } else {
                  rm();
                }
              }
            } : {};

            var platformModules = [
              attrs,
              klass,
              events,
              domProps,
              style,
              transition
            ];

            /*  */

            // the directive module should be applied last, after all
            // built-in modules have been applied.
            var modules = platformModules.concat(baseModules);

            var patch = createPatchFunction({ nodeOps: nodeOps, modules: modules });

            /**
             * Not type checking this file because flow doesn't like attaching
             * properties to Elements.
             */

            /* istanbul ignore if */
            if (isIE9) {
              // http://www.matts411.com/post/internet-explorer-9-oninput/
              document.addEventListener('selectionchange', function () {
                var el = document.activeElement;
                if (el && el.vmodel) {
                  trigger(el, 'input');
                }
              });
            }

            var directive = {
              inserted: function inserted (el, binding$$1, vnode, oldVnode) {
                if (vnode.tag === 'select') {
                  // #6903
                  if (oldVnode.elm && !oldVnode.elm._vOptions) {
                    mergeVNodeHook(vnode, 'postpatch', function () {
                      directive.componentUpdated(el, binding$$1, vnode);
                    });
                  } else {
                    setSelected(el, binding$$1, vnode.context);
                  }
                  el._vOptions = [].map.call(el.options, getValue);
                } else if (vnode.tag === 'textarea' || isTextInputType(el.type)) {
                  el._vModifiers = binding$$1.modifiers;
                  if (!binding$$1.modifiers.lazy) {
                    el.addEventListener('compositionstart', onCompositionStart);
                    el.addEventListener('compositionend', onCompositionEnd);
                    // Safari < 10.2 & UIWebView doesn't fire compositionend when
                    // switching focus before confirming composition choice
                    // this also fixes the issue where some browsers e.g. iOS Chrome
                    // fires "change" instead of "input" on autocomplete.
                    el.addEventListener('change', onCompositionEnd);
                    /* istanbul ignore if */
                    if (isIE9) {
                      el.vmodel = true;
                    }
                  }
                }
              },

              componentUpdated: function componentUpdated (el, binding$$1, vnode) {
                if (vnode.tag === 'select') {
                  setSelected(el, binding$$1, vnode.context);
                  // in case the options rendered by v-for have changed,
                  // it's possible that the value is out-of-sync with the rendered options.
                  // detect such cases and filter out values that no longer has a matching
                  // option in the DOM.
                  var prevOptions = el._vOptions;
                  var curOptions = el._vOptions = [].map.call(el.options, getValue);
                  if (curOptions.some(function (o, i) { return !looseEqual(o, prevOptions[i]); })) {
                    // trigger change event if
                    // no matching option found for at least one value
                    var needReset = el.multiple
                      ? binding$$1.value.some(function (v) { return hasNoMatchingOption(v, curOptions); })
                      : binding$$1.value !== binding$$1.oldValue && hasNoMatchingOption(binding$$1.value, curOptions);
                    if (needReset) {
                      trigger(el, 'change');
                    }
                  }
                }
              }
            };

            function setSelected (el, binding$$1, vm) {
              actuallySetSelected(el, binding$$1, vm);
              /* istanbul ignore if */
              if (isIE || isEdge) {
                setTimeout(function () {
                  actuallySetSelected(el, binding$$1, vm);
                }, 0);
              }
            }

            function actuallySetSelected (el, binding$$1, vm) {
              var value = binding$$1.value;
              var isMultiple = el.multiple;
              if (isMultiple && !Array.isArray(value)) {
                process.env.NODE_ENV !== 'production' && warn(
                  "<select multiple v-model=\"" + (binding$$1.expression) + "\"> " +
                  "expects an Array value for its binding, but got " + (Object.prototype.toString.call(value).slice(8, -1)),
                  vm
                );
                return
              }
              var selected, option;
              for (var i = 0, l = el.options.length; i < l; i++) {
                option = el.options[i];
                if (isMultiple) {
                  selected = looseIndexOf(value, getValue(option)) > -1;
                  if (option.selected !== selected) {
                    option.selected = selected;
                  }
                } else {
                  if (looseEqual(getValue(option), value)) {
                    if (el.selectedIndex !== i) {
                      el.selectedIndex = i;
                    }
                    return
                  }
                }
              }
              if (!isMultiple) {
                el.selectedIndex = -1;
              }
            }

            function hasNoMatchingOption (value, options) {
              return options.every(function (o) { return !looseEqual(o, value); })
            }

            function getValue (option) {
              return '_value' in option
                ? option._value
                : option.value
            }

            function onCompositionStart (e) {
              e.target.composing = true;
            }

            function onCompositionEnd (e) {
              // prevent triggering an input event for no reason
              if (!e.target.composing) { return }
              e.target.composing = false;
              trigger(e.target, 'input');
            }

            function trigger (el, type) {
              var e = document.createEvent('HTMLEvents');
              e.initEvent(type, true, true);
              el.dispatchEvent(e);
            }

            /*  */

            // recursively search for possible transition defined inside the component root
            function locateNode (vnode) {
              return vnode.componentInstance && (!vnode.data || !vnode.data.transition)
                ? locateNode(vnode.componentInstance._vnode)
                : vnode
            }

            var show = {
              bind: function bind (el, ref, vnode) {
                var value = ref.value;

                vnode = locateNode(vnode);
                var transition$$1 = vnode.data && vnode.data.transition;
                var originalDisplay = el.__vOriginalDisplay =
                  el.style.display === 'none' ? '' : el.style.display;
                if (value && transition$$1) {
                  vnode.data.show = true;
                  enter(vnode, function () {
                    el.style.display = originalDisplay;
                  });
                } else {
                  el.style.display = value ? originalDisplay : 'none';
                }
              },

              update: function update (el, ref, vnode) {
                var value = ref.value;
                var oldValue = ref.oldValue;

                /* istanbul ignore if */
                if (!value === !oldValue) { return }
                vnode = locateNode(vnode);
                var transition$$1 = vnode.data && vnode.data.transition;
                if (transition$$1) {
                  vnode.data.show = true;
                  if (value) {
                    enter(vnode, function () {
                      el.style.display = el.__vOriginalDisplay;
                    });
                  } else {
                    leave(vnode, function () {
                      el.style.display = 'none';
                    });
                  }
                } else {
                  el.style.display = value ? el.__vOriginalDisplay : 'none';
                }
              },

              unbind: function unbind (
                el,
                binding$$1,
                vnode,
                oldVnode,
                isDestroy
              ) {
                if (!isDestroy) {
                  el.style.display = el.__vOriginalDisplay;
                }
              }
            };

            var platformDirectives = {
              model: directive,
              show: show
            };

            /*  */

            var transitionProps = {
              name: String,
              appear: Boolean,
              css: Boolean,
              mode: String,
              type: String,
              enterClass: String,
              leaveClass: String,
              enterToClass: String,
              leaveToClass: String,
              enterActiveClass: String,
              leaveActiveClass: String,
              appearClass: String,
              appearActiveClass: String,
              appearToClass: String,
              duration: [Number, String, Object]
            };

            // in case the child is also an abstract component, e.g. <keep-alive>
            // we want to recursively retrieve the real component to be rendered
            function getRealChild (vnode) {
              var compOptions = vnode && vnode.componentOptions;
              if (compOptions && compOptions.Ctor.options.abstract) {
                return getRealChild(getFirstComponentChild(compOptions.children))
              } else {
                return vnode
              }
            }

            function extractTransitionData (comp) {
              var data = {};
              var options = comp.$options;
              // props
              for (var key in options.propsData) {
                data[key] = comp[key];
              }
              // events.
              // extract listeners and pass them directly to the transition methods
              var listeners = options._parentListeners;
              for (var key$1 in listeners) {
                data[camelize(key$1)] = listeners[key$1];
              }
              return data
            }

            function placeholder (h, rawChild) {
              if (/\d-keep-alive$/.test(rawChild.tag)) {
                return h('keep-alive', {
                  props: rawChild.componentOptions.propsData
                })
              }
            }

            function hasParentTransition (vnode) {
              while ((vnode = vnode.parent)) {
                if (vnode.data.transition) {
                  return true
                }
              }
            }

            function isSameChild (child, oldChild) {
              return oldChild.key === child.key && oldChild.tag === child.tag
            }

            var isNotTextNode = function (c) { return c.tag || isAsyncPlaceholder(c); };

            var isVShowDirective = function (d) { return d.name === 'show'; };

            var Transition = {
              name: 'transition',
              props: transitionProps,
              abstract: true,

              render: function render (h) {
                var this$1 = this;

                var children = this.$slots.default;
                if (!children) {
                  return
                }

                // filter out text nodes (possible whitespaces)
                children = children.filter(isNotTextNode);
                /* istanbul ignore if */
                if (!children.length) {
                  return
                }

                // warn multiple elements
                if (process.env.NODE_ENV !== 'production' && children.length > 1) {
                  warn(
                    '<transition> can only be used on a single element. Use ' +
                    '<transition-group> for lists.',
                    this.$parent
                  );
                }

                var mode = this.mode;

                // warn invalid mode
                if (process.env.NODE_ENV !== 'production' &&
                  mode && mode !== 'in-out' && mode !== 'out-in'
                ) {
                  warn(
                    'invalid <transition> mode: ' + mode,
                    this.$parent
                  );
                }

                var rawChild = children[0];

                // if this is a component root node and the component's
                // parent container node also has transition, skip.
                if (hasParentTransition(this.$vnode)) {
                  return rawChild
                }

                // apply transition data to child
                // use getRealChild() to ignore abstract components e.g. keep-alive
                var child = getRealChild(rawChild);
                /* istanbul ignore if */
                if (!child) {
                  return rawChild
                }

                if (this._leaving) {
                  return placeholder(h, rawChild)
                }

                // ensure a key that is unique to the vnode type and to this transition
                // component instance. This key will be used to remove pending leaving nodes
                // during entering.
                var id = "__transition-" + (this._uid) + "-";
                child.key = child.key == null
                  ? child.isComment
                    ? id + 'comment'
                    : id + child.tag
                  : isPrimitive(child.key)
                    ? (String(child.key).indexOf(id) === 0 ? child.key : id + child.key)
                    : child.key;

                var data = (child.data || (child.data = {})).transition = extractTransitionData(this);
                var oldRawChild = this._vnode;
                var oldChild = getRealChild(oldRawChild);

                // mark v-show
                // so that the transition module can hand over the control to the directive
                if (child.data.directives && child.data.directives.some(isVShowDirective)) {
                  child.data.show = true;
                }

                if (
                  oldChild &&
                  oldChild.data &&
                  !isSameChild(child, oldChild) &&
                  !isAsyncPlaceholder(oldChild) &&
                  // #6687 component root is a comment node
                  !(oldChild.componentInstance && oldChild.componentInstance._vnode.isComment)
                ) {
                  // replace old child transition data with fresh one
                  // important for dynamic transitions!
                  var oldData = oldChild.data.transition = extend({}, data);
                  // handle transition mode
                  if (mode === 'out-in') {
                    // return placeholder node and queue update when leave finishes
                    this._leaving = true;
                    mergeVNodeHook(oldData, 'afterLeave', function () {
                      this$1._leaving = false;
                      this$1.$forceUpdate();
                    });
                    return placeholder(h, rawChild)
                  } else if (mode === 'in-out') {
                    if (isAsyncPlaceholder(child)) {
                      return oldRawChild
                    }
                    var delayedLeave;
                    var performLeave = function () { delayedLeave(); };
                    mergeVNodeHook(data, 'afterEnter', performLeave);
                    mergeVNodeHook(data, 'enterCancelled', performLeave);
                    mergeVNodeHook(oldData, 'delayLeave', function (leave) { delayedLeave = leave; });
                  }
                }

                return rawChild
              }
            };

            /*  */

            var props = extend({
              tag: String,
              moveClass: String
            }, transitionProps);

            delete props.mode;

            var TransitionGroup = {
              props: props,

              beforeMount: function beforeMount () {
                var this$1 = this;

                var update = this._update;
                this._update = function (vnode, hydrating) {
                  var restoreActiveInstance = setActiveInstance(this$1);
                  // force removing pass
                  this$1.__patch__(
                    this$1._vnode,
                    this$1.kept,
                    false, // hydrating
                    true // removeOnly (!important, avoids unnecessary moves)
                  );
                  this$1._vnode = this$1.kept;
                  restoreActiveInstance();
                  update.call(this$1, vnode, hydrating);
                };
              },

              render: function render (h) {
                var tag = this.tag || this.$vnode.data.tag || 'span';
                var map = Object.create(null);
                var prevChildren = this.prevChildren = this.children;
                var rawChildren = this.$slots.default || [];
                var children = this.children = [];
                var transitionData = extractTransitionData(this);

                for (var i = 0; i < rawChildren.length; i++) {
                  var c = rawChildren[i];
                  if (c.tag) {
                    if (c.key != null && String(c.key).indexOf('__vlist') !== 0) {
                      children.push(c);
                      map[c.key] = c
                      ;(c.data || (c.data = {})).transition = transitionData;
                    } else if (process.env.NODE_ENV !== 'production') {
                      var opts = c.componentOptions;
                      var name = opts ? (opts.Ctor.options.name || opts.tag || '') : c.tag;
                      warn(("<transition-group> children must be keyed: <" + name + ">"));
                    }
                  }
                }

                if (prevChildren) {
                  var kept = [];
                  var removed = [];
                  for (var i$1 = 0; i$1 < prevChildren.length; i$1++) {
                    var c$1 = prevChildren[i$1];
                    c$1.data.transition = transitionData;
                    c$1.data.pos = c$1.elm.getBoundingClientRect();
                    if (map[c$1.key]) {
                      kept.push(c$1);
                    } else {
                      removed.push(c$1);
                    }
                  }
                  this.kept = h(tag, null, kept);
                  this.removed = removed;
                }

                return h(tag, null, children)
              },

              updated: function updated () {
                var children = this.prevChildren;
                var moveClass = this.moveClass || ((this.name || 'v') + '-move');
                if (!children.length || !this.hasMove(children[0].elm, moveClass)) {
                  return
                }

                // we divide the work into three loops to avoid mixing DOM reads and writes
                // in each iteration - which helps prevent layout thrashing.
                children.forEach(callPendingCbs);
                children.forEach(recordPosition);
                children.forEach(applyTranslation);

                // force reflow to put everything in position
                // assign to this to avoid being removed in tree-shaking
                // $flow-disable-line
                this._reflow = document.body.offsetHeight;

                children.forEach(function (c) {
                  if (c.data.moved) {
                    var el = c.elm;
                    var s = el.style;
                    addTransitionClass(el, moveClass);
                    s.transform = s.WebkitTransform = s.transitionDuration = '';
                    el.addEventListener(transitionEndEvent, el._moveCb = function cb (e) {
                      if (e && e.target !== el) {
                        return
                      }
                      if (!e || /transform$/.test(e.propertyName)) {
                        el.removeEventListener(transitionEndEvent, cb);
                        el._moveCb = null;
                        removeTransitionClass(el, moveClass);
                      }
                    });
                  }
                });
              },

              methods: {
                hasMove: function hasMove (el, moveClass) {
                  /* istanbul ignore if */
                  if (!hasTransition) {
                    return false
                  }
                  /* istanbul ignore if */
                  if (this._hasMove) {
                    return this._hasMove
                  }
                  // Detect whether an element with the move class applied has
                  // CSS transitions. Since the element may be inside an entering
                  // transition at this very moment, we make a clone of it and remove
                  // all other transition classes applied to ensure only the move class
                  // is applied.
                  var clone = el.cloneNode();
                  if (el._transitionClasses) {
                    el._transitionClasses.forEach(function (cls) { removeClass(clone, cls); });
                  }
                  addClass(clone, moveClass);
                  clone.style.display = 'none';
                  this.$el.appendChild(clone);
                  var info = getTransitionInfo(clone);
                  this.$el.removeChild(clone);
                  return (this._hasMove = info.hasTransform)
                }
              }
            };

            function callPendingCbs (c) {
              /* istanbul ignore if */
              if (c.elm._moveCb) {
                c.elm._moveCb();
              }
              /* istanbul ignore if */
              if (c.elm._enterCb) {
                c.elm._enterCb();
              }
            }

            function recordPosition (c) {
              c.data.newPos = c.elm.getBoundingClientRect();
            }

            function applyTranslation (c) {
              var oldPos = c.data.pos;
              var newPos = c.data.newPos;
              var dx = oldPos.left - newPos.left;
              var dy = oldPos.top - newPos.top;
              if (dx || dy) {
                c.data.moved = true;
                var s = c.elm.style;
                s.transform = s.WebkitTransform = "translate(" + dx + "px," + dy + "px)";
                s.transitionDuration = '0s';
              }
            }

            var platformComponents = {
              Transition: Transition,
              TransitionGroup: TransitionGroup
            };

            /*  */

            // install platform specific utils
            Vue$1.config.mustUseProp = mustUseProp;
            Vue$1.config.isReservedTag = isReservedTag;
            Vue$1.config.isReservedAttr = isReservedAttr;
            Vue$1.config.getTagNamespace = getTagNamespace;
            Vue$1.config.isUnknownElement = isUnknownElement;

            // install platform runtime directives & components
            extend(Vue$1.options.directives, platformDirectives);
            extend(Vue$1.options.components, platformComponents);

            // install platform patch function
            Vue$1.prototype.__patch__ = inBrowser ? patch : noop$1;

            // public mount method
            Vue$1.prototype.$mount = function (
              el,
              hydrating
            ) {
              el = el && inBrowser ? query(el) : undefined;
              return mountComponent(this, el, hydrating)
            };

            // devtools global hook
            /* istanbul ignore next */
            if (inBrowser) {
              setTimeout(function () {
                if (config$1.devtools) {
                  if (devtools) {
                    devtools.emit('init', Vue$1);
                  } else if (
                    process.env.NODE_ENV !== 'production' &&
                    process.env.NODE_ENV !== 'test' &&
                    isChrome
                  ) {
                    console[console.info ? 'info' : 'log'](
                      'Download the Vue Devtools extension for a better development experience:\n' +
                      'https://github.com/vuejs/vue-devtools'
                    );
                  }
                }
                if (process.env.NODE_ENV !== 'production' &&
                  process.env.NODE_ENV !== 'test' &&
                  config$1.productionTip !== false &&
                  typeof console !== 'undefined'
                ) {
                  console[console.info ? 'info' : 'log'](
                    "You are running Vue in development mode.\n" +
                    "Make sure to turn on production mode when deploying for production.\n" +
                    "See more tips at https://vuejs.org/guide/deployment.html"
                  );
                }
              }, 0);
            }

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

            var p$1 = Promise$1.prototype;

            p$1.resolve = function resolve(x) {
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

            p$1.reject = function reject(reason) {
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

            p$1.notify = function notify() {
                var promise = this;

                nextTick$2(function () {
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

            p$1.then = function then(onResolved, onRejected) {
                var promise = this;

                return new Promise$1(function (resolve, reject) {
                    promise.deferred.push([onResolved, onRejected, resolve, reject]);
                    promise.notify();
                });
            };

            p$1.catch = function (onRejected) {
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

            var p$1$1 = PromiseObj.prototype;

            p$1$1.bind = function (context) {
                this.context = context;
                return this;
            };

            p$1$1.then = function (fulfilled, rejected) {

                if (fulfilled && fulfilled.bind && this.context) {
                    fulfilled = fulfilled.bind(this.context);
                }

                if (rejected && rejected.bind && this.context) {
                    rejected = rejected.bind(this.context);
                }

                return new PromiseObj(this.promise.then(fulfilled, rejected), this.context);
            };

            p$1$1.catch = function (rejected) {

                if (rejected && rejected.bind && this.context) {
                    rejected = rejected.bind(this.context);
                }

                return new PromiseObj(this.promise.catch(rejected), this.context);
            };

            p$1$1.finally = function (callback) {

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

            var ref$1 = {};
            var hasOwnProperty$1 = ref$1.hasOwnProperty;
            var ref$1$1 = [];
            var slice = ref$1$1.slice;
            var debug = false, ntick;

            var inBrowser$1 = typeof window !== 'undefined';

            function Util (ref) {
                var config = ref.config;
                var nextTick = ref.nextTick;

                ntick = nextTick;
                debug = config.debug || !config.silent;
            }

            function warn$1(msg) {
                if (typeof console !== 'undefined' && debug) {
                    console.warn('[VueResource warn]: ' + msg);
                }
            }

            function error(msg) {
                if (typeof console !== 'undefined') {
                    console.error(msg);
                }
            }

            function nextTick$2(cb, ctx) {
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

            function isObject$1(obj) {
                return obj !== null && typeof obj === 'object';
            }

            function isPlainObject$1(obj) {
                return isObject$1(obj) && Object.getPrototypeOf(obj) == Object.prototype;
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
                } else if (isObject$1(obj)) {
                    for (key in obj) {
                        if (hasOwnProperty$1.call(obj, key)) {
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
                    if (deep && (isPlainObject$1(source[key]) || isArray(source[key]))) {
                        if (isPlainObject$1(source[key]) && !isPlainObject$1(target[key])) {
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

            function query$1 (options$$1, next) {

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

            Url.transform = {template: template, query: query$1, root: root};
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

                var array = isArray(obj), plain = isPlainObject$1(obj), hash;

                each(obj, function (value, key) {

                    hash = isObject$1(value) || isArray(value);

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

            var SUPPORTS_CORS = inBrowser$1 && 'withCredentials' in new XMLHttpRequest();

            function cors (request) {

                if (inBrowser$1) {

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
                } else if (isObject$1(request.body) && request.emulateJSON) {
                    request.body = Url.params(request.body);
                    request.headers.set('Content-Type', 'application/x-www-form-urlencoded');
                }

            }

            /**
             * JSON Interceptor.
             */

            function json (request) {

                var type = request.headers.get('Content-Type') || '';

                if (isObject$1(request.body) && type.indexOf('application/json') === 0) {
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

                if (!isObject$1(context)) {
                    context = null;
                }

                function Client(request) {
                    while (reqHandlers.length) {

                        var handler = reqHandlers.pop();

                        if (isFunction(handler)) {

                            var response = (void 0), next = (void 0);

                            response = handler.call(context, request, function (val) { return next = val; }) || next;

                            if (isObject$1(response)) {
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
                            warn$1(("Invalid interceptor of type " + (typeof handler) + ", must be a function"));
                        }
                    }
                }

                Client.use = function (handler) {
                    reqHandlers.push(handler);
                };

                return Client;
            }

            function sendRequest(request) {

                var client = request.client || (inBrowser$1 ? xhrClient : nodeClient);

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
                        return (self.$http || Http)(opts$1(action, arguments));
                    };
                });

                return resource;
            }

            function opts$1(action, args) {

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

            function isObject$2 (obj) {
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

            var prototypeAccessors$2 = { state: { configurable: true } };

            prototypeAccessors$2.state.get = function () {
              return this._vm._data.$$state
            };

            prototypeAccessors$2.state.set = function (v) {
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

            Object.defineProperties( Store.prototype, prototypeAccessors$2 );

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
              if (isObject$2(type) && type.type) {
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
            function isObject$3(value) {
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
            var hasOwnProperty$2 = objectProto.hasOwnProperty;

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
              var isOwn = hasOwnProperty$2.call(value, symToStringTag),
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
            function toNumber$1(value) {
              if (typeof value == 'number') {
                return value;
              }
              if (isSymbol(value)) {
                return NAN;
              }
              if (isObject$3(value)) {
                var other = typeof value.valueOf == 'function' ? value.valueOf() : value;
                value = isObject$3(other) ? (other + '') : other;
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
              wait = toNumber$1(wait) || 0;
              if (isObject$3(options)) {
                leading = !!options.leading;
                maxing = 'maxWait' in options;
                maxWait = maxing ? nativeMax(toNumber$1(options.maxWait) || 0, wait) : maxWait;
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
                inject("data-v-44ea2018_0", { source: ".frontpage-global-search[data-v-44ea2018] {\n  position: relative;\n}\n.frontpage-global-search__search-input[data-v-44ea2018] {\n    padding: 16px !important;\n    border-radius: 4px 0 0 4px !important;\n}\n.frontpage-global-search__search-submit[data-v-44ea2018] {\n    color: white;\n    background-color: #3f5efb;\n    background-image: none;\n    border-color: transparent;\n    transition: all .15s ease-in-out;\n    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.125);\n    border-radius: 0 4px 4px 0;\n    padding: 0 32px;\n    text-transform: uppercase;\n    font-weight: bold;\n}\n.frontpage-global-search__form[data-v-44ea2018] {\n    position: relative;\n    z-index: 50;\n    display: flex;\n    box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);\n}\n.frontpage-global-search__form--has-results[data-v-44ea2018] {\n    box-shadow: none;\n}\n.frontpage-global-search__results[data-v-44ea2018] {\n    position: absolute;\n    z-index: 40;\n    top: 54px;\n    width: 100%;\n    background-color: white;\n    border: 1px solid #cccccc;\n    border-radius: 0 0 4px 4px;\n    box-shadow: 0 0 50px rgba(0, 0, 0, 0.2);\n}\n.frontpage-global-search__result[data-v-44ea2018] {\n    padding: 8px 16px;\n    border-bottom: 1px solid #cccccc;\n}\n.frontpage-global-search__result[data-v-44ea2018]:hover {\n      background-color: #3f5efb;\n}\n.frontpage-global-search__result:hover a[data-v-44ea2018] {\n        color: white;\n}\n.frontpage-global-search__result[data-v-44ea2018]:last-child {\n      border-bottom: unset;\n}\n\n/*# sourceMappingURL=FrontpageGlobalSearch.vue.map */", map: {"version":3,"sources":["/home/nikita/Projects/local/dlog.niklan.net/code/web/modules/custom/dlog_vue/assets/js/src/components/FrontpageGlobalSearch.vue","FrontpageGlobalSearch.vue"],"names":[],"mappings":"AAyEA;EACA,mBAAA;CA0DA;AAxDA;IACA,yBAAA;IACA,sCAAA;CACA;AAEA;IACA,aAAA;IACA,0BAAA;IACA,uBAAA;IACA,0BAAA;IACA,iCAAA;IACA,2CAAA;IACA,2BAAA;IACA,gBAAA;IACA,0BAAA;IACA,kBAAA;CACA;AAEA;IACA,mBAAA;IACA,YAAA;IACA,cAAA;IACA,wCAAA;CACA;AAEA;IACA,iBAAA;CACA;AAEA;IACA,mBAAA;IACA,YAAA;IACA,UAAA;IACA,YAAA;IACA,wBAAA;IACA,0BAAA;IACA,2BAAA;IACA,wCAAA;CACA;AAEA;IACA,kBAAA;IACA,iCAAA;CAaA;AAfA;MAKA,0BAAA;CAKA;AAVA;QAQA,aAAA;CACA;AATA;MAaA,qBAAA;CACA;;ACxFA,qDAAqD","file":"FrontpageGlobalSearch.vue","sourcesContent":[null,".frontpage-global-search {\n  position: relative; }\n  .frontpage-global-search__search-input {\n    padding: 16px !important;\n    border-radius: 4px 0 0 4px !important; }\n  .frontpage-global-search__search-submit {\n    color: white;\n    background-color: #3f5efb;\n    background-image: none;\n    border-color: transparent;\n    transition: all .15s ease-in-out;\n    box-shadow: 0 1px 1px rgba(0, 0, 0, 0.125);\n    border-radius: 0 4px 4px 0;\n    padding: 0 32px;\n    text-transform: uppercase;\n    font-weight: bold; }\n  .frontpage-global-search__form {\n    position: relative;\n    z-index: 50;\n    display: flex;\n    box-shadow: 0 0 50px rgba(0, 0, 0, 0.2); }\n  .frontpage-global-search__form--has-results {\n    box-shadow: none; }\n  .frontpage-global-search__results {\n    position: absolute;\n    z-index: 40;\n    top: 54px;\n    width: 100%;\n    background-color: white;\n    border: 1px solid #cccccc;\n    border-radius: 0 0 4px 4px;\n    box-shadow: 0 0 50px rgba(0, 0, 0, 0.2); }\n  .frontpage-global-search__result {\n    padding: 8px 16px;\n    border-bottom: 1px solid #cccccc; }\n    .frontpage-global-search__result:hover {\n      background-color: #3f5efb; }\n      .frontpage-global-search__result:hover a {\n        color: white; }\n    .frontpage-global-search__result:last-child {\n      border-bottom: unset; }\n\n/*# sourceMappingURL=FrontpageGlobalSearch.vue.map */"]}, media: undefined });

              };
              /* scoped */
              const __vue_scope_id__ = "data-v-44ea2018";
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

            Vue$1.directive('click-outside', {
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
              }
            });

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

}());
