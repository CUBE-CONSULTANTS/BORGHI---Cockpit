sap.ui.define(
  ["../model/API", "../model/formatter"],
  function (API, formatter) {
    "use strict";
    return {
      getColumnConfig: function (tableId) {
        const columnMapper = {
          tablePos: [
            {
              key: "stato_col",
              label: "Stato",
              path: "Stato",
            },
            {
              key: "dettaglio_col",
              label: " ",
              path: "",
            },
            {
              key: "destinatario_col",
              label: "Destinatario",
              path: "destinatario",
            },
            {
              key: "codice_cliente_materiale_col",
              label: "Codice cliente materiale",
              path: "codice_cliente_materiale",
            },
            {
              key: "codice_materiale_fornitore_col",
              label: "Codice materiale fornitore",
              path: "codice_materiale_fornitore",
            },
            {
              key: "descrizione_materiale_col",
              label: "Descrizione materiale",
              path: "descrizione_materiale",
            },
            {
              key: "punto_scarico_col",
              label: "Punto di scarico",
              path: "punto_scarico",
            },
            {
              key: "destinazione_interna_col",
              label: "Destinazione interna",
              path: "destinazione_interna",
            },
            {
              key: "testo_riga_col",
              label: "Testo riga",
              path: "testo_riga",
            },
            {
              key: "data_inizio_calc_quantita_cumulata_col",
              label: "Data inizio calcolo quantità cumulata",
              path: "data_inizio_calc_quantita_cumulata",
            },
            {
              key: "progressivo_invio_col",
              label: "Progressivo invio",
              path: "progressivo_invio",
            },
            {
              key: "data_progressivo_invio_col",
              label: "Data progressivo invio",
              path: "data_progressivo_invio",
            },
            {
              key: "numero_ultima_schedulazione_ricevuta_col",
              label: "Numero Ultima Schedulazione Ricevuta",
              path: "numero_ultima_schedulazione_ricevuta",
            },
            {
              key: "data_numero_ultima_schedulazione_ricevuta_col",
              label: "Data Numero Ultima Schedulazione Ricevuta",
              path: "data_numero_ultima_schedulazione_ricevuta",
            },
            {
              key: "numero_ordine_acquisto_col",
              label: "Numero ordine di acquisto",
              path: "numero_ordine_acquisto",
            },
            {
              key: "ultima_quantita_spedita_col",
              label: "Ultima quantità spedita",
              path: "ultima_quantita_spedita",
            },
            {
              key: "numero_ultima_bolla_ricevuta_cliente_col",
              label: "Numero Ultima bolla ricevuta dal cliente",
              path: "numero_ultima_bolla_ricevuta_cliente",
            },
            {
              key: "data_ultima_bolla_ricevuta_col",
              label: "Data ultima bolla ricevuta",
              path: "data_ultima_bolla_ricevuta",
            },
            {
              key: "quantita_cumulativa_ricevuta_col",
              label: "Quantità cumulativa ricevuta",
              path: "quantita_cumulativa_ricevuta",
            },
            {
              key: "ultima_quantita_ordinata_col",
              label: "Ultima quantità ordinata",
              path: "",
            },
            {
              key: "release_number_col",
              label: "Release number",
              path: "",
            },
            {
              key: "quantita_cumulativa_precedente_col",
              label: "Quantità cumulativa precedente",
              path: "",
            },
            {
              key: "quantita_in_backorder_col",
              label: "Quantità in backorder",
              path: "",
            },
            {
              key: "quantita_ricevuta_e_accettata_col",
              label: "Quantità ricevuta e accettata",
              path: "",
            },
            {
              key: "contatto_cliente_col",
              label: "Contatto cliente",
              path: "contatto_cliente",
            },
            {
              key: "informazioni_contatto_email_col",
              label: "Info contatto email",
              path: "informazioni_contatto_email",
            },
            {
              key: "informazioni_contatto_telefonico_col",
              label: "Info contatto telefonico",
              path: "informazioni_contatto_telefonico",
            },
            {
              key: "informazioni_contatto_fax_col",
              label: "Info contatto fax",
              path: "informazioni_contatto_fax",
            },
          ],
          //altre tabelle
        };
        return columnMapper[tableId] || [];
      },
      buildFilters: function (oFilterSet, key) {
        let aFilters = [];
        if (key === "01") {
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
        if (key === "02") {
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
        if (key === "03") {
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
          if (oFilterSet.clienti && oFilterSet.clienti.value) {
            aFilters.push(
              new sap.ui.model.Filter(
                "customer",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.clienti.value
              )
            );
          }
          if (oFilterSet.fornitori && oFilterSet.fornitori.value) {
            aFilters.push(
              new sap.ui.model.Filter(
                "supplier",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.fornitori.value
              )
            );
          }
          if (oFilterSet.fatture && oFilterSet.fatture.value) {
            aFilters.push(
              new sap.ui.model.Filter(
                "dettaglio_fattura/numero_fattura",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.fatture.value
              )
            );
          }
        }
        if (key === "06") {
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
      _formatExcelData: function (aData) {
        debugger;
        let aExportData = [];
        aData.forEach((item) => {
          let row = this._cleanAndFormatData(item);
          let positions =
            item.posizioni ||
            item.posizioni_testata ||
            item.dettaglio_fattura ||
            [];

          positions.forEach((position) => {
            debugger;
            let positionRow = { ...row, ...this._cleanAndFormatData(position) };
            let schedules =
              position.schedulazioni?.results ||
              position.riferimento_ddt?.results ||
              Array.isArray(position.riferimento_ddt)
                ? position.riferimento_ddt
                : [position.riferimento_ddt] || [];
            debugger;
            schedules.forEach((schedule) => {
              let scheduleRow = {
                ...positionRow,
                ...this._cleanAndFormatData(schedule),
              };
              debugger;
              let invoiceLines = Array.isArray(schedule.riga_fattura)
                ? schedule.riga_fattura
                : [schedule.riga_fattura];
              invoiceLines.forEach((invoice) => {
                let invoiceRow = {
                  ...scheduleRow,
                  ...this._cleanAndFormatData(invoice),
                };
                aExportData.push(invoiceRow);
              });
              aExportData.push(scheduleRow);
            });
            aExportData.push(positionRow);
          });
          aExportData.push(row);
        });
        return aExportData;
      },
      _cleanAndFormatData: function (data) {
        debugger;
        if (!data || typeof data !== "object") return data;
        let cleanedData = { ...data };
        [
          "posizioni",
          "posizioni_testata",
          "id",
          "id_master",
          "edi",
          "idoc_paylod",
          "log_testata",
          "__metadata",
          "payload_db",
          "idoc_payload_db",
          "archiviato",
          "template",
          "posizione",
          "dettaglio_fattura",
          "riferimento_ddt",
          "riga_fattura",
          "id_dettaglio_fattura",
          "numero_idoc",
          "master",
          "log",
          "id_posizione",
          "id_testata",
          "testata",
        ].forEach((key) => delete cleanedData[key]);
        if (cleanedData.master) {
          ["edi", "payload_db", "id"].forEach(
            (key) => delete cleanedData.master[key]
          );
        }
        Object.keys(cleanedData).forEach((key) => {
          if (
            key.toLowerCase().includes("data") ||
            key.toLowerCase().includes("date")
          ) {
            cleanedData[key] = formatter.formatDate(cleanedData[key]);
          }
          if (key.toLowerCase().includes("posizione_14_19")) {
            cleanedData[key] = formatter.returnDate(
              cleanedData[key],
              "yyyyMMdd",
              "dd/MM/YYYY"
            );
          }
        });
        return cleanedData;
      },
      // flatData: function (data) {
      //   debugger;
      //   const flatData = [];
      //   let dataArray = Array.isArray(data) ? data : [data];
      //   dataArray.forEach((item) => {
      //     let testataRow = { ...item };
      //     delete testataRow?.posizioni;
      //     delete testataRow?.posizioni_testata;
      //     delete testataRow?.id;
      //     delete testataRow?.id_master;
      //     delete testataRow?.edi;
      //     delete testataRow?.idoc_paylod;
      //     delete testataRow?.log_testata;
      //     delete testataRow?.__metadata;
      //     delete testataRow?.payload_db;
      //     delete testataRow?.idoc_payload_db;
      //     delete testataRow?.archiviato;
      //     delete testataRow?.template;
      //     delete testataRow?.tipo;
      //     delete testataRow?.versione;
      //     delete testataRow?.numero_idoc;

      //     delete testataRow?.master?.edi;
      //     delete testataRow?.master?.payload_db;
      //     delete testataRow?.master;

      //     debugger
      //     Object.keys(testataRow).forEach(key => {
      //       if (key.toLowerCase().includes("data")) {
      //           testataRow[key] = formatter.formatDate(testataRow[key]);
      //       }
      //     });
      //     flatData.push(testataRow);
      //     let positions
      //     item.posizioni ? positions = item.posizioni : positions = item.posizioni_testata
      //     if (Array.isArray(positions) && positions.length > 0) {
      //       positions.forEach((posizione) => {
      //         let posizioneRow = { ...posizione };
      //         delete posizioneRow?.id;
      //         delete posizioneRow?.id_testata;
      //         delete posizioneRow?.idoc_payload;
      //         delete posizioneRow?.log;
      //         delete posizioneRow?.testata;
      //         delete posizioneRow?.schedulazioni;
      //         delete posizioneRow?.__metadata
      //         Object.keys(posizioneRow).forEach(key => {
      //           if (key.toLowerCase().includes("data")) {
      //               posizioneRow[key] = formatter.formatDate(posizioneRow[key]);
      //           }
      //           if(key.toLowerCase().includes("posizione_14_19")){
      //             posizioneRow[key] = formatter.returnDate(posizioneRow[key],"yyyyMMdd","dd/MM/YYYY");
      //           }
      //         });
      //         flatData.push(posizioneRow);
      //         if (
      //           posizione.schedulazioni?.results &&
      //           posizione.schedulazioni.results.length > 0
      //         ) {
      //           posizione.schedulazioni.results.forEach((schedulazione) => {
      //             let schedulazioneRow = { ...schedulazione };
      //             delete schedulazioneRow?.id;
      //             delete schedulazioneRow?.id_posizione;
      //             delete schedulazioneRow?.posizione;
      //             delete schedulazioneRow?.__metadata;
      //             Object.keys(schedulazioneRow).forEach(key => {
      //               if (key.toLowerCase().includes("data")) {
      //                   schedulazioneRow[key] = formatter.formatDate(schedulazioneRow[key]);
      //               }
      //             });
      //             flatData.push(schedulazioneRow);
      //           });
      //         }
      //       });
      //     }
      //   });

      //   return flatData;
      // },
    };
  }
);
