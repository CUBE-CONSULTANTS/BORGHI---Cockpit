sap.ui.define([
  "sap/ui/model/Filter",
  "sap/ui/model/FilterOperator"
], function (Filter, FilterOperator) {
  "use strict";
  
  return {
    getEntity: function (oModel, Entity, aFilters = [], Expands = []) {
      let parameters = {};
      if (Expands.length > 0) {
        parameters["$expand"] = Expands.join(",");
      }
      
      return new Promise((resolve, reject) => {
        oModel.read(Entity, {
          filters: aFilters.length > 0 ? aFilters : undefined,
          parameters: parameters,
          success: (odata) => {
            resolve({
              "results": odata.results || odata,
              success: true
            });
          },
          error: (err) => {
            reject({ success: false, error: err });
          }
        });
      });
    },
    
    readByKey: function (oModel, Entity, keyValue) {
      let keyString = typeof keyValue === "object"
        ? Object.entries(keyValue).map(([k, v]) => `${k}='${v}'`).join(",")
        : `'${keyValue}'`;
      
      return new Promise((resolve, reject) => {
        oModel.read(`${Entity}(${keyString})`, {
          success: function (data) {
            resolve(data);
          },
          error: function (err) {
            reject(err);
          }
        });
      });
    },
    
    createEntity: function (oModel, Entity, oRecords, headers = {}) {
      return new Promise((resolve, reject) => {
        oModel.create(Entity, oRecords, {
          headers: headers,
          success: function (res) {
            resolve(res);
          },
          error: function (err) {
            reject({ success: false, error: err });
          }
        });
      });
    },

    updateEntity: function (oModel, Entity, oRecord, method) {
      return new Promise((resolve, reject) => {
        oModel.update(Entity, oRecord, {
          method: method, // "PATCH" or "PUT"
          success: function (res) {
            resolve(res);
          },
          error: function (err) {
            reject({ success: false, error: err });
          }
        });
      });
    },
    deleteEntity: function (oModel, Entity) {
      return new Promise((resolve, reject) => {
        oModel.remove(Entity, {
          success: function () {
            resolve();
          },
          error: function (err) {
            reject({ success: false, error: err });
          }
        });
      });
    }
  };
});
