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

console.log(JSON.stringify(result,null,4));
