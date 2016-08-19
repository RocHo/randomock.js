# randomock

A small library that generate random mock data.

## 生成数据

直接把配置对象给randomock方法即可得到自动生成的mock数据。

	var $rm = require('./randomock');

	var result = $rm({
	    "result" : {
	        "count" : $rm.range(100,120),
	        "list" : $rm.repeat($rm.range(10,15),{
	            "id" : $rm.increase(),
	            "text" : $rm.join('Prefix ',$rm.text('ABC123',$rm.range(3,5))),
	            "option" : $rm.choose('支付宝','微信','银联'),
	            "date" : $rm.date('2016-1-1','-30d'),
	            "permissions" : $rm.repeat($rm.range(3),{
	                "index" : $rm.index(),
	                "value" : $rm.choose(1,2,4)
	            })
	        })
	    }
	});
	
## 延迟执行

randomock的所有方法都是延迟执行，只有真正调用randomock的时候才会生成数据。

也可以使用正常的javascript表达式，但数据会在配置的时候生成。

	{ "text" : 'value before generation' + 123 + pager.index }

randomock的所有方法都支持正常的javascript表达式和randomock的延迟执行方法，可以提升mock数据的灵活性。

	{
		"normalArguments" : $rm.text('ABC123',3),
		"randomockArguments" : $rm.text('ABC123',$rm.range(3,5)),
	}

## 生成方法

### repeat(count,item) *(alias: times)*

迭代生成数组数据，指定生成数量，和每个数组元素的配置。数组的每个元素会在生成的时候动态生成数据。

	"list" : $rm.repeat($rm.range(10,15),{
		            "id" : $rm.increase(),
		            "option" : $rm.choose('支付宝','微信','银联')
		        })

### index()

获取当前迭代的索引，每进入一层repeat会有自己的索引。

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

### float([min = 0], max)

生成在范围内的浮点数，min默认0。

### range([min = 0], max) *(alias: integer)*

生成在范围内的整数，min默认0。生成的结果大于等于min，**小于max（不包含max值）**。

### increase([base = 0], [step = 1])

生成自增的数据，base默认0，step默认1。每个生成的increase都包含自己的状态，如果需要全局自增，请提出变量。

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
	
### join(*values)

计算每一个值，并使用[].join拼合组成字符串作为结果。生成部分随机的字符串很方便。

	"text" : $rm.join('Price: ',rm.range(1000)), '$')
	
	// { "text" : 'Price: 332$' }
	
### text([sample = /[A-Z0-9]/], length)

从传入的示例文本中随机挑选指定数量的字符组合生成文本。chars默认是所有数字和大写字母的组合

	"text" : $rm.text('ABC', $rm.range(3,5))
	
	// { "text" : 'BACC' }


### sample(samples)

随机从samples的列表中选择一个值

### choose(*options)

随机从参数列表中选择一个值，与sample类似，但是使用动态参数，对于简单的选择更有可读性。

	"option" : $rm.choose('option1','options2','options3')


### date([start = Date.now()], range)

从一个日期范围生成随机日期，返回Date对象。start默认是现在，start可以指定Date对象、可以parse的字符串或毫秒数字。

range是描述距离start的偏移量的字符串，使用+-配合数字及指定位，可以使用空格指定多个偏移位。

	"date" : $rm.date('2016-1-1','+2y -30d')
	
- y 年
- m或mo 月
- d 日
- h 小时
- M或mi 分钟
- s 秒
- ms 毫秒











