sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController) {
    "use strict";

    return BaseController.extend("sap.ui.demo.fiori2.controller.DetailMaster3", {
      onInit: function () {
        this.oOwnerComponent = this.getOwnerComponent();

        this.oRouter = this.oOwnerComponent.getRouter();
        this.oModel = this.oOwnerComponent.getModel();

        this.oRouter
          .getRoute("master3")
          .attachPatternMatched(this._onProductMatched, this);
        this.oRouter
          .getRoute("detailMaster3")
          .attachPatternMatched(this._onProductMatched, this);
      },

      _onProductMatched: function (oEvent) {
        debugger;
        this._product =
          oEvent.getParameter("arguments").product || this._product || "0";
        ///prova anthea binding su table
        // let datiElementoSelect=this.getOwnerComponent().getModel("master3").getProperty(`/Master3/${this._product}`)
        let datiElementoSelect = this.getOwnerComponent()
          .getModel("master3")
          .getProperty("/Master3")
          .find((x) => (x.DelforTestata.id = this._product));
        datiElementoSelect.DelforPosizioni =
          datiElementoSelect.DelforPosizioni.flat();
        this.getView().setModel(
          new sap.ui.model.json.JSONModel(),
          "detailData"
        );
        this.getView()
          .getModel("detailData")
          .setProperty("/DettaglioMaster3", datiElementoSelect);
        // this.getView().bindElement({
        // 	path: "/ProductCollection/" + this._product,
        // 	model: "products"
        // });
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
        this.oRouter.navTo("detailMaster3", {
          layout: sNextLayout,
          product: this._product,
        });
      },

      handleExitFullScreen: function () {
        var sNextLayout = this.oModel.getProperty(
          "/actionButtonsInfo/midColumn/exitFullScreen"
        );
        this.oRouter.navTo("detailMaster3", {
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
    });
  }
);
