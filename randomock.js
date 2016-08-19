(function (exports) {
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


        // if (typeof config === 'object' && config.length) {
        //     // array like
        //     mock = [];
        //     for (var i = 0; i < config.length; i++) {
        //         mock.push(randomock(config[i],status));
        //     }
        //     return mock;
        // }
        // else
        if (typeof config === 'object' && Object.getPrototypeOf(config) == Object.prototype) {
            var mock = {};
            for (var n in config) {
                var v = status.val(config[n]);
                mock[n] = randomock(v,status);
            }
            return mock;
        }
        else {
            return config;
        }

    };

    randomock.times = randomock.repeat = function (times, value) {
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
    };

    randomock.index = function(){
        return function(){
            return this.index();
        }
    };
    randomock.float = function (min, max) {
        if (max === undefined) {
            max = min;
            min = 0;
        }
        return function () {
            return this.val(min) + this.rnd() * (this.val(max) - this.val(min));
        };
    };
    randomock.integer = randomock.range= function (min, max) {
        var f = randomock.float(min, max);
        return function () {
            return Math.floor(this.val(f));
        }
    };

    randomock.increase = function (base, step) {
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
    };


    randomock.join = function () {
        var args = arguments;
        return function () {
            var r = [];
            for (var i = 0; i < args.length; i++) {
                r.push(this.val(args[i]));
            }
            return r.join('');
        }
    };



    randomock.text = function (source, length) {
        if (length === undefined) {
            length = source;
            source = "1234567890ABCDEFGHIJKLMNOPQRSTUVWXYZ";
        }
        return function () {
            var s = this.val(source).split('');
            return this.val(randomock.times(this.val(length), randomock.sample(s))).join('');
        }
    };

    randomock.text.padLeft = function (result, min, c) {
        return function () {
            var t = this.val(result);
            if (t.length < min) {
                return randomock.text(randomock.times(t.length - min, c), t);
            }
            return t;
        }
    };


    randomock.sample = function (list) {
        return function () {
            var l = this.val(list);
            return this.val(l[this.val(randomock.integer(l.length))]);
        }
    };

    randomock.choose = function () {
        var args = arguments;
        return function () {
            return this.val(args[this.val(randomock.integer(args.length))]);
        }
    };

    function normalizeDate(d) {
        if (typeof d === 'number') {
            return new Date(d);
        }
        else if (typeof d === 'string') {
            return new Date(Date.parse(d));
        }
        else {
            return new Date(Date.now());
        }
    }

    var dc = /([+-]?)(\d+)(y|mo|m|d|h|mi|M|s|ms)(\s|$)/g;

    function applyDateChange(date, change) {
        dc.lastIndex = 0;
        var y, m, d, h, mi, s, ms;
        y = m = d = h = mi = s = ms = 0;
        var c = null;

        while ((c = dc.exec(change))) {
            var v = parseInt(c[2]);
            v = c[1] === '-' ? v * -1 : v;
            switch (c[3]) {
                case 'y':
                    y = y + v;
                    break;
                case 'm':
                case 'mo':
                    m = m + v;
                    break;
                case 'd':
                    d = d + v;
                    break;
                case 'h':
                    h = h + v;
                    break;
                case 'mi':
                case 'M':
                    mi = mi + v;
                    break;
                case 's':
                    s = s + v;
                    break;
                case 'ms':
                    ms = ms + v;
                    break;
            }
        }
        return new Date(date.getFullYear() + y, date.getMonth() + m, date.getDate() + d, date.getHours() + h, date.getMinutes() + mi, date.getSeconds() + s, date.getMilliseconds() + ms);
    }

    randomock.date = function (start, range) {
        if (range === undefined) {
            range = start;
            start = Date.now();
        }
        return function () {
            start = normalizeDate(this.val(start));
            var end = applyDateChange(normalizeDate(start, this.val(range)));
            start = start.getTime();
            end = end.getTime();

            return new Date(this.val(randomock.integer(Math.min(start,end),Math.max(start,end))));
        }
    };

    randomock.date.format = function (date, format) {
        if (format === undefined) {
            format = date;
            date = Date.now();
        }
        return function () {
            date = normalizeDate(this.val(date));
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
                    case 'ms':
                        return date.getMilliseconds();
                }
            });
        }
    }
    if (module) {
        module.exports = randomock;
    }
})();