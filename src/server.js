/**
 * Node.js API Starter Kit (https://reactstarter.com/nodejs)
 *
 * Copyright © 2016-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* @flow */
/* eslint-disable no-console, no-shadow */
import app from './app';
import { host, port, env, service, activeCoin, logger } from './config';
import errors from './errors';
import CoinSocket from './core/CoinSocket';
import Worker from './core/Worker';

console.log(`Running on ${env} instance.`);
const coins = activeCoin.split(',') || [];
const socketInterface = {};

coins.forEach(coinID => {
	if (coinID in service && service[coinID]) {
		const serviceConfig = service[coinID];
		socketInterface[serviceConfig.coinCode] = new CoinSocket({
			coinCode: serviceConfig.coinCode,
			coinID: coinID.toUpperCase(),
			mode: env,
			socketType: serviceConfig.socketType,
		});
	} else {
		logger(
			`Not found service configuration ${coinID}`,
			'Server.js - initialize() function.',
		);
	}
});

const worker = new Worker({
	mode: env,
	sockets: socketInterface,
});

// Launch Node.js server
const server = app.listen(port, host, async () => {
	worker.initialize();
	console.log(`Streaming server is listening on http://${host}:${port}/`);
});

// Shutdown Node.js app gracefully
function handleExit(options, err) {
	if (options.cleanup) {
		const actions = [server.close, worker.close()];
		actions.forEach((close, i) => {
			try {
				close(() => {
					if (i === actions.length - 1) process.exit();
				});
			} catch (err) {
				if (i === actions.length - 1) process.exit();
			}
		});
	}
	if (err) errors.report(err);
	if (options.exit) process.exit();
	process.exit();
}

process.on('exit', handleExit.bind(null, { cleanup: true }));
process.on('SIGINT', handleExit.bind(null, { cleanup: true, exit: true }));
process.on('SIGTERM', handleExit.bind(null, { cleanup: true, exit: true }));
process.on(
	'uncaughtException',
	handleExit.bind(null, { cleanup: true, exit: true }),
);
