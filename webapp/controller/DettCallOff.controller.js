sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "../model/formatter"],
  function (BaseController, JSONModel, formatter) {
    "use strict";
    
    return BaseController.extend(
      "programmi.consegne.edi.controller.DettCallOff",
      {
        formatter: formatter,
        onInit: function () {
          debugger;
          this.oOwnerComponent = this.getOwnerComponent();
          this.oRouter = this.oOwnerComponent.getRouter();
          this.oModel = this.oOwnerComponent.getModel();

          this.oRouter
            .getRoute("dettCallOff")
            .attachPatternMatched(this._onProductMatched, this);
        },

        _onProductMatched: function (oEvent) {
        debugger;
        this._id =oEvent.getParameter("arguments").id || this._id || "0";
        let datiElementoSelect = this.getOwnerComponent().getModel("master3CO").getProperty("/").find((x) => (x.id = this._product));
        this.getView().setModel(
          new JSONModel(),
          "detailData"
        );
        this.getModel("detailData").setProperty("/DettaglioMaster3", datiElementoSelect);
        // this._registerForP13n();
        },
        
      }
    );
  }
);
