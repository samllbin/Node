const fs = require("fs");
const path = require("path");

let dataCache = null;

function loadData() {
  if (!dataCache) {
    const file = path.resolve(__dirname, "../mock/data.json");
    let data = JSON.parse(fs.readFileSync(file, { encoding: "utf-8" }));
    let reports = data.dailyReports;
    dataCache = {};
    reports.forEach((report) => {
      if (report?.updatedDate !== undefined) {
        dataCache[report.updatedDate] = report;
      }
    });
  }
  return dataCache;
}
function getCoronavirusKeyIndex() {
  return Object.keys(loadData());
}

function getCoronavirusByDate(date) {
  const dailyData = loadData()[date] || {};
  if (dailyData?.countries) {
    // 按照各国确诊人数排序
    dailyData.countries.sort((a, b) => {
      return b.confirmed - a.confirmed;
    });
  }
  return dailyData;
}

module.exports = {
  getCoronavirusByDate,
  getCoronavirusKeyIndex,
};
