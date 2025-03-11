sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Detail", {
      onInit: function () {
        this.getRouter()
          .getRoute("detail")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      _onObjectMatched: function (oEvent) {
        

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

      handleClose: function () {
        // var sNextLayout = this.oModel.getProperty(
        //   "/actionButtonsInfo/midColumn/closeColumn"
        // );
        // this.getRouter().navTo("master", { layout: sNextLayout });
      },
    });
  }
);
