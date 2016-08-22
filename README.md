# randomock

A small library that generate random mock data.





## 生成数据

直接把配置对象给randomock方法即可得到自动生成的mock数据。


```javascript
var $rm = require('./randomock');
var result = $rm({
    "result" : {
        "count" : $rm.range(100,120),
        "list" : $rm.repeat($rm.integer(10,15),{
            "id" : $rm.increase(),
            "index" : $rm.index(),
            "text" : $rm.join('Prefix ',$rm.text('ABC123',$rm.integer(3,5)),' Subfix').padLeft(30,$rm.choose('!','$','&',' ')),
            "date" : $rm.date('2016-11-13','-30d').dateOffset('+2y'),
            "dateFormat" : $rm.date('2016-11-13','-1y').dateFormat('y/m/d h:M:s.f'),
            "sublist" : $rm.repeat($rm.range(0,3),{
                "index" : $rm.index(),
                "value" : $rm.choose('123','456','789')
            }),
            "value" : $rm.value(function(){
                return "generate on processing" + (typeof $rm) + Math.random() + this.val(this.index());
            })
        })
    }
});
```





## 延迟执行

randomock的所有方法都是延迟执行，只有真正调用randomock的时候才会生成数据。

也可以使用正常的javascript表达式，但数据会在配置的时候生成。

```javascript
{ "text" : 'value before generation' + 123 + pager.index }
```

randomock的所有方法都支持正常的javascript表达式和randomock的延迟执行方法，mock数据的生成会更灵活，你可以使`text`或`repeat`生成的文本长度或数据量依赖于其他随机生成方法。

```javascript
{
	"normalArguments" : $rm.text('ABC123',3),
	"randomockArguments" : $rm.text('ABC123',$rm.range(3,5)),
}
```





## 生成方法

生成方法提供了多种用来生成随机数据的方式。

### repeat(count,item) *(alias: times)*

迭代生成数组数据，指定生成数量，和每个数组元素的配置。数组的每个元素会在生成的时候动态生成数据。

```javascript
"list" : $rm.repeat($rm.range(10,15),{
	            "id" : $rm.increase(),
	            "option" : $rm.choose('支付宝','微信','银联')
	        })
```

### index()

获取当前迭代的索引，每进入一层repeat会有自己的索引。

```javascript
$rm.repeat(2,{
	"index" : $rm.index(),
	"permissions" : $rm.repeat(3,{
	                "index" : $rm.index()
	            })
}

// [{
//     index: 0,
//     permissions: [{
//         index: [0, 1, 2]
//     }]
// },{
//     index: 1,
//     permissions: [{
//         index: [0, 1, 2]
//     }]
// }]
```

### float([min = 0], max)

生成在范围内的浮点数，min默认0。

### range([min = 0], max) *(alias: integer)*

生成在范围内的整数，min默认0。生成的结果大于等于min，**小于max（不包含max值）**。

### increase([base = 0], [step = 1])

生成自增的数据，base默认0，step默认1。每个生成的increase都包含自己的状态，如果需要全局自增，请提出变量。

```javascript
var ic = $rm.increase();
$rm.repeat(2,{
		"index" : ic,
		"permissions" : $rm.repeat(3,{
		                "index" : ic
		            })
	}
	
// [{
//     index: 0,
//     permissions: [{
//         index: [1, 2, 3]
//     }]
// },{
//     index: 4,
//     permissions: [{
//         index: [5, 6, 7]
//     }]
// }]
```

### join(*values)

计算每一个值，并使用[].join拼合组成字符串作为结果。生成部分随机的字符串很方便。

```javascript
"text" : $rm.join('Price: ',rm.range(1000)), '$')
// { "text" : 'Price: 332$' }
```

### text([sample = /[A-Z0-9]/], length)

从传入的示例文本中随机挑选指定数量的字符组合生成文本。chars默认是所有数字和大写字母的组合

```javascript
"text" : $rm.text('ABC', $rm.range(3,5))
// { "text" : 'BACC' }
```


### sample(samples)

随机从samples的列表中选择一个值

### choose(*options)

随机从参数列表中选择一个值，与sample类似，但是使用动态参数，对于简单的选择更有可读性。

```javascript
"option" : $rm.choose('option1','options2','options3')
```


### date([start = Date.now()], offset)

从一个日期范围生成随机日期，返回Date对象。start默认是现在，start可以指定Date对象、可以parse的字符串或毫秒数字。

offset是描述距离start的偏移量的字符串，使用+-配合数字及指定位，可以使用空格指定多个偏移位。

```javascript
"date" : $rm.date('2016-1-1','+2y -30d')
```

- y 年
- m或mo 月
- d 日
- h 小时
- M或mi 分钟
- s 秒
- ms 毫秒


### value(func)

用于包装延迟计算，func可以包含任何正常的javascript内容，代码在生成数据的时候执行。

```javascript
"value" : $rm.value(function(){
    return "generate" + (typeof $rm) + Math.random() + this.val(this.index());
})
```

 在函数中执行randomock生成方法，请使用`this.val()`，更多信息请参考**randomock状态对象**。



## 扩展方法

扩展方法用来在生成方法之后添加更多的处理，直接在生成方法之后调用并传入参数即可。

```javascript
{ text : $rm.date('+1y').dateOffset('-2y').dateFormat('y-m-d').val() }
```

### .val()

立即执行生成方法并获取值，对于某些需要延迟执行才能获取正确结果的生成方法（如：`index()`）可能会出现不符合预期的结果。

### .toFixed([digits])

同原生toFixed。

### .padLeft(min,[c=' '])

使用`c`给出的字符填充至`min`给出的位数。

### .dateOffset(offset)

为日期应用偏移，语法同`date()`生成方法。

### .dateFormat([format='y-m-d h:M:s.f'])

格式化日期，字符串中年、月、日、时、分、秒、毫秒对应的替换字符是y、m、d、h、M、s、f。

### randomock.extend(name,extendFunc)

可以通过调用randomock.extend添加自定义扩展方法：

```javascript
randomock.extend('wrap',function(result,prefix,subfix){
	return prefix + this.val(result) + subfix;
});

{ text : $rm.range(1000,10000).wrap('Currency: ','$')}
// { text : 'Currency: 413$'}
```

扩展方法中第一个参数result是上一个扩展方法或生成方法的执行结果，需要调用`this.val()`来确保正确的执行结果。

## ramdomock状态对象

在生成方法`value`和自定义通道方法中可以通过`this`访问randomock状态对象。

### val(obj)

如果是randomock延迟方法，则在保证this是状态对象的情况下获取值，如果是普通javascript对象，则不作处理。

### rnd()

随机生成0-1的浮点数的工具方法。

### index()

获取当前`repeat`方法正在生成的对象的索引。

### randomock(obj)

如果参数是一个子randomock配置，可以调用此方法执行生成对象。



## 扩展生成方法和通道方法

