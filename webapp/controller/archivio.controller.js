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
                  true
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
                //   true
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
                  true
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
      onDownloadCumulativi: async function(oEvent){
        
        let numIdoc = oEvent.getSource().getBindingContext("master3").getObject().numero_idoc
        let dest = oEvent.getSource().getBindingContext("master3").getObject().destinatario
        let rffon = oEvent.getSource().getBindingContext("master3").getObject().numero_ordine_acquisto
        await this.getReportCumulativi(dest, numIdoc,rffon);
      }, 
      
    });
  }
);
