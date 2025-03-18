sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel",   "../model/API",
    "../model/models",
    "../model/formatter",],
  function (BaseController, JSONModel,API,models, formatter) {
    "use strict";
    
    return BaseController.extend(
      "programmi.consegne.edi.controller.DettSelfBilling",
      {
        formatter: formatter,
        onInit: function () {
          
          this.getRouter().getRoute("dettSelfBilling").attachPatternMatched(this._onObject, this);
        },

        _onObject: async function (oEvent) {
          
          this._id =oEvent.getParameter("arguments").id || this._id || "0";
          try {
            this.showBusy(0);
            
            let dettaglio = await API.readByKey(
              this.getOwnerComponent().getModel("selfBillingV2"),
              "/Testata",
              { id: this._id},
              [],
              [
                "dettaglio_fattura,dettaglio_fattura/riferimento_ddt,dettaglio_fattura/riferimento_ddt/riga_fattura",
              ],
            );
            console.log(dettaglio);
            dettaglio.dettaglio_fattura.results.forEach(pos=> {
              pos.data_fattura = formatter.formatDate(pos.data_fattura)
              pos.data_scadenza_fattura = formatter.formatDate(pos.data_scadenza_fattura)
              pos.riferimento_ddt = Object.values(pos.riferimento_ddt.results);
              pos.riferimento_ddt.forEach(posit=>{
              posit.data_ddt_cliente = formatter.formatDate(posit.data_ddt_cliente)
              })
            })
            this.getView().setModel(
              new JSONModel(),
              "detailData"
            );
            this.getModel("detailData").setProperty("/DettaglioMaster3", dettaglio);
            this.getModel("detailData").setProperty("/DettaglioFatture", dettaglio.dettaglio_fattura.results);
            this._registerForP13n(oEvent, "tablePosSB")
          } catch (error) {
            MessageBox.error("Errore durante la ricezione dei Dati");
          }  
          finally {
            this.hideBusy(0)
          }
        },
        onCollapseAll: function (oEvent) {
          
          let oTable = oEvent.getSource().getParent().getParent()
            oTable.collapseAll();
        },
        onExpandFirstLevel: function (oEvent) {        
          let oTable = oEvent.getSource().getParent().getParent()
          oTable.expandToLevel(2);
          
        },
  
      }
    );
  }
);
