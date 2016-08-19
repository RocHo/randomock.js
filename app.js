var $r = require('./randomock');

var result = $r({
    "result" : {
        "count" : $r.range(100,120),
        "sodList" : $r.repeat($r.integer(10,15),{
            "id" : $r.increase(),
            "index" : $r.index(),
            "bill" : $r.join('BILLNUMBER',$r.text($r.integer(3,5))),
            "number" : $r.integer(0,1000),
            "payment" : $r.choose('支付宝','微信','银联'),
            "date" : $r.date('2016-11-13','-1y -30d'),
            "permissions" : $r.repeat($r.range(3,10),{
                "index" : $r.index(),
                "value" : $r.choose('123','456','789')
            })
        })
    }
});

console.log(JSON.stringify(result,null,4));
