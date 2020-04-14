const express = require('express');
const router = express.Router();
const fs = require('fs');


router.get('/',(req,res,next)=>{
    try{
        const e = req.query.e;
        const height = req.query.height;
        if(!e||!height)
        res.send(`Give queries in the format - /api/getCordinates?height=50&e=0.5`);
        else
        {
            const g = req.query.g||9.8;
            let time = 0;
            let timegap = Math.min(0.5,height/100);
            let getdata = getData(height,time,e,g,timegap);
            let bounce = 0;
            getdata.forEach(Coordinate=>{
                if(Coordinate.y<=0.01)
                bounce++;
            })
            let data = {Coordinates:getdata, bounce};
            res.send(data);
            
            data["time"] = Math.floor(new Date() / 1000);
            let d = JSON.stringify(data, null, 2);
            fs.writeFile('./history.json', d, (err) => {
                if (err) throw err;
                console.log('Data written to file');
            });
            
        }
    }
    catch(e)
    {
        console.log(e);
        res.send("There is an error");
    }
});

router.get('/past',(req,res,next)=>{
    try{
            let filename = './history.json';
            fs.readFile(filename, (err, data) => {
                if (err) {console.log(err); res.send("Either the file is not made or Something wrong with the file");}
                else
                {
                    
                    let d = {};
                    data = data.length===0?"{}":data;
                    d = JSON.parse(data);
                    res.send(d);
                }
            });
    }
    catch(e)
    {
        console.log(e);
        res.send(e);
    }
})
const getData=(height,time,e,g,timegap)=>{
    //if e == 1 time == infinity
    if(e===1&&time>600)
      return [];
    //Height almost equal to 0
    if(height<0.01)
    return [];

    //Time for first fall
    const timetofall1 = Math.sqrt(2*height/g);
    let datas = [];

    for(let i = 0;i<timetofall1;i+=timegap)
    {
      let h = height- 1/2*g*i*i;
      datas = [...datas,{x:i+time,y:h}]
    }
    datas.push({x:timetofall1+time,y:0});


    //time to rise
    const timetofall2 = e*timetofall1;
    let datas2 = [];
    for(let i = 0;i<timetofall2;i+=timegap)
    {
      let h = e*e*height - 1/2*g*i*i;
      datas2 = [{x:timetofall2+timetofall1-i+time,y:h},...datas2]
    }
    // datas2 =[...datas2,{x:timetofall1+timetofall2+time,y:parseInt(e*e*height)}];

    //Recursively Calling the function
    const newTime = timetofall2+timetofall1+time;
    const newHeight = e*e*height;
    const addDatas = getData(newHeight,newTime,e,g,timegap);

    datas = datas.concat(datas2);
    datas = datas.concat(addDatas);

    return datas;
  }

module.exports = router;