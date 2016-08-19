var $rm = require('./randomock');

// var result = $rm({
//     "result" : {
//         "count" : $rm.range(100,120),
//         "list" : $rm.repeat($rm.integer(10,15),{
//             "id" : $rm.increase(),
//             "index" : $rm.index(),
//             "text" : $rm.join('Prefix ',$rm.text('ABC123',$rm.integer(3,5)),' Subfix'),
//             "date" : $rm.date('2016-11-13','-1y -30d'),
//             "sublist" : $rm.repeat($rm.range(3,10),{
//                 "index" : $rm.index(),
//                 "value" : $rm.choose('123','456','789')
//             }),
//             "value" : $rm.value(function(){
//                 return "generate on processing" + (typeof $rm) + Math.random() + this.val(this.index());
//             })
//         })
//     }
// });
//
// console.log(JSON.stringify(result,null,4));

console.log(JSON.stringify($rm(
    {
        "text" : $rm.text($rm.range(5,15)).padLeft(20,$rm.choose('!','$','&'))
    }
),null,4));