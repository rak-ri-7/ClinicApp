// src/hooks/useMedicineSelection.js
import { useState, useEffect, useCallback } from "react";

export const useMedicineSelection = (
  inventoryMedicines,
  getMedicinePrice,
  initialMeds = [],
  onQuantityUpdate = () => {}
) => {
  const [selectedMedicines, setSelectedMedicines] = useState(initialMeds);
  const [medicineTotal, setMedicineTotal] = useState(0);

  // *** THE FIX IS HERE ***
  // This effect synchronizes the hook's internal state whenever the initialMeds prop changes.
  // This is the standard pattern for resetting a hook's state from its parent.
  useEffect(() => {
    setSelectedMedicines(initialMeds || []);
  }, [initialMeds]);

  // Calculate medicine total (no change needed here)
  useEffect(() => {
    const total = selectedMedicines.reduce((acc, med) => {
      const price = Number(med.pricePerUnit) || 0;
      return acc + med.quantity * price;
    }, 0);
    setMedicineTotal(total);
  }, [selectedMedicines]);

  // handleMedicineSelection (no change needed here)
  const handleMedicineSelection = useCallback(
    (selectedNames) => {
      const newSelection = selectedNames.map((name) => {
        const existing = selectedMedicines.find((m) => m.name === name);
        return (
          existing || {
            name,
            quantity: 1,
            pricePerUnit: getMedicinePrice(name) || 0,
          }
        );
      });
      setSelectedMedicines(newSelection);
    },
    [selectedMedicines, getMedicinePrice]
  );

  // handleQuantityChange (no change needed here)
  const handleQuantityChange = useCallback(
    (name, quantity) => {
      setSelectedMedicines((prev) =>
        prev.map((med) => {
          const updated =
            med.name === name ? { ...med, quantity: Number(quantity) } : med;
          if (updated.name === name) {
            onQuantityUpdate(updated.name, Number(quantity));
          }
          return updated;
        })
      );
    },
    [onQuantityUpdate]
  );

  return {
    selectedMedicines,
    medicineTotal,
    handleMedicineSelection,
    handleQuantityChange,
    setSelectedMedicines, // It's still useful to return this for direct manipulation if needed
  };
};
