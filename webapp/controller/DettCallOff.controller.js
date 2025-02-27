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
          
          this.oModel = this.oOwnerComponent.getModel();

          this.getRouter()
            .getRoute("dettCallOff")
            .attachPatternMatched(this._onProductMatched, this);
        },

        _onProductMatched: function (oEvent) {
        this._id =oEvent.getParameter("arguments").id || this._id || "0";
        let datiElementoSelect = this.getOwnerComponent().getModel("master3CO").getProperty("/").find((x) => (x.id = this._id));
        datiElementoSelect.posizioni_testata.forEach(pos=> pos.posizione_14_19 = formatter.returnDate(pos.posizione_14_19,"yyyyMMdd","dd/MM/yyyy"))
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
