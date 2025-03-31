sap.ui.define(
  ["./BaseController", "sap/f/library"],
  function (BaseController, fioriLibrary) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Home", {
      onInit: function () {
        this.getRouter().getRoute("home").attachPatternMatched(this._onObjectMatched.bind(this));
      },
      _onObjectMatched: function (oEvent) {
        this._onRouteChange(oEvent)
      },
      onNavigateToPage1: function () {
        this.getRouter().navTo("master");
      },
      onNavigateToPage2: function () {
        this.getRouter().navTo("master2");
      },
      onNavigateToPage3: function () {
        this.getOwnerComponent().getModel("datiAppoggio").setProperty("/currentPage", "master3");
        this.getRouter().navTo("master3");
      },
      onNavigateToPage4: function () {
        this.getOwnerComponent().getModel("datiAppoggio").setProperty("/currentPage", "archivio");
        this.getRouter().navTo("archivio");
      },
    });
  }
);
