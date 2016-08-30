var $rm = require('./randomock');

var options = {
    'Option1': 'Value1',
    'Option2': 'Value2',
    'Option3': 'Value3',
};
var increase = $rm.increase();

var result = $rm({
    "result" : {
        "count" : $rm.data('total',$rm.range(100,120)),
        "list" : $rm.repeat($rm.integer(10,15),{
            "id" : increase,
            "index" : $rm.index(),
            "text" : $rm.join('Prefix ',$rm.text('ABC123',$rm.integer(3,5)),' Subfix').padLeft(30,$rm.choose('!','$','&',' ')),
            "date" : $rm.date('2016-11-13','-30d').dateOffset('+2y'),
            "dateFormat" : $rm.date('2016-11-13','-1y').dateFormat('y/m/d h:M:s.f'),
            "option" : $rm.choose('Option1','Option2','Option3'),
            "subOption" : $rm.property(options,$rm.current('option')),
            "sublist" : $rm.repeat($rm.range(0,3),{
                "id" : increase,
                "index" : $rm.index(),
                "value" : $rm.choose('123','456','789'),
                "parentIndex" : $rm.parent('index'),
                "resultCount" : $rm.data('total'),
            }),
            "value" : $rm.value(function(){
                return "generate on processing" + (typeof $rm) + Math.random() + this.val(this.index());
            })
        })
    }
});

console.log(JSON.stringify(result,null,4));
