/* eslint-disable no-console */
import kue from 'kue';
import { logger, queue, tasks } from '../config';

// Define a skeleton factory
class Worker {
  // Our default instance
  mode = 'development';
  sockets = null;

  // setup coin api factory
  constructor(options) {
    this.mode =
      ['production', 'development', 'uat'].indexOf(options.mode) !== -1
        ? options.mode
        : 'development';
    this.sockets = options.sockets || null;
  }

  /** Start subscribe to Coin Network
   * @data: {
   * coinCode: String,
   * }
   */
  subscribe = async data => {
    let error = '';
    const socket = this.sockets[data.coinCode.toLowerCase()];
    if (!socket) {
      error = `Not found the socket of coin ${data.coinCode}`;
      return error;
    }
    try {
      console.log('Start to disconnet');
      await socket.disconnect();
      console.log('Start to reinit');
      await socket.initialize(this);
    } catch (e) {
      console.log(`Re-init fail as error ${e.message}`);
      error = e.message;
    }

    return error;
  };

  createWorker = (task, data, timer, backoff) => {
    queue
      .create(task, data)
      .delay(timer || 5000)
      .attempts(5)
      .removeOnComplete(true)
      .backoff({ delay: backoff || 1000 * 60 * 10, type: 'fixed' }) // delay the next failed job for 10 minutes
      .save(err => {
        if (err) {
          logger(
            `Failed to create a job for task: ${task}. Data detail ${JSON.stringify(
              data,
            )}`,
            'Worker.js - Function createWorker()',
            err.message,
          );
        }
      });
  };
  createAndCleanWorker = (task, data, timer, backoff) => {
    kue.Job.rangeByType(task, 'active', 0, 1000, 'asc', (err, jobs) => {
      jobs.forEach(job => {
        job.remove(() => {});
      });
    });
    kue.Job.rangeByType(task, 'delayed', 0, 1000, 'asc', (err, jobs) => {
      jobs.forEach(job => {
        job.remove(() => {});
      });
    });
    kue.Job.rangeByType(task, 'inactive', 0, 1000, 'asc', (err, jobs) => {
      jobs.forEach(job => {
        job.remove(() => {});
      });
    });
    queue
      .create(task, data)
      .delay(timer || 5000)
      .attempts(5)
      .backoff({ delay: backoff || 1000 * 70 * 10, type: 'fixed' }) // delay the next failed job for 10 minutes
      .save(err => {
        if (err) {
          logger(
            `Failed to create a job for task: ${task}. Data detail ${JSON.stringify(
              data,
            )}`,
            'Worker.js - Function createAndCleanWorker()',
            err.message,
          );
        }
      });
  };

  createIfNotExits = (task, data, timer, backoff) => {
    let exits = false;
    kue.Job.rangeByType(task, 'active', 0, 1000, 'asc', (err, jobs) => {
      jobs.forEach(job => {
        exits = true;
      });
    });
    kue.Job.rangeByType(task, 'delayed', 0, 1000, 'asc', (err, jobs) => {
      exits = true;
    });
    kue.Job.rangeByType(task, 'inactive', 0, 1000, 'asc', (err, jobs) => {
      jobs.forEach(job => {
        job.remove(() => {});
      });
    });
    if (!exits) {
      queue
        .create(task, data)
        .delay(timer || 5000)
        .attempts(5)
        .backoff({ delay: backoff || 1000 * 70 * 10, type: 'fixed' }) // delay the next failed job for 10 minutes
        .removeOnComplete(true)
        .save(err => {
          if (err) {
            logger(
              `Failed to create a job for task: ${task}. Data detail ${JSON.stringify(
                data,
              )}`,
              'Worker.js - Function createAndCleanWorker()',
              err.message,
            );
          }
        });
    }
  };

  createSingleWorker = (task, data, timer) => {
    queue
      .create(task, data)
      .delay(timer || 5000)
      .removeOnComplete(true)
      .save(err => {
        if (err) {
          logger(
            `Failed to create a job for task: ${task}. Data detail ${JSON.stringify(
              data,
            )}`,
            'Worker.js - Function createWorker()',
            err.message,
          );
        }
      });
  };

  finalize = (err, done) => {
    if (err) {
      done(err);
    } else {
      done();
    }
  };

  initialize = () => {
    queue.setMaxListeners(0);

    Object.entries(this.sockets).forEach(([key, socket]) => {
      // init new subscribe socket
      queue.process(
        `${tasks.subscribe} ${socket.instance.coinID}`,
        async (job, done) => {
          const err = await this.subscribe(job.data);
          this.finalize(err, done);
        },
      );
    });

    // trigger to run after server restart
    kue.Job.rangeByType(
      tasks.subscribe,
      'delayed',
      0,
      1000,
      'asc',
      (err, selectedJobs) => {
        selectedJobs.forEach(job => {
          job.remove();
        });

        Object.entries(this.sockets).forEach(([key, socket]) => {
          this.createAndCleanWorker(
            `${tasks.subscribe} ${socket.instance.coinID}`,
            {
              coinCode: key,
            },
            1000,
            1000 * 15,
          );
        });
      },
    );
  };
  close = () => {
    Object.entries(this.sockets).forEach(([key, value]) => value.disconnect());
  };
}

export default Worker;
