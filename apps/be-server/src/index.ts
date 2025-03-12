import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import userRouter from './routes/user';

dotenv.config();
const PORT = process.env.PORT || 3001;

const app = express();

app.use(cors());
app.use(express.json());
app.use('/user', userRouter);

app.listen(PORT, () => {
    console.log(`BE server is running at PORT ${PORT}`);
});
