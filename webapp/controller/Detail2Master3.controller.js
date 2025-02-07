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
            .getRoute("master3")
            .attachPatternMatched(this._onProductMatched, this);
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
          let datiElementoSelect = productData.DelforSchedulazioni;

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

        handleClose: function () {
          var sNextLayout = this.oModel.getProperty(
            "/actionButtonsInfo/midColumn/closeColumn"
          );
          this.oRouter.navTo("master3", { layout: sNextLayout });
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
