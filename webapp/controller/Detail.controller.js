sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel"],
  function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Detail", {
      onInit: function () {
        this.getRouter().getRoute("detail").attachPatternMatched(this._onObjectMatched, this);
        this.prevApp = undefined
      },
      _onObjectMatched: function (oEvent) {
        if (oEvent.getParameters().arguments.prevApp === "master3") {
          this.prevApp = "master3"
        } else if (oEvent.getParameters().arguments.prevApp === "archivio") {
          this.prevApp = "archivio"
        } 
        let detailData = this.getModel("datiAppoggio").getProperty("/");
        let oDetailModel = new JSONModel(detailData);
        this.setModel(oDetailModel, "detailData");
        this.grafico()
      },
      grafico: function () {
        let oDetailData = this.getModel("detailData").getData()
        let dataChart = []
        let dataChartPercentuali = []
        oDetailData.WEEKS.forEach(function (weekData) {
            dataChart.push({
                "Settimane": weekData.WEEK.slice(0, 4) + "/" + weekData.WEEK.slice(4),  
                "ValoreRicavo": parseFloat(weekData.QTY) 
            })
            dataChartPercentuali.push({
              "Settimane": weekData.WEEK.slice(0, 4) + "/" + weekData.WEEK.slice(4),
              "VariazionePercentuale": parseFloat(weekData.PERC)
          });
        })
        
        oDetailData.ProductCollection = [{
          variazioni_quantita: dataChart,
          variazioni_percentuali: dataChartPercentuali
        }]
        this.getModel("detailData").setData(oDetailData);
    },

     
    });
  }
);
