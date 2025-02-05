sap.ui.define(
  [
    "./BaseController",
    "sap/ui/model/json/JSONModel",
    "sap/ui/model/Sorter",
    "sap/ui/core/library",
    "sap/ui/core/Fragment",
    "sap/m/MessageBox",
  ],
  function (
    BaseController,
    JSONModel,
    Sorter,
    CoreLibrary,
    Fragment,
    MessageBox
  ) {
    "use strict";

    const SortOrder = CoreLibrary.SortOrder;

    return BaseController.extend("sap.ui.demo.fiori2.controller.Master3", {
      onInit: function () {
        // var oMaster3Model = new JSONModel(sap.ui.require.toUrl('sap/ui/demo/fiori2/mockdata/master3.json'));
        // this.getView().setModel(oMaster3Model, 'master3');
        this.oRouter = this.getOwnerComponent().getRouter();
        this.onFilterSelect(null, "01");
        // this.onFilterSelect();
      },

      onFilterSelect: function (oEvent, key) {
        this.showBusy(0);
        var selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();
        !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
        // this.getView().getContent()[0].getContent().getContent()[0].destroy();

        switch (selectedKey) {
          case "01":
            var oMaster3Model = new JSONModel(
              sap.ui.require.toUrl(
                "sap/ui/demo/fiori2/mockdata/dataMaster3.json"
              )
            );

            this.getOwnerComponent().setModel(oMaster3Model, "master3");

            break;
          case "02":
            this.getOwnerComponent().setModel(new JSONModel({}), "master3");

            break;
          case "03":
            var oMaster3Model = new JSONModel(
              sap.ui.require.toUrl(
                "sap/ui/demo/fiori2/mockdata/dataMaster3.json"
              )
            );
            this.getOwnerComponent().setModel(oMaster3Model, "master3");
            // this.getOwnerComponent().setModel(new JSONModel({}), "master3");
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
        this.hideBusy(0);
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

      onProcessaButton: function (oEvent) {
        debugger;
        let indici = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getSelectedIndices();
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

      importaPress: function (oEvent) {
        if (!this._oDialog2) {
          Fragment.load({
            id: this.getView().getId(),
            name: "sap.ui.demo.fiori2.view.fragments.importMaster3",
            controller: this,
          }).then(
            function (oDialog2) {
              this._oDialog2 = oDialog2;
              this.getView().addDependent(this._oDialog2);
              this._oDialog2.open();
            }.bind(this)
          );
        } else {
          this._oDialog.open();
        }
      },
      rowDetailPress: function (detailPath) {
        // var detailPath = oEvent.getParameter("rowBindingContext").getPath()
        let detailRowIndex = detailPath.split("/").slice(-1).pop();
        let detail = this.getView()
          .getModel("master3")
          .getProperty(`/Master3/${detailRowIndex}/DelforTestata/id`);
        let oNextUIState;
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
      dettaglioNav: function (oEvent) {
        debugger;
        let level = oEvent
          .getSource()
          .getParent()
          .getBindingContext("master3")
          .getPath()
          .includes("DelforPosizioni");
        // let detailSched = oEvent.getSource().getParent().getBindingContext("master3").getObject().DelforSchedulazioni
        let detailPath = oEvent
          .getSource()
          .getParent()
          .getBindingContext("master3")
          .getPath();

        let detail = this.getView()
          .getModel("master3")
          .getProperty(`${detailPath}`);
        if (level) {
          debugger;
          let oNextUIState;
          this.getOwnerComponent()
            .getHelper()
            .then(
              function (oHelper) {
                oNextUIState = oHelper.getNextUIState(1);
                this.oRouter.navTo("Detail2Master3", {
                  product: JSON.stringify(detail),
                  layout: oNextUIState.layout,
                });
              }.bind(this)
            );
        } else {
          let path = oEvent
            .getSource()
            .getParent()
            .getBindingContext("master3")
            .getPath();
          this.rowDetailPress(path);
        }
      },

      statoButtonPress: function (oEvent) {
        debugger;
        MessageBox.error("Errori nel processamento delle posizioni.", {
          title: "Error",

          details: "<p><strong>This can happen if:</strong></p>",
          contentWidth: "100px",
          dependentOn: this.getView(),
        });
      },

      formatData: function (data) {
        debugger;
      },

      onCollapseAll: function () {
        const oTreeTable = this.byId("treetableMain");
        oTreeTable.collapseAll();
      },

      onCollapseSelection: function () {
        const oTreeTable = this.byId("treetableMain");
        oTreeTable.collapse(oTreeTable.getSelectedIndices());
      },

      onExpandFirstLevel: function () {
        const oTreeTable = this.byId("treetableMain");
        oTreeTable.expandToLevel(1);
      },

      onExpandSelection: function () {
        const oTreeTable = this.byId("treetableMain");
        oTreeTable.expand(oTreeTable.getSelectedIndices());
      },

      // loadFragment: function (oEvent) {
      //   if (!this._oMyFragment) {
      //     this._oMyFragment = sap.ui.xmlfragment(
      //       // this.getView().getId(),
      //       "sap.ui.demo.fiori2.view.fragments.deliveryMaster3",
      //       this
      //     );

      //     // this.getView()
      //     //   .getContent()[0]
      //     //   .getContent()
      //     //   .getContent()[0]
      //     //   .addContent(this._oMyFragment.oFragment);
      //     // this.getView()
      //     //   .getContent()[0]
      //     //   .getContent()
      //     //   .getContent()
      //     //   .addContent(this._oMyFragment.oFragment);

      //     this.getView()
      //       .getContent()[0]
      //       .getContent()
      //       .addDependent(this._oMyFragment.oFragment);
      //   }
      // },
    });
  }
);
