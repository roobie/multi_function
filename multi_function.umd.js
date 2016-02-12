(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.multiFunction = f()}})(function(){var define,module,exports;module={exports:(exports={})};
'use strict';
/**
The MIT License (MIT)

Copyright (c) 2016 Bjorn Roberg

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/

/**
  @summary Creates a function that applies multiple dispatch
  dynamically and calls the function that best matches, given the
  registered definitions.

  @caveats The order of the definitions matter, as they are checked
  in the same order as registered.

  @returns a `dispatcher` that is a function (the "root" function).
  This function exposes a
  function bound to the property `params`, that registers a list of
  values or constructors. Invoking this function returns an object with
  a property `fn` that registers the supplied function to be called,
  when the params are matched in an invocation. These functions are
  applied with the arguments sent to the `MultiFunction` with an extra
  argument in the last position, which is the `MultiFunction` instance
  itself. See example. (Look at the test module for more examples).

  @example
```javascript
const mm = MultiFunction()
   // will match when the multi function is called
   // with no arguments
  .params()
   // call into the multi function with a default value;
  .fn((self) => self({}))

   // if explicit null is sent
  .params(null)
   // return the string 'null'
  .fn(() => 'null')

   // if any string is sent, this handler expects a JSON string
  .params(String)
   // call into the multi function with the parsed repr.
  .fn((json, self) => self(JSON.parse(json)))

   // if any object is passed,
  .params(Object)
   // return the number 1.
  .fn(cfg => 1);
```
**/

var _slice = Function.prototype.call.bind(Array.prototype.slice);
var first = function first(list) {
  return list[0];
};
var isSomething = function isSomething(val) {
  return val !== null && val !== void 0;
};

function instance() {
  var pairs = [];

  function dispatcher() {
    var args = _slice(arguments);

    var match = pairs.filter(function (pair) {
      var values = pair.values;
      var len = values.length;

      if (len !== args.length) {
        return false;
      } else if (len === 0) {
        return true;
      }

      var matches = [];
      for (var i = 0; i < len; i++) {
        var val = values[i];
        var arg = args[i];

        var isSameVal = arg === val;
        if (isSameVal) {
          matches.push(true);
        } else if (isSomething(arg) && isSomething(val)) {
          var isFunc = typeof val === 'function';
          var isInstanceOf = isFunc && arg instanceof val;
          var sameConstructor = val === arg.constructor;

          if (isInstanceOf || sameConstructor) {
            matches.push(true);
          } else {
            matches.push(false);
          }
        } else {
          matches.push(false);
        }
      }

      var allTrue = matches.reduce(function (out, next) {
        return out && next;
      });

      return matches.length === len && allTrue;
    });

    if (match.length > 1) {
      //throw new Error('More than one match found.');
    } else if (match.length < 1) {
        throw new Error('No match found.');
      }

    return first(match).fn.apply(this, args.concat(dispatcher));
  };

  dispatcher.params = function registerParams() {
    var args = _slice(arguments);

    var index = pairs.length;
    var config = {
      values: args,
      fn: null
    };
    pairs.push(config);

    return {
      fn: function registerFn(fn) {
        config.fn = fn;
        return dispatcher;
      }
    };
  };

  return dispatcher;
}

function MultiFunction() {
  return instance();
}

module.exports = MultiFunction;


return module.exports;});
