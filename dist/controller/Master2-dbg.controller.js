sap.ui.define([
    "./BaseController",
    "sap/ui/model/json/JSONModel"
], function (BaseController, JSONModel) {
    "use strict";

    return BaseController.extend("sap.ui.demo.fiori2.controller.Master2", {

        onInit: function () {
            // Carica i dati dei clienti
            var oCustomersModel = new JSONModel(sap.ui.require.toUrl('sap/ui/demo/fiori2/mockdata/customers.json'));
            this.getView().setModel(oCustomersModel, "customers");

            // Modello per il cliente selezionato
            var oSelectedCustomerModel = new JSONModel();
            this.getView().setModel(oSelectedCustomerModel, "selectedCustomer");

            this.oRouter = this.getOwnerComponent().getRouter();
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
            var oSelectedCustomerModel = this.getView().getModel("selectedCustomer");
            oSelectedCustomerModel.setData(oSelectedCustomer);
        },
        navToHome: function() {
			this.oRouter.navTo("home");
		}
    });
});
