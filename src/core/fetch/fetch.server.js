/**
 * React Starter Kit (https://www.reactstarterkit.com/)
 *
 * Copyright © 2014-present Kriasoft, LLC. All rights reserved.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE.txt file in the root directory of this source tree.
 */

import Promise from 'bluebird';
import fetch, { Request, Headers, Response } from 'node-fetch';
import { host, serviceSeting } from '../../config';

fetch.Promise = Promise;
Response.Promise = Promise;

function localUrl(url) {
  if (url.startsWith('//')) {
    return `https:${url}`;
  }

  if (url.startsWith('http')) {
    return url;
  }

  return `http://${host}${url}`;
}

function localFetch(url, options) {
  let { limit } = serviceSeting;
  const { delay } = serviceSeting;
  return new Promise((resolve, reject) => {
    function success(response) {
      resolve(response);
    }
    function failure(error) {
      limit -= 1;
      if (limit) {
        setTimeout(fetchUrl, delay);
      } else {
        // this time it failed for real
        reject(error);
      }
    }
    function finalHandler(finalError) {
      throw finalError;
    }
    function fetchUrl() {
      fetch(localUrl(url), options)
        .then(success)
        .catch(failure)
        .catch(finalHandler);
    }
    fetchUrl();
  });
}

export { localFetch as default, Request, Headers, Response };
