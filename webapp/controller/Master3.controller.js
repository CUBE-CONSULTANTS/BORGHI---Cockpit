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
    formatter
  ) {
    "use strict";

    const SortOrder = CoreLibrary.SortOrder;

    return BaseController.extend("programmi.consegne.edi.controller.Master3", {
      formatter: formatter,
      onInit: function () {
        this.oRouter = this.getOwnerComponent().getRouter();
        this.onFilterSelect(null, "01");
        this.setModel(models.createEdiFiltersModel(), "filtersModel");
      },
      _onObjectMatched: function (oEvent) {
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
              ["posizioni,posizioni/schedulazioni,posizioni/log"],
              selectedKey
            );
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
          case "02":
            oModel = this.getOwnerComponent().getModel("calloffV2");
            await this.callData(
              oModel,
              "/Master",
              [],
              [
                "testata_master,testata_master/posizioni_testata,testata_master/log_testata",
              ],
              selectedKey
            );
            this.onFiltersBuilding(oEvent, selectedKey);
            break;
          case "03":
            var oMaster3Model = new JSONModel(
              sap.ui.require.toUrl(
                "programmi/consegne/edi/mockdata/dataMaster3.json"
              )
            );
            this.getOwnerComponent().setModel(oMaster3Model, "master3");
            // this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            break;
          case "04":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            this.byId("idDataConsegna").setProperty(
              "label",
              "Data di uscita merci"
            );
            this.byId("idDataConsegna").setProperty(
              "name",
              "Data di uscita merci"
            );
            break;
          case "05":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            break;
          case "06":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            break;
          case "07":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");
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
            break;
          default:
            return;
        }
      },
      downloadExcelFile: function (oEvent) {
        debugger;
        let oModel = this.getModel("master3");
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

      navToHome: function () {
        this.oRouter.navTo("home");
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
              this.oRouter.navTo("detailMaster3", {
                product: detail,
                layout: oNextUIState.layout,
              });
            }.bind(this)
          );
      },
      dettaglioNav: function (oEvent) {
        debugger;
        let level = oEvent.getSource().getParent().getBindingContext("master3").getPath().includes("posizioni");
        // let detailSched = oEvent.getSource().getParent().getBindingContext("master3").getObject().DelforSchedulazioni
        let detailPath = oEvent.getSource().getParent().getBindingContext("master3").getPath();
        let detail = this.getView().getModel("master3").getProperty(`${detailPath}`);

        this.getOwnerComponent()
          .getModel("datiAppoggio")
          .setProperty("/testata", detail);
        this.getOwnerComponent()
          .getModel("datiAppoggio")
          .setProperty("/posizioni", detail.posizioni);
        if (level) {
          this.getOwnerComponent()
            .getModel("datiAppoggio")
            .setProperty("/posizioneCorrente", detail);
          this.getOwnerComponent()
            .getModel("datiAppoggio")
            .setProperty("/schedulazioni", detail.schedulazioni.results);
          this.getOwnerComponent()
            .getModel("datiAppoggio")
            .setProperty(
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
                this.oRouter.navTo("Detail2Master3", {
                  product: detail.id,
                  layout: oNextUIState.layout,
                });
              }.bind(this)
            );
        } else {
          let path = oEvent
            .getSource()
            .getParent()
            .getBindingContext("master3")
            .getPath();
          this.oRouter.navTo("detailMaster3", {
            product: detail.id,
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
        const oTreeTable = this.byId("treetableMain");
        oTreeTable.collapseAll();
      },

      onCollapseSelection: function () {
        const oTreeTable = this.byId("treetableMain");
        oTreeTable.collapse(oTreeTable.getSelectedIndices());
      },

      onExpandFirstLevel: function () {
        const oTreeTable = this.byId("treetableMain");
        oTreeTable.expandToLevel(1);
      },

      onExpandSelection: function () {
        const oTreeTable = this.byId("treetableMain");
        oTreeTable.expand(oTreeTable.getSelectedIndices());
      },
      
      navToAPP: function (oEvent) {
        debugger;
        let level = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getBindingContext("master3")
          .getPath();
        if (level.includes("DelforPosizioni")) {
          this.getRouter().navTo("master");
        } else {
          this.getRouter().navTo("master2");
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

        MessageBox.confirm(message, {
          parameters: items,
          title: "Riepilogo",
          onClose: (oAction) => {
            if (oAction === sap.m.MessageBox.Action.OK) {
              debugger;
            }
          },
        });
      },
       //FUNZIONI CALLOFF
      onListItemPress: function (oEvent){
        debugger
        let idMaster = oEvent.getSource().getBindingContext("master3CO").getObject().id
        this.getRouter().navTo("dettCallOff", {id: idMaster})

      },
    });
  }
 
);
