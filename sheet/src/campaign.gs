
const QUERY_AGENCY_BY_SLUG = `
    SELECT
        c.id,
        c.name,
        c.sourceurl AS sourceUrl,
        c.utm_source AS utmSource,
        c.utm_medium AS utmMedium,
        c.utm_campaign AS utmCampaign,
        c.utm_content AS utmContent,
        c.agencyid AS agency,
        c.conduitoid,
        c.pagetype AS pageType,
        c.medium,
        c.platformpid AS pageId,
        ac.organizationname as client
    FROM
        campaign as c,
        agency_client as ac
    WHERE
        c.conduitoid = ac.oid
      and agencyslug = ?
`;

const QUERY_CAMPAIGN_BY_SLUG = `
    SELECT
        cm.id AS id,
        cm.name AS publicName,
        cm.slug AS slug,
        cm.baseurl AS baseDomain,
        cm.utm_source AS utmSource,
        cm.utm_medium AS utmMedium,
        cm.utm_campaign AS utmCampaign,
        cm.utm_content AS utmContent,
        cm.platformpid AS pageId,
        sl.client AS client,
        sl.pagetype AS pageType,
        cm.agencyid AS agency,
        sl.topic AS topic,
        cm.medium AS medium,
        sl.dateslug AS date,
        sl.sourcecode AS sourceCode,
        sl.source AS source,
        sl.pagename AS internalName
    FROM campaign AS cm
             INNER JOIN slug AS sl ON sl.slug = cm.slug
    WHERE sl.slug = ?`;

const QUERY_FEES_BY_CAMPAIGN_ID = `
  select 
    f.fee,
    ft.shortdesc as feeType,
    f.onpage
  from fee as f, feetype as ft
  where f.feetypeid = ft.id 
    and (f.inactive is null or f.inactive > CURRENT_DATE())
    and f.campaignid = ?
`;

function getAgencyCapmapaignBySlug(slug) {
    Logger.log(`Getting agency campaign for slug [${slug}]`);
    return _getCampaignBySlug(slug, QUERY_AGENCY_BY_SLUG, _parseAgencyCampaign);
}

function getStarboardCampaignBySlug(slug) {
    Logger.log(`Getting campaign for slug [${slug}]`);
    return _getCampaignBySlug(slug, QUERY_CAMPAIGN_BY_SLUG, _parseStarboardCampaign);
}
function _getCampaignBySlug(slug, campaignQuery, campaignParseFunction) {
    let campaignComposite = {};
    let conn, stm, stmFee, result, resultFee;
    try {
        conn = _getJDBCConnection();
        stm = conn.prepareStatement(campaignQuery);
        stm.setString(1, slug);
        result = stm.executeQuery();

        if (result.next()) {
            campaignComposite = campaignParseFunction(result);
            stmFee = conn.prepareStatement(QUERY_FEES_BY_CAMPAIGN_ID);
            stmFee.setInt(1, campaignComposite.meta.id);
            resultFee = stmFee.executeQuery();
            campaignComposite.campaign.fees = [];
            while(resultFee.next()) {
                campaignComposite.campaign.fees.push(_parseFee(resultFee));
            }
        }
        return campaignComposite.campaign;
    } finally {
        closeChannels([resultFee, result, stmFee, stm, conn]);
    }
}

function _parseStarboardCampaign(resultSet) {
    const resultObject = {
        meta: {},
        campaign: {}
    };

    resultObject.meta.id = resultSet.getString('id');
    resultObject.campaign.slug = resultSet.getString('slug');
    resultObject.campaign.baseDomain = resultSet.getString('baseDomain');
    resultObject.campaign.utmSource = resultSet.getString('utmSource');
    resultObject.campaign.utmMedium = resultSet.getString('utmMedium');
    resultObject.campaign.utmCampaign = resultSet.getString('utmCampaign');
    resultObject.campaign.utmContent = resultSet.getString('utmContent');
    resultObject.campaign.pageId = resultSet.getString('pageId');
    resultObject.campaign.client = resultSet.getString('client');
    resultObject.campaign.pageType = resultSet.getString('pageType');
    resultObject.campaign.agency = resultSet.getString('agency');
    resultObject.campaign.topic = resultSet.getString('topic');
    resultObject.campaign.medium = resultSet.getString('medium');
    resultObject.campaign.date = resultSet.getString('date');
    resultObject.campaign.sourceCode = resultSet.getString('sourceCode');
    resultObject.campaign.source = resultSet.getString('source');
    resultObject.campaign.publicName = resultSet.getString('publicName');
    resultObject.campaign.internalName = resultSet.getString('internalName');

    return resultObject;
}

function _parseFee(resultSet) {
    return {
        'fee': resultSet.getDouble('fee'),
        'feeType': resultSet.getString('feeType'),
        'onPage': resultSet.getString('onpage')
    }
}

