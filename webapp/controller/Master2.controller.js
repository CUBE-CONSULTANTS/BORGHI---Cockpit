sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "../model/models"],
  function (BaseController, JSONModel, models ) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Master2", {
      onInit: function () {
        this.setModel(models.createMainModel(), "main");
        this.getRouter().getRoute("master2").attachPatternMatched(this._onObjectMatched, this);
  
      },
      _onObjectMatched: function (oEvent) { 
        
        if(oEvent.getParameters().arguments.prevApp === 'monitor') {
          this.getModel("main").setProperty("/backToMon", true)
        }else if(oEvent.getParameters().arguments.prevApp === 'archivio'){
          this.getModel("main").setProperty("/backToArch", true)
        }else{
          this.getModel("main").setProperty("/backToMon", false);
          this.getModel("main").setProperty("/backToArch", false);
        }
      },
      onSearch: function (oEvent) {
       
      },
      
    });
  }
);
