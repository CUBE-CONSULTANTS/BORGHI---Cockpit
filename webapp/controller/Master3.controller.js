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
        // let countModel = new JSONModel(
        //   { delivery: "", calloff: "", selfbilling: "" },
        //   "count"
        // );
        // this.setModel("count");
        // this.getModel("count").setProperty(
        //   "/delivery",
        //   await API.getEntity("/Testata/$count")
        // );
        debugger;
        this.getRouter().getHashChanger().replaceHash("master3");
        this.getRouter().getRoute("master3").attachPatternMatched(this._onObjectMatched, this);
        this.onFilterSelect(null, "01");
        this.setModel(models.createEdiFiltersModel(), "filtersModel");
      },
      _onObjectMatched: function (oEvent) {
        debugger;
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
              [],
              [
                "posizioni($filter=stato ne '53'),posizioni($expand=log,schedulazioni,testata)",
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
              [],
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
              [],
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
            await this.callData(
              oModel,
              "/FileScartati",
              [],
              [],
              selectedKey
            );
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
      onPressRow: function (oEvent) {
        var index = oEvent.getParameter("rowIndex");
        if (index === 0) {
          this.getView().byId("buttonDelete").setProperty("enabled", false);
        } else {
          this.getView().byId("buttonDelete").setProperty("enabled", true);
        }
      },

      onProcessaButton: function (oEvent) {
        debugger;
        let table = this.getView().byId("treetableMain");
        let indices = this.getView().byId("treetableMain").getSelectedIndices();
        let testate = [];
        let selectedPos = [];
        let self = this;
        let flag = false;

        if (indices.length != 0) {
          let aSelectedItems = indices.map(function (iIndex) {
            return table.getContextByIndex(iIndex).getObject();
          });

          aSelectedItems.forEach((element) => {
            if (element.hasOwnProperty("posizioni")) {
              testate.push(element);
              flag = true;
            } else {
              selectedPos.push(element);
            }
          });

          if (flag) {
            //selezionata testata
            MessageBox.confirm(
              "Essendo stata selezionata una testata verranno processate tutte le posizioni al suo interno, continuare?",
              {
                title: "Continuare?",
                onClose: (oAction) => {
                  if (oAction === sap.m.MessageBox.Action.OK) {
                    debugger;
                    testate.forEach((x) => {
                      debugger;
                      selectedPos = selectedPos.concat(x.posizioni);
                    });
                    debugger;
                    let uniqueArray = selectedPos.reduce(
                      (acc, currentValue) => {
                        if (!acc.some((item) => item.id === currentValue.id)) {
                          acc.push(currentValue);
                        }
                        return acc;
                      },
                      []
                    );

                    console.log(uniqueArray);
                    this.processaItems(uniqueArray);
                  }
                },
              }
            );
          } else {
            //selezionate solo posizioni
            debugger;
            this.processaItems(selectedPos);
          }
        } else {
          MessageBox.alert("Si prega di selezionare almeno una posizione");
        }
      },

      importaPress: function (oEvent) {
        debugger;
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
      rowDetailPress: function (detailPath) {
        // var detailPath = oEvent.getParameter("rowBindingContext").getPath()
        let detailRowIndex = detailPath.split("/").slice(-1).pop();
        let detail = this.getView()
          .getModel("master3")
          .getProperty(`/Master3/${detailRowIndex}/DelforTestata/id`);
        let oNextUIState;
        this.getOwnerComponent()
          .getHelper()
          .then(
            function (oHelper) {
              oNextUIState = oHelper.getNextUIState(1);
              this.getRouter().navTo("detailMaster3", {
                product: detail,
                layout: oNextUIState.layout,
              });
            }.bind(this)
          );
      },
      dettaglioNav: function (oEvent) {
        debugger;
        let level, detailPath, detail;
        if (
          oEvent.getSource().getParent().getBindingContext("master3") !== undefined
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
                this.getView()
                  .getModel("master3")
                  .getProperty(`${detailPath[0] + detailPath[1]}`)
              );
            debugger;
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
              product: detail.id,
              layout: "OneColumn",
            });
          }
        } else if (
          oEvent.getSource().getParent().getBindingContext("master3CO") !== undefined
        ) {
          detailPath = oEvent.getSource().getParent().getBindingContext("master3CO").getPath();
          detail = this.getView().getModel("master3CO").getProperty(`${detailPath}`);
          this.getRouter().navTo("dettCallOff", {
            id: detail.id,
            layout: "OneColumn",
          });
        }else if( oEvent.getSource().getParent().getBindingContext("master3SB") !==undefined){
          debugger
          detailPath = oEvent.getSource().getParent().getBindingContext("master3SB").getPath();
          detail = this.getView().getModel("master3SB").getProperty(`${detailPath}`);
          this.getRouter().navTo("dettSelfBilling", {
            id: detail.id,
            layout: "OneColumn",
          });
        }
      },

      statoButtonPress: function (oEvent) {
        debugger;
        MessageBox.error("Errori nel processamento delle posizioni.", {
          title: "Error",
          details: "<p><strong>This can happen if:</strong></p>",
          contentWidth: "100px",
          dependentOn: this.getView(),
        });
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
        debugger;
        let level = oEvent.getSource().getParent().getParent().getBindingContext("master3").getPath();
        if (level.includes("posizioni")) {
          this.getRouter().navTo("master", { monitor: "monitor" });
        } else {
          this.getRouter().navTo("master2",{ monitor: "monitor" });
        }
      },

      prova2: function (oEvent) {
        debugger;
        let table = this.byId("treetableMain");
        let row = oEvent.getParameter("rowContext").getObject();
      },

      processaItems: function (items) {
        debugger;

        let itemList = items
          .map(
            (item) =>
              `Codice cliente materiale: ${item.codice_cliente_materiale} - ID: ${item.id} - Codice materiale fornitore: ${item.codice_materiale_fornitore}\n`
          )
          .join("");
        let message = `Vuoi continuare con questi elementi? \n ${itemList}`;

        // MessageBox.confirm(message, {
        //   title: "Riepilogo",
        //   onClose: (oAction) => {
        //     debugger;
        //     if (oAction === sap.m.MessageBox.Action.OK) {
        //       debugger;
        //     }
        //   },
        // });

        //prova
        sap.m.MessageBox.confirm(message, {
          icon: sap.m.MessageBox.Icon.WARNING,
          title: "Riepilogo",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          emphasizedAction: sap.m.MessageBox.Action.YES,
          onClose: async function (oAction) {
            if (oAction == "YES") {
              let payload = [];
              items.forEach((x) => {
                payload.push(x.id);
              });

              let obj = { id: payload };

              let oModel = this.getOwnerComponent().getModel("modelloV2");
              let res = await API.createEntity(oModel, "/Processamento", obj);
              debugger;
              let modelloReport = new JSONModel(
                { successo: "", errore: "" },
                "modelloReport"
              );
              let success = [];
              let error = [];
              res.results.forEach((x) => {});

              if (!this._fragment) {
                Fragment.load({
                  name: "programmi.consegne.edi.view.fragments.reportDelfor",
                  controller: this,
                }).then(
                  function (oFragment) {
                    this._fragment = oFragment;
                    this._fragment.setModel(modelloReport);
                    this.getView().addDependent(this._fragment);

                    this._fragment.open();
                  }.bind(this)
                );
              } else {
                this._fragment.setModel(modelloReport);
                this._fragment.open();
              }
            } else {
              // sap.ui.core.BusyIndicator.hide(0);
            }
          }.bind(this),
        });
      },
      //FUNZIONI CALLOFF
      onListItemPress: function (oEvent) {
        debugger;
        let idMaster = oEvent
          .getSource()
          .getBindingContext("master3CO")
          .getObject().id;
        this.getRouter().navTo("dettCallOff", { id: idMaster });
      },
    });
  }
);
