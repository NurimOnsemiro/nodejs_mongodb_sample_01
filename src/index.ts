import mongoose, { Connection, Document, Model, Schema } from 'mongoose';

const MONGO_URI: string = 'mongodb://127.0.0.1:27017/mam';

const kittySchema = new Schema({
    name: { type: String, required: true },
});

interface IKittySchema extends Document {
    name: string;
    speak(): void;
}

kittySchema.methods.speak = function () {
    const greeting = this.name ? 'Meow name is ' + this.name : 'I Dont have a name';
    console.log(greeting);
};

//INFO: 콜렉션의 이름이 Kitten으로 저장되는 모델을 생성한다.
//INFO: 이 모델을 통해 저장하는 모든 데이터는 Kitten 콜렉션에 저장된다. (대소문자 구분안함)
const KittenModel = mongoose.model<IKittySchema>('Kitten', kittySchema);

/**
 * INFO: 몽고DB 서버에 접속하는 함수
 */
async function connectMongoDb(): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            await mongoose.connect(MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            resolve();
        } catch (ex) {
            console.error('[MongoDB Connect Error]');
            reject(ex);
        }
    });
}

/**
 * INFO: 주어진 콜렉션의 모든 문서들을 찾는다
 */
async function findData(model: Model<Document>): Promise<Document[]> {
    return new Promise(async (resolve, reject) => {
        model.find((err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    });
}

/**
 * INFO: 데이터를 저장합니다.
 * @param doc 저장할 문서
 */
async function saveData(doc: Document): Promise<Document> {
    return new Promise(async (resolve, reject) => {
        doc.save((err, doc) => {
            if (err) {
                reject(err);
            }
            resolve(doc);
        });
    });
}

async function main() {
    console.log('Start Main');
    try {
        const conn: Connection = mongoose.connection;
        //INFO: MongoDB 서버 연결 후 호출되는 함수
        conn.once('open', () => {
            console.log('connected to mongod server');
        });

        //INFO: MongoDB 접속 오류 시 호출되는 함수
        conn.on('error', err => {
            console.log('[MongoDB Error]');
            console.error(err);
        });

        await connectMongoDb();

        let kitty = new KittenModel({
            name: 'mk3',
        });

        await saveData(kitty);

        let res = await findData(KittenModel);
        console.log(res);

        await mongoose.disconnect();
    } catch (ex) {
        console.error(ex);
        process.exit(0);
    }
}
main();
