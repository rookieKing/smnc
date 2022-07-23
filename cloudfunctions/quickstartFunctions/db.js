
const cloud = require('wx-server-sdk');
const { once } = require('lodash');

const cloudPath = 'db/db.json';

module.exports = class Database {
  constructor() {
    this.data;
    this.next;
    this.queueRs = [];
    this.init = new Promise(async (rs) => {
      const res = await cloud.downloadFile({
        fileID: `cloud://free-6gixn2qc479bdf6c.6672-free-6gixn2qc479bdf6c-1312997891/` + cloudPath,
      })
      var data = res.fileContent.toString('utf8');
      if (!data) data = '{}';
      this.data = JSON.parse(data);
      rs();
    });
  }
  async get(readonly) {
    try {
      if (!this.data) await this.init;
      if (readonly) return { data: this.data };
      if (this.next) {
        await this.next;
      }
      this.next = new Promise(rs => this.queueRs.push(rs));
      return {
        data: this.data,
        // save: once(async () => {
        //   const rs = this.queueRs.shift();
        //   rs();
        //   if (this.queueRs.length) return;
        //   await cloud.uploadFile({
        //     cloudPath,
        //     fileContent: Buffer.from(JSON.stringify(this.data)),
        //   });
        //   this.next = undefined;
        // }),
      };

    } catch (err) {
      return { err }
    }
  }
}
