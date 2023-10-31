const settingsSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('tsettings');

function _getConnectionSettings() {
    Logger.log('Resolving DB settings');
    const settingsRange = settingsSheet.getRange(2, 2, 5, 1);
    const settingsData = settingsRange.getValues();

    const host = settingsData[0][0];
    const port = settingsData[1][0];
    const dbName = settingsData[2][0];
    const user = settingsData[3][0];
    const passsword = settingsData[4][0];

    Logger.log('DB Settings resolved');
    return {host,port,dbName, user, passsword};
}

function _getJDBCConnection() {
    Logger.log('Getting JDBC connection');
    const cs = _getConnectionSettings();
    const dbUrl =  `jdbc:mysql://${cs.host}:${cs.port}/${cs.dbName}`;
    const connection = Jdbc.getConnection(dbUrl, cs.user, cs.passsword);
    return connection;
}

function queryDb(query, entryParseFunciton) {
    let conn;
    let stmt;
    let results;
    Logger.log('Querying DB');
    try {
        conn = _getJDBCConnection();
        stmt = conn.createStatement();
        results = stmt.executeQuery(query);
        Logger.log('Query executioni complete, parsing results');
        const entreis = [];

        while(results.next()) {
            entreis.push(entryParseFunciton(results))
        }
        Logger.log('All results parsed');

        return entreis;
    } catch (ex) {
        Logger.log(`Unable to complete DB call [${ex.message}]`);
    } finally {
        // Close the statement, results, and connection in the 'finally' block
        if (results) results.close();
        if (stmt) stmt.close();
        if (conn) conn.close();
        Logger.log('All DB channels closed');
    }
}

