sap.ui.define(["./BaseController"], function (BaseController) {
  "use strict";

  return BaseController.extend("programmi.consegne.edi.controller.App", {
    onInit: function () {
      this.oOwnerComponent = this.getOwnerComponent();
      
      this.getRouter().attachRouteMatched(this.onRouteMatched, this);
    },

    onRouteMatched: function (oEvent) {
      var sRouteName = oEvent.getParameter("name"),
        oArguments = oEvent.getParameter("arguments");

      this._updateUIElements();

      // Save the current route name
      this.currentRouteName = sRouteName;
      this.currentProduct = oArguments.product;
      this.currentSupplier = oArguments.supplier;
    },

    onStateChanged: function (oEvent) {
      debugger;
      var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
        sLayout = oEvent.getParameter("layout");

      this._updateUIElements();

      // Replace the URL with the new layout if a navigation arrow was used
      if (bIsNavigationArrow) {
        this.oRouter.navTo(
          this.currentRouteName,
          {
            layout: sLayout,
            product: this.currentProduct,
            supplier: this.currentSupplier,
          },
          true
        );
      }
    },

    // Update the close/fullscreen buttons visibility
    _updateUIElements: function () {
      var oModel = this.oOwnerComponent.getModel(),
        oUIState;
      this.oOwnerComponent.getHelper().then(function (oHelper) {
        oUIState = oHelper.getCurrentUIState();
        oModel.setData(oUIState);
      });
    },

    onExit: function () {
      this.oRouter.detachRouteMatched(this.onRouteMatched, this);
      this.oRouter.detachBeforeRouteMatched(this.onBeforeRouteMatched, this);
    },
  });
});
