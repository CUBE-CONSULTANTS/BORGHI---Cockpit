sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend(
      "sap.ui.demo.fiori2.controller.Detail2Master3",
      {
        onInit: function () {
          debugger;
          this.oOwnerComponent = this.getOwnerComponent();
          this.oRouter = this.oOwnerComponent.getRouter();
          this.oModel = this.oOwnerComponent.getModel();

          this.oRouter
            .getRoute("Detail2Master3")
            .attachPatternMatched(this._onProductMatched, this);
        },

        _onProductMatched: function (oEvent) {
          debugger;
          this._product =
            oEvent.getParameter("arguments").product || this._product || "0";
          let productData = JSON.parse(this._product);
          let codiceClienteMateriale = productData.codice_cliente_materiale;
          let numeroOrdineAcquisto = productData.numero_ordine_acquisto;
          let materiale = productData.descrizione_materiale;
          let idoc = productData.numero_idoc;
          let datiElementoSelect = productData.DelforSchedulazioni;

          //prova per testata info
          let datiElementoSelect2 = this.getOwnerComponent()
            .getModel("master3")
            .getProperty("/Master3")
            .find((x) => (x.DelforPosizioni.id = this._product));
          datiElementoSelect2.DelforPosizioni =
            datiElementoSelect2.DelforPosizioni.flat();
          this.getView().setModel(
            new sap.ui.model.json.JSONModel(),
            "detailData2"
          );
          this.getView()
            .getModel("detailData2")
            .setProperty("/DettaglioMaster3", datiElementoSelect2);

          // fine prova
          datiElementoSelect = datiElementoSelect
            .map((item) => {
              if (item.data_spedizione_richiesta_effettiva) {
                item.data_spedizione_richiesta_effettiva = this.formatDate(
                  item.data_spedizione_richiesta_effettiva
                );
              }
              return item;
            })
            .sort((a, b) => {
              let dateA = this.parseDate(a.data_spedizione_richiesta_effettiva);
              let dateB = this.parseDate(b.data_spedizione_richiesta_effettiva);
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
          var sNextLayout = this.oModel.getProperty(
            "/actionButtonsInfo/midColumn/fullScreen"
          );
          this.oRouter.navTo("Detail2Master3", {
            layout: sNextLayout,
            product: this._product,
          });
        },

        handleExitFullScreen: function () {
          var sNextLayout = this.oModel.getProperty(
            "/actionButtonsInfo/midColumn/exitFullScreen"
          );
          this.oRouter.navTo("Detail2Master3", {
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
            .getViewName();
          // oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getCurrentBeginColumnPage().getProperty('viewName')
          var sNextLayout = this.oModel.getProperty(
            "/actionButtonsInfo/midColumn/closeColumn"
          );
          //prova chiusura colonna e nav
          if (
            currentBegColViewName !== "sap.ui.demo.fiori2.view.DetailMaster3"
          ) {
            sNextLayout = this.oRouter.navTo("master3", {
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
          this.oRouter
            .getRoute("master3")
            .detachPatternMatched(this._onProductMatched, this);
          this.oRouter
            .getRoute("detailMaster3")
            .detachPatternMatched(this._onProductMatched, this);
        },
      }
    );
  }
);
