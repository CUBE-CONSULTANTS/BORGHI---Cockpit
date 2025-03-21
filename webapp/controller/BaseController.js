sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/UIComponent",
    "sap/ui/core/routing/History",
    "sap/ui/core/Fragment",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageBox",
    "sap/m/MessageToast",
    "sap/ui/model/Sorter",
    "sap/m/PDFViewer",
    "sap/ui/export/Spreadsheet",
    "sap/ui/core/format/DateFormat",
    "../model/API",
    "../model/mapper",
    "sap/m/p13n/Engine",
    "sap/m/p13n/SelectionController",
    "sap/m/p13n/SortController",
    "sap/m/p13n/GroupController",
    "sap/m/p13n/MetadataHelper",
    "sap/ui/core/library",
    "../model/formatter",
    "sap/ui/model/Filter",
    "sap/ui/model/FilterOperator",
  ],
  function (
    Controller,
    UIComponent,
    History,
    Fragment,
    JSONModel,
    MessageBox,
    MessageToast,
    Sorter,
    PDFViewer,
    Spreadsheet,
    DateFormat,
    API,
    mapper,
    Engine,
    SelectionController,
    SortController,
    GroupController,
    MetadataHelper,
    CoreLibrary,
    formatter,
    Filter,
    FilterOperator
  ) {
    "use strict";

    return Controller.extend("programmi.consegne.edi.controller.BaseController", {
      /**
       * Convenience method for accessing the component of the controller's view.
       * @returns {sap.ui.core.Component} The component of the controller's view
       */
      getOwnerComponent: function () {
        return Controller.prototype.getOwnerComponent.call(this);
      },
      /**
       * Convenience method to get the components' router instance.
       * @returns {sap.m.routing.Router} The router instance
       */
      getRouter: function () {
        return UIComponent.getRouterFor(this);
      },
      /**
       * Convenience method for getting the i18n resource bundle of the component.
       * @returns {sap.base.i18n.ResourceBundle} The i18n resource bundle of the component
       */
      getResourceBundle: function () {
        let oComponent;
        this.getOwnerComponent() === undefined
          ? (oComponent = this._oComponent)
          : (oComponent = this.getOwnerComponent());
        return oComponent.getModel("i18n").getResourceBundle();
      },
      getBundleText: function (i18nID) {
        return this.getResourceBundle().getText(i18nID);
      },
      /**
       * Convenience method for getting the view model by name in every controller of the application.
       * @param {string} [sName] The model name
       * @returns {sap.ui.model.Model} The model instance
       */
      getModel: function (sName) {
        return this.getView().getModel(sName);
      },
      /**
       * Convenience method for setting the view model in every controller of the application.
       * @param {sap.ui.model.Model} oModel The model instance
       * @param {string} [sName] The model name
       * @returns {sap.ui.core.mvc.Controller} The current base controller instance
       */
      setModel: function (oModel, sName) {
        this.getView().setModel(oModel, sName);
        return this;
      },
      /**
       * Convenience method for triggering the navigation to a specific target.
       * @public
       * @param {string} sName Target name
       * @param {object} [oParameters] Navigation parameters
       * @param {boolean} [bReplace] Defines if the hash should be replaced (no browser history entry) or set (browser history entry)
       */
      navTo: function (sName, oParameters, bReplace) {
        this.getRouter().navTo(sName, oParameters, undefined, bReplace);
      },
      /**
       * Convenience event handler for navigating back.
       * It there is a history entry we go one step back in the browser history
       * If not, it will replace the current entry of the browser history with the main route.
       */
      onNavBack: function () {
        var sPreviousHash = History.getInstance().getPreviousHash();
        if (sPreviousHash !== undefined) {
          window.history.go(-1);
        } else {
          this.getRouter().navTo("home", {}, undefined, true);
        }
      },
      showBusy: function (delay) {
        // sap.ui.core.BusyIndicator.show(delay || 0);
        sap.ui.core.BusyIndicator.show(delay);
      },
      hideBusy: function (delay) {
        // sap.ui.core.BusyIndicator.hide(delay || 0);
        sap.ui.core.BusyIndicator.hide(delay);
      },
      onOpenDialog: function (dialName, fragmName, self, ...oModel) {
        let oView = self.getView();
        if (!self[dialName]) {
          Fragment.load({
            id: oView.getId(),
            name: fragmName,
            controller: self,
          }).then((oDialog) => {
            oView.addDependent(oDialog);
            oDialog.setModel(self.getModel(...oModel));
            self[dialName] = oDialog;
            oDialog.open();
          });
        } else {
          self[dialName].open();
        }
      },
      //UTILITY X TUTTE LE TABELLE
      sortCategories: function () {
        let oTable;
        let aSorters = [];
        switch (this.getView().byId("idIconTabBar").getSelectedKey()) {
          case "01":
            oTable = this.byId("treetableMain");
            aSorters = this.sortTables(oTable, ["codice_cliente", "numero_progressivo_invio"]);
            break;
          case "02":
            oTable = this.byId("treetableCallOff");
            aSorters = this.sortTables(oTable, ["codice_terre_cliente", "progressivo_invio"]);
            break;
          case "03":
            oTable = this.byId("treetableSB");
            aSorters = this.sortTables(oTable, ["customer", "data_ricezione"]);
            break;
          case "04":
            oTable = this.byId("tableDes");
            aSorters = this.sortTables(oTable, ["data_creazione_documento", "numero_ddt"]);
            break;
          case "05":
            oTable = this.byId("tableInvoice");
            aSorters = this.sortTables(oTable, ["data_di_fatturazione", "fattura_di_vendita"]);
            break;
          case "06":
            oTable = this.byId("tableScartati");
            aSorters = this.sortTables(oTable, ["filename", "data_ricezione"]);
            break;
          default:
            return;
        }
      },
      sortTables: function (table, aSortFields) {
        let oBinding = table.getBinding("rows");
        let aCurrentSorters = oBinding.aSorters || [];
        let bDescending = aCurrentSorters.length === 0 || !aCurrentSorters[0].bDescending;
        let aSorters = aSortFields.map((field) => new sap.ui.model.Sorter(field, bDescending));
        oBinding.sort(aSorters);
      },
      onCollapseAll: function () {
        let oTable;
        let selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();
        !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
        switch (selectedKey) {
          case "01":
            oTable = this.byId("treetableMain");
            oTable.collapseAll();
            break;
          case "02":
            oTable = this.byId("treetableCallOff");
            oTable.collapseAll();
            break;
          case "03":
            oTable = this.byId("treetableSB");
            oTable.collapseAll();
            break;
          default:
        }
      },
      onExpandFirstLevel: function () {
        let oTable;
        let selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();
        !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
        switch (selectedKey) {
          case "01":
            oTable = this.byId("treetableMain");
            oTable.expandToLevel(1);
            break;
          case "02":
            oTable = this.byId("treetableCallOff");
            oTable.expandToLevel(1);
            break;
          case "03":
            oTable = this.byId("treetableSB");
            oTable.expandToLevel(1);
            break;
          default:
        }
      },
      //NAVIGAZIONE VERSO VARIAZIONI
      navToAPP: function (oEvent) {
        let level = oEvent.getSource().getParent().getParent().getBindingContext("master3").getPath();
        let oCodArt = oEvent
          .getSource()
          .getParent()
          .getParent()
          .getBindingContext("master3")
          .getObject().codice_cliente_materiale;

        let oCodCliente;
        oEvent.getSource().getParent().getParent().getBindingContext("master3").getObject().codice_cliente === null
          ? (oCodCliente = oEvent.getSource().getParent().getParent().getBindingContext("master3").getObject()
              .testata.codice_cliente)
          : (oCodCliente = oEvent
              .getSource()
              .getParent()
              .getParent()
              .getBindingContext("master3")
              .getObject().codice_cliente);

        this.getOwnerComponent().getModel("datiAppoggio").setProperty("/filtriNav", {
          codice_articolo: oCodArt,
          codice_cliente: oCodCliente,
        });
        if (level.includes("posizioni")) {
          this.getRouter().navTo("master", {
            prevApp: this.getOwnerComponent().getModel("datiAppoggio").getProperty("/currentPage"),
          });
        } else {
          this.getRouter().navTo("master2", {
            prevApp: this.getOwnerComponent().getModel("datiAppoggio").getProperty("/currentPage"),
          });
        }
      },
      // MC X VARIAZIONI
      _getMatchCode: async function () {
        try {
          this.showBusy(0);
          let matchcode = new JSONModel();
          matchcode.setSizeLimit(100000000);
          this.setModel(matchcode, "matchcode");
          let oModel = this.getOwnerComponent().getModel("modelloV2");
          let [clienti, materialiForn, materialiSap] = await Promise.all([
            API.getEntity(oModel, "/EIGHTWEEK_MC_KDMAT", [new Filter("Azione", FilterOperator.EQ, "CLIENTE")], []),
            API.getEntity(oModel, "/EIGHTWEEK_MC_KDMAT", [new Filter("Azione", FilterOperator.EQ, "KDMAT")], []),
            API.getEntity(oModel, "/EIGHTWEEK_MC_KDMAT", [new Filter("Azione", FilterOperator.EQ, "MATNR")], []),
          ]);

          this.getModel("matchcode").setProperty("/clienti", clienti.results);
          this.getModel("matchcode").setProperty("/materiali", materialiForn.results);
          this.getModel("matchcode").setProperty("/materialiSap", materialiSap.results);
        } catch (error) {
          MessageBox.error("Errore durante il recupero dei dati");
        } finally {
          this.hideBusy(0);
        }
      },
      //COUNTERS X MONITOR E ARCHIVIO
      _getCounters: async function (filterVal) {
        this.showBusy(0);
        try {
          let oModel = this.getOwnerComponent().getModel("modelloV2");
          let calloffModel = this.getOwnerComponent().getModel("calloffV2");
          let selfBillingModel = this.getOwnerComponent().getModel("selfBillingV2");
          let desAdvModel = this.getOwnerComponent().getModel("despatchAdviceV2");

          let invoiceModel = this.getOwnerComponent().getModel("invoiceV2");
          let fileScartatiModel = this.getOwnerComponent().getModel("fileScartatiV2");
          let [delfor, calloff, selfb, desadv, invoice, fileScart] = await Promise.all([
            API.getEntity(
              oModel,
              "/Testata/$count",
              [new sap.ui.model.Filter("archiviazione", sap.ui.model.FilterOperator.EQ, filterVal)],
              []
            ),
            filterVal
              ? API.getEntity(calloffModel, "/ContatoreTestate", [], [])
              : API.getEntity(
                  calloffModel,
                  "/Testata/$count",
                  [new sap.ui.model.Filter("archiviazione", sap.ui.model.FilterOperator.EQ, filterVal)],
                  []
                ),
            API.getEntity(
              selfBillingModel,
              "/Testata/$count",
              [new sap.ui.model.Filter("archiviazione", sap.ui.model.FilterOperator.EQ, filterVal)],
              []
            ),
            API.getEntity(
              desAdvModel,
              "/Testata/$count",
              [new sap.ui.model.Filter("archiviazione", sap.ui.model.FilterOperator.EQ, filterVal)],
              []
            ),
            API.getEntity(
              invoiceModel,
              "/Invoice/$count",
              [new sap.ui.model.Filter("archiviazione", sap.ui.model.FilterOperator.EQ, filterVal)],
              []
            ),
            API.getEntity(
              fileScartatiModel,
              "/FileScartati/$count",
              [new sap.ui.model.Filter("archiviazione", sap.ui.model.FilterOperator.EQ, filterVal)],
              []
            ),
          ]);
          this.getModel("count").setProperty("/delivery", delfor.results);
          this.getModel("count").setProperty(
            "/calloff",
            filterVal ? calloff.results[0].ContatoreTestata : calloff.results
          );
          this.getModel("count").setProperty("/selfbilling", selfb.results);
          this.getModel("count").setProperty("/despatch", desadv.results);
          this.getModel("count").setProperty("/invoice", invoice.results);
          this.getModel("count").setProperty("/fileScartati", fileScart.results);
        } catch (error) {
          console.error("Errore durante il recupero dei dati:", error);
        } finally {
          this.hideBusy(0);
        }
      },
      //COSTRUZIONE FILTRI X TUTTI I TAB
      onFiltersBuilding: function (oEvent, key) {
        if (key === "01") {
          let aData = this.getModel("master3").getProperty("/");

          let aStato = [
            ...new Set(
              aData.flatMap((item) =>
                item.posizioni.map((pos) => {
                  if (pos.stato === "51") {
                    return "In Errore";
                  } else if (pos.stato === "53") {
                    return "Elaborato Positivamente";
                  } else if (pos.stato === null) {
                    return "Non Elaborato";
                  } else if (pos.stato === "64") {
                    return "In Elaborazione";
                  }
                  return pos.stato;
                })
              )
            ),
          ];

          let aClienti = [...new Set(aData.map((item) => item.codice_cliente))];
          let aNumProgInvio = [...new Set(aData.map((item) => item.numero_progressivo_invio))];
          let aMateriali = [];
          let aMessaggi = [];
          aData.forEach((item) => {
            if (item.posizioni) {
              item.posizioni.forEach((pos) => {
                if (pos.codice_cliente_materiale) {
                  aMateriali.push(pos.codice_cliente_materiale);
                }
                if (pos.log) {
                  pos.log.results.forEach((res) => aMessaggi.push(res.messaggio));
                }
              });
            }
          });
          aMateriali = [...new Set(aMateriali)];
          aMessaggi = [...new Set(aMessaggi)];
          this.getModel("filtersModel").setProperty(
            "/delivery/cliente/items",
            aClienti.map((c) => ({ Key: c, Text: c }))
          );
          this.getModel("filtersModel").setProperty(
            "/delivery/materiale/items",
            aMateriali.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/delivery/numProg/items",
            aNumProgInvio.map((n) => ({ Key: n, Text: n }))
          );
          this.getModel("filtersModel").setProperty(
            "/delivery/stato/items",
            aStato.map((n) => ({ Key: n, Text: n }))
          );
          this.getModel("filtersModel").setProperty(
            "/delivery/messaggio/items",
            aMessaggi.map((n) => ({ Key: n, Text: n }))
          );
        } else if (key === "02") {
          let aData = this.getModel("master3CO").getProperty("/");
          let aClienti = [...new Set(aData.map((item) => item.codice_terre_cliente))];
          let aReason = [];
          let aMateriali = [];
          aData.forEach((item) => {
            if (item.posizioni_testata) {
              item.posizioni_testata.forEach((pos) => {
                if (pos.posizione_6_28) {
                  aMateriali.push(pos.posizione_6_28);
                }
                if (pos.posizione_43_44) {
                  aReason.push(pos.posizione_43_44);
                }
              });
            }
          });
          aReason = [...new Set(aReason)];
          aMateriali = [...new Set(aMateriali)];

          this.getModel("filtersModel").setProperty(
            "/callOff/materiale/items",
            aMateriali.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/callOff/reason/items",
            aReason.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/callOff/clienti/items",
            aClienti.map((m) => ({ Key: m, Text: m }))
          );
        } else if (key === "03") {
          let aData = this.getModel("master3SB").getProperty("/");
          let aClienti = [...new Set(aData.map((item) => item.customer))];
          let aFornitori = [...new Set(aData.map((item) => item.supplier))];
          let aFatture = [];
          aData.forEach((item) => {
            if (item.dettaglio_fattura) {
              item.dettaglio_fattura.forEach((pos) => {
                if (pos.numero_fattura) {
                  aFatture.push(pos.numero_fattura);
                }
              });
            }
          });
          aFatture = [...new Set(aFatture)];
          this.getModel("filtersModel").setProperty(
            "/selfBilling/fatture/items",
            aFatture.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/selfBilling/clienti/items",
            aClienti.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/selfBilling/fornitori/items",
            aFornitori.map((m) => ({ Key: m, Text: m }))
          );
        } else if (key === "04") {
          let aData = this.getModel("master3DesAdv").getProperty("/");
          let aIdoc = [...new Set(aData.map((item) => item.numero_idoc))];
          let aNumCons = [...new Set(aData.map((item) => item.numero_consegna))];
          let aNumDDTCl = [...new Set(aData.map((item) => item.numero_ddt))];
          let aBp = [...new Set(aData.map((item) => item.numero_bp_sold_to))];
          this.getModel("filtersModel").setProperty(
            "/desadv/numiDoc/items",
            aIdoc.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/desadv/numConsegna/items",
            aNumCons.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/desadv/numDDTCliente/items",
            aNumDDTCl.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/desadv/bp/items",
            aBp.map((m) => ({ Key: m, Text: m }))
          );
        } else if (key === "05") {
          let aData = this.getModel("master3Inv").getProperty("/");
          let aIdoc = [...new Set(aData.map((item) => item.numero_idoc))];
          let aNumFat = [...new Set(aData.map((item) => item.fattura_di_vendita))];
          let aNumDocCont = [...new Set(aData.map((item) => item.numero_documento_contabile))];
          let aDateFat = [...new Set(aData.map((item) => item.data_di_fatturazione))];
          let aBp = [...new Set(aData.map((item) => item.BP))];
          let aDateCreDoc = [...new Set(aData.map((item) => item.data_creazione_doc_contabile))];

          this.getModel("filtersModel").setProperty(
            "/invoice/numiDoc/items",
            aIdoc.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/invoice/numFattVend/items",
            aNumFat.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/invoice/dataFattura/items",
            aDateFat.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/invoice/numDocCont/items",
            aNumDocCont.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/invoice/bp/items",
            aBp.map((m) => ({ Key: m, Text: m }))
          );
          this.getModel("filtersModel").setProperty(
            "/invoice/dataDocCont/items",
            aDateCreDoc.map((m) => ({ Key: m, Text: m }))
          );
        } else if (key === "06") {
          let aData = this.getModel("master3Scart").getProperty("/");
          let aFile = [...new Set(aData.map((item) => item.filename))];
          this.getModel("filtersModel").setProperty(
            "/scartati/nomeFile/items",
            aFile.map((m) => ({ Key: m, Text: m }))
          );
        }
      },
      // FILTRI X APP VARIAZIONI
      getFiltersVariazioni: function (filterbar) {
        const filterMap = {
          "Codice Cliente": "CLIENTE",
          "Codice Articolo Fornitore": "KDMAT",
          "Codice Articolo SAP": "MATNR",
        };
        let aFilters = [];
        filterbar.getFilterGroupItems().forEach((filter) => {
          let value = filter.getControl().getValue().split(" -")[0];
          let label = filter.getLabel();
          if (value && value.length > 0 && filterMap[label]) {
            aFilters.push(new Filter(filterMap[label], FilterOperator.EQ, value));
          }
        });
        return aFilters;
      },
      //CLEAR DELLE FILTERBAR
      onFilterBarVariazioniClear: async function (oEvent) {
        let oFilterBar = oEvent.getSource();
        let aFilterItems = oFilterBar.getFilterGroupItems();

        aFilterItems.forEach(function (oFilterItem) {
          let oControl = oFilterItem.getControl();
          if (oControl instanceof sap.m.ComboBox) {
            oControl.setSelectedKey(null);
            oControl.setValue("");
          } else if (oControl instanceof sap.m.MultiComboBox) {
            oControl.setSelectedKeys([]);
            oControl.setValue("");
          }
        });
        this.getModel("main").setProperty("/visibility", false);
        await this._getMatchCode();
      },
      onFilterBarClear: async function (oEvent) {
        let operator, archivVal;
        this.getModel("datiAppoggio").getProperty("/currentPage") === "archivio"
          ? (operator = "eq")
          : (operator = "ne");
        this.getModel("datiAppoggio").getProperty("/currentPage") === "archivio"
          ? (archivVal = true)
          : (archivVal = false);

        let oFilterData = this.getModel("filtersModel").getData();
        for (let sView in oFilterData) {
          if (oFilterData.hasOwnProperty(sView)) {
            let oFilters = oFilterData[sView];
            for (let sKey in oFilters) {
              if (oFilters.hasOwnProperty(sKey)) {
                let oFilter = oFilters[sKey];
                if (oFilter && typeof oFilter === "object" && oFilter.hasOwnProperty("value")) {
                  oFilters[sKey].value = null;
                } else {
                  oFilters[sKey] = null;
                }
              }
            }
          }
        }
        this.getModel("filtersModel").refresh(true);
        this._refreshData(this.getView().byId("idIconTabBar").getSelectedKey(), archivVal);
      },
      //FINE CLEAR FILTERBAR
      // CHIAMATE DI ARCHIVIO E MONITOR SIA IN OBJECTMATCHED CHE CON SEARCH SU FILTERBAR
      onSearchData: async function (oEvent, filterTab) {
        let oFilterSet;
        let key;
        let operator;
        let valPosArch;
        let filtrato = false;
        this.getModel("datiAppoggio").getProperty("/currentPage") === "archivio"
          ? (operator = "eq")
          : (operator = "ne");
        operator === "ne" ? (valPosArch = false) : (valPosArch = true);
        //GESTIONE FILTRI DELFOR
        if (
          (oEvent &&
            oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("delivery")) ||
          (!oEvent && filterTab === "01")
        ) {
          oFilterSet = this.getModel("filtersModel").getProperty("/delivery");
          let aFilters = mapper.buildFilters(oFilterSet, (key = "01"), operator);
          let filters = {
            data_ricezione: aFilters.find((f) => f.sPath === "data_ricezione"),
            stato: aFilters.find((f) => f.sPath === "stato"),
            messaggio: aFilters.find((f) => f.sPath === "messaggio"),
            materiale: aFilters.find((f) => f.sPath === "posizioni/codice_cliente_materiale"),
          };
          Object.keys(filters).forEach((key) => {
            if (filters[key]) {
              let index;
              if (key === "materiale") {
                index = aFilters.findIndex((f) => f.sPath === "posizioni/codice_cliente_materiale");
              } else {
                index = aFilters.findIndex((f) => f.sPath === key);
              }
              if (index !== -1) aFilters.splice(index, 1);
            }
          });
          let expandQuery = `posizioni,posizioni($expand=log,schedulazioni,testata),master`;

          let posizioniFilter = "";
          let masterFilter = "";
          let logFilter = "";
          if (filters.stato) {
            posizioniFilter += `stato eq '${filters.stato.oValue1}'`;
          }
          if (filters.materiale) {
            posizioniFilter += posizioniFilter ? ` and ` : "";
            posizioniFilter += `codice_cliente_materiale eq '${filters.materiale.oValue1}'`;
          }
          if (filters.messaggio) {
            filtrato = true;
            filters.messaggio.oValue1 = filters.messaggio.oValue1.replace(/'/g, "''");
            logFilter = `messaggio eq '${filters.messaggio.oValue1}'`;
          }
          if (filters.data_ricezione) {
            masterFilter = `data_ricezione eq '${filters.data_ricezione.oValue1}'`;
          }
          if (posizioniFilter) {
            expandQuery = `posizioni($filter=${posizioniFilter}),posizioni($expand=log,schedulazioni,testata),master`;
          }
          await this.callData(
            this.getOwnerComponent().getModel("modelloV2"),
            "/Testata",
            aFilters,
            [expandQuery],
            "01",
            filtrato
          );
        } // GESTIONE FILTRI CALLOFF
        else if (
          (oEvent &&
            oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("callOff")) ||
          (!oEvent && filterTab === "02")
        ) {
          oFilterSet = this.getModel("filtersModel").getProperty("/callOff");
          let aFilters = mapper.buildFilters(oFilterSet, (key = "02"), operator);
          let filters = {
            data_ricezione: aFilters.find((f) => f.sPath === "data_ricezione"),
            materiale: aFilters.find((f) => f.sPath === "posizioni_testata/posizione_6_28"),
            reason: aFilters.find((f) => f.sPath === "posizioni_testata/posizione_43_44"),
          };
          Object.keys(filters).forEach((key) => {
            if (filters[key]) {
              let index;
              if (key === "reason") {
                index = aFilters.findIndex((f) => f.sPath === "posizioni_testata/posizione_43_44");
              } else if (key === "materiale") {
                index = aFilters.findIndex((f) => f.sPath === "posizioni_testata/posizione_6_28");
              } else {
                index = aFilters.findIndex((f) => f.sPath === key);
              }
              if (index !== -1) aFilters.splice(index, 1);
            }
          });

          let posizioniFilter = `archiviazione eq '${valPosArch}'`;
          if (filters.materiale) {
            posizioniFilter += ` and posizione_6_28 eq '${filters.materiale.oValue1}'`;
          }
          if (filters.reason) {
            posizioniFilter += ` and posizione_43_44 eq '${filters.reason.oValue1}'`;
          }
          let masterFilter = "";
          if (filters.data_ricezione) {
            masterFilter = `($filter=data_ricezione eq '${filters.data_ricezione.oValue1}')`;
          }
          let expandQuery = `posizioni_testata($filter=${posizioniFilter}),posizioni_testata($expand=log_posizioni,testata),master${masterFilter}`;
          await this.callData(
            this.getOwnerComponent().getModel("calloffV2"),
            "/Testata",
            aFilters,
            [expandQuery],
            "02",
            filtrato
          );
        } // GESTIONE FILTRI SELFBILLING
        else if (
          (oEvent &&
            oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("selfBilling")) ||
          (!oEvent && filterTab === "03")
        ) {
          oFilterSet = this.getModel("filtersModel").getProperty("/selfBilling");

          let aFilters = mapper.buildFilters(oFilterSet, (key = "03"), operator);
          let filters = {
            fatture: aFilters.find((f) => f.sPath === "dettaglio_fattura/numero_fattura"),
          };
          Object.keys(filters).forEach((key) => {
            if (filters[key]) {
              let index;
              if (key === "fatture") {
                index = aFilters.findIndex((f) => f.sPath === "dettaglio_fattura/numero_fattura");
              } else {
                index = aFilters.findIndex((f) => f.sPath === key);
              }
              if (index !== -1) aFilters.splice(index, 1);
            }
          });
          let posizioniFilter = `archiviazione eq ${valPosArch}`;
          if (filters.fatture) {
            posizioniFilter += ` and numero_fattura eq '${filters.fatture.oValue1}'`;
          }
          let expandQuery = `dettaglio_fattura($filter=${posizioniFilter}),dettaglio_fattura($expand=riferimento_ddt),dettaglio_fattura/riferimento_ddt($expand=riga_fattura)`;
          await this.callData(
            this.getOwnerComponent().getModel("selfBillingV2"),
            "/Testata",
            aFilters,
            [expandQuery],
            "03",
            false
          );
        } // GESTIONE FILTRI DESADV
        else if (
          (oEvent && oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("desadv")) ||
          (!oEvent && filterTab === "04")
        ) {
          oFilterSet = this.getModel("filtersModel").getProperty("/desadv");
          let aFilters = mapper.buildFilters(oFilterSet, (key = "04"), operator);
          await this.callData(
            this.getOwnerComponent().getModel("despatchAdviceV2"),
            "/Testata",
            aFilters,
            [],
            "04",
            false
          );
        } // GESTIONE FILTRI INVOICE
        else if (
          (oEvent &&
            oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("invoice")) ||
          (!oEvent && filterTab === "05")
        ) {
          oFilterSet = this.getModel("filtersModel").getProperty("/invoice");
          let aFilters = mapper.buildFilters(oFilterSet, (key = "05"), operator);
          await this.callData(this.getOwnerComponent().getModel("invoiceV2"), "/Invoice", aFilters, [], "05", false);
        } //GESTIONE FILTRI SCARTATI
        else if (
          (oEvent &&
            oEvent.getParameters().selectionSet[0].getBindingInfo("value").parts[0].path.includes("scartati")) ||
          (!oEvent && filterTab === "06")
        ) {
          oFilterSet = this.getModel("filtersModel").getProperty("/scartati");
          let aFilters = mapper.buildFilters(oFilterSet, (key = "06"), operator);
          await this.callData(
            this.getOwnerComponent().getModel("fileScartatiV2"),
            "/FileScartati",
            aFilters,
            [],
            "06",
            false
          );
        }
      },
      //gestione CHIAMATE E BINDING X TAB
      callData: async function (oModel, entity, aFilters, Expands, key, filtrato) {
        let metadata, modelMeta;
        try {
          metadata = await API.getEntity(oModel, entity, aFilters, Expands);
          if (key === "01") {
            let datiFiltrati = metadata.results.filter((x) => x.master !== null && x.posizioni.results.length > 0);
            if (filtrato) {
              datiFiltrati = metadata.results
                .filter((x) => x.master !== null)
                .map((x) => ({
                  ...x,
                  posizioni: {
                    results: x.posizioni.results.filter((res) => res.log.results.length > 0),
                  },
                }))
                .filter((x) => x.posizioni.results.length > 0);
            }
            modelMeta = new JSONModel(datiFiltrati);
            modelMeta.getProperty("/").forEach((testata) => {
              testata.posizioni = Object.values(testata.posizioni.results);
            });

            this.getOwnerComponent().setModel(modelMeta, "master3");
            this.getModel("master3").setSizeLimit(1000000);
          } else if (key === "02") {
            let datiFiltrati = metadata.results.filter(
              (x) => x.master !== null && x.posizioni_testata.results.length > 0
            );
            modelMeta = new JSONModel(datiFiltrati);
            modelMeta.getProperty("/").forEach((testata) => {
              testata.posizioni_testata = Object.values(testata.posizioni_testata.results);
            });
            this.getOwnerComponent().setModel(modelMeta, "master3CO");
            this.getModel("master3CO").setSizeLimit(1000000);
          } else if (key === "03") {
            // let datiFiltrati = metadata.results.filter(
            //   (x) => x.dettaglio_fattura.results.length > 0
            // );
            modelMeta = new JSONModel(metadata.results);
            modelMeta.getProperty("/").forEach((testata) => {
              testata.dettaglio_fattura = Object.values(testata.dettaglio_fattura.results);
            });
            this.getOwnerComponent().setModel(modelMeta, "master3SB");
            this.getModel("master3SB").setSizeLimit(1000000);
          } else if (key === "04") {
            modelMeta = new JSONModel(metadata.results);
            this.getOwnerComponent().setModel(modelMeta, "master3DesAdv");
            this.getModel("master3DesAdv").setSizeLimit(1000000);
          } else if (key == "05") {
            modelMeta = new JSONModel(metadata.results);
            this.getOwnerComponent().setModel(modelMeta, "master3Inv");
            this.getModel("master3Inv").setSizeLimit(1000000);
          } else if (key == "06") {
            modelMeta = new JSONModel(metadata.results);
            this.getOwnerComponent().setModel(modelMeta, "master3Scart");
            this.getModel("master3Scart").setSizeLimit(1000000);
          }
        } catch (error) {
          MessageBox.error("Errore durante la ricezione dei dati");
        } finally {
          this.hideBusy(0);
        }
      },
      //DOWLOAD MAIN TABLE
      downloadExcelFile: function (oEvent) {
        let selectedKey = this.getView().byId("idIconTabBar").getSelectedKey();
        !selectedKey ? (selectedKey = key) : (selectedKey = selectedKey);
        let oModel;

        switch (selectedKey) {
          case "01":
            oModel = this.getModel("master3");
            break;
          case "02":
            oModel = this.getModel("master3CO");
            break;
          case "03":
            oModel = this.getModel("master3SB");
            break;
          case "04":
            oModel = this.getModel("master3DesAdv");
            break;
          case "05":
            oModel = this.getModel("master3Inv");
            break;
          case "06":
            oModel = this.getModel("master3Scart");
            break;
          default:
        }
        let aData = oModel.getProperty("/");
        if (!aData || aData.length === 0) {
          MessageToast.show("Nessun dato disponibile per l'esportazione");
          return;
        }
        this.buildSpreadSheet(aData);
      },

      // DOWNLOAD DI EXCEL X DETTAGLI
      downloadExcelFileDett: function (oEvent) {
        let oModel = this.getModel("detailData");
        let aData = oModel.getProperty("/");
        if (!aData || aData.length === 0) {
          MessageToast.show("Nessun dato disponibile per l'esportazione");
          return;
        }
        this.buildSpreadSheet(aData);
      },
      //COSTRUZIONE DELLO SHEET
      buildSpreadSheet: function (aExportData) {
        if (aExportData.hasOwnProperty("DettaglioFatture")) {
          aExportData = Object.values(aExportData)[0];
        }
        let exportData = Array.isArray(aExportData) ? aExportData : [aExportData];

        let flatExportData;
        if (!aExportData.RFFON) {
          flatExportData = mapper._formatExcelData(exportData);
        } else {
          flatExportData = mapper._formatCumulativi(exportData);
        }

        let oSpreadsheet = new Spreadsheet({
          dataSource: flatExportData,
          workbook: {
            columns: this._getExcelColumns(flatExportData),
            hierarchyLevel: "Level",
          },
          fileName: "Export",
          showProgress: true,
          worker: true,
        });
        oSpreadsheet.build().then(function () {
          MessageToast.show("Esportazione completata!");
        });
      },
      _getExcelColumns: function (aExportData) {
        let columns = [];
        let fields = new Set();

        aExportData.forEach((item) => {
          Object.keys(item).forEach((field) => fields.add(field));

          let positions = item.posizioni || [];
          positions.forEach((position) => {
            Object.keys(position).forEach((field) => fields.add(field));
            let schedules = position.schedulazioni.results || [];
            schedules.forEach((schedule) => {
              Object.keys(schedule).forEach((field) => fields.add(field));
            });
          });
        });

        fields.forEach((field) => {
          columns.push({
            label: field.replace(/_/g, " "),
            property: field,
            type: "Edm.String",
          });
        });
        return columns;
      },
      //getEXCELVariazioni
      createExcel: function (oTable) {
        const oRowBinding = oTable.getBinding("rows");
        const aCols = this._getVariazioniColumnsConfig(oTable);
        let fileName;
        oTable.getId().includes("cliente")
          ? (fileName = "Confronto Programmazioni Clienti")
          : (fileName = "Confronto Programmazioni Articolo");
        const oSheet = new Spreadsheet({
          workbook: {
            columns: aCols,
            hierarchyLevel: "Level",
          },
          dataSource: oRowBinding,
          fileName: fileName,
        });
        oSheet.build().finally(function () {
          oSheet.destroy();
        });
      },
      _getVariazioniColumnsConfig: function (oTable) {
        const aCols = [];
        const isClientTable = oTable.getId().includes("cliente");
        oTable.getColumns().forEach((el, key) => {
          if (isClientTable || key !== 0) {
            let property = "";
            let type = String;
            oTable.getRows().forEach((row, i) => {
              const cell = row.getCells()[key];
              if (cell.getBindingInfo("text")) {
                property = cell.getBindingInfo("text").parts[0].path;
              } else if (cell.getBindingInfo("text")) {
                property = cell.getBindingInfo("text").parts[0].path;
              }
            });
            let label;
            if (el.getMultiLabels().length > 0) {
              el.getMultiLabels()[0].getText() === ""
                ? (label = el.getMultiLabels()[1].getText())
                : el.getMultiLabels()[0].getText();
              if (el.getMultiLabels()[0].getText() !== "" && el.getMultiLabels()[1].getText() !== 0) {
                label = el.getMultiLabels()[0].getText() + " " + el.getMultiLabels()[1].getText();
              }
            } else {
              label = el.getLabel().getText();
            }
            aCols.push({
              label: label,
              property: property,
              type: type,
            });
          }
        });
        return aCols;
      },
      // FINE EXCEL VARIAZIONI
      //DELETE X TUTTI I BUTTON
      onDeletePosition: async function (oEvent) {
        let archivVal;
        this.getModel("datiAppoggio").getProperty("/currentPage") === "archivio"
          ? (archivVal = true)
          : (archivVal = false);
        let oTable = oEvent.getSource().getParent().getParent();
        try {
          let arrayToProcess = await this._returnPayload(oTable, "delete");
          if (arrayToProcess.length > 0) {
            this.showBusy(0);
            let payload = arrayToProcess.map((x) => {
              return {
                id_testata: x.id_testata,
                id_posizione: x.id,
              };
            });
            let obj = { id: payload };
            let tableID, oModel, Entity;
            let selectedKey;
            this.getView().byId("idIconTabBar")
              ? (selectedKey = this.getView().byId("idIconTabBar").getSelectedKey())
              : undefined;

            if (selectedKey !== undefined) {
              ({ tableID, oModel, Entity } = this.getModelAndEntityByPart(selectedKey));
            } else {
              if (this.getModel("detailData").getProperty("/__metadata") !== undefined) {
                if (this.getModel("detailData").getProperty("/__metadata").type.includes("Delivery")) {
                  oModel = this.getOwnerComponent().getModel("modelloV2");
                } else if (this.getModel("detailData").getProperty("/__metadata").type.includes("CalloffService")) {
                  oModel = this.getOwnerComponent().getModel("calloffV2");
                }
              } else if (
                this.getModel("detailData").getProperty("/DettaglioMaster3").__metadata.type.includes("SelfBilling")
              ) {
                oModel = this.getOwnerComponent().getModel("selfBillingV2");
              }
            }
            let res = await API.createEntity(oModel, "/DeletePosizioni", obj);
            if (res.results.length > 0) {
              MessageBox.success("Operazione andata a buon fine.", {
                title: "Operazione completata",
                onClose: async () => {
                  if (selectedKey !== undefined) {
                    await this._refreshData(selectedKey, archivVal);
                  } else {
                    await this._refreshDetailData();
                  }
                },
              });
            }
          }
        } catch (error) {
          MessageBox.error("Errore durante l'eliminazione delle posizioni.");
        } finally {
          this.hideBusy(0);
        }
      },
      // UTILITY X POST (ELABORAZIONE E DELETE)
      _returnPayload: async function (table, action) {
        let indices = table.getSelectedIndices();
        let testate = [];
        let selectedPos = [];
        let flag = false;

        if (indices.length !== 0) {
          let aSelectedItems = indices.map(function (iIndex) {
            return table.getContextByIndex(iIndex).getObject();
          });

          aSelectedItems = aSelectedItems
            .map((item) => {
              if (item.posizioni) {
                item.posizioni = item.posizioni.filter((pos) => pos.stato !== "53" && pos.stato !== "64");
              }
              if ((item.stato !== "53" && item.stato !== "64") || (item.posizioni && item.posizioni.length > 0)) {
                return item;
              }
              return null;
            })
            .filter((item) => item !== null);

          let errorMessage = "Non è possibile rielaborare elementi già processati.";
          if (aSelectedItems.length === 0) {
            MessageBox.error(errorMessage);
            return [];
          }

          aSelectedItems.forEach((element) => {
            if (
              element.hasOwnProperty("posizioni") ||
              element.hasOwnProperty("posizioni_testata") ||
              element.hasOwnProperty("dettaglio_fattura")
            ) {
              testate.push(element);
              flag = true;
            } else {
              selectedPos.push(element);
            }
          });
          let message;
          action === "elab"
            ? (message =
                "Verranno processate tutte le posizioni non ancora elaborate della Testata selezionata, continuare?")
            : (message = "Verranno eliminate tutte le posizioni della Testata selezionata, continuare?");
          if (flag) {
            return new Promise((resolve) => {
              MessageBox.confirm(message, {
                title: "Continuare?",
                onClose: (oAction) => {
                  if (oAction === sap.m.MessageBox.Action.OK) {
                    testate.forEach((x) => {
                      if (x.hasOwnProperty("posizioni")) {
                        x.posizioni.forEach((pos) => (pos["numero_progressivo_invio"] = x.numero_progressivo_invio));
                        selectedPos = selectedPos.concat(x.posizioni);
                      } else if (x.hasOwnProperty("posizioni_testata")) {
                        x.posizioni_testata.forEach((pos) => (pos["numero_progressivo_invio"] = x.progressivo_invio));
                        selectedPos = selectedPos.concat(x.posizioni_testata);
                      } else if (x.hasOwnProperty("dettaglio_fattura")) {
                        x.dettaglio_fattura.forEach((pos) => (pos["numero_progressivo_invio"] = x.progressivo_invio));
                        selectedPos = selectedPos.concat(x.dettaglio_fattura);
                      }
                    });
                    let uniqueArray = selectedPos.reduce((acc, currentValue) => {
                      if (!acc.some((item) => item.id === currentValue.id)) {
                        acc.push(currentValue);
                      }
                      return acc;
                    }, []);
                    resolve(uniqueArray);
                  } else {
                    resolve([]);
                  }
                },
              });
            });
          } else {
            return selectedPos;
          }
        } else {
          MessageBox.alert("Selezionare almeno una posizione");
          return [];
        }
      },
      //processamento dettagli
      onProcessaButtonDetail: function (oEvent) {
        let table = oEvent.getSource().getParent().getParent();
        let indices = table.getSelectedIndices();
        let items = [];
        let that = this;
        if (indices.length === 0) {
          sap.m.MessageBox.alert("Si prega di selezionare almeno una posizione");
          return;
        }
        items = indices.map(function (iIndex) {
          return table.getContextByIndex(iIndex).getObject();
        });
        items = items.filter((item) => item.posizione_43_44 !== "35");
        items = items
          .map((item) => {
            if (item.stato !== "53" && item.stato !== "64") {
              return item;
            }
            return null;
          })
          .filter((item) => item !== null);

        if (items.length === 0) {
          MessageBox.error("Non è possibile Rielaborare elementi già processati");
          return [];
        }

        let itemList = items
          .map((item) => {
            if (item.hasOwnProperty("posizione_6_13")) {
              return `Codice Cliente: ${item.posizione_77_86} - Codice cliente materiale: ${item.posizione_6_28} - Progressivo Invio: ${item.testata.progressivo_invio} \n`;
            } else {
              return `Codice Cliente: ${item.testata.codice_cliente} - Codice cliente materiale: ${item.codice_cliente_materiale} - Progressivo Invio: ${item.testata.numero_progressivo_invio} \n`;
            }
          })
          .join("");

        let message = `Vuoi continuare con questi elementi? \n ${itemList}`;

        sap.m.MessageBox.confirm(message, {
          icon: sap.m.MessageBox.Icon.WARNING,
          title: "Riepilogo",
          actions: [sap.m.MessageBox.Action.YES, sap.m.MessageBox.Action.NO],
          emphasizedAction: sap.m.MessageBox.Action.YES,
          onClose: async function (oAction) {
            if (oAction !== sap.m.MessageBox.Action.YES) {
              return;
            }

            let payload = items.map((x) => x.id);
            let obj = { id: payload };
            let oModel = this.getOwnerComponent().getModel("modelloV2");
            this.showBusy(0);
            try {
              let res = await API.createEntity(oModel, "/Processamento", obj);
              if (res.results.length > 0) {
                MessageBox.show("Elaborazione in corso", {
                  icon: sap.m.MessageBox.Icon.INFORMATION,
                  title: "Processo di Elaborazione",
                  actions: [sap.m.MessageBox.Action.CLOSE],
                  emphasizedAction: sap.m.MessageBox.Action.CLOSE,
                  onClose: async function (oAction) {
                    that._refreshDetailData();
                  },
                });
              } else {
                MessageBox.error("Elaborazione non andata a buon fine");
              }
            } catch (error) {
              MessageBox.error("Errore durante il processamento.");
            } finally {
              this.hideBusy(0);
            }
          }.bind(this),
        });
      },
      // refresh data dopo post X MASTER
      _refreshData: async function (selectedKey, archivVal) {
        this.showBusy(0);
        try {
          await this._getCounters(archivVal);
          switch (selectedKey) {
            case "01":
              await this.onFilterSelect(null, "01");
              break;
            case "02":
              await this.onFilterSelect(null, "02");
              break;
            case "03":
              await this.onFilterSelect(null, "03");
              break;
            case "04":
              await this.onFilterSelect(null, "04");
              break;
            case "05":
              await this.onFilterSelect(null, "04");
              break;
            case "06":
              await this.onFilterSelect(null, "06");
              break;
            default:
              console.warn("Chiave della tabella non riconosciuta:", selectedKey);
              break;
          }
        } catch (error) {
          console.error("Errore durante il refresh dei dati:", error);
        } finally {
          this.hideBusy(0);
        }
      },
      // REFRESH X DETTAGLI
      _refreshDetailData: async function () {
        this.showBusy(0);
        try {
          if (this.getView().getControllerName().includes("Master3")) {
            let dettaglio = await API.readByKey(
              this.getOwnerComponent().getModel("modelloV2"),
              "/Testata",
              { id: this._id, id_master: this._idMaster },
              [],
              ["posizioni,posizioni($expand=log,schedulazioni,testata),master"]
            );
            let detailModel = this.getModel("detailData");
            detailModel.setData(dettaglio);
            detailModel.getProperty("/posizioni/results").forEach((pos) => {
              pos.log = Object.values(pos.log.results);
            });
          } else if (this.getView().getControllerName().includes("DettCallOff")) {
            let dettaglio = await API.readByKey(
              this.getOwnerComponent().getModel("calloffV2"),
              "/Testata",
              { id: this._id, id_master: this._idMaster },
              [],
              ["master,posizioni_testata($expand=log_posizioni)"]
            );
            let detailModel = this.getModel("detailData");
            detailModel.setData(dettaglio);
            detailModel.getProperty("/posizioni_testata/results").forEach((pos) => {
              pos.posizione_14_19 = this.formatter.returnDate(pos.posizione_14_19, "yyyyMMdd", "dd/MM/yyyy");
            });
          } else if (this.getView().getControllerName().includes("DettSelfBilling")) {
            let dettaglio = await API.readByKey(
              this.getOwnerComponent().getModel("selfBillingV2"),
              "/Testata",
              { id: this._id },
              [],
              ["dettaglio_fattura,dettaglio_fattura/riferimento_ddt,dettaglio_fattura/riferimento_ddt/riga_fattura"]
            );
            this.getView().setModel(new JSONModel(), "detailData");
            let detailModel = this.getModel("detailData");
            detailModel.setData(dettaglio);
            dettaglio.dettaglio_fattura.results.forEach((pos) => {
              pos.data_fattura = formatter.formatDate(pos.data_fattura);
              pos.data_scadenza_fattura = formatter.formatDate(pos.data_scadenza_fattura);
              pos.riferimento_ddt = Object.values(pos.riferimento_ddt.results);
              pos.riferimento_ddt.forEach((posit) => {
                posit.data_ddt_cliente = formatter.formatDate(posit.data_ddt_cliente);
              });
            });
            this.getModel("detailData").setProperty("/DettaglioMaster3", dettaglio);
            this.getModel("detailData").setProperty("/DettaglioFatture", dettaglio.dettaglio_fattura.results);
          }

          //AGGIUNGERE LOGICHE X OGNI DETTAGLIO SE ESISTENTE
        } catch (error) {
          MessageBox.error("Errore durante il recupero dei dati dettaglio");
        } finally {
          this.hideBusy(0);
        }
      },
      //engine dinamico
      _registerForP13n: function (oEvent, tableId) {
        let columnConfig = mapper.getColumnConfig(tableId);
        let oTable = this.byId(tableId);
        this.oMetadataHelper = new MetadataHelper(columnConfig);

        this._mIntialWidth = columnConfig.reduce((acc, column) => {
          acc[column.key] = column.initialWidth || "11rem";
          return acc;
        }, {});

        Engine.getInstance().register(oTable, {
          helper: this.oMetadataHelper,
          controller: {
            Columns: new SelectionController({
              targetAggregation: "columns",
              control: oTable,
            }),
            Sorter: new SortController({
              control: oTable,
            }),
            Groups: new GroupController({
              control: oTable,
            }),
          },
        });

        Engine.getInstance().attachStateChange(this.handleStateChange.bind(this, tableId));
      },
      openPosizioniDialog: function (oEvent) {
        let tableId = oEvent.getSource().getParent().getParent().getId().split("--").pop();
        let oTable = this.byId(tableId);
        Engine.getInstance().show(oTable, ["Columns", "Sorter"], {
          contentHeight: "35rem",
          contentWidth: "32rem",
          source: oEvent.getSource(),
        });
      },
      _getKey: function (oControl) {
        let aCustomData = oControl.getCustomData();
        let sKey = aCustomData.find((data) => data.getKey() === "p13nKey");
        return sKey ? sKey.getValue() : null;
      },
      handleStateChange: function (tableId, oEvt) {
        const oTable = this.getView().byId(tableId);
        const oState = oEvt.getParameter("state");

        if (!oState) {
          return;
        }

        oTable.getColumns().forEach((oColumn) => {
          const sKey = this._getKey(oColumn);
          const sColumnWidth = oState.ColumnWidth ? oState.ColumnWidth[sKey] : undefined;
          oColumn.setWidth(sColumnWidth || this._mIntialWidth[sKey] || "10rem");
          oColumn.setVisible(false);
          oColumn.setSortOrder(CoreLibrary.SortOrder.None);
        });

        oState.Columns.forEach((oProp, iIndex) => {
          const oCol = oTable.getColumns().find((oColumn) => this._getKey(oColumn) === oProp.key);
          if (oCol) {
            oCol.setVisible(true);
            oTable.removeColumn(oCol);
            oTable.insertColumn(oCol, iIndex);
          }
        });
        if (oState.Sorter) {
          const aSorter = [];
          const priorityMap = {
            51: 1,
            64: 2,
            53: 3,
            null: 4,
          };
          oState.Sorter.forEach((oSorter) => {
            const oColumn = oTable.getColumns().find((oColumn) => this._getKey(oColumn) === oSorter.key);

            if (oColumn) {
              oColumn.setSorted(true);
              oColumn.setSortOrder(
                oSorter.descending ? CoreLibrary.SortOrder.Descending : CoreLibrary.SortOrder.Ascending
              );

              const oProperty = this.oMetadataHelper.getProperty(oSorter.key);
              if (oProperty) {
                if (oSorter.key === "stato_col") {
                  const oCustomSorter = new Sorter("stato", oSorter.descending);
                  oCustomSorter.fnCompare = function (a, b) {
                    let valueA = a,
                      valueB = b;
                    if (typeof a === "object" && a !== null) {
                      if (a.getProperty) valueA = a.getProperty("stato");
                      else if (a.getObject) valueA = a.getObject().stato;
                      else if (a.oData) valueA = a.oData.stato;
                    }

                    if (typeof b === "object" && b !== null) {
                      if (b.getProperty) valueB = b.getProperty("stato");
                      else if (b.getObject) valueB = b.getObject().stato;
                      else if (b.oData) valueB = b.oData.stato;
                    }
                    const priorityA = priorityMap[valueA] !== undefined ? priorityMap[valueA] : 999;
                    const priorityB = priorityMap[valueB] !== undefined ? priorityMap[valueB] : 999;
                    return priorityA - priorityB;
                  };
                  aSorter.push(oCustomSorter);
                } else {
                  aSorter.push(new Sorter(oProperty.path, oSorter.descending));
                }
              }
            }
          });

          if (oTable.getBinding("rows")) {
            oTable.getBinding("rows").sort(aSorter);
          }
        }
      },
      //fine configurazione Engine x tutte tabelle, da richiamare nei controller dei dettagli,
      // dopo aver mappato le colonne in mapper e definite il custData nelle view di dettaglio

      //DOWNLOAD EDI, VALIDO X TUTTI I TAB, DA AGGIUNGERE I BINDING CONTEXT
      downloadEdi: async function (oEvent) {
        let oBindingContext;
        if (oEvent.getSource().getBindingContext("master3") !== undefined) {
          oBindingContext = oEvent.getSource().getBindingContext("master3");
        } else if (oEvent.getSource().getBindingContext("master3CO") !== undefined) {
          oBindingContext = oEvent.getSource().getBindingContext("master3CO");
        }
        let objId = oBindingContext.getObject().id;
        let selectedKey = this.byId("idIconTabBar")?.getSelectedKey();
        let { tableId, oModel, Entity } = this.getModelAndEntityByPart(selectedKey);

        try {
          this.showBusy(0);
          let base64Edi = await API.readByKey(oModel, "/GetFileEdi", { id_testata: objId }, [], []);
          const blob = this.base64ToBlob(base64Edi.contenuto_base64, "text/plain");
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement("a");
          a.href = url;
          a.download = base64Edi.nome_file;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          window.URL.revokeObjectURL(url);
        } catch (error) {
          MessageBox.error("Errore durante il download del File");
        } finally {
          this.hideBusy(0);
        }
      },
      // BLOB DA SCARICARE
      base64ToBlob: function (base64, mimeType) {
        base64 = base64.replaceAll("-", "+").replaceAll("_", "/");
        const binaryString = window.atob(base64);
        const len = binaryString.length;
        const bytes = new Uint8Array(len);
        for (let i = 0; i < len; ++i) {
          bytes[i] = binaryString.charCodeAt(i);
        }
        return new Blob([bytes], { type: mimeType });
      },
      // GESTIONE CUMULATIVI X ARCHIVIO E MONITOR
      onDownloadCumulativi: async function (oEvent) {
        let numIdoc = oEvent.getSource().getBindingContext("master3").getObject().numero_idoc;
        let dest = oEvent.getSource().getBindingContext("master3").getObject().destinatario;
        let rffon = oEvent.getSource().getBindingContext("master3").getObject().numero_ordine_acquisto;
        await this.getReportCumulativi(dest, numIdoc, rffon);
      },
      getReportCumulativi: async function (dest, numIdoc, rffon) {
        try {
          this.showBusy(0);
          let oModel = this.getOwnerComponent().getModel("modelloV2");
          let res = await API.getEntity(
            oModel,
            `/DELFOR_CUMULATIVI(IdocNum='${numIdoc}',Stabilimento='${dest}', RFFON ='${rffon}')`
          );
          console.log(res);
          this.buildSpreadSheet(res.results);
        } catch (error) {
          MessageBox.error("Errore durante il download del Report");
        } finally {
          this.hideBusy(0);
        }
      },
      // LOG DEI PROCESSAMENTI
      onStatoPress: function (oEvent) {
        let oSource = oEvent.getSource();
        let oBindingContext = oSource.getBindingContext("detailData");
        let oData = oBindingContext.getObject();
        let oDataLog;
        oData.log === undefined ? (oDataLog = oData.log_posizioni.results) : (oDataLog = oData.log);
        if (oDataLog.length === 0) {
          MessageBox.error("Nessun log disponibile per questa posizione");
          return;
        }

        let sortedLogs = oDataLog.sort((a, b) => {
          let dateA = new Date(a.data).getTime();
          let dateB = new Date(b.data).getTime();

          if (dateA === dateB) {
            return b.ora.ms - a.ora.ms;
          }
          return dateB - dateA;
        });
        let oModel = new JSONModel();
        oModel.setData({ logs: sortedLogs });
        if (!this._oDialog) {
          this._oDialog = sap.ui.xmlfragment("programmi.consegne.edi.view.fragments.detailStato", this);
          this.getView().addDependent(this._oDialog);
        }
        this._oDialog.setModel(oModel, "logData");
        this._oDialog.open();
      },
      // SPOSTAMENTO IN ARCHIVIO SIA TOOLBAR CHE POSIZIONALE
      moveToArchive: async function (oEvent) {
        let part = oEvent.getSource().getParent().getParent().getParent().getParent().getParent().getSelectedKey();
        let { tableID, oModel, Entity } = this.getModelAndEntityByPart(part);
        if (tableID === "treetableCallOff") {
          let elId = oEvent.getSource().getBindingContext("master3CO").getObject().id;
          let elIdTest = oEvent.getSource().getBindingContext("master3CO").getObject().id_testata;
          await this.archiveSingleItem(oModel, Entity, elId, elIdTest);
        } else {
          let table = this.byId(tableID);
          let indices = table.getSelectedIndices();
          if (indices.length > 0) {
            await this.archiveSelectedItems(oModel, Entity, indices, table);
          } else {
            MessageBox.error("Selezionare almeno un elemento");
          }
        }
      },
      getModelAndEntityByPart: function (part) {
        switch (part) {
          case "01":
            return {
              tableID: "treetableMain",
              oModel: this.getOwnerComponent().getModel("modelloV2"),
              Entity: "",
            };
          case "02":
            return {
              tableID: "treetableCallOff",
              oModel: this.getOwnerComponent().getModel("calloffV2"),
              Entity: "/Posizioni",
            };
          case "03":
            return {
              tableID: "treetableSB",
              oModel: this.getOwnerComponent().getModel("selfBillingV2"),
              Entity: "/ArchiviazionePosizioni",
            };
          case "04":
            return {
              tableID: "tableDes",
              oModel: this.getOwnerComponent().getModel("despatchAdviceV2"),
              Entity: "/Testata",
            };
          case "05":
            return {
              tableID: "tableInvoice",
              oModel: this.getOwnerComponent().getModel("invoiceV2"),
              Entity: "/Invoice",
            };
          case "06":
            return {
              tableID: "tableScartati",
              oModel: this.getOwnerComponent().getModel("fileScartatiV2"),
              Entity: "/FileScartati",
            };

          default:
            return { tableID: "", oModel: null, Entity: "" };
        }
      },
      archiveSingleItem: async function (oModel, Entity, elId, elIdTest) {
        let archivVal;
        this.getModel("datiAppoggio").getProperty("/currentPage") === "archivio"
          ? (archivVal = true)
          : (archivVal = false);
        try {
          this.showBusy(0);
          if (oModel)
            await API.updateEntity(
              oModel,
              `${Entity}(id='${elId}',id_testata='${elIdTest}')`,
              { archiviazione: true },
              "PUT"
            );
          MessageBox.success("Archiviato con successo", {
            onClose: async () => {
              let selectedKey = this.byId("idIconTabBar")?.getSelectedKey();
              if (selectedKey) {
                await this._refreshData(selectedKey, archivVal);
              }
            },
          });
        } catch (error) {
          MessageBox.error("Errore nell'Archiviazione");
        } finally {
          this.hideBusy(0);
        }
      },
      archiveSelectedItems: async function (oModel, Entity, indices, table) {
        let archivVal;
        this.getModel("datiAppoggio").getProperty("/currentPage") === "archivio"
          ? (archivVal = true)
          : (archivVal = false);
        let aSelectedItems = indices.map((iIndex) => table.getContextByIndex(iIndex).getObject());
        let promises = [];
        if (Entity === "/FileScartati" || Entity === "/Invoice" || table.getId().includes("tableDes") === true) {
          promises = aSelectedItems.map((el) => {
            let elId = el.id;
            return API.updateEntity(
              oModel,
              `${Entity}(id='${elId}')`,
              { archiviazione: true, data_archiviazione: new Date() },
              "PUT"
            );
          });
        } else {
          promises = aSelectedItems.map((el) => {
            let payload = [];
            if (el.hasOwnProperty("dettaglio_fattura")) {
              el.dettaglio_fattura.forEach((fat) => {
                payload.push({
                  id_testata: fat.id_testata,
                  id_posizione: fat.id,
                });
              });
            } else {
              payload.push({
                id_testata: el.id_testata,
                id_posizione: el.id,
              });
            }
            return API.createEntity(oModel, `${Entity}`, { id: payload });
          });
        }

        try {
          this.showBusy(0);
          let out = await Promise.allSettled(promises);
          let hasError = out.some((x) => x.status !== "fulfilled");

          if (hasError) {
            MessageBox.error("Errore nell'archiviazione dei file");
          } else {
            MessageBox.success("File archiviati con successo", {
              onClose: async () => {
                let selectedKey = this.byId("idIconTabBar")?.getSelectedKey();
                if (selectedKey) {
                  table.clearSelection();
                  await this._refreshData(selectedKey, archivVal);
                }
              },
            });
          }
        } catch (error) {
          MessageBox.error("Errore nell'archiviazione dei file");
        } finally {
          this.hideBusy(0);
        }
      },
      // FINE ARCHIVIAZIONE
      // REPORT REASON 35
      downloadRow35: function (oEvent) {
        let oRow35 = oEvent.getSource().getBindingContext("master3CO").getObject();
        let aData = [];
        aData.push(oRow35);
        this.buildSpreadSheet(aData);
      },
      // NAVIGAZIONE NEI DETTAGLI
      dettaglioNav: function (oEvent) {
        let level, detailPath, detail;
        if (oEvent.getSource().getParent().getBindingContext("master3") !== undefined) {
          level = oEvent.getSource().getParent().getBindingContext("master3").getPath().includes("posizioni");
          detailPath = oEvent.getSource().getParent().getBindingContext("master3").getPath();
          detail = this.getModel("master3").getProperty(`${detailPath}`);
          this.getOwnerComponent().getModel("datiAppoggio").setProperty("/testata", detail);
          this.getOwnerComponent().getModel("datiAppoggio").setProperty("/posizioni", detail.posizioni);
          if (level) {
            this.getOwnerComponent().getModel("datiAppoggio").setProperty("/posizioneCorrente", detail);
            this.getOwnerComponent()
              .getModel("datiAppoggio")
              .setProperty("/schedulazioni", detail.schedulazioni.results);
            this.getOwnerComponent()
              .getModel("datiAppoggio")
              .setProperty("/testata", this.getModel("master3").getProperty(`${detailPath[0] + detailPath[1]}`));
            let oNextUIState;
            this.getOwnerComponent()
              .getHelper()
              .then(
                function (oHelper) {
                  oNextUIState = oHelper.getNextUIState(1);
                  this.getRouter().navTo("Detail2Master3", {
                    product: detail.id,
                    layout: oNextUIState.layout,
                  });
                }.bind(this)
              );
          } else {
            detailPath = oEvent.getSource().getParent().getBindingContext("master3").getPath();
            this.getRouter().navTo("detailMaster3", {
              id: detail.id,
              idmaster: detail.id_master,
              layout: "OneColumn",
            });
          }
        } else if (oEvent.getSource().getParent().getBindingContext("master3CO") !== undefined) {
          detailPath = oEvent.getSource().getParent().getBindingContext("master3CO").getPath();
          detail = this.getView().getModel("master3CO").getProperty(`${detailPath}`);
          this.getRouter().navTo("dettCallOff", {
            id: detail.id,
            idmaster: detail.id_master,
            layout: "OneColumn",
          });
        } else if (oEvent.getSource().getParent().getBindingContext("master3SB") !== undefined) {
          detailPath = oEvent.getSource().getParent().getBindingContext("master3SB").getPath();
          detail = this.getModel("master3SB").getProperty(`${detailPath}`);

          this.getRouter().navTo("dettSelfBilling", {
            id: detail.id,
            layout: "OneColumn",
          });
        }
      },
      navToHome: function () {
        this.getRouter().navTo("home");
      },
      handleCloseDetail: function () {
        this.getModel("datiAppoggio").getProperty("/currentPage") === "archivio"
          ? this.getRouter().navTo("archivio")
          : this.getRouter().navTo("master3");
      },
      handleCloseVariazioni: function (oEvent) {
        this.getRouter().navTo("master", {
          layout: oEvent.getSource().getParent().getParent().getParent().getParent().getParent().setLayout(),
          prevApp: this.prevApp,
        });
      },
      //REFRESH FILTRI VARIAZIONI
      refreshOnExit: function () {
        this.getOwnerComponent().getModel("datiAppoggio").setProperty("/filtriNav", "");
        let idMatComboBox = this.byId("idMatComboBox");
        let idMatnrComboBox = this.byId("idMatnrComboBox");
        let idClienti1 = this.byId("idClientiComboBox");
        let idClienti2 = this.byId("idClientiComboBox2");
        if (idMatComboBox) {
          idMatComboBox.setSelectedKey("");
          idMatComboBox.setValue("");
        }
        if (idMatnrComboBox) {
          idMatnrComboBox.setSelectedKey("");
          idMatnrComboBox.setValue("");
        }
        if (idClienti1) {
          idClienti1.setSelectedKey("");
          idClienti1.setValue("");
        }
        if (idClienti2) {
          idClienti2.setSelectedKey("");
          idClienti2.setValue("");
        }
        this.getModel("main").setProperty("/visibility", false);
      },
      navToMonitor: function () {
        this.refreshOnExit();
        this.getRouter().navTo("master3");
      },
      navToArchive: function () {
        this.refreshOnExit();
        this.getRouter().navTo("archivio");
      },
      onClose: function (oEvent) {
        oEvent.getSource().getParent().close();
      },
    });
  }
);
