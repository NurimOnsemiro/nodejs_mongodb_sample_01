import mongoose, { Connection, isValidObjectId, Schema } from 'mongoose';

async function main(){
    console.log('Start Main');
    try{
        const conn: Connection = mongoose.connection;
        conn.once('open', ()=>{
            console.log('connected to mongod server');
        });
        conn.on('error', (err) => {
            console.log('[MongoDB Error]');
            console.error(err);
        })

        await mongoose.connect('mongodb://127.0.0.1:27017', {
            useNewUrlParser: true,
            useUnifiedTopology: true
        });

        let ArticleSchema = new Schema({
            author: ObjectId,
            title: String,
            body: String,
            date: Date
        });

        interface IArticle {
            author: number;
            title: string;
            body: string;
            date: string;
        };

        let ArticleModel = mongoose.model('Article',  ArticleSchema);
        let instance = new ArticleModel();
        instance.title = 'hello';
    }catch(ex){
        console.error(ex);
        process.exit(0);
    }
}
main();