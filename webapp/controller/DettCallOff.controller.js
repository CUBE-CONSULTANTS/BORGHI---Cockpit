sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/API",
    "../model/models",
    "../model/formatter",
  ],
  function (BaseController, JSONModel, API, models, formatter) {
    "use strict";

    return BaseController.extend(
      "programmi.consegne.edi.controller.DettCallOff",
      {
        formatter: formatter,
        onInit: function () {
          debugger;
          this.getRouter().getRoute("dettCallOff").attachPatternMatched(this._onProductMatched, this);
        },

        _onProductMatched: async function (oEvent) {
          debugger;
          this._id = oEvent.getParameter("arguments").id || this._id || "0";
          this._idMaster = oEvent.getParameter("arguments").idmaster || this._id || "0";
          try {
            this.showBusy(0);
            debugger;
            let dettaglio = await API.readByKey(
              this.getOwnerComponent().getModel("calloffV2"),
              "/Testata",
              { id: this._id, id_master: this._idMaster },
              [],
              ["master,posizioni_testata,log_testata"]
            );

            let detailModel = new JSONModel(dettaglio);
            detailModel.getProperty("/posizioni_testata/results").forEach((pos) => {
                pos.posizione_14_19 = this.formatter.returnDate(pos.posizione_14_19,"yyyyMMdd","dd/MM/yyyy");
              });
            this.setModel(detailModel, "detailData");
            this._registerForP13n(oEvent, "tablePosCO");
          } catch (error) {
            MessageBox.error("Errore durante la ricezione dei Dati");
          } finally {
            this.hideBusy(0);
          }
        },
      }
    );
  }
);
