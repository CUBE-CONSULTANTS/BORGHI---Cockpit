sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
    "sap/ui/model/Sorter",
    "sap/m/MessageBox",
    "../model/models",
    "../model/API",
	"sap/ui/model/json/JSONModel"
  ],
  function (BaseController,
	Filter,
	FilterOperator,
	Sorter,
	MessageBox,
	models,
	API,
	JSONModel) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Master", {
      onInit: function () {
        this.setModel(models.createMainModel(), "main");
        this.getRouter().getRoute("master").attachPatternMatched(this._onObjectMatched, this);
      },
      _onObjectMatched: function (oEvent) {      
        if(oEvent.getParameters().arguments.prevApp === 'monitor') {
          this.getModel("main").setProperty("/backToMon", true)
        }else if(oEvent.getParameters().arguments.prevApp === 'archivio'){
          this.getModel("main").setProperty("/backToArch", true)
        }else{
          this.getModel("main").setProperty("/backToMon", false);
          this.getModel("main").setProperty("/backToArch", false);
        }
      },
      onSearch: function (oEvent) {      
      //  /delivery-forecast/EIGHTWEEK_MAT?$expand=WEEKS&$filter=CLIENTE eq '0000200137' and KDMAT eq 'BRESSANS_2ND_TEST'
        let aFilters = []
        this._searchVarArticolo(aFilters)
      },
      _searchVarArticolo: async function (aFilters) {
        debugger
        try {
          this.showBusy(0)
          let weekCall = await API.getEntity(this.getOwnerComponent().getModel("modelloV2"), "/EIGHTWEEK_MAT", aFilters, ['WEEKS'])         
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
              }))
            };
          });
          this.setModel(new JSONModel(formattedData),"variazioneArticolo" )
          this.getModel("main").setProperty("/visibility",true)
        } catch (error) {
          MessageBox.error("Errore durante la ricezione dei dati ",error)
        }finally {
          this.hideBusy(0);
        }
      },
      onSort: function () {     
      },

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
