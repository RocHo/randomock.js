(function () {
    function _getType(o){
        return Object.prototype.toString.call(o).slice(8,-1).toLowerCase();
    }

    function _identity(o){
        return o;
    }


	const randomock = function (config,status) {
        if(status === undefined){
            status = {
                _contextStack : [],
                val : function (v) {
					if (typeof v === 'function' && v._$rm) {
                        return v.apply(this);
                    }
                    return v;
                },
                rnd : function(){
                    return Math.random();
                },
                index : function(){
                    return this._currentContext().index;
                },
                _currentContext :function(){
                    return this._contextStack[this._contextStack.length - 1];
                },
                _pushStack : function(){
                    this._contextStack.push({
                        index : 0,
                        datas : {}
                    });
                },
                _popStack : function(){
                    this._contextStack.pop();
                },
                _increaseIndex : function(){
                    this._currentContext().index = this.index() +1;
                },
                randomock : function(obj){
                    return randomock(obj,this);
                },
				$rm : randomock,
                _setItem : function(obj){
                    var ctx = this._currentContext();
                    ctx.item = obj;
                },
                item : function(){
                    return this._currentContext().item;
                },
                parentItem : function(index){
                    index = index || 0;
                    if(!this._contextStack.length){
                        return null;
                    }
                    return this._contextStack[Math.max(0,this._contextStack.length - 2 - index)].item;
                },
                data : function(name,value){
                    if(value === undefined){
                        //get
                        for (var i = this._contextStack.length - 1; i >= 0; i--) {
                            var ctx = this._contextStack[i];
                            if(ctx.datas.hasOwnProperty(name)){
                                return ctx.datas[name];
                            }
                        }
                        return null;
                    }else{
                        //set
                        this._currentContext().datas[name] = value;
                        return value;
                    }
                }
            };
            status._pushStack();
        }


        config = status.val(config);


        if (_getType(config) === 'object') {
            var mock = {};
            var ps = [];
            status._setItem(mock);

            for (var n in config) {
                if(config.hasOwnProperty(n)){
                    ps.push({
                        key : n,
                        func : config[n]
                    });
                }
            }

            ps.sort(function(a,b){return a.func._order - b.func._order;});
            for(var i= 0,l = ps.length;i<l;i++){
                mock[ps[i].key] = randomock(status.val(ps[i].func),status);
            }
            return mock;
        }
        else {
            return config;
        }

    };

	const $rm = randomock;
	
    randomock._wrap = function(func){
        return function(){
            var args = arguments;

            var order = 0;
            for (var i = 0; i < args.length; i++) {
                var obj = args[i];
                if(_getType(obj) === 'function'){
                    order = Math.max(obj._order || 0,order);
                }
            }

            var resultFunc = func.apply(this,args);
			resultFunc._$rm = randomock;
            var wrapper = function(){
                var result = this.val(resultFunc);
                for(var i = 0; i < wrapper._extends.length;i++){
                    var e = wrapper._extends[i];
                    var args = Array.prototype.slice.call(e.args);
                    args.unshift(result);
                    for (var j = 0; j < args.length; j++) {
                        args[j] = this.val(args[j]);
                    }
                    result = randomock._extends[e.name].apply(this,args);
                }
                return this.val(result);
            };
			wrapper._$rm = randomock;
            wrapper._order = Math.max(resultFunc._order || 0,order);
            wrapper._extends = [];
            for(var n in randomock._extends){
                wrapper[n] = (function(n){
                    return function(){
                        var process = randomock._extendsProcesses[n];
                        if(_getType(process) === 'function'){
                           process.apply(wrapper,arguments);
                        }
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



    randomock.extend = function(name,func,processFunc){
        randomock._extends[name] = func;
        randomock._extendsProcesses[name] = processFunc;
    };
    randomock._extends = {};
    randomock._extendsProcesses = {};

    randomock.times = randomock.repeat = randomock._wrap(function (times, value) {
        var f = function () {
            var count = this.val(times);
            var r = [];
            this._pushStack();
            for (var i = 0; i < count; i++) {
                r.push(this.randomock(value));
                this._increaseIndex();
            }
            this._popStack();
            return r;
        };
        f._order = 500;
        return f
    });

    randomock.index = randomock._wrap(function(base,multiply){
        return function(){
            var b = this.val(base);
            var m = this.val(multiply) || 10;

            return this.index() + (b ? b * m : 0);
        }
    });

    randomock.current = randomock._wrap(function(name){
        var func = function(){
            var i = this.item();
            return i ? i[name] : null;
        };
        func._order = 1000;
        return func;
    });

    randomock.parent = randomock._wrap(function(name){
        return function(){
            var i = this.parentItem();
            return i ? i[name] : null;
        };
    });

    randomock.data = randomock._wrap(function(name,value){
        return function(){
            if(value === undefined){
                // get
                return this.data(this.val(name));
            }else{
                var v = this.val(value);
                this.data(this.val(name),v);
                return v;
            }
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

    randomock.choose = randomock.sample = randomock._wrap(function (list) {
        if(arguments.length > 1){
            list = Array.prototype.slice.apply(arguments);
        }
        return function () {
            var l = this.val(list);
            return this.val(l[this.val(randomock.integer(l.length))]);
        }
    });

	randomock.chooseSome = randomock._wrap(function(count,list){
		return function(){
			return this.val($rm.repeat(count,$rm.choose(list)));
		}
	});
	
    randomock.weightedChoose = randomock._wrap(function(){
        var args = Array.prototype.slice.apply(arguments);
        return function(){
            var wa = [];
            for (var i = 0; i < args.length; i=i+2) {
                wa.push({
					w : args[i+1],
					v : this.val(args[i])
                });
            }
            wa.sort(function(a,b){ return a.w-b.w;});
            var b = 0;
            for (var i = 0; i < wa.length; i++) {
                var v = wa[i];
                b +=v.w;
                v.w = b;
            }
            b = this.rnd() *  wa[wa.length-1].w;
            for (var i = 0; i < wa.length; i++) {
                var v = wa[i];
                if(v.w > b){
                    return this.val(v.v);
                }
            }
        };
    });

    randomock.when = randomock._wrap(function(cond,t,f){
        return function () {
            return this.val(this.val(cond) ? t : f);
        }
    });

    randomock.prop = randomock._wrap(function(obj,name,def){
        return function(){
            var o = this.val(obj);
            if(o){
                var n = this.val(name);
                var r = o[n];
                if(r !== undefined){
                    return r;
                }
            }
            return def;
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

    function _applyDateOffset(date, change) {
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
            var end = _applyDateOffset(normalizeDate(start),this.val(offset));
            start = start.getTime();
            end = end.getTime();

            return new Date(this.val(randomock.integer(Math.min(start,end),Math.max(start,end))));
        }
    });

    // randomock.generator = function(generator){
    //     if(_getType(generator) === 'function'){
    //         return randomock._wrap(generator);
    //     }
    //     else{
    //         return generator;
    //     }
    // };

    randomock.v = randomock.value = randomock._wrap(function(v){
        return function(){
            return this.val(v);
        }
    });


    function _pad(t,min,c,r){
        t = ''+t;
        if (t.length < min) {
            var p = new Array(min-t.length+1).join(c);
            return  r ? t + p: p + t;
        }
        return t;
    }

    randomock.extend('val',function(result){
        return this.val(result);
    });

    randomock.extend('data',function(result,name){
            this.data(name,result);
            return result;
    });

    randomock.extend('order',_identity,function(order){
        this._order = order;
    });

    randomock.extend('toFixed',function(result, digits){
            var r = parseFloat(result);
            return r.toFixed(this.val(digits));
    });

    randomock.extend('append',function (result, append) {
        return result + this.val(append);
    });

	randomock.extend('map',function(result,func){
	    return func ? func.call(this,result) : result;
	});

    randomock.extend('padLeft',function (result, min, c) {
        return _pad(result,min,c,false);
    });

    randomock.extend('dateOffset',function(result,offset){
        return _applyDateOffset(result,offset);
    });

    randomock.extend('dateFormat',function (date, format) {
        if (format === undefined) {
            format === 'y-m-d h:M:s.f';
        }

        date = normalizeDate(date);
        return format.replace(/y+|m+|d+|h+|M+|s+|f+/g, function (m) {
            var r = "";
            switch (m[0]) {
                case 'y':
                    r =  date.getFullYear();
                    break;
                case 'm':
                    r =  date.getMonth() + 1;
                    break;
                case 'd':
                    r =  date.getDate();
                    break;
                case 'h':
                    r =  date.getHours();
                    break;
                case 'M':
                    r =  date.getMinutes();
                    break;
                case 's':
                    r =  date.getSeconds();
                    break;
                case 'f':
                    return _pad(date.getMilliseconds(),m.length,'0').substr(0,m.length);
            }
            return _pad(r,m.length,'0');
        });
    });



    if (module) {
        module.exports = randomock;
    }
})();