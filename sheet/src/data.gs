const DATA_PROP_ARRAYS = {
    [GET_AGENCY_CLIENT]: {
        propertiesArray: ['name', 'slug', 'feeType', 'fee', 'process', 'extraPercent', 'extraType'],
        dbProperties: {
            selectAllQuery: 'select sc.organizationname as name, sc.onpage as process, sc.fee1 as fee, sc.feetype1 as feeType, sc.fee2 extraPercent, sc.feetype2 as extraType, sc.oid as oid from agency_client as sc order by name',
            entryParsefunction: function(results) {
                return {
                    'name': results.getString(1),
                    'process': results.getString(2),
                    'fee': results.getDouble(3),
                    'feeType': results.getString(4),
                    'extraPercent': results.getDouble(5),
                    'extraType': results.getString(6),
                    'oid': results.getString(7),
                };
            },
            insertStatement: function(entry) {
                throw {message: 'Unsupported operation'};
            },
            checkDuplicateStatement: function(entry) {
                throw {message: 'Unsupported operation'};
            }
        }
    },
    [GET_DATA_CLIENT]: {
        propertiesArray: ['name', 'slug', 'subdomain', 'feeType', 'fee', 'process', 'extraPercent', 'extraType'],
        dbProperties: {
            selectAllQuery: 'select sc.longname as name, sc.slugname as slug, sc.domain, sc.subdomain, sc.onpage as process, sc.fee1 as fee, sc.feetype1 as feeType, sc.fee2 extraPercent, sc.feetype2 as extraType, sc.oid as oid from slug_client as sc order by name',
            entryParsefunction: function(results) {
                return {
                    'name': results.getString(1),
                    'slug': results.getString(2),
                    'domain': results.getString(3),
                    'subdomain': results.getString(4),
                    'process': results.getString(5),
                    'fee': results.getDouble(6),
                    'feeType': results.getString(7),
                    'extraPercent': results.getDouble(8),
                    'extraType': results.getString(9),
                    'oid': results.getString(10),
                };
            },
            insertStatement: function(entry) {
                throw {message: 'Unsupported operation'};
            },
            checkDuplicateStatement: function(entry) {
                throw {message: 'Unsupported operation'};
            }
        }
    },
    [GET_DATA_AGENCY]:  {
        propertiesArray: ['name', 'code'],
        dbProperties: {
            selectAllQuery: 'select sa.longname as name, sa.slugname as code, sa.agencyid as agencyid from slug_agency as sa order by name',
            entryParsefunction: function(results) {
                return {
                    'name': results.getString(1),
                    'code': results.getString(2)
                };
            },
            insertStatement: function(entry) {
                return `insert into slug_agency(longname, slugname) values("${entry.name}", "${entry.code}")`
            },
            checkDuplicateStatement: function(entry) {
                return `select count(*) from slug_agency where longname="${entry.name}" or slugname="${entry.code}"`
            }
        }
    },
    [GET_DATA_PAGE_TYPE]: {
        propertiesArray: ['name', 'code'],
        dbProperties: {
            selectAllQuery: 'select sp.longname as name, sp.slugname as code from slug_pagetype as sp order by name',
            entryParsefunction: function(results) {
                return {
                    'name': results.getString(1),
                    'code': results.getString(2)
                };
            },
            insertStatement: function(entry) {
                return `insert into slug_pagetype(longname, slugname) values("${entry.name}", "${entry.code}")`
            },
            checkDuplicateStatement: function(entry) {
                return `select count(*) from slug_pagetype where longname="${entry.name}" or slugname="${entry.code}"`
            }
        }
    },
    [GET_DATA_SOURCE]: {
        propertiesArray: ['name', 'code'],
        dbProperties: {
            selectAllQuery: 'select ss.longname as name, ss.slugname as code from slug_source as ss order by name',
            entryParsefunction: function(results) {
                return {
                    'name': results.getString(1),
                    'code': results.getString(2)
                };
            },
            insertStatement: function(entry) {
                return `insert into slug_source(longname, slugname) values("${entry.name}", "${entry.code}")`
            },
            checkDuplicateStatement: function(entry) {
                return `select count(*) from slug_source where longname="${entry.name}" or slugname="${entry.code}"`
            }
        }
    },
    [GET_DATA_MEDIUM]: {
        propertiesArray: ['name', 'code'],
        dbProperties: {
            selectAllQuery: 'select sm.longname as name, sm.slugname as code from slug_medium as sm order by name',
            entryParsefunction: function(results) {
                return {
                    'name': results.getString(1),
                    'code': results.getString(2)
                };
            },
            insertStatement: function(entry) {
                return `insert into slug_medium(longname, slugname) values("${entry.name}", "${entry.code}")`
            },
            checkDuplicateStatement: function(entry) {
                return `select count(*) from slug_medium where longname="${entry.name}" or slugname="${entry.code}"`
            }
        }
    },
    [GET_DATA_CAMPAIGN]: {
        propertiesArray: ['name', 'code'],
        dbProperties: {
            selectAllQuery: 'select sc.longname as name, sc.slugname as code from slug_campaign as sc order by name',
            entryParsefunction: function(results) {
                return {
                    'name': results.getString(1),
                    'code': results.getString(2)
                };
            },
            insertStatement: function(entry) {
                return `insert into slug_campaign(longname, slugname) values("${entry.name}", "${entry.code}")`
            },
            checkDuplicateStatement: function(entry) {
                return `select count(*) from slug_campaign where longname="${entry.name}" or slugname="${entry.code}"`
            }
        }
    },
    [GET_DATA_ISSUE_TOPIC]: {
        propertiesArray: ['name', 'code'],
        dbProperties: {
            selectAllQuery: 'select st.longname as name, st.slugname as code from slug_topic as st order by name',
            entryParsefunction: function(results) {
                return {
                    'name': results.getString(1),
                    'code': results.getString(2)
                };
            },
            insertStatement: function(entry) {
                return `insert into slug_topic(longname, slugname) values("${entry.name}", "${entry.code}")`
            },
            checkDuplicateStatement: function(entry) {
                return `select count(*) from slug_topic where longname="${entry.name}" or slugname="${entry.code}"`
            }
        }
    },
    [GET_DATA_FEE]:  {
        propertiesArray: ['name', 'fee'],
        dbProperties: {
            selectAllQuery: 'select ft.shortdesc as name, ft.multiplier as fee from feetype as ft order by name',
            entryParsefunction: function(results) {
                return {
                    'name': results.getString(1),
                    'fee': results.getDouble(2)
                };
            },
            insertStatement: function(entry) {
                throw {message: 'Unsupported operation'};
            },
            checkDuplicateStatement: function(entry) {
                throw {message: 'Unsupported operation'};
            }
        }
    },
    [GET_DATA_ON_PAGE]:  {
        propertiesArray:  ['id'],
        values: ['SPLIT', 'ZERO', 'NONE'],
        dbProperties: {
            insertStatement: function(entry) {
                throw {message: 'Unsupported operation'};
            },
            checkDuplicateStatement: function(entry) {
                throw {message: 'Unsupported operation'};
            }
        }
    },
}

function getDataByType(dataType) {
    Logger.log(`Get data by type [${dataType}]`);
    const dataTypeConfig = DATA_PROP_ARRAYS[dataType];
    if (dataType === GET_DATA_ON_PAGE) {
        return dataTypeConfig.values;
    }
    if (dataTypeConfig) {
        return queryDb(dataTypeConfig.dbProperties.selectAllQuery, dataTypeConfig.dbProperties.entryParsefunction);
    } else {
        throw `Unknown data type [${dataType}]`;
    }
}

function putDataByType(dataType, data) {
    Logger.log(`Putting data by type [${dataType}]`);
    const dataTypeConfig = DATA_PROP_ARRAYS[dataType];
    const dbProperties = dataTypeConfig.dbProperties;
    if (dataTypeConfig) {
        const inserted = insertIntoDb(data, dbProperties.insertStatement, dbProperties.checkDuplicateStatement);
        if (inserted === 1) {
            return 'Added';
        } else {
            return 'Ignored or Error';
        }
    }
}