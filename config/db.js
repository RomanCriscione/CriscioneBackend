import mongoose from 'mongoose'

const connectDB = async () => {
    try {
        await mongoose.connect("mongodb+srv://criscioner:pjF3DJtcz59ABY9t@codercluster.sdeyn.mongodb.net/fitoPlantas?retryWrites=true&w=majority")
        console.log('MongoDB connected')
    } catch (error) {
        console.error('Error connecting to MongoDB', error)
        process.exit(1); 
    }
};

export default connectDB