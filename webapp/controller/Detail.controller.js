sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Detail", {
      onInit: function () {
        this.getRouter()
          .getRoute("detail")
          .attachPatternMatched(this._onObjectMatched, this);
      },

      _onObjectMatched: function (oEvent) {
        debugger
        let detailData = this.getModel("datiAppoggio").getProperty("/");
        let oDetailModel = new JSONModel(detailData);
        this.setModel(oDetailModel, "detailData");
        this.grafico()
      },
      grafico: function () {
        debugger
        let oDetailData = this.getModel("detailData").getData()
        let dataChart = []
        oDetailData.WEEKS.forEach(function (weekData) {
            dataChart.push({
                "Settimane": weekData.WEEK,  
                "Valore Ricavo": parseFloat(weekData.QTY) 
            })
        })
        oDetailData.ProductCollection = [{
            variazioni_quantita: dataChart
        }]
        this.getModel("detailData").setData(oDetailData);
    },

     
    });
  }
);
