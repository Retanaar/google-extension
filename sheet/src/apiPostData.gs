function doPost(e) {
    Logger.log(`doPost call [${e.parameters}]`);
    let responseData;
    let statusCode = 200;

    const operation = e.parameter.operation;
    try {
        switch(operation) {
            case API_POST_OPERATION_UPSERT_CAMPAIGN:
                const data = JSON.parse(e.postData.contents);
                responseData = upsertCompositeCampaign(data);
                break;
            case API_POST_OPERATION_PUT_DATA:
                const dataType = e.parameter.dataType;
                responseData = putDataByType(dataType, JSON.parse(e.postData.contents));
                break;
            default:
                throw `Unknown operation [${operation}]`;
        }
    } catch (ex) {
        statusCode = 500;
        responseData = ex;
    }

    return ContentService.createTextOutput(JSON.stringify({data: responseData, status: statusCode}))
        .setMimeType(ContentService.MimeType.JSON);
}

