const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const port = 3000;

const {Client} = require('@elastic/elasticsearch');

// Get the global environment object.
const env = process.env;
const hostname = 'recipees';

// Function returning an connectionString value.
const getConnectionString = (serviceName) => {
	const connectionString = 'connectionString';
	const value = env[`${serviceName}_${connectionString}`];
	return value ? value : null;
}

const getEsClient = (hostname) => {
	// For example, the result of the <host> would be: ["http://recipees:9200"]
	const host = getConnectionString(hostname);
	if (host) {
		return new Client({
			node: host,
			sniffOnStart: false
		});
	}
	return null;
}

// Declaration of the Elasticsearch SDK API client.
const esClient = getEsClient(hostname);

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
	(async() => {
		try {
			if (esClient) {
				const insertResult = await insert(esClient);
				if (insertResult.statusCode === 201) {
					res.send('... Hello! A new document was inserted into Elasticsearch!');
					console.log('... created document id:', insertResult.body._id);
				} else {
					res.send(`... Error! Elasticsearch insert operation failed: ${insertResult.statusCode}`);
					console.log('... document creation failed:', insertResult.statusCode);
				}
			} else {
				res.send('... Error! Elasticsearch SDK API client not initialized.');
				console.log('... Error! Elasticsearch SDK API client not initialized.');
			}
		} catch (err) {
			res.send(`... Error! Elasticsearch insert operation failed: ${err.statusCode}`);
			console.log('... document creation failed:', err.statusCode);
		}
	})();
});

app.listen(port, () => {
	console.log(`... listening on port ${port}, the application started.`);
});
