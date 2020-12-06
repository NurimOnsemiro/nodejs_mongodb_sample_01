import mongoose, { Connection, Document, Model, Schema } from 'mongoose';
import autoIncrement from 'mongoose-auto-increment';
import moment from 'moment';
import { filetimeFromDate } from './utils';

const MONGO_URI: string = 'mongodb://127.0.0.1:27017/mam';

/**
 * INFO: 다큐먼트 스키마. 반드시 Document를 상속받아야 한다.
 */
interface IKittySchema extends Document {
    idx: number;
    name: string;
    age: number; //나이
    height: number; //키 (cm)
    birth: number; //태어난 날짜를 파일타임으로 저장
    speak(): void;
}

/**
 * INFO: 모델 스키마. statics 메서드를 호출할 때 사용된다
 */
interface IKittyModelSchema extends Model<IKittySchema> {
    cry(): void;
}

/**
 * INFO: Kitten 콜렉션에 저장되는 데이터 형식 정의
 */
const kittySchema = new Schema({
    idx: { type: Number, required: true },
    name: { type: String, required: true },
    age: { type: Number, required: true },
    height: { type: Number, required: true },
    birth: { type: Number, required: true },
});

/**
 * INFO: 메서드는 DB에 저장되지 않지만 편의를 위해 구현할 수 있다.
 * INFO: 인터페이스에 정의한 함수는 반드시 구현해야 한다.
 * INFO: 메서드는 모델로 생성된 다큐먼트 인스턴스에서 호출될 수 있다
 */
kittySchema.methods.speak = function () {
    const greeting = this.name ? 'Meow name is ' + this.name : 'I Dont have a name';
    console.log(greeting);
};

/**
 * INFO: statics 메서드는 모델에서 직접 호출할 수 있다
 */
kittySchema.statics.cry = function () {
    console.log('Cry. This function can be called from Model');
};

//INFO: 콜렉션의 이름이 Kitten으로 저장되는 모델을 생성한다.
//INFO: 이 모델을 통해 저장하는 모든 데이터는 Kitten 콜렉션에 저장된다. (대소문자 구분안함)
const KittenModel = mongoose.model<IKittySchema, IKittyModelSchema>('Kitten', kittySchema);

/**
 * INFO: 몽고DB 서버에 접속하는 함수
 */
async function connectMongoDb(): Promise<void> {
    return new Promise(async (resolve, reject) => {
        try {
            let res = await mongoose.connect(MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
            });
            autoIncrement.initialize(res.connection);
            resolve();
        } catch (ex) {
            console.error('[MongoDB Connect Error]');
            reject(ex);
        }
    });
}

/**
 * INFO: 특정 다큐먼트의 자동 증가 항목을 등록한다.
 */
function registerAutoIncrement() {
    kittySchema.plugin(autoIncrement.plugin, {
        model: 'Kitten',
        field: 'idx',
        startAt: 1,
        increment: 1,
    });
}

/**
 * INFO: 주어진 콜렉션의 모든 문서들을 찾는다
 */
async function findAllData(model: Model<Document>): Promise<Document[]> {
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
 * INFO: 이름으로 다큐먼트 한개 조회
 * @param model 조회할 모델
 * @param name 다큐먼트 name 값
 */
async function findOneByName(model: Model<Document>, name: string): Promise<Document> {
    return new Promise(async (resolve, reject) => {
        model.findOne({ name: name }, (err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    });
}

/**
 * INFO: 이름으로 모든 다큐먼트 조회
 * @param model 조회할 모델
 * @param name 다큐먼트 name 값
 */
async function findAllByName(model: Model<Document>, name: string): Promise<Document[]> {
    return new Promise(async (resolve, reject) => {
        model.find({ name: name }, (err, res) => {
            if (err) {
                reject(err);
            }
            resolve(res);
        });
    });
}

/**
 * INFO: 콜렉션에 데이터를 저장합니다.
 * @param doc 저장할 문서
 */
async function saveCollectionData(doc: Document): Promise<Document> {
    return new Promise(async (resolve, reject) => {
        doc.save((err, doc) => {
            if (err) {
                reject(err);
            }
            resolve(doc);
        });
    });
}

/**
 * INFO: 더미 데이터 삽입
 */
async function insertDummyData(numData: number) {
    for (let i = 0; i < numData; i++) {
        if (i % 50 === 0) {
            console.log(`Inserting dummy data... (${i}/${numData})`);
        }

        let kitty = new KittenModel({
            name: moment().format('YYYYMMDDHHmmssSSS'),
            age: Math.round(Math.random() * 1000),
            height: Math.round(Math.random() * 250),
            birth: filetimeFromDate(),
        });

        await saveCollectionData(kitty);
    }
    console.log('insertDummyData ok.');
}

/**
 * INFO: 개수 조회
 */
async function findCount(model: Model<Document>, birth: number): Promise<number> {
    return new Promise(async (resolve, reject) => {
        //console.log('Start find count documents');
        let query = {
            height: { $gte: 180, $lte: 200 },
            birth: { $gte: 132517297351830000, $lte: 132517298895810000 },
        };
        model.countDocuments(query, (err, count) => {
            if (err) {
                reject(err);
            }
            resolve(count);
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
        registerAutoIncrement();

        // console.time('insertDummyData');
        // await insertDummyData(400000);
        // console.timeEnd('insertDummyData');

        // let kitty = new KittenModel({
        //     name: 'mk7',
        //     age: 10,
        //     birth: '2020-05-01',
        // });

        // kitty.speak();
        // KittenModel.cry();

        // await saveCollectionData(kitty);

        // let res = (await findAllData(KittenModel)) as IKittySchema[];
        // console.log(res);

        // let res2 = (await findOneByName(KittenModel, 'mk5')) as IKittySchema;
        // console.log(res2);

        // let res3 = (await findAllByName(KittenModel, 'mk5')) as IKittySchema[];
        // for (let doc of res3) {
        //     console.log(doc.name);
        // }

        console.time('count');
        let cnt: number = await findCount(KittenModel, 132517297351850000);
        console.timeEnd('count');
        console.log(`Document count : ${cnt}`);

        await mongoose.disconnect();
    } catch (ex) {
        console.error(ex);
        process.exit(0);
    }
}
main();
