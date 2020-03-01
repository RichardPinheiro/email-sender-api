import mongoose, { Mongoose } from 'mongoose';

class MongoMock {
    private database: Mongoose

    public async connect(): Promise<void> {
        if (!process.env.MONGO_URL) {
            throw new Error('MongoDB server not initialized');
        }

        this.database = await mongoose.connect(process.env.MONGO_URL, {
            useNewUrlParser: true,
            useCreateIndex: true,
            useFindAndModify: false
        })
    }

    public disconnect(): Promise<void> {
        return this.database.connection.close()
    }
}

export default new MongoMock()