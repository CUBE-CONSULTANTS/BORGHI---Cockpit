sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/library",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
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
        this.getOwnerComponent()
          .getModel("datiAppoggio")
          .setProperty("/currentPage", "monitor");
        this.getRouter()
          .getRoute("master3")
          .attachPatternMatched(this._onObjectMatched, this);
      },
      _onObjectMatched: async function (oEvent) {
        
        // let numIdoc='0000000000000030'
        // let rffon='123456'
        // let dest='CIAO'
        // await this.getReportCumulativi(dest, numIdoc, rffon)
        await this._getCounters(false);
        this.onFilterSelect(null, "01");
      },

      onFilterSelect: async function (oEvent, key) {
        this.showBusy(0);
        let selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();
        !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
        let oModel;
        switch (selectedKey) {
          case "01":
            oModel = this.getOwnerComponent().getModel("modelloV2");
            await this.callData(
              oModel,
              "/Testata",
              [
                new sap.ui.model.Filter(
                  "archiviazione",
                  sap.ui.model.FilterOperator.EQ,
                  false
                ),
              ],
              ["posizioni,posizioni($expand=log,schedulazioni,testata),master"],
              selectedKey, false
            );
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
          case "02":
            oModel = this.getOwnerComponent().getModel("calloffV2");
            await this.callData(
              oModel,
              "/Testata",
              [
                new sap.ui.model.Filter(
                  "archiviazione",
                  sap.ui.model.FilterOperator.EQ,
                  false
                ),
              ],
              ["master,posizioni_testata,log_testata"],
              selectedKey, false
            );
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
          case "03":
            oModel = this.getOwnerComponent().getModel("selfBillingV2");
            await this.callData(
              oModel,
              "/Testata",
              [
                // new sap.ui.model.Filter(
                //   "archiviazione",
                //   sap.ui.model.FilterOperator.EQ,
                //   false
                // )
              ],
              [
                "dettaglio_fattura,log_testata,dettaglio_fattura/riferimento_ddt,dettaglio_fattura/riferimento_ddt/riga_fattura",
              ],
              selectedKey, false
            );
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
          case "04":
            break;
          case "05":
            break;
          case "06":
            oModel = this.getOwnerComponent().getModel("fileScartatiV2");
            await this.callData(
              oModel,
              "/FileScartati",
              [
                new sap.ui.model.Filter(
                  "archiviazione",
                  sap.ui.model.FilterOperator.EQ,
                  false
                ),
              ],
              [],
              selectedKey, false
            );
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
        let table = this.getView().byId("treetableMain");
        try {
          let arrayToProcess = await this._returnPayload(table);
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
        let lastIndexMessage =
          oEvent.getSource().getBindingContext("master3").getObject().log
            .results.length - 1;
        let message = oEvent
          .getSource()
          .getBindingContext("master3")
          .getObject().log.results[lastIndexMessage].messaggio;
        MessageBox.error(message);
      },
      processaItems: function (items) {
        let itemList = items
          .map(
            (item) =>
              `Codice Cliente: ${item.codice_cliente} - Codice cliente materiale: ${item.codice_cliente_materiale} - Progressivo Invio: ${item.numero_progressivo_invio} \n`
          )
          .join("");
        let message = `Vuoi continuare con questi elementi? \n ${itemList}`;
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
                let oModel = this.getOwnerComponent().getModel("modelloV2");
                let res = await API.createEntity(oModel, "/Processamento", obj);
                if (res.results.length > 0) {
                  let modelloReport = new JSONModel({
                    successo: "",
                    errore: "",
                  });
                  that.setModel(modelloReport, "modelloReport");
                  let success = [];
                  let error = [];
                  res.results.forEach((x) => {
                    if (x.status === "51") {
                      let el = items.find((y) => x.id === y.id);
                      error.push(Object.assign(el, x));
                    } else {
                      let el = items.find((y) => x.id === y.id);
                      success.push(Object.assign(el, x));
                    }
                  });
                  that
                    .getModel("modelloReport")
                    .setProperty("/successo", success);
                  that.getModel("modelloReport").setProperty("/errore", error);
                  that._refreshData("01");
                  if (!that._fragment) {
                    Fragment.load({
                      name: "programmi.consegne.edi.view.fragments.reportDelfor",
                      controller: this,
                    }).then(
                      function (oFragment) {
                        this._fragment = oFragment;
                        this.getView().addDependent(this._fragment);
                        this._fragment.open();
                      }.bind(this)
                    );
                  } else {
                    that._fragment.setModel("modelloReport");
                    that._fragment.open();
                  }
                } else {
                  MessageBox.error("Elaborazione non andata a buon fine");
                }
              } catch (error) {
                MessageBox.error("Errore durante la ricezione dei dati");
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

      onUploadButtonPress: async function (oEvent) {
        ;

        let fileupload = this.getView().byId("FileUploader");
        let formData = new FormData();
        try {
          formData.append("file", fileupload.oFileUpload.files[0]);
          await fetch("/fiori/upload_excel", {
            method: "POST",
            body: formData,
          });
        } catch (error) {
          console.log(error);
        }
      },
    });
  }
);