function _parseAgencyCampaign(resultSet) {
    const resultObject = {
        meta: {},
        campaign: {}
    };

    resultObject.meta.id = resultSet.getString('id');
    resultObject.campaign.name = resultSet.getString('name');
    resultObject.campaign.sourceUrl = resultSet.getString('sourceUrl');
    resultObject.campaign.utmSource = resultSet.getString('utmSource');
    resultObject.campaign.utmMedium = resultSet.getString('utmMedium');
    resultObject.campaign.utmCampaign = resultSet.getString('utmCampaign');
    resultObject.campaign.utmContent = resultSet.getString('utmContent');
    resultObject.campaign.agency = resultSet.getString('agency');
    resultObject.campaign.conduitoid = resultSet.getString('conduitoid');
    resultObject.campaign.pageType = resultSet.getString('pageType');
    resultObject.campaign.medium = resultSet.getString('medium');
    resultObject.campaign.pageId = resultSet.getString('pageId');
    resultObject.campaign.client = resultSet.getString('client');

    return resultObject;
}

function putStarboardCampaign(campaign) {
    let conn, stm, stmFee, result, resultFee;
    try {
        conn = _getJDBCConnection();
        conn.setAutoCommit(false);
        stm = conn.prepareStatement(_buildInsertSlugStatement(campaign.slug, campaign.sourceCode, campaign.internalName));
        let insertStatus = stm.executeUpdate();

        if (insertStatus !== 1) {
            throw {message: 'Unable to perform insert into [slug] table'}
        }

        conn.commit();
    } catch (ex) {
        if (conn) {
            conn.rollback();
        }
        throw ex;
    } finally {
        closeChannels([resultFee, result, stmFee, stm, conn]);
    }
}

function _buildInsertSlugStatement(sd, sourceCode, internalName){
    return `INSERT INTO slug (slug, client, conduitoid, pagetype, agency, source, campaign, topic, 
                  medium, dateslug, created, sourcecode, pagename)
    SELECT '${sd.slug}', sc.slugname, sc.oid, '${sd.pageType}', '${sd.agency}', '${sd.source}', '${sd.campaign}', 
           '${sd.topic}', '${sd.medium}', '${sd.date}', CURRENT_DATE(), '${sourceCode}', '${internalName}' 
    FROM slug_client as sc
    WHERE sc.longname = ?`;
}
//
// function _upsertContent(sheet, rowIndex, contentArray) {
//     let status = 'Unknown';
//
//     if (rowIndex === -1) {
//         sheet.insertRowBefore(2);
//         rowIndex = 2;
//         status = 'Added';
//     } else {
//         status = 'Updated';
//         rowIndex++;
//     }
//     const newRow = contentArray;
//     sheet.getRange(rowIndex, 1, 1, newRow.length).setValues([newRow]);
//
//     return status;
// }
//
//
// function _getSlugEntryRowIndexBySlug(slug) {
//     const existingData = slugSheet.getRange("A:A").getValues();
//     return existingData.findIndex(row => row[0] === slug);
// }
//
// function _getCampaignEntryRowIndexBySlug(slug) {
//     const existingData = campaignSheet.getRange("A:A").getValues();
//     return existingData.findIndex(row => row[0] === slug);
// }
//
// function _compositeCampaignToSlugArray(compositeCampaign) {
//     return [
//         compositeCampaign.slug,
//         compositeCampaign.client,
//         compositeCampaign.pageType,
//         compositeCampaign.agency,
//         compositeCampaign.source,
//         compositeCampaign.campaign,
//         compositeCampaign.issueOrTopic,
//         compositeCampaign.medium,
//         compositeCampaign.date,
//         compositeCampaign.publicName,
//         compositeCampaign.sourceCode
//     ]
// }
//
// function _compositeCampaignToCampaignArray(compositeCampaign) {
//     const dataArray = Array.from({ length: 20 });
//     dataArray[0] = compositeCampaign.slug;
//     dataArray[2] = compositeCampaign.client;
//     dataArray[3] = compositeCampaign.agency;
//     dataArray[4] = compositeCampaign.campaign;
//     dataArray[5] = compositeCampaign.issueOrTopic;
//     dataArray[6] = compositeCampaign.medium;
//     dataArray[7] = compositeCampaign.date;
//     dataArray[8] = compositeCampaign.baseDomain;
//     dataArray[9] = compositeCampaign.utmSource;
//     dataArray[10] = compositeCampaign.utmMedium;
//     dataArray[11] = compositeCampaign.utmCampaign;
//     dataArray[12] = compositeCampaign.utmContent;
//     dataArray[13] = compositeCampaign.pageRevvUID;
//     dataArray[14] = compositeCampaign.feeOneValue;
//     dataArray[15] = compositeCampaign.feeOne;
//     dataArray[16] = compositeCampaign.feeTwoValue;
//     dataArray[17] = compositeCampaign.feeTwo;
//     dataArray[18] = compositeCampaign.onPage;
//     return dataArray;
// }
