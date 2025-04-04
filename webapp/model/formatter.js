sap.ui.define([
  "sap/ui/core/format/DateFormat" 
], function (DateFormat) {
  "use strict";

	return {
		formatValue: function (value) {
			return value && value.toUpperCase();
		},
    formatDate: function (date) {
      if (date) {
        var oDateFormat = DateFormat.getDateTimeInstance({
          pattern: "dd/MM/yyyy",
        });
        return oDateFormat.format(new Date(date));
      }
      return "";
    },
    formatTime: function(ms) {
      const date = new Date(ms); 
      const hours = date.getHours(); 
      const minutes = date.getMinutes(); 
      const seconds = date.getSeconds(); 

      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    },
    formatDateString: function (dateString) {
      if (!dateString) return ""; 
      const timestampMatch = dateString.match(/\d+/);
      if (!timestampMatch) return "";
      const timestamp = parseInt(timestampMatch[0], 10);
      const date = new Date(timestamp);
      return date
    },
    parseDate: function (dateStr) {
      let parts = dateStr.split("/");
      return new Date(parts[2], parts[1] - 1, parts[0]);
    },
    formatDateToYYYYMMDD(dateString) {
      const date = new Date(dateString);
      const formattedDate = date.getFullYear().toString() +
                            String(date.getMonth() + 1).padStart(2, '0') +
                            String(date.getDate()).padStart(2, '0');
      return formattedDate;
    },
    returnDate: function (sVal,inpPatForm,OutPatForm){
      if (sVal === "" || sVal === undefined || sVal === null || sVal === "00000000") {
          return "";
        }      
        let inputFormat = DateFormat.getDateInstance({
            pattern: inpPatForm
        });
        let inputDate = inputFormat.parse(sVal);
        let outputFormat = DateFormat.getDateInstance({
          pattern: OutPatForm
        });
        return outputFormat.format(inputDate);   
    },
    formattedPerc:function (val){
      let numVal = parseFloat(val);
      let formatted = numVal.toFixed(2);  
      
      return formatted + ' %';
    },
    convertNegative: function(value) {
      if (typeof value === "string" && value.endsWith("-")) {
        return (-parseFloat(value.slice(0, -1))).toFixed(2)
      }
      return parseFloat(value).toFixed(2)
    },
    checkValidExt: function(ext){
      const extUpperCase = ext.toUpperCase();
      if(extUpperCase === "DOC" || extUpperCase === "JPG" || extUpperCase === "PNG" || extUpperCase ==="XLS" || extUpperCase === "ZIP" || extUpperCase === "PDF"){
        return true
      }
      return false
    }
	};
});