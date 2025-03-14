sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/models",
    "../model/API",
    "../model/formatter",
    "sap/m/MessageBox",
  ],
  function (BaseController, JSONModel, models, API, formatter, MessageBox) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Master2", {
      onInit: function () {
        this.setModel(models.createMainModel(), "main");
        this.getRouter()
          .getRoute("master2")
          .attachPatternMatched(this._onObjectMatched, this);
      },
      _onObjectMatched: async function (oEvent) {
        
        if ( oEvent.getParameters().arguments.prevApp === "master3") {
          this.getModel("main").setProperty("/backToMon", true);
          this.getModel("main").setProperty("/backToArch", false);
        } else if (oEvent.getParameters().arguments.prevApp === "archivio") {
          this.getModel("main").setProperty("/backToArch", true);
          this.getModel("main").setProperty("/backToMon", false);
        } else {
          this.getModel("main").setProperty("/backToMon", false);
          this.getModel("main").setProperty("/backToArch", false);
        }
        await this._getMatchCode();
        let oFiltriNav = this.getOwnerComponent()
          .getModel("datiAppoggio")
          .getProperty("/filtriNav");
        if (oFiltriNav) {
          let oCodClienteComboBox = this.byId("idClientiComboBox2");
          if (oFiltriNav.codice_cliente && oCodClienteComboBox) {
            oCodClienteComboBox.setSelectedKey(oFiltriNav.codice_cliente);
            oCodClienteComboBox.setValue(oFiltriNav.codice_cliente);
          }
        }
      },
      onSearch: function (oEvent) {
        let aFilters = this.getFiltersVariazioni(oEvent.getSource());
        if (aFilters.length > 0) {
          this._searchVarCliente(aFilters);
        } else {
          MessageBox.error("Inserire il filtro di ricerca Cliente");
        }
      },
      _searchVarCliente: async function (aFilters) {
        try {
          this.showBusy(0);
          let dataCall = await API.getEntity(
            this.getOwnerComponent().getModel("modelloV2"),
            "/EIGHTWEEK_CLI",
            aFilters,
            ["RETURN_DATA"]
          );
          if (dataCall.results.length) {
          dataCall.results.forEach((element) => {
            element.WEEK =
              element.WEEK.slice(0, 4) + "/" + element.WEEK.slice(4);
              element.percPos = element.VAR_PERCPOS;
              element.percNeg = formatter.convertNegative(element.VAR_PERCNEG);
              element.VAR_PERCTOT = formatter.formattedPerc(element.VAR_PERCTOT);
              element.VAR_PERCPOS = formatter.formattedPerc(element.VAR_PERCPOS);
              element.VAR_PERCNEG = formatter.formattedPerc(element.VAR_PERCNEG);
              element.VAR_NEG = formatter.convertNegative(element.VAR_NEG)
              element.VAR_TOT = formatter.convertNegative(element.VAR_TOT);
            });
            this.setModel(new JSONModel(dataCall.results), "variazioneCliente");
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
      navToHome: function () {
        this.refreshOnExit()
        this.getRouter().navTo("home");
      },

      onSort: function (oEvent) {
        let oTable = this.byId("clienteTable");
        let aSorters = [];
        aSorters = this.sortTables(oTable, [
          "WEEK"
        ]);
      },

      downloadExcelFile: function (oEvent) {
        let table = this.byId("clienteTable");
        this.createExcel(table);
      },
    });
  }
);
