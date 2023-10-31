const { SecretManagerServiceClient } = require('@google-cloud/secret-manager');

const client = new SecretManagerServiceClient();
const project = process.env.PROJECT_ID;
const environment = process.env.ENV;

async function getSecret(secretId) {
    const [version] = await client.accessSecretVersion({
        name: `projects/${project}/secrets/${environment}-${secretId}/versions/latest`,
    });

    return version.payload.data.toString();
}

module.exports = {getSecret}