sap.ui.define(
  [
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel",
    "sap/f/FlexibleColumnLayoutSemanticHelper",
    "sap/f/library",
    "./model/models",
  ],
  function (
    UIComponent,
    JSONModel,
    FlexibleColumnLayoutSemanticHelper,
    fioriLibrary,
    models
  ) {
    "use strict";

    return UIComponent.extend("programmi.consegne.edi.Component", {
      metadata: {
        manifest: "json",
      },

      init: function () {
        UIComponent.prototype.init.apply(this, arguments);
        // this.getRouter().attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
        this.getRouter().initialize();
        this.getRouter().attachRouteMatched(this._onRouteMatched, this);
        this.setModel(models.createLayoutModel(), "layout");

        this.setModel(
          new JSONModel({
            testata: "",
            posizioni: "",
            schedulazioni: "",
            posizioneCorrente: "",
            currentPage: "",
          }),
          "datiAppoggio"
        );
      },
      _onRouteMatched: function (oEvent) {
        var oArgs = oEvent.getParameter("arguments");
        var oModel = this.getModel("layout");
        if (oArgs.layout) {
          oModel.setProperty("/layout", oArgs.layout);
        }
      },

      onStateChanged: function (oEvent) {
        debugger;
        var bIsNavigationArrow = oEvent.getParameter("isNavigationArrow"),
          sLayout = oEvent.getParameter("layout");

        this._updateUIElements();

        // Replace the URL with the new layout if a navigation arrow was used
        if (bIsNavigationArrow) {
          this.getRouter().navTo(
            this.currentRouteName,
            {
              layout: sLayout,
              product: this.currentProduct,
              supplier: this.currentSupplier,
            },
            true
          );
        }
      },
      _updateUIElements: function () {
        debugger;
        var oModel = this.getOwnerComponent().getModel("layout"),
          oUIState;
        this.getOwnerComponent()
          .getHelper()
          .then(function (oHelper) {
            oUIState = oHelper.getCurrentUIState();
            oModel.setData(oUIState);
          });
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

      // _onBeforeRouteMatched: function (oEvent) {
      //   debugger
      //   var oModel = this.getModel("layout"),
      //     sLayout = oEvent.getParameters().arguments.layout,
      //     oNextUIState;

      //   // If there is no layout parameter, query for the default level 0 layout (normally OneColumn)
      //   if (!sLayout) {
      //     this.getHelper().then(function (oHelper) {
      //       oNextUIState = oHelper.getNextUIState(0);
      //       oModel.setProperty("/layout", oNextUIState.layout);
      //     });
      //     return;
      //   }

      //   oModel.setProperty("/layout", sLayout);
      // },

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
