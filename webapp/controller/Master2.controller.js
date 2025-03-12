sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/models",
    "../model/API",
  ],
  function (BaseController, JSONModel, models, API) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Master2", {
      onInit: function () {
        this.setModel(models.createMainModel(), "main");
        this.getRouter()
          .getRoute("master2")
          .attachPatternMatched(this._onObjectMatched, this);
      },
      _onObjectMatched: async function (oEvent) {
        if (oEvent.getParameters().arguments.prevApp === "monitor") {
          this.getModel("main").setProperty("/backToMon", true);
        } else if (oEvent.getParameters().arguments.prevApp === "archivio") {
          this.getModel("main").setProperty("/backToArch", true);
        } else {
          this.getModel("main").setProperty("/backToMon", false);
          this.getModel("main").setProperty("/backToArch", false);
        }

        let model = this.getOwnerComponent().getModel("modelloV2");
        let clienti = await API.getEntity(model, "/T661W", [], []);
        this.getView().setModel(new JSONModel(), "matchcode");
        this.getView()
          .getModel("matchcode")
          .setProperty("/clienti", clienti.results);
      },
      onSearch: function (oEvent) {},
    });
  }
);
