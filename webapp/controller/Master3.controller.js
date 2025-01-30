sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/library",
    "sap/ui/core/Fragment",
  ],
  function (Controller, JSONModel, Sorter, CoreLibrary, Fragment) {
    "use strict";

    const SortOrder = CoreLibrary.SortOrder;

    return Controller.extend("sap.ui.demo.fiori2.controller.Master3", {
      onInit: function () {
        // var oMaster3Model = new JSONModel(sap.ui.require.toUrl('sap/ui/demo/fiori2/mockdata/master3.json'));
        // this.getView().setModel(oMaster3Model, 'master3');
        this.oRouter = this.getOwnerComponent().getRouter();
        this.onFilterSelect();
      },

      onFilterSelect: function (oEvent) {
        var selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();

        switch (selectedKey) {
          case "01":
            var oMaster3Model = new JSONModel(
              sap.ui.require.toUrl("sap/ui/demo/fiori2/mockdata/master3.json")
            );
            this.getOwnerComponent().setModel(oMaster3Model, "master3");
            break;
          case "02":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            break;
          case "03":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            break;
          case "04":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            this.byId("idDataConsegna").setProperty(
              "label",
              "Data di uscita merci"
            );
            this.byId("idDataConsegna").setProperty(
              "name",
              "Data di uscita merci"
            );
            break;
          case "05":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");
            break;
        }
      },

      sortCategoriesAndName: function (oEvent) {
        const oView = this.getView();
        const oTable = oView.byId("table");
        oTable.sort(oView.byId("cliente"), SortOrder.Ascending, false);
        oTable.sort(oView.byId("dataRicezione"), SortOrder.Ascending, true);
      },
      sortCategories: function (oEvent) {
        const oView = this.getView();
        const oTable = oView.byId("table");
        const oCategoriesColumn = oView.byId("cliente");

        oTable.sort(
          oCategoriesColumn,
          this._bSortColumnDescending
            ? SortOrder.Descending
            : SortOrder.Ascending,
          /*extend existing sorting*/ true
        );
        this._bSortColumnDescending = !this._bSortColumnDescending;
      },

      rowDetailPress: function (oEvent) {
        var detailPath = oEvent.getParameter("rowBindingContext").getPath(),
          detail = detailPath.split("/").slice(-1).pop(),
          oNextUIState;
        this.getOwnerComponent()
          .getHelper()
          .then(
            function (oHelper) {
              oNextUIState = oHelper.getNextUIState(1);
              this.oRouter.navTo("detailMaster3", {
                product: detail,
                layout: oNextUIState.layout,
              });
            }.bind(this)
          );
      },

      deletePress: function (oEvent) {
        this.getView().byId("table");
      },

      onPressRow: function (oEvent) {
        var index = oEvent.getParameter("rowIndex");
        if (index === 0) {
          this.getView().byId("buttonDelete").setProperty("enabled", false);
        } else {
          this.getView().byId("buttonDelete").setProperty("enabled", true);
        }
      },

      navToHome: function () {
        this.oRouter.navTo("home");
      },

      onProcessaButton: function () {
        debugger;
        let indici = this.getView().byId("table").getSelectedIndices();
        let data = this.getView().getModel("master3").getData().Master3;
        let selected = [];
        indici.forEach((x) => {
          selected.push(data[x]);
        });
        let flag = 0;
        selected.forEach((y) => {
          if (y.Stato == "KO") {
            flag++;
          }
        });
        if (flag > 0) {
          console.log("errori nel processo");
        } else {
          if (!this._oDialog) {
            Fragment.load({
              id: this.getView().getId(),
              name: "sap.ui.demo.fiori2.view.fragments.linkDialogMaster3",
              controller: this,
            }).then(
              function (oDialog) {
                this._oDialog = oDialog;
                this.getView().addDependent(this._oDialog);
                this._oDialog.open();
              }.bind(this)
            );
          } else {
            this._oDialog.open();
          }
        }
      },

      onclose: function (oEvent) {
        oEvent.getSource().getParent().close();
      },
    });
  }
);
