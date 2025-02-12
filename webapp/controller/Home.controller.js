sap.ui.define([
    "./BaseController",
    "sap/f/library"
], function (BaseController, fioriLibrary) {
    "use strict";

    return BaseController.extend("sap.ui.demo.fiori2.controller.Home", {
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
        }
    });
});
