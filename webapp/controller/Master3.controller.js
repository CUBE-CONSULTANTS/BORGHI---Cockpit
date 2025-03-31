sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/library",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "../model/API",
    "../model/models",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (BaseController, JSONModel, Sorter, CoreLibrary, Fragment, MessageBox, MessageToast, API, models, formatter, Filter, FilterOperator) {
    "use strict";

    const SortOrder = CoreLibrary.SortOrder;

    return BaseController.extend("programmi.consegne.edi.controller.Master3", {
      formatter: formatter,

      onInit: async function () {
        this.setModel(models.createMainModel(), "main");
        this.setModel(models.createCountModel(), "count");
        let modF = models.createEdiFiltersModel();

        modF.setSizeLimit(1000000);
        this.setModel(modF, "filtersModel");
        this.getRouter().getRoute("master3").attachPatternMatched(this._onObjectMatched, this);
        let aComboBoxes = this.getView()
          .findAggregatedObjects(true)
          .filter(function (oControl) {
            return oControl instanceof sap.m.ComboBox;
          });

        aComboBoxes.forEach(function (oComboBox) {
          oComboBox.setFilterFunction(function (sTerm, oItem) {
            return oItem.getText().match(new RegExp(sTerm, "i")) || oItem.getKey().match(new RegExp(sTerm, "i"));
          });
        });
      },
      _onObjectMatched: async function (oEvent) {
        this._onRouteChange(oEvent)
        this.getOwnerComponent().getModel("datiAppoggio").setProperty("/currentPage", "master3");
        await this._getCounters(false);
        this.onFilterSelect(null, "01");
      },

      onFilterSelect: async function (oEvent, key) {
        this.showBusy(0);
        let oFlexibleColumnLayout = this.getOwnerComponent().getModel("layout");
        let sNextLayout = oFlexibleColumnLayout.getProperty("/actionButtonsInfo/endColumn/closeColumn");
        this.getModel("layout").setProperty("/layout", sNextLayout);
        let selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();
        !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
        switch (selectedKey) {
          case "01":
            await this.onSearchData(undefined, selectedKey);
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
          case "02":
            await this.onSearchData(undefined, selectedKey);
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
          case "03":
            await this.onSearchData(undefined, selectedKey);
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
          case "04":
            await this.onSearchData(undefined, selectedKey);
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
          case "05":
            await this.onSearchData(undefined, selectedKey);
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
          case "06":
            await this.onSearchData(undefined, selectedKey);
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
        }
        this.hideBusy(0);
      },
      onProcessaButton: async function (oEvent) {
        let key = this.getView().byId("idIconTabBar").getSelectedKey();
        let id;
        switch (key) {
          case "01":
            id = "treetableMain";
            break;
          case "02":
            id = "treetableCallOff";
            break;
          case "03":
            id = "treetableSB";
            break;
        }
        let table = this.getView().byId(id);
        try {
          let arrayToProcess = await this._returnPayload(table, "elab");
          if (arrayToProcess.length > 0) {
            this.processaItems(arrayToProcess);
          }
        } catch (error) {
          console.error("Errore durante la selezione delle posizioni:", error);
        }
      },

      importaPress: function (oEvent) {
        if (!this._oDialog2) {
          Fragment.load({
            id: this.getView().getId(),
            name: "programmi.consegne.edi.view.fragments.importMaster3",
            controller: this,
          }).then(
            function (oDialog2) {
              this._oDialog2 = oDialog2;
              this.getView().addDependent(this._oDialog2);
              this._oDialog2.open();
            }.bind(this)
          );
        } else {
          this._oDialog2.open();
        }
      },

      statoButtonPress: function (oEvent) {
        let oBindingContext;
        oEvent.getSource().getBindingContext("master3") === undefined
          ? (oBindingContext = oEvent.getSource().getBindingContext("master3CO"))
          : (oBindingContext = oEvent.getSource().getBindingContext("master3"));

        let log;
        oBindingContext.getObject().log ? (log = oBindingContext.getObject().log.results) : (log = oBindingContext.getObject().log_posizioni.results);
        log.sort((a, b) => {
          const timestampA = new Date(a.data).getTime() + a.ora.ms;
          const timestampB = new Date(b.data).getTime() + b.ora.ms;
          return timestampA - timestampB; 
        });

        let lastIndexMessage;
        oBindingContext.getObject().log ? (lastIndexMessage = oBindingContext.getObject().log.results.length - 1) : (lastIndexMessage = oBindingContext.getObject().log_posizioni.results.length - 1);
        let giorno = String(log[lastIndexMessage].data.getDate()).padStart(2, "0");
        let mese = String(log[lastIndexMessage].data.getMonth() + 1).padStart(2, "0");
        let anno = log[lastIndexMessage].data.getFullYear();
        let dataFormattata = `${giorno}/${mese}/${anno}`;

        let msTotali = log[lastIndexMessage].ora.ms;
        let ore = Math.floor(msTotali / (1000 * 60 * 60)) + 1;
        let minuti = Math.floor((msTotali % (1000 * 60 * 60)) / (1000 * 60));
        let secondi = Math.floor((msTotali % (1000 * 60)) / 1000);
        let ms = msTotali % 1000;
        let oraFormattata = `${String(ore).padStart(2, "0")}:${String(minuti).padStart(2, "0")}:${String(ms).padStart(3, "0")}`;
        let timestampCompleto = `${dataFormattata} ${oraFormattata}`;

        let message = `Data: ${timestampCompleto}\n ${log[lastIndexMessage].messaggio}`;

        MessageBox.information(message);
      },
      processaItems: function (items) {
        let itemList;
        let excluded = [];
        if (this.byId("idIconTabBar").getSelectedKey() === "02") {
          excluded = items.filter((x) => x.posizione_43_44 === "35");
          items = items.filter((x) => x.posizione_43_44 !== "35");
        }
        let message35;
        excluded.length > 0 ? (message35 = "Le posizioni con Reason 35 non verranno processate.") : (message35 = "");

        itemList = items
          .map((item) => {
            if (item.hasOwnProperty("posizione_6_13")) {
              return `Codice Cliente: ${item.testata.codice_terre_cliente} - Codice cliente materiale: ${item.posizione_6_28} - Progressivo Invio: ${item.testata.progressivo_invio} \n`;
            } else {
              return `Codice Cliente: ${item.testata.codice_cliente} - Codice cliente materiale: ${item.codice_cliente_materiale} - Progressivo Invio: ${item.testata.numero_progressivo_invio} \n`;
            }
          })
          .join("");

        let message = `Vuoi continuare con questi elementi? \n ${itemList}`;

        if (message35) {
          message = `${message35}\nVuoi continuare con questi elementi? \n ${itemList}`;
        }
        let that = this;

        sap.m.MessageBox.confirm(message, {
          icon: sap.m.MessageBox.Icon.WARNING,
          title: "Riepilogo",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          emphasizedAction: sap.m.MessageBox.Action.YES,
          onClose: async function (oAction) {
            if (oAction == "YES") {
              try {
                that.showBusy(0);
                let payload = [];
                items.forEach((x) => {
                  payload.push(x.id);
                });
                let obj = { id: payload };
                let oModel;
                let res;
                let key;
                if (this.byId("idIconTabBar").getSelectedKey() === "01") {
                  oModel = this.getOwnerComponent().getModel("modelloV2");
                  res = await API.createEntity(oModel, "/Processamento", obj);
                  key = "01";
                } else if (this.byId("idIconTabBar").getSelectedKey() === "02") {
                  oModel = this.getOwnerComponent().getModel("calloffV2");
                  res = await API.createEntity(oModel, "/Processamento", obj);
                  key = "02";
                }

                if (res.results.length > 0) {
                  MessageBox.show("Elaborazione in corso", {
                    title: "Processo di Elaborazione",
                    icon: sap.m.MessageBox.Icon.INFORMATION,
                    actions: [sap.m.MessageBox.Action.CLOSE],
                    emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                    onClose: async function (oAction) {
                      that._refreshData(key, false);
                    },
                  });
                } else {
                  MessageBox.error("Elaborazione non andata a buon fine");
                }
              } catch (error) {
                MessageBox.error("Errore durante l'elaborazione dei dati");
              } finally {
                that.hideBusy(0);
              }
            }
          }.bind(this),
        });
      },

      onCumulativi: async function (oEvent) {
        let obj = oEvent.getSource().getParent().getParent().getBindingContext("modelloReport").getObject();
        let numIdoc = obj.idoc_number;
        let dest = obj.destinatario;
        let rffon = obj.numero_ordine_acquisto;
        await this.getReportCumulativi(dest, numIdoc, rffon);
      },
      downloadTemplate: function (oEvent) {
        let sExcelFilePath = "programmi/consegne/edi/public/TemplateCaricamentoManuale.xlsx";
        let link = document.createElement("a");
        link.href = sap.ui.require.toUrl(sExcelFilePath);
        link.download = "TemplateCaricamentoManuale.xlsx";

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      },
      onUploadButtonPress: async function (oEvent) {
        let fileupload = this.getView().byId("FileUploader");
        let formData = new FormData();
        if (fileupload.oFileUpload.files[0]) {
          try {
            this.showBusy(0);
            formData.append("file", fileupload.oFileUpload.files[0]);
            let response = await fetch("/fiori/upload_excel", {
              method: "POST",
              body: formData,
            });
            if (!response.ok) {
              let errorText = await response.text();
              throw new Error(`Errore ${response.status}: ${errorText}`);
            } else {
              oEvent.getSource().getParent().getParent().getParent().close();
              MessageToast.show("File caricato con Successo");
              await this._refreshData("01", false);
            }
          } catch (error) {
            MessageBox.error("Errore durante il caricamento del File");
          } finally {
            this.hideBusy(0);
          }
        } else {
          MessageBox.error("Nessun file selezionato");
        }
      },
      reportSB: async function (oEvent) {
        // /sap/opu/odata/sap/ZEDIFACT_IDOC_SRV/SELFBILLING_VDA4908_REPORT_SET?$filter=(KNREF eq '0000707511' and KUNNR eq '00217881' and NOTA_CREDITO eq 'test' and DATA_NOTA eq '20250313' and NUM_BOLLA eq 'Off 25/2025' and DATA_BOLLA eq '20250313' and COD_ARTICOLO_CLIENTE eq 'test_art' and NUM_ORDINE eq '1234' and QUANT_PRELEVATA eq '1' and PREZZO eq '100' and VALORE eq '123')&$format=json,
        let aData = oEvent.getSource().getBindingContext("master3SB").getObject();
        let aPostData = [];
        if (Array.isArray(aData)) {
          aData.forEach((item) => {
            this._processItem(item, aPostData);
          });
        } else if (typeof aData === "object" && aData !== null) {
          this._processItem(aData, aPostData);
        }
        try {
          this.showBusy(0);
          let report = await API.createEntity(this.getOwnerComponent().getModel("selfBillingV2"), "/REPORT_SET", { DATI: aPostData }, {}, ["DATI,DATI($expand= DATI)"]);
          this.buildSpreadSheet(report.DATI.results);
        } catch (error) {
          MessageBox.error("Errore durante il recupero dei dati");
        } finally {
          this.hideBusy(0);
        }
      },
      _processItem: function (item, aPostData) {
        let supplier = item.supplier;
        let fatture = item.dettaglio_fattura || [];
        fatture.forEach((fattura) => {
          let numero_fattura = fattura.numero_fattura;
          let data_fattura = fattura.data_fattura;
          let ddt = fattura.riferimento_ddt?.results || [];
          ddt.forEach((data) => {
            let payload = {
              KUNNR: supplier,
              NOTA_CREDITO: numero_fattura,
              DATA_NOTA: formatter.formatDateToYYYYMMDD(data_fattura),
              NUM_ORDINE: data.order_number,
              KNREF: data.nad_cn_consegna,
              NUM_BOLLA: data.num_ddt_cliente,
              DATA_BOLLA: formatter.formatDateToYYYYMMDD(data.data_ddt_cliente),
              COD_ARTICOLO_CLIENTE: data.riga_fattura?.codice_articolo_cliente_da_transcodificare,
              QUANT_PRELEVATA: data.riga_fattura?.qty_delivery,
              PREZZO: data.riga_fattura?.unit_price,
              VALORE: data.riga_fattura?.total_price,
            };
            aPostData.push(payload);
          });
        });
      },
    });
  }
);
