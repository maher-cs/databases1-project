const oracledb = require('oracledb');

oracledb.outFormat = oracledb.OUT_FORMAT_OBJECT;
oracledb.autoCommit = true;

async function run(queryString) {

    let connection;

    try {
        connection = await oracledb.getConnection({
            user: "sys",
            password: "oracle",
            connectString: "localhost:1521/xe",
            privilege: oracledb.SYSDBA
        });

        const result = await connection.execute(queryString);
        return result.rows;
    } catch (err) {
        console.error(err);
    } finally {
        if (connection) {
            try {
                await connection.close();
            } catch (err) {
                console.error(err);
            }
        }
    }
}
const dbConnection = {
    query: run
};
module.exports = dbConnection;
