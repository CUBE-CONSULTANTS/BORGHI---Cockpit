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
        this.getRouter()
          .getRoute("master3")
          .attachPatternMatched(this._onObjectMatched, this);
      },
      _onObjectMatched: async function (oEvent) {
        await this._getCounters();
        this.onFilterSelect(null, "01");
      },
      _getCounters: async function () {
        this.showBusy(0);
        try {
          let del = await API.getEntity(
            this.getOwnerComponent().getModel("modelloV2"),
            "/Testata/$count",
            [new sap.ui.model.Filter(
              "archiviazione",
              sap.ui.model.FilterOperator.EQ,
              false
            )],
            []
          );
          this.getModel("count").setProperty("/delivery", del.results);
          let cal = await API.getEntity(
            this.getOwnerComponent().getModel("calloffV2"),
            "/Testata/$count",
            [new sap.ui.model.Filter(
              "archiviazione",
              sap.ui.model.FilterOperator.EQ,
              false
            )],
            []
          );
          this.getModel("count").setProperty("/calloff", cal.results);
          let selfb = await API.getEntity(
            this.getOwnerComponent().getModel("selfBillingV2"),
            "/Testata/$count",
            [], 
            // new sap.ui.model.Filter(
            //   "archiviazione",
            //   sap.ui.model.FilterOperator.EQ,
            //   false
            // )
            []
          );
          this.getModel("count").setProperty("/selfbilling", selfb.results);
          let fileScart = await API.getEntity(
            this.getOwnerComponent().getModel("fileScartatiV2"),
            "/FileScartati/$count",
            [
              ],
              // new sap.ui.model.Filter(
              //   "archiviazione",
              //   sap.ui.model.FilterOperator.EQ,
              //   false
              // )
            []
          );
          this.getModel("count").setProperty(
            "/fileScartati",
            fileScart.results
          );
        } catch (error) {
          MessageBox.error("Errore durante il recupero dei Dati");
        } finally {
          this.hideBusy(0);
        }
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
                )
              ],
              [
                "posizioni($filter=stato ne '53'),posizioni($expand=log,schedulazioni,testata),master",
              ],
              selectedKey
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
                )
              ],
              ["master,posizioni_testata,log_testata"],
              selectedKey
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
              selectedKey
            );
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
          case "04":
            break;
          case "05":
            break;
          case "06":
            oModel = this.getOwnerComponent().getModel("fileScartatiV2");
            await this.callData(oModel, "/FileScartati", [
              new sap.ui.model.Filter(
                "archiviazione",
                sap.ui.model.FilterOperator.EQ,
                false
              )
            ], [], selectedKey);
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
        }
        this.hideBusy(0);
      },

      sortCategories: function (oEvent) {
        let oTable;
        let aSorters = [];
        switch (this.getView().byId("idIconTabBar").getSelectedKey()) {
          case "01":
            oTable = this.byId("treetableMain");
            aSorters = this.sortTables(oTable, [
              "codice_seller",
              "numero_progressivo_invio",
            ]);
            break;
          case "02":
            oTable = this.byId("treetableCallOff");
            aSorters = this.sortTables(oTable, [
              "codice_terre_cliente",
              "progressivo_invio",
            ]);
            break;
          case "03":
            oTable = this.byId("treetableSB");
            aSorters = this.sortTables(oTable, ["customer", "data_ricezione"]);
            break;
          case "06":
            oTable = this.byId("tableScartati");
            aSorters = this.sortTables(oTable, ["filename", "data_ricezione"]);
            break;
          default:
            return;
        }
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

      onProcessaButton:async  function (oEvent) {
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

      dettaglioNav: function (oEvent) {
        let level, detailPath, detail;
        if (
          oEvent.getSource().getParent().getBindingContext("master3") !==
          undefined
        ) {
          level = oEvent.getSource().getParent().getBindingContext("master3").getPath().includes("posizioni");
          detailPath = oEvent.getSource().getParent().getBindingContext("master3").getPath();
          detail = this.getView().getModel("master3").getProperty(`${detailPath}`);
          this.getOwnerComponent().getModel("datiAppoggio").setProperty("/testata", detail);
          this.getOwnerComponent().getModel("datiAppoggio").setProperty("/posizioni", detail.posizioni);
          if (level) {
            this.getOwnerComponent().getModel("datiAppoggio").setProperty("/posizioneCorrente", detail);
            this.getOwnerComponent().getModel("datiAppoggio").setProperty("/schedulazioni", detail.schedulazioni.results);
            this.getOwnerComponent().getModel("datiAppoggio").setProperty(
                "/testata",
                this.getModel("master3").getProperty(`${detailPath[0] + detailPath[1]}`)
              );
            let oNextUIState;
            this.getOwnerComponent()
              .getHelper()
              .then(
                function (oHelper) {
                  oNextUIState = oHelper.getNextUIState(1);
                  this.getRouter().navTo("Detail2Master3", {
                    product: detail.id,
                    layout: oNextUIState.layout,
                  });
                }.bind(this)
              );
          } else {
            detailPath = oEvent.getSource().getParent().getBindingContext("master3").getPath();
            this.getRouter().navTo("detailMaster3", {
              id: detail.id,
              idmaster: detail.id_master,
              layout: "OneColumn",
            });
          }
        } else if (
          oEvent.getSource().getParent().getBindingContext("master3CO") !==
          undefined
        ) {
          detailPath = oEvent.getSource().getParent().getBindingContext("master3CO").getPath();
          detail = this.getView().getModel("master3CO").getProperty(`${detailPath}`);
          this.getRouter().navTo("dettCallOff", {
            id: detail.id,
            idmaster: detail.id_master,
            layout: "OneColumn",
          });
        } else if (
          oEvent.getSource().getParent().getBindingContext("master3SB") !==
          undefined
        ) {
          detailPath = oEvent.getSource().getParent().getBindingContext("master3SB").getPath();
          detail = this.getModel("master3SB").getProperty(`${detailPath}`);
          this.getRouter().navTo("dettSelfBilling", {
            id: detail.id,
            layout: "OneColumn",
          });
        }
      },

      statoButtonPress: function (oEvent) {
        let lastIndexMessage =oEvent.getSource().getBindingContext("master3").getObject().log.results.length - 1;
        let message = oEvent.getSource().getBindingContext("master3").getObject().log.results[lastIndexMessage].messaggio;
        MessageBox.error(message);
      },

      onCollapseAll: function () {
        let oTable;
        let selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();
        !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
        switch (selectedKey) {
          case "01":
            oTable = this.byId("treetableMain");
            oTable.collapseAll();
            break;
          case "02":
            oTable = this.byId("treetableCallOff");
            oTable.collapseAll();
            break;
          case "03":
            oTable = this.byId("treetableSB");
            oTable.collapseAll();
            break;
          default:
        }
      },
      onExpandFirstLevel: function () {
        let oTable;
        let selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();
        !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
        switch (selectedKey) {
          case "01":
            oTable = this.byId("treetableMain");
            oTable.expandToLevel(1);
            break;
          case "02":
            oTable = this.byId("treetableCallOff");
            oTable.expandToLevel(1);
            break;
          case "03":
            oTable = this.byId("treetableSB");
            oTable.expandToLevel(1);
            break;
          default:
        }
      },

      navToAPP: function (oEvent) {
        let level = oEvent.getSource().getParent().getParent().getBindingContext("master3").getPath();
        if (level.includes("posizioni")) {
          this.getRouter().navTo("master", { monitor: "monitor" });
        } else {
          this.getRouter().navTo("master2", { monitor: "monitor" });
        }
      },
      processaItems: function (items) {
        let itemList = items
          .map(
            (item) =>
             `Codice cliente materiale: ${item.codice_cliente_materiale} - ID: ${item.id} - Codice materiale fornitore: ${item.codice_materiale_fornitore}\n`
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
                      debugger;
                      let el = items.find((y) => x.id === y.id);
                      error.push(el);
                    } else {
                      let el = items.find((y) => x.id === y.id);
                      success.push(el);
                    }
                  });
                  that
                    .getModel("modelloReport")
                    .setProperty("/successo", success);
                  that.getModel("modelloReport").setProperty("/errore", error);
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
        debugger;
        let obj = oEvent.getSource().getParent().getParent().getBindingContext("modelloReport").getObject();
        let numIdoc = obj.numero_idoc;
        let dest = obj.destinatario;

        let oModel = this.getOwnerComponent().getModel("modelloV2");
        let res = await API.getEntity(
          oModel,
          `/DELFOR_CUMULATIVI(IdocNum='${numIdoc}',Stabilimento='${dest}')`
        );
        console.log(res);
      },
    });
  }
);
