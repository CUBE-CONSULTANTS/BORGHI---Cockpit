sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "../model/formatter",
	"sap/m/MessageBox", "../model/API",],
  function (BaseController,
	JSONModel,
	formatter,
	MessageBox, API) {
    "use strict";
    
    return BaseController.extend(
      "programmi.consegne.edi.controller.Detail2Master3",
      {
        formatter: formatter,
        onInit: function () {
          this.getRouter().getRoute("Detail2Master3").attachPatternMatched(this._onProductMatched, this);
        },

        _onProductMatched: async function (oEvent) {  
          
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
          let numeroProgressivoInvio = this.getModel("datiAppoggio").getProperty("/testata").numero_progressivo_invio;
          let cliente = this.getModel("datiAppoggio").getProperty("/testata").codice_buyer;
          let testataId = productData.testata.id;
          let posizioneId = productData.posizioneCorrente.id;
          try {
            this.showBusy(0)
            let datiElementoSelect = await API.readByKey(
              this.getOwnerComponent().getModel("modelloV2"),
              "/Posizioni",
              { id: posizioneId, id_testata: testataId  },
              [],
              [`schedulazioni`]
            );
            let schedulazioni = datiElementoSelect.schedulazioni.results;
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
              schedulazioni: schedulazioni,
              codiceClienteMateriale,
              numeroOrdineAcquisto,
              materiale,
              idoc,
            }),
            "detailSched"
          );
          } catch (error) {
            MessageBox.error("Errore durante il recupero delle Schedulazioni")
          }finally{
            this.hideBusy(0)
          }
          
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
