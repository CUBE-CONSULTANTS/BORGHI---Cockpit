sap.ui.define(
  ["../model/API", "../model/formatter"],
  function (API, formatter) {
    "use strict";
    return {
      buildFilters: function (oFilterSet) {
        let aFilters = [];
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
        return aFilters;
      },
      flatData: function (data) {
        debugger;
        const flatData = [];
        let dataArray = Array.isArray(data) ? data : [data];
        dataArray.forEach((item) => {
          let testataRow = { ...item };
          delete testataRow.posizioni;
          delete testataRow.id;
          delete testataRow.edi;
          delete testataRow.payload_db;
          delete testataRow.template;
          delete testataRow.tipo;
          delete testataRow.versione;
          delete testataRow.numero_idoc;
          debugger
          Object.keys(testataRow).forEach(key => {
            if (key.toLowerCase().includes("data")) {
                testataRow[key] = formatter.formatDate(testataRow[key]);
            }
          });
          flatData.push(testataRow);

          if (Array.isArray(item.posizioni) && item.posizioni.length > 0) {
            item.posizioni.forEach((posizione) => {
              let posizioneRow = { ...posizione };
              delete posizioneRow.id;
              delete posizioneRow.id_testata;
              delete posizioneRow.idoc_payload;
              delete posizioneRow.num_idoc;
              delete posizioneRow.log;
              delete posizioneRow.testata;
              delete posizioneRow.schedulazioni;
              Object.keys(posizioneRow).forEach(key => {
                if (key.toLowerCase().includes("data")) {
                    posizioneRow[key] = formatter.formatDate(posizioneRow[key]);
                }
              });
              flatData.push(posizioneRow);

              if (
                posizione.schedulazioni?.results &&
                posizione.schedulazioni.results.length > 0
              ) {
                posizione.schedulazioni.results.forEach((schedulazione) => {
                  let schedulazioneRow = { ...schedulazione };
                  delete schedulazioneRow.id;
                  delete schedulazioneRow.id_posizione;
                  delete schedulazioneRow.posizione;
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
