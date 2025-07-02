const XLSX = require("xlsx");
const PatientSchema = require("../models/patientModel");
const { validateExcelData } = require("../validators/excelValidator");

const processExcel = async (fileBuffer) => {
  try {
    const workbook = XLSX.read(fileBuffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const rawData = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

    // Validate and transform data
    const { validPatients, errors } = await validateExcelData(rawData);

    if (errors.length > 0) {
      return { success: false, errors };
    }

    // Batch insert with transaction
    const result = await PatientSchema.insertMany(validPatients, {
      ordered: false,
    });

    return {
      success: true,
      importedCount: result.length,
      duplicatesSkipped: rawData.length - result.length,
    };
  } catch (error) {
    throw new Error(`Excel processing failed: ${error.message}`);
  }
};

module.exports = { processExcel };
