"use client";

import { motion } from "motion/react";
import EmployeeList from "./EmployeeList";
import AttendanceLog from "./AttendanceLog";
import PayrollPanel from "./PayrollPanel";
import type {
  Employee,
  AttendanceLog as AttendanceLogType,
  PayrollResult,
  PendingActionType,
} from "../types";

interface HRTabProps {
  employees: Employee[];
  attendanceLogs: AttendanceLogType[];
  calculatePayroll: (emp: Employee) => PayrollResult;
  onOpenAuth: (empId: string, action: PendingActionType) => void;
}

export default function HRTab({
  employees,
  attendanceLogs,
  calculatePayroll,
  onOpenAuth,
}: HRTabProps) {
  return (
    <motion.div
      key="hr"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.2 }}
      className="grid grid-cols-1 lg:grid-cols-12 gap-6"
    >
      {/* Left col — employees + attendance */}
      <div className="lg:col-span-7 space-y-6">
        <EmployeeList
          employees={employees}
          calculatePayroll={calculatePayroll}
          onOpenAuth={onOpenAuth}
        />
        <AttendanceLog logs={attendanceLogs} />
      </div>

      {/* Right col — payroll */}
      <div className="lg:col-span-5">
        <PayrollPanel employees={employees} calculatePayroll={calculatePayroll} />
      </div>
    </motion.div>
  );
}
