sap.ui.define(
  ["./BaseController", "sap/f/library"],
  function (BaseController, fioriLibrary) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Home", {
      onNavigateToPage1: function () {
        this.getRouter().navTo("master");
      },
      onNavigateToPage2: function () {
        this.getRouter().navTo("master2");
      },
      onNavigateToPage3: function () {
        this.getRouter().navTo("master3");
      },
      onNavigateToPage4: function () {
        this.getOwnerComponent()
          .getModel("datiAppoggio")
          .setProperty("/currentPage", "archivio");
          this.getRouter().navTo("archivio");
      },
    });
  }
);
