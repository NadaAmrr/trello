import connectDB from '../DB/connection.js'
import userRouter from './modules/user/user.router.js'
import authRouter from './modules/auth/auth.router.js'
import taskRouter from './modules/task/task.router.js'
import { globalErrorHandling } from './utils/errorHandling.js'
const bootstrap = (app , express)=>{
    app.use(express.json())
    app.get('/',(req,res)=>{
        res.send('Hello')
    })
    app.use("/user",userRouter)
    app.use("/task",taskRouter)
    app.use("/auth",authRouter)
    
    app.use("*",(req,res,next)=>{
        return res.json({message:"Invalid Routing"})
    })

    app.use(globalErrorHandling)
    connectDB()
}
export default bootstrap