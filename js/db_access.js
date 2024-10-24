const DB_NAME = 'wlmapp'
const MATCHES_TABLES = 'matches';
const RESULTS_TABLES = 'results';
const DB_VERSION = 1;
const READYSTATE_OK = 'done';

const TABLES = {
    [MATCHES_TABLES]: {
        'keyPath': 'id',
        'indexes': {
            'rule': false,
            'date': false,
            'tag':  false,
        },
        'others': [
            'game_code',
            'note',
        ],
    },
    [RESULTS_TABLES]: {
        'keyPath': 'id',
        'indexes': {
            'match_id': false,
            'winlose': false,
            'turn': false,
            'mydeck': false,
        },
        'others': [
            'enemydeck',
        ],
    },
}

async function createTables(db_name) {
    var db, objectStore, result=true;
    const REQUEST = indexedDB.open(db_name, DB_VERSION);
    REQUEST.onerror = (event) => {
        console.log('ERR: DB REQUEST');
        result = false;
    };
    REQUEST.onupgradeneeded = (event) => {
        db = event.target.result;
        // 定義済みテーブル作成
        for (var table_name in TABLES) {
            console.log(`Create: ${table_name}`);
            // キーパスとobjectStore作成
            objectStore = db.createObjectStore(
                table_name, { keyPath: TABLES[table_name]['keyPath'] }
            );
            // インデックス作成
            for (var index in TABLES[table_name]['indexes']) {
                objectStore.createIndex(
                    index,
                    index,
                    { unique: TABLES[table_name]['indexes'][index] }
                );
            }
            objectStore.transaction.oncomplete = (event) => {
                console.log(`Created: ${table_name}`);
            };
            objectStore.transaction.onerror = (event) => {
                console.log('ERR: DB ACCESS');
                console.error(event);
                result = false;
            };
        }
        if (!result) alert(MESSGES['error']);
    };
}

function insertData(db_name, data, callbackFunc = () => { }) {
    var db, transaction, objectStore, request, result = true;
    const REQUEST = indexedDB.open(db_name, DB_VERSION);
    REQUEST.onerror = (event) => {
        console.log('ERR: DB REQUEST');
        result = false;
    };
    REQUEST.onsuccess = (event) => {
        db = event.target.result;
        transaction = db.transaction(
            Object.keys(data),
            "readwrite"
        );
        for (var table in data) {
            console.log(`INSERT TABLE START: ${table}`)
            objectStore = transaction.objectStore(table);
            data[table].forEach(record => {
                console.log(`INSERT: ${record}`)
                request = objectStore.add(record);
                request.onsuccess = (event) => {};
            });
            console.log(`INSERT TABLE FIN: ${table}`)
        }
        transaction.oncomplete = (event) => {};
        transaction.onerror = (event) => {
            console.log('ERR: DB ACCESS');
            console.log(event);
            transaction.abort();
            result = false;
        };
        callbackFunc(data);
    };
}

function countData( db_name, tables, callbackFunc) {
    var db, objectStore, request, result = true;
    var data = {};
    const REQUEST = indexedDB.open(db_name, DB_VERSION);
    REQUEST.onerror = (event) => {
        console.log('ERR: DB REQUEST');
        result = false;
    };
    REQUEST.onsuccess = async (event) => {
        db = event.target.result;
        for (var table of tables) {
            objectStore = db.transaction(
                table,
                "readonly"
            ).objectStore(table);
            request = objectStore.count();
            await waitReady(
                request,
                data,
                (request, data) => {
                    data[table] = request.result;
                    request.onerror = (event) => {
                        throw new Error(`REQERR: ${event}`);
                    };
                }
            );
        }
        callbackFunc(data);
    };
}

async function waitReady( request, callbackArgs, callbackFunc) {
    for (var i = 0; i < MAX_WAIT; i++){
        console.log(`${i}:${request.readyState}`);
        await timer(WAIT_SECOND);
        if (request.readyState == READYSTATE_OK) {
            console.log(`${i}:${request.readyState}`);
            callbackFunc(request, callbackArgs);
            break;
        } else if (i == MAX_WAIT - 1) {
            throw new Error('MAX_WAIT');
        }
    }
}

async function getFilteredData(
    db_name,
    table,
    filterFunc,
    callbackFunc
) {
    const REQUEST = indexedDB.open(db_name, DB_VERSION);
    var request, cursor;
    REQUEST.onerror = (event) => {
        console.log('ERR: DB REQUEST');
    };
    REQUEST.onsuccess = (event) => {
        request =
            (event.target.result)
                .transaction(table, 'readonly')
                .objectStore(table)
                .openCursor();
        request.onsuccess = async (event) => {
            cursor = event.target.result;
            if (cursor) {
                filterFunc(cursor);
                cursor.continue();
            } else {
                // 最後の結果まで読み切ったら実行される
                callbackFunc();
            }
        };
    };
}

function clearData(db_name, tables, callbackFunc = () => { }) {
    var db, transaction, objectStore, request, result = true;
    const REQUEST = indexedDB.open(db_name, DB_VERSION);
    REQUEST.onerror = (event) => {
        console.log('ERR: DB REQUEST');
        result = false;
    };
    REQUEST.onsuccess = (event) => {
        db = event.target.result;
        transaction = db.transaction(tables,"readwrite");
        for (var table of tables) {
            console.log(`DELETE START: ${table}`)
            objectStore = transaction.objectStore(table);
            request = objectStore.clear();
            request.onsuccess = (event) => {};
            console.log(`DELETE FIN: ${table}`)
        }
        transaction.oncomplete = (event) => {};
        transaction.onerror = (event) => {
            console.log('ERR: DB ACCESS');
            console.log(event);
            transaction.abort();
            result = false;
        };
        callbackFunc();
    };
}

function deleteData(db_name, keyDatas, callbackFunc = () => { }) {
    var db, transaction, objectStore, request, result = true;
    const REQUEST = indexedDB.open(db_name, DB_VERSION);
    REQUEST.onerror = (event) => {
        console.log('ERR: DB REQUEST');
        result = false;
    };
    REQUEST.onsuccess = (event) => {
        db = event.target.result;
        transaction = db.transaction(
            Object.keys(keyDatas),
            "readwrite"
        );
        for (var table in keyDatas) {
            console.log(`DELETE START: ${table}`)
            objectStore = transaction.objectStore(table);
            keyDatas[table].forEach(key => {
                console.log(`DELETE: ${key}`)
                request = objectStore.delete(key);
                request.onsuccess = (event) => {};
            });
            console.log(`DELETE FIN: ${table}`)
        }
        transaction.oncomplete = (event) => {};
        transaction.onerror = (event) => {
            console.log('ERR: DB ACCESS');
            console.log(event);
            transaction.abort();
            result = false;
        };
        callbackFunc(keyDatas);
    };
}