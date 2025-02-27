sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "../model/formatter"],
  function (BaseController, JSONModel, formatter) {
    "use strict";
    
    return BaseController.extend(
      "programmi.consegne.edi.controller.DettSelfBilling",
      {
        formatter: formatter,
        onInit: function () {
          debugger;
          this.getRouter()
            .getRoute("dettSelfBilling")
            .attachPatternMatched(this._onProductMatched, this);
        },

        _onProductMatched: function (oEvent) {
        this._id =oEvent.getParameter("arguments").id || this._id || "0";
        let datiElementoSelect = this.getOwnerComponent().getModel("master3SB").getProperty("/").find((x) => (x.id = this._id));
        datiElementoSelect.dettaglio_fattura.forEach(pos=> {
          pos.data_fattura = formatter.formatDate(pos.data_fattura)
          pos.data_scadenza_fattura = formatter.formatDate(pos.data_scadenza_fattura)
          pos.riferimento_ddt = Object.values(pos.riferimento_ddt.results);
        })
        this.getView().setModel(
          new JSONModel(),
          "detailData"
        );
        this.getModel("detailData").setProperty("/DettaglioMaster3", datiElementoSelect);
        this.getModel("detailData").setProperty("/DettaglioFatture", datiElementoSelect.dettaglio_fattura);
        // this._registerForP13n();
        },
        
      }
    );
  }
);
