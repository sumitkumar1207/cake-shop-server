let sql = require('@/app/db/database.js');

export const sqlPaginate = (query) => {
  let pagination = '';
  if (query.limit && query.limit !== undefined && String(query.limit.length > 0) &&
    query.currentPage && query.currentPage !== undefined && String(query.currentPage.length > 0)
  ) {
    let start = 0;
    if (parseInt(query.currentPage) >= 1) {
      start = (parseInt(query.currentPage - 1)) * parseInt(query.limit);
      pagination = ` LIMIT ${parseInt(query.limit)} OFFSET ${start}`
      // console.log('pagination :', pagination);
    }
  } else {
    pagination = ``
  }
  return pagination;
};

export const sqlTableCount = (SQLQuery) => {
  return new Promise((resolve, reject) => {
    sql.query(SQLQuery, function (error, result) {
      if (error) {
        resolve({ count: 0 });
      } else {
        if (result.length > 0) resolve({ count: result[0].count })
        else resolve({ count: 0 });
      }
    });
  });
};

export const executeQuery = (SQLQuery) => {
  return new Promise((resolve, reject) => {
    sql.query(SQLQuery, function (error, result) {
      if (error) {
        reject(error);
      } else {
        resolve(result)
      }
    });
  });
};
