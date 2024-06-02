'use strict';

const schedule = require('node-schedule');
//* https://www.npmjs.com/package/node-schedule

class DemoJobs {
    static async printHello() {
        try {
            const printHelloJob = schedule.scheduleJob(
                '*/30 * * * * *', //* For every 30 seconds!
                function() {
                    console.log(
                        'Hello - The answer to life, the universe, and everything!'
                    );
                }
            );
            //printHelloJob.cancel();
            return;
        } catch (error) {
            next(error);
        }
    }
}

module.exports = DemoJobs;
