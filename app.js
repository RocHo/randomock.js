var $rm = require('./randomock');

var options = {
    'Option1': 'Value1',
    'Option2': 'Value2',
    'Option3': 'Value3',
};
var increase = $rm.increase();

var result = $rm({
    "result" : {
        "count" : $rm.range(100,120).data('total'),
        "list" : $rm.repeat($rm.integer(10,15),{
            "id" : increase,
            "index" : $rm.index(),
            "text" : $rm.join('Prefix ',$rm.text('ABC123',$rm.integer(3,5)),' Subfix').padLeft(30,$rm.choose('!','$','&',' ')),
            "date" : $rm.date('2016-11-13','-30d').dateOffset('+2y'),
            "dateFormat" : $rm.date('2016-11-13','-1y').data('dateH').dateFormat('yyyy/mm/dd hh:MM:ss.ff'),
            "dateH" : $rm.data('dateH').order(1),
            "option" : $rm.choose(['Option1','Option2','Option3']).append(' in Selection'),
            "laterOrder" : $rm.join('Value After SubOption : ',$rm.current('subOption').order(1500)),
            "subOption" : $rm.prop(options,$rm.current('option')),
            "sublist" : $rm.repeat($rm.range(10,15),{
                "id" : increase,
                "index" : $rm.index(),
                "value" : $rm.choose('123','456','789'),
                "parentIndex" : $rm.parent('index'),
                "resultCount" : $rm.data('total'),
                "weight": $rm.weightedChoose(4,'4',1,'1',3,'3',2,'2')
            }),
            "value" : $rm.value(function(){
                return "generate on processing" + (typeof $rm) + Math.random() + this.val(this.index());
            })
        })
    }
});

console.log(JSON.stringify(result,null,4));
