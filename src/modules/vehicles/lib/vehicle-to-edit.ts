import type { DealerCustomerVehicle } from "@/modules/vehicles/schemas/dealer-customer-vehicle.schema";
import type { VehicleToEdit } from "@/modules/vehicles/components/dealer-customer-vehicle-modal";

/** يضبط سنة النموذج ضمن نطاق الـ validation عند فتح التعديل */
export function dealerCustomerVehicleToEdit(v: DealerCustomerVehicle): VehicleToEdit {
  const year = Number.isFinite(v.year) ? Math.min(2035, Math.max(1980, v.year)) : new Date().getFullYear();
  return {
    id: v.id,
    vin: v.vin,
    year,
    make: v.make,
    model: v.model,
    plateNumber: v.plateNumber,
    color: v.color,
    odometerKm: v.odometerKm,
  };
}
