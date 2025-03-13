sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "../model/models",
    "../model/API",
    "sap/m/MessageBox",
  ],
  function (BaseController, JSONModel, models, API, MessageBox) {
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
        await this._getMatchCode()
        let oFiltriNav = this.getOwnerComponent().getModel("datiAppoggio").getProperty("/filtriNav")
        if(oFiltriNav){
          let oCodClienteComboBox = this.byId("idClientiComboBox2"); 
          if (oFiltriNav.codice_cliente && oCodClienteComboBox) {
            oCodClienteComboBox.setSelectedKey(oFiltriNav.codice_cliente);
            oCodClienteComboBox.setValue(oFiltriNav.codice_cliente);
          }
        }
      },
      onSearch: function (oEvent) {
        let aFilters = this.getFiltersVariazioni(oEvent.getSource())
        debugger
        if(aFilters.length > 0) {
          
        this._searchVarCliente(aFilters)
        }else{
          MessageBox.error("Inserire il filtro di ricerca Cliente");
        }
        // /odata/v2/delivery-forecast/EIGHTWEEK_CLI?$expand=RETURN_DATA&$filter=CLIENTE eq '0000200191'
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
          // this.setModel(new JSONModel(formattedData), "variazioneArticolo");
          // this.getModel("main").setProperty("/visibility", true);
        } catch (error) {
          MessageBox.error("Errore durante la ricezione dei dati ", error);
        } finally {
          this.hideBusy(0);
        }
      },
      navToHome: function () {
        this.getOwnerComponent().getModel("datiAppoggio").setProperty("/filtriNav","")
        this.byId("idClientiComboBox2").setSelectedKey("")
        this.byId("idClientiComboBox2").setValue("")
        this.getModel("main").setProperty("/visibility",false)
        this.getRouter().navTo("home");
      },
    });
  }
);
