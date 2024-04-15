const mongoose=require("mongoose");
const {Schema}=mongoose;

const Docs=new Schema({
    title:{
        type:String,
        default:"Untitled Document"
    },
    data:{
        type:Object,
        default:''
    },
    owner:{
        type:mongoose.Schema.Types.ObjectId,
        required:true,
        ref:"User"
    },
    userAllowed:[{
        name:{
            type:String   //Email of allowed Users
        },
        email:{
            type:String   //Email of allowed Users
        }
    }]
})

module.exports=mongoose.model("Docs",Docs);