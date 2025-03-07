sap.ui.define(
  ["./BaseController", "sap/ui/model/json/JSONModel", "../model/models"],
  function (BaseController, JSONModel, models ) {
    "use strict";

    return BaseController.extend("programmi.consegne.edi.controller.Master2", {
      onInit: function () {
        // Carica i dati dei clienti
        this.setModel(models.createMainModel(), "main");
        this.getRouter().getRoute("master2").attachPatternMatched(this._onObjectMatched, this);
        var oCustomersModel = new JSONModel(
          sap.ui.require.toUrl("programmi/consegne/edi/mockdata/customers.json")
        );
        this.getView().setModel(oCustomersModel, "customers");

        // Modello per il cliente selezionato
        var oSelectedCustomerModel = new JSONModel();
        this.getView().setModel(oSelectedCustomerModel, "selectedCustomer");
  
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
        // Ottieni l'ID del cliente selezionato dal ComboBox
        var oComboBox = this.byId("customerComboBox");
        var sCustomerId = oComboBox.getSelectedKey();

        if (!sCustomerId) {
          MessageToast.show("Per favore, seleziona un cliente.");
          return;
        }

        // Ottieni il modello dei clienti
        var oCustomersModel = this.getView().getModel("customers");
        var aCustomers = oCustomersModel.getProperty("/Customers");

        // Trova il cliente selezionato
        var oSelectedCustomer = aCustomers.find(function (customer) {
          return customer.CustomerID === sCustomerId;
        });

        if (!oSelectedCustomer) {
          MessageToast.show("Cliente non trovato.");
          return;
        }

        // Imposta i dati del cliente selezionato
        var oSelectedCustomerModel =
          this.getView().getModel("selectedCustomer");
        oSelectedCustomerModel.setData(oSelectedCustomer);
      },
      
    });
  }
);
