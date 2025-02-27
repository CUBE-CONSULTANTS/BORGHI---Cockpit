sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "../model/formatter"],
  function (BaseController, JSONModel, formatter) {
    "use strict";
    
    return BaseController.extend(
      "programmi.consegne.edi.controller.Detail2Master3",
      {
        formatter: formatter,
        onInit: function () {
          debugger;     
          this.getRouter().getRoute("Detail2Master3").attachPatternMatched(this._onProductMatched, this);
        },

        _onProductMatched: function (oEvent) {
          debugger;
          this._product = oEvent.getParameter("arguments").product || this._product || "0";
          let productData = this.getModel("datiAppoggio").getData();
          let codiceClienteMateriale = productData.posizioneCorrente.codice_cliente_materiale;
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
          datiElementoSelect = datiElementoSelect
            .map((item) => {
              if (item.data_spedizione_richiesta_da) {
                item.data_spedizione_richiesta_da = formatter.formatDate(
                  item.data_spedizione_richiesta_da
                );
              }
              if (item.data_spedizione_richiesta_a) {
                item.data_spedizione_richiesta_a = formatter.formatDate(
                  item.data_spedizione_richiesta_a
                );
              }
              return item;
            })
            .sort((a, b) => {
              let dateA = formatter.parseDate(a.data_spedizione_richiesta_da);
              let dateB = formatter.parseDate(b.data_spedizione_richiesta_da);
              return dateA - dateB;
            });

          this.getView().setModel(
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
        onEditToggleButtonPress: function () {
          var oObjectPage = this.getView().byId("ObjectPageLayout"),
            bCurrentShowFooterState = oObjectPage.getShowFooter();

          oObjectPage.setShowFooter(!bCurrentShowFooterState);
        },

        handleFullScreen: function () {
          var sNextLayout = this.getOwnerComponent().getModel().getProperty(
            "/actionButtonsInfo/midColumn/fullScreen"
          );
          this.getRouter().navTo("Detail2Master3", {
            layout: sNextLayout,
            product: this._product,
          });
        },

        handleExitFullScreen: function () {
          var sNextLayout = this.getOwnerComponent().getModel().getProperty(
            "/actionButtonsInfo/midColumn/exitFullScreen"
          );
          this.getRouter().navTo("Detail2Master3", {
            layout: sNextLayout,
            product: this._product,
          });
        },

        handleClose: function (oEvent) {
          debugger;
          let currentBegColViewName = oEvent
            .getSource()
            .getParent()
            .getParent()
            .getParent()
            .getParent()
            .getParent()
            .getCurrentBeginColumnPage()
            .getProperty("viewName");

          var sNextLayout = this.getOwnerComponent().getModel().getProperty(
            "/actionButtonsInfo/midColumn/closeColumn"
          );
          //prova chiusura colonna e nav
          if (currentBegColViewName === undefined) {
            sNextLayout = this.getRouter().navTo("master3", {
              layout: sNextLayout,
              product: this._product,
            });
          } else {
            oEvent
              .getSource()
              .getParent()
              .getParent()
              .getParent()
              .getParent()
              .getParent()
              .setLayout();
          }
        },

        onExit: function () {
          this.getRouter()
            .getRoute("master3")
            .detachPatternMatched(this._onProductMatched, this);
          this.getRouter()
            .getRoute("detailMaster3")
            .detachPatternMatched(this._onProductMatched, this);
        },
      }
    );
  }
);
