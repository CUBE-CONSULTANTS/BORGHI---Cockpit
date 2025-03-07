sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/library",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
    "../model/models",
    "../model/API"
  ],
  function (
    BaseController,
    JSONModel,
    Sorter,
    CoreLibrary,
    Fragment,
    MessageBox,
    models,
    API
  ) {
    "use strict";

    const SortOrder = CoreLibrary.SortOrder;

    return BaseController.extend("programmi.consegne.edi.controller.archivio", {
      onInit: function () {
        this.setModel(models.createMainModel(), "main");
        this.setModel(models.createCountModel(), "count");
        this.setModel(models.createEdiFiltersModel(), "filtersModel");
        this.getOwnerComponent().getModel("datiAppoggio").setProperty("/currentPage", "archivio");
        this.getRouter().getRoute("archivio").attachPatternMatched(this._onObjectMatched.bind(this));      
      },
      _onObjectMatched: async function (oEvent) {
        await this._getCounters(true);
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
                  true
                ),
              ],
              [
                "posizioni($filter=stato eq '53'),posizioni($expand=log,schedulazioni,testata),master",
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
                  true
                ),
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
                //   true
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
            await this.callData(
              oModel,
              "/FileScartati",
              [
                new sap.ui.model.Filter(
                  "archiviazione",
                  sap.ui.model.FilterOperator.EQ,
                  true
                ),
              ],
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
      navToHome: function () {
        this.getRouter().navTo("home");
      },

      dettaglioNav: function (oEvent) {
        debugger;
        let level = oEvent
          .getSource()
          .getParent()
          .getBindingContext("master3")
          .getPath()
          .includes("DelforPosizioni");
        // let detailSched = oEvent.getSource().getParent().getBindingContext("master3").getObject().DelforSchedulazioni
        let detailPath = oEvent
          .getSource()
          .getParent()
          .getBindingContext("master3")
          .getPath();
        let detail = this.getView()
          .getModel("master3")
          .getProperty(`${detailPath}`);

        this.getOwnerComponent()
          .getModel("datiAppoggio")
          .setProperty("/testata", detail.DelforTestata);
        this.getOwnerComponent()
          .getModel("datiAppoggio")
          .setProperty("/posizioni", detail.DelforPosizioni);
        if (level) {
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
          let path = oEvent
            .getSource()
            .getParent()
            .getBindingContext("master3")
            .getPath();
          this.getRouter().navTo("detailMaster3", {
            product: detail.DelforTestata.id,
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
    });
  }
);
