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
          if (!oData.log) {
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
        onProcessaButton: function (oEvent) {
          let table = this.getView().byId("tablePos");
          let indices = table.getSelectedIndices();
          let items = [];
          let that = this
          if (indices.length === 0) {
              sap.m.MessageBox.alert("Si prega di selezionare almeno una posizione");
              return;
          }
      
          // Mappa gli elementi selezionati
          items = indices.map(function (iIndex) {
              return table.getContextByIndex(iIndex).getObject();
          });
      
          let itemList = items
              .map(
                  (item) =>
                      `Codice cliente materiale: ${item.codice_cliente_materiale} - ID: ${item.id} - Codice materiale fornitore: ${item.codice_materiale_fornitore}\n`
              )
              .join("");
      
          let message = `Vuoi continuare con questi elementi? \n ${itemList}`;
      
          sap.m.MessageBox.confirm(message, {
              icon: sap.m.MessageBox.Icon.WARNING,
              title: "Riepilogo",
              actions: [
                  sap.m.MessageBox.Action.YES,
                  sap.m.MessageBox.Action.NO,
              ],
              emphasizedAction: sap.m.MessageBox.Action.YES,
              onClose: async function (oAction) {
                  if (oAction !== sap.m.MessageBox.Action.YES) {
                      return;
                  }
      
                  let payload = items.map((x) => x.id);
                  let obj = { id: payload };
                  let oModel = this.getOwnerComponent().getModel("modelloV2");
                  this.showBusy(0);
                  try {
                      let res = await API.createEntity(oModel, "/Processamento", obj); 
                      if (res.results.length > 0) {
                        let modelloReport = new JSONModel({
                          successo: "",
                          errore: "",
                        });
                        that.setModel(modelloReport, "modelloReport");
                        let success = [];
                        let error = [];
                        res.results.forEach((x) => {
                          if (x.status === "51") {
                            let el = items.find((y) => x.id === y.id);
                            error.push(Object.assign(el, x));
                          } else {
                            let el = items.find((y) => x.id === y.id);
                            success.push(Object.assign(el, x));
                          }
                        });
                        that
                          .getModel("modelloReport")
                          .setProperty("/successo", success);
                        that.getModel("modelloReport").setProperty("/errore", error);
                        // that._refreshData("01");
                        that._refreshDetailData()
                        if (!that._fragment) {
                          Fragment.load({
                            name: "programmi.consegne.edi.view.fragments.reportDelfor",
                            controller: this,
                          }).then(
                            function (oFragment) {
                              this._fragment = oFragment;
                              this.getView().addDependent(this._fragment);
                              this._fragment.open();
                            }.bind(this)
                          );
                        } else {
                          that._fragment.setModel("modelloReport");
                          that._fragment.open();
                        }
                      } else {
                        MessageBox.error("Elaborazione non andata a buon fine");
                      }
                  } catch (error) {
                      MessageBox.error("Errore durante il processamento.");
                  } finally {
                      this.hideBusy(0);
                  }
              }.bind(this), 
          });
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
