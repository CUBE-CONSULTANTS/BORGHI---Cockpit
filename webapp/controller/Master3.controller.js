sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/library"
], function (Controller, JSONModel, Sorter, CoreLibrary) {
    "use strict";

    const SortOrder = CoreLibrary.SortOrder;

    return Controller.extend("sap.ui.demo.fiori2.controller.Master3", {

        onInit: function () {
            // var oMaster3Model = new JSONModel(sap.ui.require.toUrl('sap/ui/demo/fiori2/mockdata/master3.json'));
			// this.getView().setModel(oMaster3Model, 'master3');
            this.oRouter = this.getOwnerComponent().getRouter();
        },

        onFilterSelect: function (oEvent){
        var selectedKey= this.getView().byId("idIconTabBar").getSelectedKey();

        switch (selectedKey) {
            case "01":
                var oMaster3Model = new JSONModel(sap.ui.require.toUrl('sap/ui/demo/fiori2/mockdata/master3.json'));
                this.getOwnerComponent().setModel(oMaster3Model, 'master3');
                break;
            case "02":
                this.getView().setModel(new JSONModel({}), 'master3');
                break;
            case "03":
              
                break;
            case "04":
              
                break;
        }
        },

        sortCategoriesAndName: function(oEvent) {
			const oView = this.getView();
			const oTable = oView.byId("table");
			oTable.sort(oView.byId("cliente"), SortOrder.Ascending, false);
			oTable.sort(oView.byId("dataRicezione"), SortOrder.Ascending, true);
		},
        sortCategories: function(oEvent) {
			const oView = this.getView();
			const oTable = oView.byId("table");
			const oCategoriesColumn = oView.byId("cliente");

			oTable.sort(oCategoriesColumn, this._bSortColumnDescending ? SortOrder.Descending : SortOrder.Ascending, /*extend existing sorting*/true);
			this._bSortColumnDescending = !this._bSortColumnDescending;
		},

        rowDetailPress: function (oEvent) {
			var detailPath = oEvent.getParameter("rowBindingContext").getPath(),
				detail = detailPath.split("/").slice(-1).pop(),
				oNextUIState;
			this.getOwnerComponent().getHelper().then(function (oHelper) {
				oNextUIState = oHelper.getNextUIState(1);
				this.oRouter.navTo("detailMaster3", {
                    product: detail,
					layout: oNextUIState.layout				
				});
			}.bind(this));
		},

        navToHome: function() {
			this.oRouter.navTo("home");
		}
    });
});