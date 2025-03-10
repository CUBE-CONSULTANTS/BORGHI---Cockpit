sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Detail", {
      onInit: function () {
        this.oModel = this.getOwnerComponent.getModel("layout");

        this.getRouter().getRoute("master").attachPatternMatched(this._onProductMatched, this);
        this.getRouter().getRoute("detail").attachPatternMatched(this._onProductMatched, this);
      },

      _onProductMatched: function (oEvent) {
        
        this._product =
          oEvent.getParameter("arguments").product || this._product || "0";
        ///prova anthea binding su table
        let datiElementoSelect = this.getOwnerComponent()
          .getModel("products")
          .getProperty(`/ProductCollection/${this._product}`);
        this.getView().setModel(
          new sap.ui.model.json.JSONModel(),
          "detailData"
        );
        this.getView()
          .getModel("detailData")
          .setProperty("/ProductCollection", [datiElementoSelect]);
        // this.getView().bindElement({
        // 	path: "/ProductCollection/" + this._product,
        // 	model: "products"
        // });
      },
      // grafico: function () {
      // 	var oModel = this.getOwnerComponent().getModel("ProductModel");
      // 	this.getView().setModel(oModel, "ProductModel");
      // 	console.log("ProductModel data:", oModel.getData());

      // 	var oModelChart = new sap.ui.model.json.JSONModel();
      // 	var data = oModel.getProperty("/");
      // 	var dataChart = [];

      // 	var yearValues = {};

      // 	data.forEach((item) => {
      // 		var dateParts = item.periodoAcquisizione.split("-");
      // 		var year = new Date(dateParts[2], dateParts[1] - 1, dateParts[0]).getFullYear();
      // 		if (!yearValues[year]) {
      // 			yearValues[year] = 0;
      // 		}
      // 		var value = Number(item.valoreRicavo);
      // 		if (!isNaN(value)) {
      // 			yearValues[year] += value;
      // 		}
      // 	});

      // 	for (var year in yearValues) {
      // 		var value = yearValues[year];
      // 		if (!isNaN(year) && !isNaN(value)) {
      // 			dataChart.push({
      // 				year: year,
      // 				value: value
      // 			});
      // 		}
      // 	}

      // 	oModelChart.setData(dataChart);
      // 	this.getView().setModel(oModelChart, "ProductModelCharttt");
      // 	console.log(oModelChart);

      // },

      onEditToggleButtonPress: function () {
        var oObjectPage = this.getView().byId("ObjectPageLayout"),
          bCurrentShowFooterState = oObjectPage.getShowFooter();

        oObjectPage.setShowFooter(!bCurrentShowFooterState);
      },

      handleFullScreen: function () {
        var sNextLayout = this.oModel.getProperty(
          "/actionButtonsInfo/midColumn/fullScreen"
        );
        this.getRouter().navTo("detail", {
          layout: sNextLayout,
          product: this._product,
        });
      },

      handleExitFullScreen: function () {
        var sNextLayout = this.oModel.getProperty(
          "/actionButtonsInfo/midColumn/exitFullScreen"
        );
        this.getRouter().navTo("detail", {
          layout: sNextLayout,
          product: this._product,
        });
      },

      handleClose: function () {
        var sNextLayout = this.oModel.getProperty(
          "/actionButtonsInfo/midColumn/closeColumn"
        );
        this.getRouter().navTo("master", { layout: sNextLayout });
      },

      onExit: function () {
        this.getRouter()
          .getRoute("master")
          .detachPatternMatched(this._onProductMatched, this);
        this.getRouter()
          .getRoute("detail")
          .detachPatternMatched(this._onProductMatched, this);
      },
    });
  }
);
