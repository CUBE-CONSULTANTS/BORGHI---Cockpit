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
        this.getRouter().getRoute("archivio").attachPatternMatched(this._onObjectMatched.bind(this));      
      },
      _onObjectMatched: async function (oEvent) {
        this.getOwnerComponent().getModel("datiAppoggio").setProperty("/currentPage", "archivio");
        await this._getCounters(true);
        this.onFilterSelect(null, "01");
      },
      onFilterSelect: async function (oEvent, key) {
        this.showBusy(0);
        let selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();
        !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
        switch (selectedKey) {
         case "01":
          await this.onSearchData(undefined, selectedKey)
          this.onFiltersBuilding(oEvent, selectedKey);
          break;
         case "02":
          await this.onSearchData(undefined, selectedKey)
          this.onFiltersBuilding(oEvent, selectedKey);
          break;
         case "03":
          await this.onSearchData(undefined, selectedKey)
          this.onFiltersBuilding(oEvent, selectedKey);
          break;
         case "04":
          break;
         case "05":
          break;
         case "06":
          await this.onSearchData(undefined, selectedKey)
          this.onFiltersBuilding(oEvent, selectedKey);
          break;
        }
        this.hideBusy(0);
       },
      
      
    });
  }
);
