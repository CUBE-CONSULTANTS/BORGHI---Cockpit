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
          let productData = this.getModel("datiAppoggio").getData();
          const {
            posizioneCorrente: {
              codice_cliente_materiale: codiceClienteMateriale,
              numero_ordine_acquisto: numeroOrdineAcquisto,
              descrizione_materiale: materiale,
              numero_idoc: idoc,
              testata: {
                numero_progressivo_invio: numeroProgressivoInvio,
                codice_buyer: cliente
              } = {}
            } = {}
          } = productData;
          if (codiceClienteMateriale === undefined) {
            let oFlexibleColumnLayout = this.getOwnerComponent().getModel("layout");
            let sNextLayout = oFlexibleColumnLayout.getProperty("/actionButtonsInfo/endColumn/closeColumn");
            this.getModel("layout").setProperty("/layout", sNextLayout);
            this.getRouter().navTo("home");
            return;
          }
          const testataId = oEvent.getParameter("arguments").idTestata;
          const posizioneId = oEvent.getParameter("arguments").idPosizione;
          try {
            this.showBusy(0)
            let datiElementoSelect = await API.readByKey(
              this.getOwnerComponent().getModel("modelloV2"),
              "/Posizioni",
              { id: posizioneId, id_testata: testataId },
              [],
              [`schedulazioni`]
            );
            const schedulazioni = datiElementoSelect?.schedulazioni?.results || []
            const oDetailModel = new JSONModel({
              codiceClienteMateriale,
              numeroOrdineAcquisto,
              materiale,
              idoc,
              numeroProgressivoInvio,
              cliente,
              schedulazioni
            });
            this.getView().setModel(oDetailModel, "detailSched");
          } catch (error) {
            MessageBox.error("Errore durante il recupero delle Schedulazioni")
          } finally {
            this.hideBusy(0)
          }
        },
        handleClose: function (oEvent) {
          let currentBegColViewName = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getCurrentBeginColumnPage().getProperty("viewName");
          var sNextLayout = this.getOwnerComponent().getModel("layout").getProperty(
            "/actionButtonsInfo/midColumn/closeColumn"
          );
          if (currentBegColViewName.includes('archivio')) {
            sNextLayout = this.getRouter().navTo("archivio", {
              layout: oEvent.getSource().getParent().getParent().getParent().getParent().getParent().setLayout(),
              product: this._product,
            });
          }
          if (currentBegColViewName === 'programmi.consegne.edi.view.Master3') {
            sNextLayout = this.getRouter().navTo("master3", {
              layout: oEvent.getSource().getParent().getParent().getParent().getParent().getParent().setLayout(),
              product: this._product,
            });
          }
          if (currentBegColViewName === 'programmi.consegne.edi.view.DetailMaster3') {
            this.onNavBack()
          }
        },
      }
    );
  }
);
