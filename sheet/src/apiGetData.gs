function doGet(e) {
    Logger.log(`doGet call [${e.parameters}]`);
    let responseData;
    let statusCode = 200;

    const operation = e.parameter.operation;
    try {
        switch(operation) {
            case API_GET_OPERATION_DATA:
                const dataType = e.parameter.dataType;
                responseData = getDataByType(dataType);
                break;
            case API_GET_OPERATION_GET_STARBOARD_CAMPAIGN:
                const starBoardSlug = e.parameter.slug;
                responseData = getStarboardCampaignBySlug(starBoardSlug);
                break;
            case API_GET_OPERATION_GET_AGENCY_CAMPAIGN:
                const agencySlug = e.parameter.slug;
                responseData = getAgencyCapmapaignBySlug(agencySlug);
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
