const mongoose = require('mongoose');


async function connecToMongo(mongoURL) {
    if(!mongoURL){
        console.log("Invalid URL for mongoDB");
    }
   mongoose.connect(mongoURL).then(()=>console.log("Connected to Database")).catch((error)=>console.log(error.message));
}

module.exports=connecToMongo;