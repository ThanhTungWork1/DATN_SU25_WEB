import React, { createContext, useContext, useState, ReactNode } from "react";
import { Dayjs } from "dayjs";

interface RevenueDateContextType {
  dateRange: [Dayjs, Dayjs] | null;
  setDateRange: (range: [Dayjs, Dayjs] | null) => void;
}

const RevenueDateContext = createContext<RevenueDateContextType | undefined>(
  undefined
);

export const useRevenueDate = () => {
  const context = useContext(RevenueDateContext);
  if (context === undefined) {
    throw new Error("useRevenueDate must be used within a RevenueDateProvider");
  }
  return context;
};

interface RevenueDateProviderProps {
  children: ReactNode;
}

export const RevenueDateProvider: React.FC<RevenueDateProviderProps> = ({
  children,
}) => {
  const [dateRange, setDateRange] = useState<[Dayjs, Dayjs] | null>(null);

  return (
    <RevenueDateContext.Provider value={{ dateRange, setDateRange }}>
      {children}
    </RevenueDateContext.Provider>
  );
};
