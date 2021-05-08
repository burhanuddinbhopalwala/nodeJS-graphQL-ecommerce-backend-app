"use strict";

const path = require("path");

const demoJobs = require(path.join(__dirname, "demoJobs.js"));

class MasterJobs {
    static async runMasterJobs() {
        try {
            demoJobs.printHello();
        } catch (error) {
            next(error);
        }
    }
}

module.exports = MasterJobs;
