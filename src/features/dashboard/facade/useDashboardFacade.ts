import { useState } from "react";
import type { Period } from "../models/dashboard.models";
import { chartData, criticalStock, categoryData, recentActivities } from "../repository/dashboard.repository";

export function useDashboardFacade() {
const [period, setPeriod] = useState<Period>("7dias");
return { period, setPeriod, chartData, criticalStock, categoryData, recentActivities };
}
