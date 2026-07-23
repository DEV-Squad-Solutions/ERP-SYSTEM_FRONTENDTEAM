export const mockContainers = [
  {
    id: "cnt-1",
    code: "EURO-PLT",
    name: "Euro Pallet",
    description: "Standard EUR pallet",
    isActive: true,
  },
  {
    id: "cnt-2",
    code: "PLS-CRT",
    name: "Plastic Crate",
    description: "Reusable plastic crate",
    isActive: true,
  },
  {
    id: "cnt-3",
    code: "GAS-CYL",
    name: "Gas Cylinder",
    description: "Returnable gas cylinder",
    isActive: false,
  },
];

// key: storeId -> array of containerIds currently assigned
export const mockStoreContainers = {};
