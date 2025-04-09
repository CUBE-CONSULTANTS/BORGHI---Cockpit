sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/core/Fragment",
    "../model/formatter",
    "sap/m/MessageBox",
    "../model/API",
    "sap/ui/core/routing/History"
  ],
  function (
    BaseController,
    JSONModel,
    Fragment,  
    formatter,
    MessageBox,
    API,
    History
  ) {
    "use strict";

    return BaseController.extend(
      "programmi.consegne.edi.controller.DetailMaster3",
      {
        formatter: formatter,
        onInit: function () {
          this.getRouter()
            .getRoute("detailMaster3")
            .attachPatternMatched(this._onObjectMatched, this);
        },
        _onObjectMatched: async function (oEvent) {         
          this._id = oEvent.getParameter("arguments").id || this._id || "0";
          this._idMaster = oEvent.getParameter("arguments").idmaster || this._id || "0";
          
          try {
            this.showBusy(0)
            let dettaglio = await API.readByKey( this.getOwnerComponent().getModel("modelloV2"), "/Testata", {id: this._id, id_master: this._idMaster}, [], [
              `posizioni,posizioni($expand=log,schedulazioni,testata),master`,
            ])
            let detailModel = new JSONModel(dettaglio);
            detailModel.getProperty("/posizioni/results").forEach((pos) => {  
              pos.log = Object.values(pos.log.results);
            });
            this.setModel(detailModel,"detailData");
            this._registerForP13n(oEvent, "tablePos")
          } catch (error) {
            MessageBox.error("Errore durante la ricezione dei Dati")
          } finally {
            this.hideBusy(0)
          }  
        },
        buttonDetailSched: function (oEvent) {   
          let detailPath = oEvent.getSource().getParent().getBindingContext("detailData").getPath();
          let detail = this.getView().getModel("detailData").getProperty(`${detailPath}`);
          this.getOwnerComponent().getModel("datiAppoggio").setProperty("/posizioneCorrente", detail);

          let oNextUIState;
          this.getOwnerComponent()
            .getHelper()
            .then(
              function (oHelper) {
                oNextUIState = oHelper.getNextUIState(1);
                this.getRouter().navTo("Detail2Master3", {
                  idTestata: detail.id_testata,
                  idPosizione: detail.id,
                  layout: oNextUIState.layout,
                });
              }.bind(this)
            );
        },
      }
    );
  }
);
