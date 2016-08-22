(function (exports) {
    function _getType(o){
        return Object.prototype.toString.call(o).slice(8,-1).toLowerCase();
    }


    var randomock = function (config,status) {
        if(status === undefined){
            status = {
                contextStack : [],
                val : function (v) {
                    if (typeof v === 'function') {
                        return v.apply(this);
                    }
                    return v;
                },
                rnd : function(){
                    return Math.random();
                },
                index : function(){
                    return this.contextStack[this.contextStack.length - 1];
                },
                pushStack : function(){
                    this.contextStack.push(0);
                },
                popStack : function(){
                    this.contextStack.pop();
                },
                increaseIndex : function(){
                    this.contextStack[this.contextStack.length - 1] = this.index() +1;
                },
                randomock : function(obj){
                    return randomock(obj,this);
                }
            };
            status.pushStack();
        }


        config = status.val(config);


        if (_getType(config) === 'object') {
            var mock = {};
            for (var n in config) {
                if(config.hasOwnProperty(n)){
                    var v = status.val(config[n]);
                    mock[n] = randomock(v,status);
                }
            }
            return mock;
        }
        else {
            return config;
        }

    };

    randomock._wrap = function(func){
        return function(){
            var args = arguments;
            var resultFunc = func.apply(this,args);
            var wrapper = function(){
                var result = this.val(resultFunc);
                for(var i = 0; i < wrapper._extends.length;i++){
                    var e = wrapper._extends[i];
                    var args = Array.prototype.slice.call(e.args);
                    args.unshift(result);
                    result = randomock._extends[e.name].apply(this,args);
                }
                return this.val(result);
            };
            wrapper._extends = [];
            for(var n in randomock._extends){
                wrapper[n] = (function(n){
                    return function(){
                        wrapper._extends.push({
                            name : n,
                            args : arguments
                        });
                        return wrapper;
                    }
                })(n);
            }
            return wrapper;
        };
    };



    randomock.extend = function(name,func){
        randomock._extends[name] = func;
    };
    randomock._extends = {};




    randomock.times = randomock.repeat = randomock._wrap(function (times, value) {
        return function () {
            var count = this.val(times);
            var r = [];
            this.pushStack();
            for (var i = 0; i < count; i++) {
                r.push(this.randomock(value));
                this.increaseIndex();
            }
            this.popStack();
            return r;
        }
    });

    randomock.index = randomock._wrap(function(){
        return function(){
            return this.index();
        }
    });

    randomock.float = randomock._wrap(function (min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return function () {
            return this.val(min) + this.rnd() * (this.val(max) - this.val(min));
        };
    });

    randomock.integer = randomock.range= randomock._wrap(function (min, max) {
        var f = randomock.float(min, max);
        return function () {
            return Math.floor(this.val(f));
        }
    });

    randomock.increase = randomock._wrap(function (base, step) {
        if (base === undefined) {
            base = 0;
        }
        if (step === undefined) {
            step = 1;
        }
        return function () {
            var r = this.val(base);
            base = this.val(base) + this.val(step);
            return r;
        }
    });


    randomock.join = randomock._wrap(function () {
        var args = arguments;
        return function () {
            var r = [];
            for (var i = 0; i < args.length; i++) {
                r.push(this.val(args[i]));
            }
            return r.join('');
        }
    });



    randomock.text = randomock._wrap(function (source, length) {
        if (length === undefined) {
            length = source;
            source = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }
        return function () {
            var s = this.val(source).split('');
            return this.val(randomock.times(this.val(length), randomock.sample(s))).join('');
        }
    });


    randomock.sample = randomock._wrap(function (list) {
        return function () {
            var l = this.val(list);
            return this.val(l[this.val(randomock.integer(l.length))]);
        }
    });

    randomock.choose = randomock._wrap(function () {
        var args = arguments;
        return function () {
            return this.val(args[this.val(randomock.integer(args.length))]);
        }
    });

    function normalizeDate(d) {
        if(_getType(d) === 'date'){
            return d;
        }
        if (_getType(d) === 'number') {
            return new Date(d);
        }
        else if (_getType(d) === 'string') {
            return new Date(Date.parse(d));
        }
        else {
            return new Date(Date.now());
        }
    }

    var dc = /([+-]?)(\d+)(y|mo|m|d|h|mi|M|s|ms)(\s|$)/g;

    function applyDateOffset(date, change) {
        dc.lastIndex = 0;
        var y, m, d, h, mi, s, ms;
        y = m = d = h = mi = s = ms = 0;
        var c = null;

        while ((c = dc.exec(change))) {
            var v = parseInt(c[2]);
            v = c[1] === '-' ? v * -1 : v;
            switch (c[3]) {
                case 'y': y = y + v; break;
                case 'm': case 'mo': m = m + v; break;
                case 'd': d = d + v; break;
                case 'h': h = h + v; break;
                case 'mi': case 'M': mi = mi + v; break;
                case 's': s = s + v; break;
                case 'ms': ms = ms + v; break;
            }
        }
        return new Date(date.getFullYear() + y, date.getMonth() + m, date.getDate() + d, date.getHours() + h, date.getMinutes() + mi, date.getSeconds() + s, date.getMilliseconds() + ms);
    }

    randomock.date = randomock._wrap(function (start, offset) {
        if (offset === undefined) {
            offset = start;
            start = Date.now();
        }
        return function () {
            start = normalizeDate(this.val(start));
            var end = applyDateOffset(normalizeDate(start),this.val(offset));
            start = start.getTime();
            end = end.getTime();

            return new Date(this.val(randomock.integer(Math.min(start,end),Math.max(start,end))));
        }
    });

    randomock.value = randomock._wrap(function(func){
        return function(){
            return typeof func === 'function' ? func.apply(this) : this.val(func);
        }
    });


    randomock.extend('val',function(result){
       return function(){
           return this.val(result);
       }
    });

    randomock.extend('toFixed',function(result, digits){
        return function(){
            var r = parseFloat(this.val(result));
            return r.toFixed(this.val(digits));
        }
    });

    randomock.extend('padLeft',function (result, min, c) {
        if(c === undefined){
            c = ' ';
        }
        return function () {
            var t = this.val(result);
            min = this.val(min);
            if (t.length < min) {
                return new Array(min-t.length+1).join(this.val(c)) + t;
                //return this.val(randomock.join(this.val(randomock.times(min - t.length, c)).join(''), t));
            }
            return t;
        }
    });

    randomock.extend('dateOffset',function(result,offset){
        return function(){
            return applyDateOffset(this.val(result),offset);
        }
    });

    randomock.extend('dateFormat',function (date, format) {
        if (format === undefined) {
            format === 'y-m-d h:M:s.f';
        }
        return function () {
            date = normalizeDate(this.val(date));
            format = this.val(format);
            return format.replace(/y+|m+|d+|h+|M+|s+|f+/g, function (m) {
                switch (m[0]) {
                    case 'y':
                        return date.getFullYear();
                    case 'm':
                        return date.getMonth() + 1;
                    case 'd':
                        return date.getDate();
                    case 'h':
                        return date.getHours();
                    case 'M':
                        return date.getMinutes();
                    case 's':
                        return date.getSeconds();
                    case 'f':
                        return date.getMilliseconds();
                }
            });
        }
    });


    if (module) {
        module.exports = randomock;
    }
})();