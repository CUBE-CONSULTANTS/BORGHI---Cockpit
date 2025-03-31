sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "../model/formatter"],
  function (BaseController, JSONModel, formatter) {
    "use strict";
    
    return BaseController.extend(
      "programmi.consegne.edi.controller.Detail2Master3",
      {
        formatter: formatter,
        onInit: function () {
          this.getRouter().getRoute("Detail2Master3").attachPatternMatched(this._onProductMatched, this);
        },

        _onProductMatched: function (oEvent) {  
          this._product = oEvent.getParameter("arguments").product || this._product || "0";
          let productData = this.getModel("datiAppoggio").getData();
          let codiceClienteMateriale = productData.posizioneCorrente.codice_cliente_materiale;
          if(codiceClienteMateriale === undefined){
            let oFlexibleColumnLayout = this.getOwnerComponent().getModel("layout");
            let sNextLayout = oFlexibleColumnLayout.getProperty("/actionButtonsInfo/endColumn/closeColumn"); 
            this.getModel("layout").setProperty("/layout", sNextLayout);
            this.getRouter().navTo("home");
            return;
          }
          let numeroOrdineAcquisto = productData.posizioneCorrente.numero_ordine_acquisto;
          let materiale = productData.posizioneCorrente.descrizione_materiale;
          let idoc = productData.posizioneCorrente.numero_idoc;
          let datiElementoSelect = productData.posizioneCorrente.schedulazioni.results;
          let numeroProgressivoInvio = this.getModel("datiAppoggio").getProperty("/testata").numero_progressivo_invio;
          let cliente = this.getModel("datiAppoggio").getProperty("/testata").codice_buyer;
          this.getView().setModel(new JSONModel(),"detailData2");
          this.getView().getModel("detailData2").setProperty("/DettaglioMaster3", {
              codiceClienteMateriale: codiceClienteMateriale,
              numeroOrdineAcquisto: numeroOrdineAcquisto,
              materiale: materiale,
              idoc: idoc,
              numeroProgressivoInvio: numeroProgressivoInvio,
              cliente: cliente,
            });

          this.setModel(
            new JSONModel({
              datiElementoSelect,
              codiceClienteMateriale,
              numeroOrdineAcquisto,
              materiale,
              idoc,
            }),
            "detailSched"
          );
        },       
        handleClose: function (oEvent) { 
          let currentBegColViewName = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getCurrentBeginColumnPage().getProperty("viewName");
          var sNextLayout = this.getOwnerComponent().getModel("layout").getProperty(
            "/actionButtonsInfo/midColumn/closeColumn"
          );     
            if(currentBegColViewName.includes('archivio')){
              sNextLayout = this.getRouter().navTo("archivio", {
                layout: oEvent.getSource().getParent().getParent().getParent().getParent().getParent().setLayout(),
                product: this._product,
              });
            }
            if(currentBegColViewName==='programmi.consegne.edi.view.Master3'){
              sNextLayout = this.getRouter().navTo("master3", {
                layout: oEvent.getSource().getParent().getParent().getParent().getParent().getParent().setLayout(),
                product: this._product,
              });
            }
            if(currentBegColViewName ==='programmi.consegne.edi.view.DetailMaster3'){
              oEvent.getSource().getParent().getParent().getParent().getParent().getParent().setLayout(sNextLayout);
            }
        },

      }
    );
  }
);
