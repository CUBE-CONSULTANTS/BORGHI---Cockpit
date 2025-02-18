sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/f/FlexibleColumnLayoutSemanticHelper",
    "sap/f/library",
  ],
  function (
    UIComponent,
    JSONModel,
    FlexibleColumnLayoutSemanticHelper,
    fioriLibrary
  ) {
    "use strict";

    return UIComponent.extend("programmi.consegne.edi.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        var oModel,
          oProductsModel,
          // oMaster3Model,
          oRouter;

        UIComponent.prototype.init.apply(this, arguments);

        oModel = new JSONModel();
        this.setModel(oModel);

        // set products demo model on this sample
        oProductsModel = new JSONModel(
          sap.ui.require.toUrl("programmi/consegne/edi/mockdata/products.json")
        );
        oProductsModel.setSizeLimit(1000);
        this.setModel(oProductsModel, "products");

        // oMaster3Model = new JSONModel(sap.ui.require.toUrl('programmi/consegne/edi/mockdata/master3.json'));
        // this.setModel(oMaster3Model, 'master3');

        oRouter = this.getRouter();
        oRouter.attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
        oRouter.initialize();

        this.setModel(
          new JSONModel({ testata: "", posizioni: "", schedulazioni: "" }),
          "datiAppoggio"
        );
      },

      getHelper: function () {
        return this._getFcl().then(function (oFCL) {
          var oSettings = {
            defaultTwoColumnLayoutType:
              fioriLibrary.LayoutType.TwoColumnsBeginExpanded,
            defaultThreeColumnLayoutType:
              fioriLibrary.LayoutType.ThreeColumnsMidExpanded,
          };
          return FlexibleColumnLayoutSemanticHelper.getInstanceFor(
            oFCL,
            oSettings
          );
        });
      },

      _onBeforeRouteMatched: function (oEvent) {
        var oModel = this.getModel(),
          sLayout = oEvent.getParameters().arguments.layout,
          oNextUIState;

        // If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
        if (!sLayout) {
          this.getHelper().then(function (oHelper) {
            oNextUIState = oHelper.getNextUIState(0);
            oModel.setProperty("/layout", oNextUIState.layout);
          });
          return;
        }

        oModel.setProperty("/layout", sLayout);
      },

      _getFcl: function () {
        return new Promise(
          function (resolve, reject) {
            var oFCL = this.getRootControl().byId("flexibleColumnLayout");
            if (!oFCL) {
              this.getRootControl().attachAfterInit(function (oEvent) {
                resolve(oEvent.getSource().byId("flexibleColumnLayout"));
              }, this);
              return;
            }
            resolve(oFCL);
          }.bind(this)
        );
      },
    });
  }
);
