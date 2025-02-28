sap.ui.define(
  ["../model/API", "../model/formatter"],
  function (API, formatter) {
    "use strict";
    return {
      buildFilters: function (oFilterSet,key) {
        let aFilters = [];
        if(key === '01'){
          if (oFilterSet.dataRic) {
            let oDataRic = formatter.parseDate(oFilterSet.dataRic);
            oDataRic.setHours(1, 0, 0, 0);
            aFilters.push(
              new sap.ui.model.Filter(
                "data_ricezione",
                sap.ui.model.FilterOperator.EQ,
                oDataRic
              )
            );
          }
          if (oFilterSet.numProg && oFilterSet.numProg.value) {
            aFilters.push(
              new sap.ui.model.Filter(
                "numero_progressivo_invio",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.numProg.value
              )
            );
          }
          if (oFilterSet.cliente && oFilterSet.cliente.value) {
            aFilters.push(
              new sap.ui.model.Filter(
                "codice_seller",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.cliente.value
              )
            );
          }
          if (oFilterSet.materiale && oFilterSet.materiale.value) {
            aFilters.push(
              new sap.ui.model.Filter(
                "posizioni/codice_materiale_fornitore",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.materiale.value
              )
            );
          }
        }
        if (key === '02'){
          if (oFilterSet.dataRic) {
            let oDataRic = formatter.parseDate(oFilterSet.dataRic);
            oDataRic.setHours(1, 0, 0, 0);
            aFilters.push(
              new sap.ui.model.Filter(
                "master/data_ricezione",
                sap.ui.model.FilterOperator.EQ,
                oDataRic
              )
            );
          }
          if (oFilterSet.cliente && oFilterSet.cliente.value) {
            aFilters.push(
              new sap.ui.model.Filter(
                "codice_cliente_terre",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.cliente.value
              )
            );
          }
          if (oFilterSet.materiale && oFilterSet.materiale.value) {
            aFilters.push(
              new sap.ui.model.Filter(
                "posizioni_testata/posizione_6_28",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.materiale.value
              )
            );
          }
          if (oFilterSet.reason && oFilterSet.reason.value) {
            aFilters.push(
              new sap.ui.model.Filter(
                "posizioni_testata/posizione_43_44",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.reason.value
              )
            );
          }
        }
        if (key === '03'){}
        if(key === '06'){
          if (oFilterSet.dataRic) {
            let oDataRic = formatter.parseDate(oFilterSet.dataRic);
            oDataRic.setHours(1, 0, 0, 0);
            aFilters.push(
              new sap.ui.model.Filter(
                "data_ricezione",
                sap.ui.model.FilterOperator.EQ,
                oDataRic
              )
            );
          }
          if (oFilterSet.nomeFile && oFilterSet.nomeFile.value) {
            aFilters.push(
              new sap.ui.model.Filter(
                "filename",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.nomeFile.value
              )
            );
          }  
        }
        return aFilters;
      },
      _formatExcelData: function(aData) {
        debugger;
        let aExportData = [];
        aData.forEach(item => {
            let row = this._cleanAndFormatData(item);
            let positions = item.posizioni || item.posizioni_testata || [];
            positions.forEach(position => {
                let positionRow = { ...row, ...this._cleanAndFormatData(position) };
                let schedules = position.schedulazioni?.results || [];
                schedules.forEach(schedule => {
                    let scheduleRow = { ...positionRow, ...this._cleanAndFormatData(schedule) };
                    aExportData.push(scheduleRow); 
                });
                aExportData.push(positionRow); 
            });
            aExportData.push(row); 
        });
        return aExportData;
    },
    _cleanAndFormatData: function(data) {
      debugger
        if (!data || typeof data !== "object") return data; 
        let cleanedData = { ...data };
        [
            "posizioni", "posizioni_testata", "id", "id_master", "edi",
            "idoc_paylod", "log_testata", "__metadata", "payload_db",
            "idoc_payload_db", "archiviato", "template", "tipo","posizione",
            "versione", "numero_idoc", "master","log","id_posizione","id_testata","testata"
        ].forEach(key => delete cleanedData[key]);
        if (cleanedData.master) {
            ["edi", "payload_db","id"].forEach(key => delete cleanedData.master[key]);
        }
        Object.keys(cleanedData).forEach(key => {
          if (key.toLowerCase().includes("data")) {
            cleanedData[key] = formatter.formatDate(cleanedData[key]);
          }
          if(key.toLowerCase().includes("posizione_14_19")){
            cleanedData[key] = formatter.returnDate( cleanedData[key],"yyyyMMdd","dd/MM/YYYY");
          }
        });
        return cleanedData;
      },
      flatData: function (data) {
        debugger;
        const flatData = [];
        let dataArray = Array.isArray(data) ? data : [data];
        dataArray.forEach((item) => {
          let testataRow = { ...item };
          delete testataRow?.posizioni;
          delete testataRow?.posizioni_testata;
          delete testataRow?.id;
          delete testataRow?.id_master;
          delete testataRow?.edi;
          delete testataRow?.idoc_paylod;
          delete testataRow?.log_testata;
          delete testataRow?.__metadata;
          delete testataRow?.payload_db;
          delete testataRow?.idoc_payload_db;
          delete testataRow?.archiviato;
          delete testataRow?.template;
          delete testataRow?.tipo;
          delete testataRow?.versione;
          delete testataRow?.numero_idoc;

          delete testataRow?.master?.edi;
          delete testataRow?.master?.payload_db;
          delete testataRow?.master;
          
          debugger
          Object.keys(testataRow).forEach(key => {
            if (key.toLowerCase().includes("data")) {
                testataRow[key] = formatter.formatDate(testataRow[key]);
            }
          });
          flatData.push(testataRow);
          let positions
          item.posizioni ? positions = item.posizioni : positions = item.posizioni_testata
          if (Array.isArray(positions) && positions.length > 0) {
            positions.forEach((posizione) => {
              let posizioneRow = { ...posizione };
              delete posizioneRow?.id;
              delete posizioneRow?.id_testata;
              delete posizioneRow?.idoc_payload;
              delete posizioneRow?.log;
              delete posizioneRow?.testata;
              delete posizioneRow?.schedulazioni;
              delete posizioneRow?.__metadata
              Object.keys(posizioneRow).forEach(key => {
                if (key.toLowerCase().includes("data")) {
                    posizioneRow[key] = formatter.formatDate(posizioneRow[key]);
                }
                if(key.toLowerCase().includes("posizione_14_19")){
                  posizioneRow[key] = formatter.returnDate(posizioneRow[key],"yyyyMMdd","dd/MM/YYYY");
                }
              });
              flatData.push(posizioneRow);
              if (
                posizione.schedulazioni?.results &&
                posizione.schedulazioni.results.length > 0
              ) {
                posizione.schedulazioni.results.forEach((schedulazione) => {
                  let schedulazioneRow = { ...schedulazione };
                  delete schedulazioneRow?.id;
                  delete schedulazioneRow?.id_posizione;
                  delete schedulazioneRow?.posizione;
                  delete schedulazioneRow?.__metadata;
                  Object.keys(schedulazioneRow).forEach(key => {
                    if (key.toLowerCase().includes("data")) {
                        schedulazioneRow[key] = formatter.formatDate(schedulazioneRow[key]);
                    }
                  });
                  flatData.push(schedulazioneRow);
                });
              }
            });
          }
        });

        return flatData;
      },
    };
  }
);
