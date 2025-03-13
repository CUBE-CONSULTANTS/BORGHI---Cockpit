sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "sap/ui/model/json/JSONModel",
    "../model/models",
    "../model/API",
    "../model/formatter",
    "sap/ui/export/Spreadsheet",
  ],
  function (
    BaseController,
    Filter,
    FilterOperator,
    Sorter,
    MessageBox,
    JSONModel,
    models,
    API,
    formatter,
    Spreadsheet
  ) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Master", {
      onInit: function () {
        this.setModel(models.createMainModel(), "main");
        this.getRouter().getRoute("master").attachPatternMatched(this._onObjectMatched, this);
        this.prevApp  = undefined 
      },
      _onObjectMatched: async function (oEvent) {      
        if ( oEvent.getParameters().arguments.prevApp === "master3") {
          this.prevApp = "master3"
          this.getModel("main").setProperty("/backToMon", true);
          this.getModel("main").setProperty("/backToArch", false);
        } else if (oEvent.getParameters().arguments.prevApp === "archivio") {
          this.prevApp = "archivio"
          this.getModel("main").setProperty("/backToArch", true);
          this.getModel("main").setProperty("/backToMon", false);
        } else {
          this.getModel("main").setProperty("/backToMon", false);
          this.getModel("main").setProperty("/backToArch", false);
        }
        await this._getMatchCode();
        let oFiltriNav = this.getOwnerComponent().getModel("datiAppoggio").getProperty("/filtriNav");
        if (oFiltriNav) {
          let oCodArtComboBox = this.byId("idMatComboBox");
          let oCodClienteComboBox = this.byId("idClientiComboBox");
          if (oFiltriNav.codice_articolo && oCodArtComboBox) {
            oCodArtComboBox.setSelectedKey(oFiltriNav.codice_articolo);
            oCodArtComboBox.setValue(oFiltriNav.codice_articolo);
          }
          if (oFiltriNav.codice_cliente && oCodClienteComboBox) {
            oCodClienteComboBox.setSelectedKey(oFiltriNav.codice_cliente);
            oCodClienteComboBox.setValue(oFiltriNav.codice_cliente);
          }
        }
      },
      onSearch: function (oEvent) {
        let aFilters = this.getFiltersVariazioni(oEvent.getSource());
        this._searchVarArticolo(aFilters);
      },
      _searchVarArticolo: async function (aFilters) {
        try {
          this.showBusy(0);
          let weekCall = await API.getEntity(
            this.getOwnerComponent().getModel("modelloV2"),
            "/EIGHTWEEK_MAT",
            aFilters,
            ["WEEKS"]
          );
          if (weekCall.results.length) {
            let labels = [];
            let formattedData = weekCall.results.map((item) => {
              return {
                CLIENTE: item.CLIENTE,
                DESCR: item.DESCR,
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
            formattedData.forEach((element) => {
              element.WEEKS.forEach((week) => {
                if (!labels.includes(week.WEEK)) {
                  labels.push(week.WEEK.slice(0, 4) + "/" + week.WEEK.slice(4));
                }
                week.PERC = formatter.formattedPerc(week.PERC);
              });
            });
            this.createWeekLabels(labels, this.byId("artTable"));
            this.setModel(new JSONModel(formattedData), "variazioneArticolo");
            this.getModel("main").setProperty("/visibility", true);
          } else {
            this.getModel("main").setProperty("/visibility", false);
            MessageBox.error("Nessun dato trovato per la ricerca");
          }
        } catch (error) {
          MessageBox.error("Errore durante la ricezione dei dati ", error);
        } finally {
          this.hideBusy(0);
        }
      },
      createWeekLabels: function (labels, table) {
        table.getColumns()[8].getMultiLabels()[0].setText(labels[0]);
        table.getColumns()[10].getMultiLabels()[0].setText(labels[1]);
        table.getColumns()[12].getMultiLabels()[0].setText(labels[2]);
        table.getColumns()[14].getMultiLabels()[0].setText(labels[3]);
        table.getColumns()[16].getMultiLabels()[0].setText(labels[4]);
        table.getColumns()[18].getMultiLabels()[0].setText(labels[5]);
        table.getColumns()[20].getMultiLabels()[0].setText(labels[6]);
        table.getColumns()[22].getMultiLabels()[0].setText(labels[7]);
      },
      onSort: function (oEvent) {
        let oTable = this.byId("artTable");
        let aSorters = [];
        aSorters = this.sortTables(oTable, [
          "CLIENTE", "MATNR"
        ]);
      },
      onOpenDetail: function (oEvent) {
        let detailPath = oEvent.getSource().getBindingContext("variazioneArticolo").getPath();
        let detail = this.getModel("variazioneArticolo").getProperty(`${detailPath}`);
        let detailMat = oEvent.getSource().getBindingContext("variazioneArticolo").getObject().MATNR;
        this.getOwnerComponent().getModel("datiAppoggio").setProperty("/", detail);
        let oNextUIState;
        this.getOwnerComponent()
          .getHelper()
          .then(
            function (oHelper) {
              oNextUIState = oHelper.getNextUIState(1);
              this.getRouter().navTo("detail", {
                mat: detailMat,
                layout: oNextUIState.layout,
                prevApp: this.prevApp,
              });
            }.bind(this)
          );
      },
      onClientiComboBoxChange: async function(oEvent){
        let aFilters = []
        aFilters.push(
          new Filter("Kunnr", FilterOperator.EQ, oEvent.getSource().getValue().split(" -")[0])
        );
        try {
          this.showBusy(0)
          let materiali = await API.getEntity(this.getOwnerComponent().getModel("modelloV2"), "/EIGHTWEEK_MC_KDMAT", aFilters, [])
          this.getModel("matchcode").setProperty("/materiali", materiali.results)
        } catch (error) {
          MessageBox.error("Errore durante il recupero dei materiali")
        }finally {
          this.hideBusy(0)
        }    
      },
      navToHome: function () {
        this.getOwnerComponent()
          .getModel("datiAppoggio")
          .setProperty("/filtriNav", "");
        this.byId("idMatComboBox").setSelectedKey("");
        this.byId("idMatComboBox").setValue("");
        this.byId("idClientiComboBox").setSelectedKey("");
        this.byId("idClientiComboBox").setValue("");
        this.getModel("main").setProperty("/visibility", false);
        this.getRouter().navTo("home");
      },

      downloadExcelFile: function (oEvent) {
        let table = this.byId("artTable");
        this.createExcel(table);
      },
      
    });
  }
);
