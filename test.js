var test = 
{
1:["one", "two" , "three"],
2:["one","two", "three"]
}

var testTwo = [
    {username:"shit",
        number:3},
    {username:"fodo",
        number:4},
    {username:"foso",
        number:3}
]

var testfour ={
    one:1,
    two:2,
    three:3,
    
}


var number = 2
var onekey="two"

console.log(test[number][testfour[onekey]])

test[number][2]="shit"
console.log(test);

// var testThree = testTwo.filter((test)=>test.number===3)

// console.log(testThree)
