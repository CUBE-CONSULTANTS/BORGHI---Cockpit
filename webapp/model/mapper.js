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
            // {
            //   key: "utente_col",
            //   label: "Utente",
            //   path: "utente",
            // },
            // {
            //   key: "ora_errore_col",
            //   label: "Ora Errore",
            //   path: "ora/ms",
            // },
            // {
            //   key: "data_errore_col",
            //   label: "Data Errore",
            //   path: "data",
            // },
            // {
            //   key: "messaggio_col",
            //   label: "Messaggio",
            //   path: "messaggio",
            // },
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
              key: "cumulativo_quantita_ordinata_col",
              label: "Cumulativo Quant Ord",
              path: "cumulativo_quantita_ordinata",
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
          tablePosCO: [
            {key: "stato_col",label: "Stato",path: "Stato"},
            { key: "cliente_col", label: "Cliente", path: "posizione_77_86" },
            { key: "reason_col", label: "Reason", path: "posizione_43_44" },
            { key: "progr_prelievo_col", label: "Progressivo Prelievo", path: "posizione_6_13" },
            { key: "data_progr_prelievo_col", label: "Data Prelievo per mov mag.", path: "posizione_14_19" },
            { key: "data_messaggio_col", label: "Data Messaggio", path: "posizione_14_19" },
            { key: "DDT_col", label: "DDT", path: "posizione_121_128" },
            { key: "data_DDT_col", label: "Data DDT", path: "posizione_14_19" },
            {
              key: "progressivo_invio_col",
              label: "Progressivo Invio",
              path: "posizione_6_13",
            },
            {
              key: "codice_materiale_col",
              label: "Cod. Mat.",
              path: "posizione_6_28",
            },
            {
              key: "punto_scarico_col",
              label: "P. scarico",
              path: "posizione_20_24",
            },
            {
              key: "nord_cliente_col",
              label: "N Ord Presso Cliente",
              path: "posizione_31_42",
            },
            { key: "num_riga_col", label: "Num riga", path: "posizione_87_89" },
            { key: "quantità_col", label: "Quantità", path: "posizione_53_65" },
            { key: "Udm_col", label: "Udm", path: "posizione_66_67" },
            {
              key: "stab_consegna_col",
              label: "Stab. Consegna",
              path: "posizione_49_51",
            },
          ],
          tablePosSB: [
            { key: "num_fattura_col", label: "Num Fattura", path: "numero_fattura" },
            { key: "data_fattura_col", label: "Data Fattura", path: "data_fattura" },
            { key: "data_scadenza_fattura_col", label: "Data Scadenza Fattura", path: "data_scadenza_fattura" },
            { key: "DDT_terre_col", label: "DDT Terre", path: "ddt_terre" },
            { key: "num_DDT_cliente_col", label: "Num. DDT Cliente", path: "num_ddt_cliente" },
            { key: "data_DDT_col", label: "Data DDT", path: "data_ddt_cliente" },
            { key: "num_ordine_col", label: "Num. Ordine", path: "order_number" },
            { key: "transazione_col", label: "Transazione", path: "transaction" },
            { key: "cod_articolo_col", label: "Cod Articolo", path: "codice_articolo_cliente_da_transcodificare" },
            { key: "versione_col", label: "Versione", path: "version" },
            { key: "vat_col", label: "Vat", path: "vat" },
            { key: "cash_col", label: "Cash", path: "cash" },
            { key: "prezzo_totale_col", label: "Prezzo Totale", path: "total_pirce" },
            { key: "tot_prezzo_tot_col", label: "Totale dal Prezzo Tot", path: "total_from_total_price" },
            { key: "unita_prezzo_col", label: "Unità Prezzo", path: "unit_price" },
            { key: "prezzo_unit_col", label: "Prezzo Unit", path: "price_unit" },
            { key: "quantita_consegna_col", label: "Quantità Consegna", path: "qty_delivery" },
            { key: "udm_col", label: "UdM", path: "um" },
            { key: "num_idoc_col", label: "Num IDoc", path: "numero_idoc" },
            { key: "invoice_code_col", label: "Invoice Code", path: "sb_invoice_code" },
            { key: "sign_01_col", label: "Sign 01", path: "sign_code_1" },
            { key: "sign_02_col", label: "Sign 02", path: "sign_code_2" },
            { key: "subcharger_deduction_col", label: "Subcharger Deduction", path: "subcharger_deduction" },
            { key: "consignment_col", label: "Consignment", path: "consignment" },
            { key: "paese_col", label: "Paese", path: "country" },
            { key: "valuta_col", label: "Valuta", path: "currency" },
            { key: "tot_vat_col", label: "Tot Vat", path: "total_vat" },
            { key: "tot_invoice_col", label: "Tot Invoice", path: "total_sb_invoice" },
            { key: "tot_sconto_col", label: "Tot Sconto", path: "total_cash_discount" },
            { key: "stab_consegna_col", label: "Stab. Consegna", path: "posizione_49_51" }
          ],
        };
        return columnMapper[tableId] || [];
      },
      buildFilters: function (oFilterSet, key,operator) {
        let aFilters = [];
        let archivVal
        operator === 'eq'? archivVal = true : archivVal = false
        
        if (key === "01") {
          aFilters.push(new sap.ui.model.Filter(
            "archiviazione",
            sap.ui.model.FilterOperator.EQ,
            archivVal
          ))
          if (oFilterSet.dataRic) {
            let oDataRic = formatter.returnDate(oFilterSet.dataRic,"dd/MM/yyyy","yyyyMMdd");            
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
                "codice_cliente",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.cliente.value
              )
            );
          }
          if (oFilterSet.materiale && oFilterSet.materiale.value) {
            aFilters.push(
              new sap.ui.model.Filter(
                "posizioni/codice_cliente_materiale",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.materiale.value
              )
            );
          }
          if (oFilterSet.stato && oFilterSet.stato.value) {
            if(oFilterSet.stato.value === "In Errore"){
              oFilterSet.stato.value = "51"
            }else if (oFilterSet.stato.value === "Non Elaborato"){
              oFilterSet.stato.value = null
            }else if(oFilterSet.stato.value === "Elaborato Positivamente"){
              oFilterSet.stato.value = "53"
            }
            else if(oFilterSet.stato.value === "In Elaborazione"){
              oFilterSet.stato.value = "64"
            }
            aFilters.push(
              new sap.ui.model.Filter(
                "stato",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.stato.value
              )
            );
          }
          if (oFilterSet.messaggio && oFilterSet.messaggio.value) {
            
            aFilters.push(
              new sap.ui.model.Filter(
                "messaggio",
                sap.ui.model.FilterOperator.EQ,
                oFilterSet.messaggio.value
              )
            );
          }
        }
        if (key === "02") {
          if (oFilterSet.dataRic) {
            let oDataRic = formatter.returnDate(oFilterSet.dataRic,"dd/MM/yyyy","yyyyMMdd");
            aFilters.push(
              new sap.ui.model.Filter(
                "data_ricezione",
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
            let oDataRic = formatter.returnDate(oFilterSet.dataRic,"dd/MM/yyyy","yyyyMMdd");
            // eq 2025-01-22T00:00:00Z    
            let year = oDataRic.substring(0, 4);
            let month = oDataRic.substring(4, 6);
            let day = oDataRic.substring(6, 8);
            let formattedDate = new Date(`${year}-${month}-${day}T00:00:00Z`).toISOString()
            aFilters.push(
              new sap.ui.model.Filter(
                "data_ricezione",
                sap.ui.model.FilterOperator.EQ,
                formattedDate
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
          aFilters.push(new sap.ui.model.Filter(
            "archiviazione",
            sap.ui.model.FilterOperator.EQ,
            archivVal
          ))
          if (oFilterSet.dataRic) {
            let oDataRic = formatter.returnDate(oFilterSet.dataRic,"dd/MM/yyyy","yyyyMMdd");
            
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
      _formatCumulativi: function (aData) {
        
        aData.forEach((element) => {
          element.DataFineCalcCumu = formatter.returnDate(element.DataFineCalcCumu, "yyyyMMdd", "dd/MM/yyyy");
          element.DataInitCalcCumu = formatter.returnDate(element.DataInitCalcCumu, "yyyyMMdd", "dd/MM/yyyy");
          element.DataLips1 = formatter.returnDate(element.DataLips1, "yyyyMMdd", "dd/MM/yyyy");
          element.DataLips2 = formatter.returnDate(element.DataLips2, "yyyyMMdd", "dd/MM/yyyy");
          element.DataLips3 = formatter.returnDate(element.DataLips3, "yyyyMMdd", "dd/MM/yyyy");
          delete element.__metadata;
        });

        let mapping = {
          IdocNum: "Numero IDOC",
          DataFineCalcCumu: "Data fine calcolo cumulativi",
          DataInitCalcCumu: "Data inizio calcolo cumulativi",
          Vbeln: "Scheduling Agreement",
          Posnr: "N° pos",
          Kunnr: "Cliente",
          Name1: "Ragione sociale",
          Matnr: "Cod Articolo",
          RFFON: "Num Ordine",
          CumuRicevuto: "Cumulativo Ricevuto",
          CumuSped: "Cumulativo Spedito",
          CumuTran: "Cumulativo in transito",
          Stabilimento: "Stabilimento",
          Meins: "UdM",
          DataLips1: "Data DDT 1",
          NumeroLips1: "Numero DDT 1",
          QuanLips1: "Quantità DDT 1",
          DataLips2: "Data DDT 2",
          NumeroLips2: "Numero DDT 2",
          QuanLips2: "Quantità DDT 2",
          DataLips3: "Data DDT 3",
          NumeroLips3: "Numero DDT 3",
          QuanLips3: "Quantità DDT 3",
        };

        let newDataset = aData.map((element) => {
          let newElement = {};
          for (let key in element) {
            if (mapping[key]) {
              newElement[mapping[key]] = element[key];
            } else {
              newElement[key] = element[key];
            }
          }
          return newElement;
        });
        
        let output = [];
        newDataset.forEach((element) => {
          let riga = {
            "Dettaglio Cumulativi": "->",
            "Numero IDOC": element["Numero IDOC"],
            "Data fine calcolo cumulativi": element["Data fine calcolo cumulativi"],
            "Data inizio calcolo cumulativi": element["Data inizio calcolo cumulativi"],
            "Scheduling Agreement": element["Scheduling Agreement"],
            "N° pos": element["N° pos"],
            "Cliente": element["Cliente"],
            "Ragione sociale": element["Ragione sociale"],
            "Cod Articolo": element["Cod Articolo"],
            "Num Ordine": element["Num Ordine"],
            "Cumulativo Ricevuto": element["Cumulativo Ricevuto"],
            "Cumulativo Spedito": element["Cumulativo Spedito"],
            "Cumulativo in transito": element["Cumulativo in transito"],
            "Stabilimento": element["Stabilimento"],
            "UdM": element["UdM"],
            
            "Dettaglio DDT": "->",
            "Data DDT 1": element["Data DDT 1"],
            "Numero DDT 1": element["Numero DDT 1"],
            "Quantità DDT 1": element["Quantità DDT 1"],
             "Data DDT 2": element["Data DDT 2"],
            "Numero DDT 2": element["Numero DDT 2"],
            "Quantità DDT 2": element["Quantità DDT 2"],
            "Data DDT 3": element["Data DDT 3"],
            "Numero DDT 3": element["Numero DDT 3"],
            "Quantità DDT 3": element["Quantità DDT 3"],
          }
        
          output.push(riga);
          
        });
      
        return output;
      },
      _formatExcelData: function (aData) {
        
        let aExportData = [];
        aData.forEach((item) => {
          let row = this._cleanAndFormatData(item);
          
          let positions =
            item.posizioni || 
            item.posizioni_testata ||
            item.dettaglio_fattura ||
            [];

          if(positions.results ){
            positions = (Object.values(positions.results))
          }  
          positions.forEach((position) => {
            
            let positionRow = { ...row, ...this._cleanAndFormatData(position) };
            let schedules =
              (position.schedulazioni?.results &&
                position.schedulazioni.results.length > 0 &&
                position.schedulazioni.results) ||
              (position.riferimento_ddt?.results &&
                position.riferimento_ddt.results.length > 0 &&
                position.riferimento_ddt.results) ||
              (Array.isArray(position.riferimento_ddt) &&
                position.riferimento_ddt.length > 0 &&
                position.riferimento_ddt) ||
              (position.riferimento_ddt ? [position.riferimento_ddt] : []);
            if (schedules.length > 0) {
              schedules.forEach((schedule) => {
                let scheduleRow = {
                  ...positionRow,
                  ...this._cleanAndFormatData(schedule),
                };
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
            }
            aExportData.push(positionRow);
          });
          aExportData.push(row);
        });
        return aExportData;
      },
      _cleanAndFormatData: function (data) {
        
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
          "log_posizioni",
          "id_posizione",
          "id_testata",
          "testata",
          "schedulazioni",
          "archiviazione"
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
          if (key.toLowerCase().includes("posizione_14_19") && !cleanedData[key].includes("/")) {
            cleanedData[key] = formatter.returnDate(cleanedData[key],"yyyyMMdd","dd/MM/YYYY");
          }
        });
        if(cleanedData.hasOwnProperty('posizione_14_19')){
          cleanedData = this.renameColumns(cleanedData)
        }
        return cleanedData;
      },
      renameColumns: function(data){
        
        const columnMapping = {
          "posizione_6_28": "Cod. Articolo Cliente",
          "posizione_20_24": "Punto di scarico",
          "posizione_31_42": "Num. Ordine presso Cliente",
          "posizione_43_44": "Reason",
          "posizione_49_51": "Stabilimento consegna",
          "posizione_53_65": "Quantità",
          "posizione_66_67": "Udm",
          "posizione_77_86": "Cod Terre Cliente",
          "posizione_87_89": "Numero riga DDT",
          "posizione_121_128": "DDT"
        };
        let renamedData = {};
        if (data.hasOwnProperty("posizione_6_13") && data.hasOwnProperty("posizione_43_44")) {
          let value = data["posizione_6_13"];
          let tipoDocumento = data["posizione_43_44"];
  
          if (tipoDocumento === "36") {
              renamedData["Progr. Prelievo"] = value;
          } else if (tipoDocumento === "35") {
              renamedData["Progr. Invio"] = value;
          } else if (tipoDocumento === "30" || tipoDocumento === "33") {
              renamedData["DDT"] = value;
          }
        }
        if (data.hasOwnProperty("posizione_14_19") && data.hasOwnProperty("posizione_43_44")) {
          let value = data["posizione_14_19"];
          let tipoDocumento = data["posizione_43_44"];
  
          if (tipoDocumento === "36") {
              renamedData["Data Prelievo mov mag."] = value;
          } else if (tipoDocumento === "35") {
              renamedData["Data Messaggio"] = value;
          } else if (tipoDocumento === "30" || tipoDocumento === "33") {
              renamedData["Data DDT"] = value;
          }
        }
        Object.keys(data).forEach((key) => {
          if (!["posizione_6_13", "posizione_14_19"].includes(key)) {
              let newKey = columnMapping[key] || key;
              renamedData[newKey] = data[key];
          }
        });
        return renamedData;
      },
      // flatData: function (data) {
      //   
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

      //     
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
