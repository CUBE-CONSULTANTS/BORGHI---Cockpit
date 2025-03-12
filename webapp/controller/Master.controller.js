sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "../model/models",
    "../model/API",
    "sap/ui/model/json/JSONModel",
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    Sorter,
    MessageBox,
    models,
    API,
    JSONModel
  ) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Master", {
      onInit: function () {
        this.setModel(models.createMainModel(), "main");
        this.getRouter()
          .getRoute("master")
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
      onSearch: function (oEvent) {
        //  /delivery-forecast/EIGHTWEEK_MAT?$expand=WEEKS&$filter=CLIENTE eq '0000200137' and KDMAT eq 'BRESSANS_2ND_TEST'
        let aFilters = [];
        this._searchVarArticolo(aFilters);
      },
      _searchVarArticolo: async function (aFilters) {
        debugger;
        try {
          this.showBusy(0);
          let weekCall = await API.getEntity(
            this.getOwnerComponent().getModel("modelloV2"),
            "/EIGHTWEEK_MAT",
            aFilters,
            ["WEEKS"]
          );
          let labels = [];
          let formattedData = weekCall.results.map((item) => {
            return {
              CLIENTE: item.CLIENTE,
              KDMAT: item.KDMAT,
              MATNR: item.MATNR,
              GIACENZA: item.GIACENZA.trim(),
              IMPEGNO: item.IMPEGNO.trim(),
              TOTALE: item.TOTALE.trim(),
              WEEKS: item.WEEKS.results.map((week) => ({
                N_WEEK: week.N_WEEK.trim(),
                WEEK: week.WEEK.trim(),
                QTY: week.QTY.trim(),
                PERC: week.PERC.trim(),
              })),
            };
          });
          formattedData[0].WEEKS.forEach((week) => {
            if (!labels.includes(week.WEEK)) {
              labels.push(week.WEEK.slice(0, 4) + "/" + week.WEEK.slice(4));
            }
          });
          this.createWeekLabels(labels, this.byId("artTable"));
          this.setModel(new JSONModel(formattedData), "variazioneArticolo");
          this.getModel("main").setProperty("/visibility", true);
        } catch (error) {
          MessageBox.error("Errore durante la ricezione dei dati ", error);
        } finally {
          this.hideBusy(0);
        }
      },
      createWeekLabels: function (labels, table) {
        table.getColumns()[7].getMultiLabels()[0].setText(labels[0]);
        table.getColumns()[9].getMultiLabels()[0].setText(labels[1]);
        table.getColumns()[11].getMultiLabels()[0].setText(labels[2]);
        table.getColumns()[13].getMultiLabels()[0].setText(labels[3]);
        table.getColumns()[15].getMultiLabels()[0].setText(labels[4]);
        table.getColumns()[17].getMultiLabels()[0].setText(labels[5]);
        table.getColumns()[19].getMultiLabels()[0].setText(labels[6]);
        table.getColumns()[21].getMultiLabels()[0].setText(labels[7]);
      },
      onSort: function () {},
      onListItemPress: function (oEvent) {
        //apri dettaglio
        // var productPath = oEvent.getSource().getBindingContext("products").getPath(),
        //   product = productPath.split("/").slice(-1).pop(),
        //   oNextUIState;
        // this.getOwnerComponent()
        //   .getHelper()
        //   .then(
        //     function (oHelper) {
        //       oNextUIState = oHelper.getNextUIState(1);
        //       this.getRouter().navTo("detail", {
        //         layout: oNextUIState.layout,
        //         product: product,
        //       });
        //     }.bind(this)
        //   );
      },
      navToHome: function () {
        this.getRouter().navTo("home");
      },
    });
  }
);
