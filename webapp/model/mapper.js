sap.ui.define(
	["../model/API"],
	function (API, formatter) {
		"use strict";
		return {
      buildFilters: function(oFilterSet) {
        let aFilters = [];
        if (oFilterSet.dataRic) {
          let oDataRic = this.parseDate(oFilterSet.dataRic)
          oDataRic.setHours(1, 0, 0, 0);
          aFilters.push(
            new sap.ui.model.Filter(
              "data_ricezione",
              sap.ui.model.FilterOperator.EQ,
              oDataRic
            )
          );
        }
        if (oFilterSet.numProg && oFilterSet.numProg.value) {
          aFilters.push(
            new sap.ui.model.Filter(
              "numero_progressivo_invio",
              sap.ui.model.FilterOperator.EQ,
              oFilterSet.numProg.value
            )
          );
        }
        if (oFilterSet.cliente && oFilterSet.cliente.value) {
          aFilters.push(
            new sap.ui.model.Filter(
              "codice_seller",
              sap.ui.model.FilterOperator.EQ,
              oFilterSet.cliente.value
            )
          );
        }
        if (oFilterSet.materiale && oFilterSet.materiale.value) {
          aFilters.push(
            new sap.ui.model.Filter(
              "posizioni/codice_materiale_fornitore",
              sap.ui.model.FilterOperator.EQ,
              oFilterSet.materiale.value
            )
          );
        }

        return aFilters;
        },
        parseDate: function (dateStr) {
          let parts = dateStr.split("/");
          return new Date(parts[2], parts[1] - 1, parts[0]);
        },
	  }
  }
);