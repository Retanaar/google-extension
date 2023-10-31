
function testArryToObj() {
    let array = getOnPageArray();
    Logger.log(JSON.stringify(array));

    let obj = _arrayToObj(array, 0, ["id"]);

    Logger.log(JSON.stringify(obj));
}

function testGetData() {
    const entires = getDataByType(GET_AGENCY_CLIENT);

    Logger.log(`First entry [${JSON.stringify(entires[0])}]`);
    Logger.log(`Found [${entires.length}] enttries`);
}

function testPutData() {

    const entry = {'name': 'New Agency', 'code': 'nag'};
    const addingNew = putDataByType(GET_DATA_AGENCY, entry);
    const ignored = putDataByType(GET_DATA_AGENCY, entry);

    Logger.log(`Adding entry: [${addingNew}]`);
    Logger.log(`Adding entry: [${ignored}]`);
}