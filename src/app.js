/**
 * Node.js API Starter Kit (https://reactstarter.com/nodejs)
 *
 * Copyright © 2016-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

/* @flow */

import express from 'express';
import cors from 'cors';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import session from 'express-session';
import PrettyError from 'pretty-error';

const app = express();

app.set('trust proxy', 'loopback');

app.use(
	cors({
		origin(origin, cb) {
			const whitelist = process.env.CORS_ORIGIN
				? process.env.CORS_ORIGIN.split(',')
				: [];
			cb(null, whitelist.includes(origin));
		},
		credentials: true,
	}),
);

app.use(compression());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(
	session({
		name: 'sid',
		resave: true,
		saveUninitialized: true,
		secret: 'bitmoon',
	}),
);

app.use('/health', (req, res) => {
	res.json({ data: 'tuyen', status: 200 });
});
app.use('/test', (req, res) => {
	res.json({ data: 'tuyentest', status: 200 });
});

const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage('express');

app.use((err, req, res, next) => {
	process.stderr.write(pe.render(err));
	next();
});
export default app;
