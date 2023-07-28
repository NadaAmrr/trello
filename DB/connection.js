import mongoose from 'mongoose'

const connectDB = async () => {
    return await mongoose.connect(process.env.DB_URL)
    .then(result=>{
         console.log(`DB CONNECTED`);
    }).catch(err => console.log(`Fail to connectDB -----${err}`));
}
export default connectDB