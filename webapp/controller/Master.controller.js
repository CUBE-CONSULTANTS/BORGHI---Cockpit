sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "../model/models"
  ],
  function (BaseController, Filter, FilterOperator, Sorter, MessageBox, models) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Master", {
      onInit: function () {
        this.setModel(models.createMainModel(), "main");
        this.oView = this.getView();
        this.getRouter().getRoute("master").attachPatternMatched(this._onObjectMatched, this);
        this._bDescendingSort = false;
        this.oProductsTable = this.oView.byId("productsTable");
        
      },
      _onObjectMatched: function (oEvent) { 
        
        if(oEvent.getParameters().arguments.prevApp === 'monitor') {
          this.getModel("main").setProperty("/backToMon", true)
        }else if(oEvent.getParameters().arguments.prevApp === 'archivio'){
          this.getModel("main").setProperty("/backToArch", true)
        }else{
          this.getModel("main").setProperty("/backToMon", false);
          this.getModel("main").setProperty("/backToArch", false);
        }
      },
      onSearch: function (oEvent) {
        var oTableSearchState = [],
          sQuery = oEvent.getParameter("query");

        if (sQuery && sQuery.length > 0) {
          oTableSearchState = [
            new Filter("Name", FilterOperator.Contains, sQuery),
          ];
        }

        this.oProductsTable
          .getBinding("items")
          .filter(oTableSearchState, "Application");
      },

      onAdd: function () {
        MessageBox.information("This functionality is not ready yet.", {
          title: "Aw, Snap!",
        });
      },

      onSort: function () {
        this._bDescendingSort = !this._bDescendingSort;
        var oBinding = this.oProductsTable.getBinding("items"),
          oSorter = new Sorter("Name", this._bDescendingSort);

        oBinding.sort(oSorter);
      },

      onListItemPress: function (oEvent) {
        var productPath = oEvent
            .getSource()
            .getBindingContext("products")
            .getPath(),
          product = productPath.split("/").slice(-1).pop(),
          oNextUIState;
        this.getOwnerComponent()
          .getHelper()
          .then(
            function (oHelper) {
              oNextUIState = oHelper.getNextUIState(1);
              this.getRouter().navTo("detail", {
                layout: oNextUIState.layout,
                product: product,
              });
            }.bind(this)
          );
      },
      navToHome: function () {
        this.getRouter().navTo("home");
      },
    });
  }
);
