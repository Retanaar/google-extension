import {constants} from "./modules/utils.js";
export const MODULE = {
    "Starboard": {
        "name": "Starboard",
        "prefix": "winred-page-setup",
        "dataTypes": [
            constants.DATA.CLIENT,
            constants.DATA.MEDIUM,
            constants.DATA.AGENCY,
            constants.DATA.PAGE_TYPE,
            constants.DATA.FEE,
            constants.DATA.CAMPAIGN,
            constants.DATA.ISSUE_TOPIC,
            constants.DATA.ON_PAGE,
            constants.DATA.SOURCE,
        ],
        "campaignBlockers": [
            constants.DATA.CLIENT,
            constants.DATA.AGENCY,
            constants.DATA.PAGE_TYPE,
            constants.DATA.SOURCE,
            constants.DATA.MEDIUM,
            constants.DATA.CAMPAIGN,
            constants.DATA.ISSUE_TOPIC,
        ]
    },
    "Agency": {
        "name": "Agency",
        "prefix": "winred-page-agency",
        "dataTypes": [
            constants.DATA.AGENCY_CLIENT,
            constants.DATA.MEDIUM,
            constants.DATA.AGENCY,
            constants.DATA.PAGE_TYPE,
            constants.DATA.FEE,
            constants.DATA.ON_PAGE,
        ],
        "campaignBlockers": [
            constants.DATA.AGENCY_CLIENT,
            constants.DATA.AGENCY,
            constants.DATA.PAGE_TYPE,
            constants.DATA.MEDIUM,
        ]
    },
    "Settings": {
        name: "Settings",
        prefix: "winred-page-settings",
        dataTypes: []
    },

}