export const calculateVisitCharges = (
  visits,
  consultationFee,
  xrayFee,
  doctors
) => {
  let cumulativeCharge = 0;
  let cumulativePaid = 0;
  let cumulativeEarnings = 0;

  return visits.map((visit) => {
    if (visit.isDuesPayment) {
      const duesPaidAmount = Number(visit.amountPaid) || 0;
      cumulativePaid += duesPaidAmount;
      cumulativeEarnings += duesPaidAmount;
      return {
        ...visit,
        visitCharge: 0,
        pendingAmountThisVisit: 0,
        earningsThisVisit: duesPaidAmount,
        totalCharge: cumulativeCharge,
        pendingAmount: cumulativeCharge - cumulativePaid,
        totalEarnings: cumulativeEarnings,
      };
    } else {
      const treatmentCharge = (visit.treatments || []).reduce(
        (sum, t) => sum + (Number(t.price) || 0),
        0
      );
      const medicineCharge = (visit.selectedMedicines || []).reduce(
        (sum, m) => sum + (m.pricePerUnit || 0) * (m.quantity || 0),
        0
      );
      const consultationFeeAmount = visit.includeConsultationFee
        ? Number(consultationFee)
        : 0;
      const xrayFeeAmount = visit.includeXrayFee ? Number(xrayFee) : 0;
      const labCharge = Number(visit.labCharge) || 0;

      const incrementalChargeForThisVisit =
        treatmentCharge +
        medicineCharge +
        consultationFeeAmount +
        xrayFeeAmount;

      const selectedDoctor = doctors.find((doc) => doc.name === visit.doctor);
      let specialistFee = 0;
      if (
        selectedDoctor &&
        selectedDoctor.paymentModel === "Percentage" &&
        selectedDoctor.name !== "Swathi Lakshmi"
      ) {
        specialistFee =
          ((selectedDoctor.percentageCut || 0) / 100) * treatmentCharge;
      } else {
        specialistFee = Number(visit.specialistFee) || 0;
      }

      const paidForThisVisit = Number(visit.paidAmount) || 0;
      const pendingThisVisit = incrementalChargeForThisVisit - paidForThisVisit;
      const earningsThisVisit = paidForThisVisit - labCharge - specialistFee;

      cumulativeCharge += incrementalChargeForThisVisit;
      cumulativePaid += paidForThisVisit;
      cumulativeEarnings += earningsThisVisit;

      return {
        ...visit,
        visitCharge: incrementalChargeForThisVisit,
        medicineCharge,
        totalCharge: cumulativeCharge,
        pendingAmount: cumulativeCharge - cumulativePaid,
        totalEarnings: cumulativeEarnings,
        specialistFee,
        pendingAmountThisVisit: pendingThisVisit,

        earningsThisVisit,
      };
    }
  });
};
