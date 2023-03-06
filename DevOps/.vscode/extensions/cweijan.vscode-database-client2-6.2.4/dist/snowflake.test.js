var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getOwnPropSymbols = Object.getOwnPropertySymbols;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __propIsEnum = Object.prototype.propertyIsEnumerable;
var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
var __spreadValues = (a, b) => {
  for (var prop in b || (b = {}))
    if (__hasOwnProp.call(b, prop))
      __defNormalProp(a, prop, b[prop]);
  if (__getOwnPropSymbols)
    for (var prop of __getOwnPropSymbols(b)) {
      if (__propIsEnum.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    }
  return a;
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// src/common/util/viewUtil.ts
var import_date_format = __toESM(require("date-format"));
var import_pretty_ms = __toESM(require("pretty-ms"));
function formatDate(date) {
  if (!date)
    return "";
  return (0, import_date_format.default)("yyyy-MM-dd hh:mm:ss", date);
}
function toIntSafe(value) {
  if (value == null) {
    value = 0;
  } else if (typeof value != "number") {
    value = parseInt(value);
    if (isNaN(value))
      value = 0;
  }
  return value;
}

// src/common/util/arrayUtil.ts
var ArrayUtil = class {
  static betterArray() {
    if (!Array.prototype.distinct) {
      Array.prototype.distinct = function(prop) {
        const temp = {};
        return this.filter((item) => {
          let key = item;
          if (prop instanceof Function)
            key = prop(item);
          else if (prop != null)
            key = item[prop];
          if (temp[key])
            return false;
          if (key != null)
            temp[key] = 1;
          return true;
        });
      };
    }
  }
  static arrayToObj(array, key, value) {
    if (!Array.isArray(array))
      return array;
    return array.reduce((map, row) => {
      const property = key instanceof Function ? key(row) : row[key];
      map[property] = value ? row[value] : row;
      return map;
    }, {});
  }
  static clone(array) {
    return array.map((item) => __spreadValues({}, item));
  }
  static getMax(list, cb) {
    let max = 0;
    for (const item of list) {
      max = Math.max(max, cb(item));
    }
    return max;
  }
  static sum(array, prop) {
    return array.reduce((res, item) => {
      return res + getValue(item, prop);
    }, 0);
    function getValue(item, prop2) {
      let value = item;
      if (value && prop2) {
        for (const key of prop2.split(".")) {
          value = value == null ? void 0 : value[key];
        }
      }
      return toIntSafe(value);
    }
  }
  /**
   * 传入一个数组, 根据每一项的keyGenerator算出来的值进行分组
   * @param array 未分组数据
   * @param keyGenerator 生成分组key的回调函数, 返回空不分组
   * @param groupGenerator 生成分组节点的数据
   * @returns 
   */
  static grouping(array, option) {
    const { keyGenerator, groupGenerator, keepSingle } = option;
    const groupedNodes = [];
    const groupMap = {};
    for (const item of array) {
      const key = keyGenerator(item);
      if (key) {
        const groupNode = groupMap[key];
        if (groupNode) {
          groupNode.addChild(item);
        } else {
          const groupNode2 = groupGenerator(key, item);
          groupNode2.addChild(item);
          groupedNodes.push(groupNode2);
          groupMap[key] = groupNode2;
        }
      } else {
        groupedNodes.push(item);
      }
    }
    if (keepSingle) {
      return groupedNodes;
    }
    for (let i = 0; i < groupedNodes.length; i++) {
      const groupNode = groupedNodes[i];
      const childs = groupNode.childs;
      if (!childs)
        continue;
      if (childs.length == 1) {
        groupedNodes.splice(i, 1, childs[0]);
      }
    }
    return groupedNodes;
  }
  /**
   * 检测是否为多重结果
   */
  static isMultipleResult(fields) {
    if (!Array.isArray(fields))
      return false;
    for (const field of fields) {
      if (Array.isArray(field)) {
        return true;
      }
    }
  }
};

// src/service/connect/connection.ts
var sqlstring = __toESM(require("sqlstring"));
var IConnection = class {
  constructor() {
    this.dumpMode = false;
    this.dead = false;
  }
  convertToDump(item, fields) {
    const row = IConnection.arrayToObj(item, fields);
    for (const key in row) {
      const element = row[key];
      if (element == null) {
        row[key] = "NULL";
      } else {
        row[key] = sqlstring.escape(element);
      }
    }
    return row;
  }
  /**
   * 如果数据没有重复列, 将其转为对象, 有的话就返回原始的二维数组(无法在结果页进行修改)
   * @param res 二维数组结果集
   * @param fields 数据列
   */
  adaptResult(res, fields) {
    const dulicate = IConnection.haveDuplicateFields(fields) || ArrayUtil.isMultipleResult(fields);
    if (dulicate)
      return IConnection.adjustArrayData(res);
    if (!res)
      res = [];
    return res.map((row) => IConnection.arrayToObj(row, fields));
  }
  static adjustArrayData(rows) {
    if (!Array.isArray(rows))
      return rows;
    for (const row of rows) {
      if (!Array.isArray(row))
        continue;
      for (let i = 0; i < row.length; i++) {
        if (row[i] instanceof Date) {
          row[i] = formatDate(row[i]);
        } else if (row[i] == Infinity || row[i] == -Infinity) {
          row[i] = row[i] + "";
        }
      }
    }
    return rows;
  }
  static haveDuplicateFields(fileds) {
    if (!Array.isArray(fileds))
      return false;
    const table = {};
    for (const field of fileds) {
      if (!field)
        continue;
      if (table[field.name])
        return true;
      table[field.name] = true;
    }
    return false;
  }
  /**
   * 将二维数组转为对象, 使用对象才能够适应前端的编辑操作
   */
  static arrayToObj(row, fields) {
    var _a, _b;
    if (!fields)
      return row;
    const item = {};
    for (let i = 0; i < row.length; i++) {
      const name = (_a = fields[i]) == null ? void 0 : _a.name;
      if (row[i] instanceof Date) {
        item[name] = formatDate(row[i]);
      } else if ((_b = row[i]) == null ? void 0 : _b.iLob) {
        item[name] = row[i].iLob.data;
      } else if (row[i] == Infinity || row[i] == -Infinity) {
        item[name] = row[i] + "";
      } else {
        item[name] = row[i];
      }
    }
    return item;
  }
};

// src/service/connect/snowflakeConnection.ts
var import_snowflake_sdk = __toESM(require("snowflake-sdk"));
var SnowflakeConnection = class extends IConnection {
  constructor(node) {
    super();
    this.node = node;
    this.connection = import_snowflake_sdk.default.createConnection({
      username: node.user,
      password: node.password,
      // 登录app.snowflake.com后点击Admin->Accounts然后点击任意一个account复制
      account: node.snowflakeAccount,
      application: "vscode-database-client"
    });
  }
  query(sql, values, callback) {
    var statement = this.connection.execute({
      sqlText: sql,
      complete: function(err, stmt, rows) {
        console.log(stmt, rows);
        if (err) {
          console.error("Failed to execute statement due to the following error: " + err.message);
        } else {
          console.log("Successfully executed statement: " + stmt.getSqlText());
        }
      }
    });
  }
  connect(callback) {
    try {
      this.connection.connect((err, conn) => {
        callback(err);
      });
    } catch (error) {
      callback(error);
    }
  }
  beginTransaction(callback) {
    throw new Error("Method not implemented.");
  }
  rollback() {
    throw new Error("Method not implemented.");
  }
  commit() {
    throw new Error("Method not implemented.");
  }
  end() {
    throw new Error("Method not implemented.");
  }
  isAlive() {
    throw new Error("Method not implemented.");
  }
};

// test/connnect/snowflake.test.ts
console.log("\u5F00\u59CB\u8FDE\u63A5");
var connection = new SnowflakeConnection({
  user: "cweijan",
  password: "9459405424.",
  snowflakeAccount: "https://ionkbfw-gl27057.snowflakecomputing.com"
});
connection.connect((err) => {
  console.log(err, "\u8FDE\u63A5\u6210\u529F");
});
