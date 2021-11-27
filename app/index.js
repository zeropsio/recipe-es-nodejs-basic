const fs = require('fs');
const path = require('path');
const express = require('express');
const app = express();
const port = 3000;

const {Client} = require('@elastic/elasticsearch');

// Get the global environment object.
const env = process.env;
const hostname = 'recipees';

// Function returning an connectionString environment variable of the <hostname> service.
const getConnectionString = (hostname) => {
	const connectionString = 'connectionString';
	const value = env[`${hostname}_${connectionString}`];
	return value ? value : null;
}

// Function returning an object of the Elasticsearch SDK client.
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

// Function inserting a new document.
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

// Code called when accessing the root URL of the enabled Zerops subdomain.
app.get('/', (req, res) => {
	(async() => {
		if (esClient) {
			try {
				const insertResult = await insert(esClient);
				if (insertResult.statusCode === 201) {
					res.send('... Hello! A new document was inserted into Elasticsearch!');
					console.log('... created document id:', insertResult.body._id);
				} else {
					res.send(`... Error! Elasticsearch insert operation failed: ${insertResult.statusCode}`);
					console.log('... document creation failed:', insertResult.statusCode);
				}
			} catch (err) {
				res.send(`... Error! Elasticsearch insert operation failed: ${err.statusCode}`);
				console.log('... document creation failed:', err.statusCode);
			}
		} else {
			res.send('... Error! Elasticsearch SDK API client not initialized.');
			console.log('... Error! Elasticsearch SDK API client not initialized.');
		}
	})();
});

app.listen(port, () => {
	console.log(`... listening on port ${port}, the application started.`);
});
