import express from 'express'
import cors from 'cors'
import userRouter from './routes/user'

const PORT = process.env.PORT || 3000

const app = express()

app.use(cors())
app.use(express.json())
app.use('/user', userRouter)

app.listen(PORT, () => {
  console.log(`BE server is running at PORT ${PORT}`)
})
