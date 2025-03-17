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
            .attachPatternMatched(this._onProductMatched, this);
        },
        _onProductMatched: async function (oEvent) {
          
          const oHistory = History.getInstance();
          this.prevHash = oHistory.getPreviousHash()
          let operator
          if(this.prevHash === 'master3'){
           operator = 'ne' 
          }else if (this.prevHash === 'archivio'){
            operator = 'eq'
          }
          this._id = oEvent.getParameter("arguments").id || this._id || "0";
          this._idMaster = oEvent.getParameter("arguments").idmaster || this._id || "0";
          
          try {
            this.showBusy(0)
            let dettaglio = await API.readByKey( this.getOwnerComponent().getModel("modelloV2"), "/Testata", {id: this._id, id_master: this._idMaster}, [], [
              `posizioni,posizioni($expand=log,schedulazioni,testata),master`,
            ])
            // dettaglio.master.data_ricezione = formatter.formatDateString(dettaglio.master.data_ricezione)
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
        onReturn: function(){
          this.prevHash === 'archivio'? this.navToArchive(): this.handleCloseDetail()
        },
        onStatoPress: function(oEvent) {
          let oSource = oEvent.getSource();
          let oBindingContext = oSource.getBindingContext("detailData");
          let oData = oBindingContext.getObject();
          if (oData.log.length === 0) {
            MessageBox.error("Nessun log disponibile per questa posizione");
            return;
          }
          let sortedLogs = oData.log.sort((a, b) => {
            let dateA = new Date(a.data).getTime(); 
            let dateB = new Date(b.data).getTime();
    
            if (dateA === dateB) {
                return b.ora.ms - a.ora.ms;
            }
            return dateB - dateA; 
          });
          let oModel = new JSONModel();
          oModel.setData({ logs: sortedLogs }); 
          if (!this._oDialog) {
            this._oDialog = sap.ui.xmlfragment("programmi.consegne.edi.view.fragments.detailStato", this);
            this.getView().addDependent(this._oDialog);
          }     
          this._oDialog.setModel(oModel, "logData");
          this._oDialog.open();
        },      
        
        buttonDetailSched: function (oEvent) {
          
          let detailPath = oEvent
            .getSource()
            .getParent()
            .getBindingContext("detailData")
            .getPath();

          let detail = this.getView()
            .getModel("detailData")
            .getProperty(`${detailPath}`);

          this.getOwnerComponent()
            .getModel("datiAppoggio")
            .setProperty("/schedulazioni", detail.schedulazioni.results);

          this.getOwnerComponent()
            .getModel("datiAppoggio")
            .setProperty("/posizioneCorrente", detail);

          let oNextUIState;
          this.getOwnerComponent()
            .getHelper()
            .then(
              function (oHelper) {
                oNextUIState = oHelper.getNextUIState(1);
                this.getRouter().navTo("Detail2Master3", {
                  product: detail.id,
                  layout: oNextUIState.layout,
                });
              }.bind(this)
            );
        },
      }
    );
  }
);
