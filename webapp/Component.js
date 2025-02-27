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

        UIComponent.prototype.init.apply(this, arguments);
        this.getRouter().attachBeforeRouteMatched(this._onBeforeRouteMatched, this);
        this.getRouter().initialize();
        let oModel = new JSONModel();
        this.setModel(oModel);

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
        debugger
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
