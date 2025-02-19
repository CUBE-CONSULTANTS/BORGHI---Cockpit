sap.ui.define(
  ["./BaseController", "sap/f/library"],
  function (BaseController, fioriLibrary) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Home", {
      onNavigateToPage1: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("master");
      },
      onNavigateToPage2: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("master2");
      },
      onNavigateToPage3: function () {
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("master3");
      },
      onNavigateToPage4: function () {
        this.getOwnerComponent()
          .getModel("datiAppoggio")
          .setProperty("/currentPage", "archivio");
        var oRouter = sap.ui.core.UIComponent.getRouterFor(this);
        oRouter.navTo("archivio");
      },
    });
  }
);
