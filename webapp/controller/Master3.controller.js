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
  function (
    BaseController,
    JSONModel,
    Sorter,
    CoreLibrary,
    Fragment,
    MessageBox,
    MessageToast,
    API,
    models,
    formatter,
    Filter,
    FilterOperator
  ) {
    "use strict";

    const SortOrder = CoreLibrary.SortOrder;

    return BaseController.extend("programmi.consegne.edi.controller.Master3", {
      formatter: formatter,

      onInit: async function () {
        this.setModel(models.createMainModel(), "main");
        this.setModel(models.createCountModel(), "count");
        this.setModel(models.createEdiFiltersModel(), "filtersModel");
        this.getRouter().getRoute("master3").attachPatternMatched(this._onObjectMatched, this);
      },
      _onObjectMatched: async function (oEvent) {
        this.getOwnerComponent().getModel("datiAppoggio").setProperty("/currentPage", "master3");
        await this._getCounters(false);
        this.onFilterSelect(null, "01");
      },

      onFilterSelect: async function (oEvent, key) {
        this.showBusy(0);
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

      downloadExcelFile: function (oEvent) {
        let selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();
        !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
        let oModel;

        switch (selectedKey) {
          case "01":
            oModel = this.getModel("master3");
            break;
          case "02":
            oModel = this.getModel("master3CO");
            break;
          case "03":
            oModel = this.getModel("master3SB");
            break;
          case "04": 
          oModel = this.getModel("master3DesAdv")
            break;  
          case "05":
            oModel = this.getModel("master3Inv");
            break; 
          case "06":
            oModel = this.getModel("master3Scart");
            break;
          default:
        }
        let aData = oModel.getProperty("/");
        if (!aData || aData.length === 0) {
          MessageToast.show("Nessun dato disponibile per l'esportazione");
          return;
        }
        this.buildSpreadSheet(aData);
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
        let lastIndexMessage;
        oBindingContext.getObject().log
          ? (lastIndexMessage = oBindingContext.getObject().log.results.length - 1)
          : (lastIndexMessage = oBindingContext.getObject().log_posizioni.results.length - 1);
        let log;
        oBindingContext.getObject().log
          ? (log = oBindingContext.getObject().log.results)
          : (log = oBindingContext.getObject().log_posizioni.results);
        let message = log[lastIndexMessage].messaggio;

        MessageBox.information(message);
      },
      processaItems: function (items) {
        let itemList;
        let excluded = []
        if (this.byId("idIconTabBar").getSelectedKey() === "02") {
          excluded = items.filter((x) => x.posizione_43_44 === "35")
          items = items.filter((x) => x.posizione_43_44 !== "35");
          
        }
        let message35 
        excluded.length > 0 ? message35 = "Le posizioni con Reason 35 non verranno processate." : message35 = "";

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
          
        if(message35){
          message = `${message35}\nVuoi continuare con questi elementi? \n ${itemList}`
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
                      that._refreshData(key);
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
        let obj = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getBindingContext("modelloReport")
          .getObject();
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
              await this._refreshData("01");
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
      reportSB: function (oEvent) {
        // /sap/opu/odata/sap/ZEDIFACT_IDOC_SRV/SELFBILLING_VDA4908_REPORT_SET?$filter=(KNREF eq '0000707511' and KUNNR eq '00217881' and NOTA_CREDITO eq 'test' and DATA_NOTA eq '20250313' and NUM_BOLLA eq 'Off 25/2025' and DATA_BOLLA eq '20250313' and COD_ARTICOLO_CLIENTE eq 'test_art' and NUM_ORDINE eq '1234' and QUANT_PRELEVATA eq '1' and PREZZO eq '100' and VALORE eq '123')&$format=json,
        debugger;
        let obj = oEvent.getSource().getBindingContext("master3SB").getObject();
      },
    });
  }
);
