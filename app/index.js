const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const port = 3000;

// Get the global environment object.
const env = process.env;
const esServiceName = 'recipees';

// Function returning an connectionString value.
const getConnectionString = (serviceName) => {
	const connectionString = 'connectionString';
	const value = env[`${serviceName}_${connectionString}`];
	return value ? value : null;
}

const {Client} = require('@elastic/elasticsearch');
const esClient = new Client({
	node: getConnectionString(esServiceName),
	sniffOnStart: false
});

const insert = async (esClient) => {
	return await esClient.index({
		index: 'zerops-recipes',
		body: {
			service: 'Node.js',
			version: '14.17.0',
			message: 'es-nodejs-basic'
		}
	})
}

app.get('/', (req, res) => {
	res.send(`... Hello! A new document was inserted into Elasticsearch!`);
	(async() => {
		const insertResult = await insert(esClient);
	})();
});

app.listen(port, () => {
	console.log(`... listening on port ${port}, application started.`);
});
