const testCampaign = {"slug":"one","client":2,"agency":3,"pageType":4,"source":5,"medium":6,"campaign":7,"issueOrTopic":8,"feeOne":9,"feeTwo":0,"onPage":11,"date":12,"sourceCode":13,"internalName":14,"publicName":15,"feeOneValue":16,"feeTwoValue":17,"pageRevvUID":"page_id"}

const updatedCampaign = {"slug":"one","client":"Client 2","agency":"Agency 3","pageType":4,"source":5,"medium":6,"campaign":7,"issueOrTopic":8,"feeOne":9,"feeTwo":0,"onPage":11,"date":12,"sourceCode":13,"internalName":14,"publicName":15,"feeOneValue":16,"feeTwoValue":17,"pageRevvUID":"page_id_2"}


function testGetCampaign() {
    const notFoundCampaign = getCompositeCampaignBySlug('2');
    const foundCampaign = getCompositeCampaignBySlug('sos_pol_ow_aelc_eoy_bka_ne_20230825');

    Logger.log(`Not found: [${JSON.stringify(notFoundCampaign)}]`);
    Logger.log(`Found: [${JSON.stringify(foundCampaign)}]`);
}

function testUpsertCampaign() {

    const campaignRowIndex = _getSlugEntryRowIndexBySlug(testCampaign.slug);

    if (campaignRowIndex !== -1) {
        slugSheet.deleteRow(campaignRowIndex + 1);
        Logger.log('Test campaign has been deleted');
    }

    const upsertStatusAdded = upsertCompositeCampaign(testCampaign);
    const foundAddedCampaign = getCompositeCampaignBySlug(testCampaign.slug);
    const upsertStatusUpdated = upsertCompositeCampaign(updatedCampaign);
    const foundUpdatedCampaign = getCompositeCampaignBySlug(testCampaign.slug);

    Logger.log(`Comparing campaigns: [${upsertStatusAdded}][equals = ${areObjectsEqual(testCampaign, foundAddedCampaign)}]`);
    Logger.log(`Comparing campaigns: [${upsertStatusUpdated}][equals = ${areObjectsEqual(updatedCampaign, foundUpdatedCampaign)}]`);
}

function areObjectsEqual(obj1, obj2) {
    if (Object.keys(obj1).length !== Object.keys(obj2).length) {
        return false;
    }

    for (const key in obj1) {
        if (obj1.hasOwnProperty(key) && obj2.hasOwnProperty(key)) {
            if (obj1[key] !== obj2[key]) {
                return false;
            }
        } else {
            return false;
        }
    }

    return true;
}
