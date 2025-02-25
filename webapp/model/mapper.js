sap.ui.define(
	["../model/API", "../model/formatter"],
	function (API, formatter) {
		"use strict";
		return {
      buildFilters: function(oFilterSet) {
        let aFilters = [];
        if (oFilterSet.dataRic) {
          let oDataRic = formatter.parseDate(oFilterSet.dataRic)
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

	  }
  }
);