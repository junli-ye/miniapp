// 云函数入口文件
"use strict";
const cloud = require('wx-server-sdk');

// 使用当前云环境
cloud.init({ env: cloud.DYNAMIC_CURRENT_ENV });

// 云函数入口函数
exports.main = async (event, context) => {
  console.log('getFlights3 invoked - event=', event);
  try {
    const db = cloud.database();

    const region = event && event.region ? String(event.region) : '';
    const page = Math.max(1, parseInt(event && event.page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(event && event.pageSize, 10) || 50));
    const skip = (page - 1) * pageSize;

    const cond = {};
    if (region) cond.region = region;

    // get total
    const countRes = await db.collection('flights').where(cond).count();
    const total = (countRes && countRes.total) ? countRes.total : 0;

    // fetch page
    let flights = [];
    if (total > 0) {
      const getRes = await db.collection('flights').where(cond).skip(skip).limit(pageSize).get();
      flights = getRes.data || [];
    }

    // load airlines
    const airlinesRes = await db.collection('airlines').get();
    const airlinesArr = airlinesRes.data || [];
    const airlinesMap = airlinesArr.reduce((m, a) => { m[a.code] = a; return m; }, {});

    const processed = flights.map(f => {
      const airline = airlinesMap[f.airlineCode] || { code: f.airlineCode, nameZh: f.airlineCode, nameEn: f.airlineCode, logo: '' };
      const codeshare = (f.codeshare || []).map(cs => ({
        flightNo: cs.flightNo,
        airlineCode: cs.airlineCode,
        airline: airlinesMap[cs.airlineCode] || { code: cs.airlineCode, nameZh: cs.airlineCode, nameEn: cs.airlineCode, logo: '' }
      }));
      return { ...f, airline, codeshare };
    });

    console.log('getFlights3 fetched', processed.length, 'flights, total=', total, 'page=', page, 'pageSize=', pageSize);
    return { flights: processed, total, page, pageSize, lastUpdated: new Date().toISOString() };
  } catch (err) {
    console.error('getFlights3 error:', err && err.stack ? err.stack : err);
    return { error: true, message: err ? String(err) : 'unknown error' };
  }
};