sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "sap/ui/model/Sorter", "sap/ui/core/library", "sap/ui/core/Fragment", "sap/m/MessageBox", "../model/models", "../model/API"],
  function (BaseController, JSONModel, Sorter, CoreLibrary, Fragment, MessageBox, models, API) {
    "use strict";

    const SortOrder = CoreLibrary.SortOrder;

    return BaseController.extend("programmi.consegne.edi.controller.archivio", {
      onInit: function () {
        this.setModel(models.createMainModel(), "main");
        this.setModel(models.createCountModel(), "count");
        this.setModel(models.createPaginationModel(), "pagination");
        this.setModel(models.createEdiFiltersModel(), "filtersModel");
        this.getRouter().getRoute("archivio").attachPatternMatched(this._onObjectMatched.bind(this));

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
        this._onScrollingDebounced = this._debounce(this.onScrolling.bind(this), 200)
      },
      _onObjectMatched: async function (oEvent) {
        this._resetPageModels()
        this._onRouteChange(oEvent)
        this.getOwnerComponent().getModel("datiAppoggio").setProperty("/currentPage", "archivio");
        await this._getCounters(true);
        this.onFilterSelect(null, "01");
      },
      onFilterSelect: async function (oEvent, key) {
        this.showBusy(0);
        let oFlexibleColumnLayout = this.getOwnerComponent().getModel("layout");
        let sNextLayout = oFlexibleColumnLayout.getProperty("/actionButtonsInfo/endColumn/closeColumn");
        this.getModel("layout").setProperty("/layout", sNextLayout);
        let selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();
        !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
        this.getModel("pagination").setData({
          pageSize: 25, 
          currentPage: 0, 
          totalCount: 0,
          isLoading: false,
          hasMore: true,
          lastLoadedRow: 0
        });
        await this.onSearchData(undefined, selectedKey);
        this.onFiltersBuilding(oEvent, selectedKey);
        this.hideBusy(0);
      },
    });
  }
);
