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
            if (weekData.PREV_QTY && weekData.QTY) {
              let percentuale = ((weekData.QTY - weekData.PREV_QTY) / weekData.PREV_QTY) * 100;
              dataChartPercentuali.push({
                  "Settimane": weekData.WEEK.slice(0, 4) + "/" + weekData.WEEK.slice(4),
                  "VariazionePercentuale": percentuale
              });
          } else {
              dataChartPercentuali.push({
                  "Settimane": weekData.WEEK.slice(0, 4) + "/" + weekData.WEEK.slice(4),
                  "VariazionePercentuale": 0 
              });
          }
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
