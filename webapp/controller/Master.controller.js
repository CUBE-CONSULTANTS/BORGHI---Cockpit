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
        this.getRouter().getRoute("master").attachPatternMatched(this._onObjectMatched, this);
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
      },
      onSort: function () {     
      },

      onListItemPress: function (oEvent) {
        //apri dettaglio
        // var productPath = oEvent.getSource().getBindingContext("products").getPath(),
        //   product = productPath.split("/").slice(-1).pop(),
        //   oNextUIState;
        // this.getOwnerComponent()
        //   .getHelper()
        //   .then(
        //     function (oHelper) {
        //       oNextUIState = oHelper.getNextUIState(1);
        //       this.getRouter().navTo("detail", {
        //         layout: oNextUIState.layout,
        //         product: product,
        //       });
        //     }.bind(this)
        //   );
      },
      navToHome: function () {
        this.getRouter().navTo("home");
      },
    });
  }
);
