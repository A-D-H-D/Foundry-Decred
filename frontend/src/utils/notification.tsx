import React from "react";
import toast from "react-hot-toast";
import { X, CheckCircle, AlertTriangle, Info } from "lucide-react";

const ToastWrapper = ({ 
  children, 
  icon, 
  onClose, 
  type 
}: { 
  children: React.ReactNode, 
  icon: React.ReactNode, 
  onClose: () => void, 
  type: string 
}) => {
  return (
    <div className={`flex flex-row items-start justify-between max-w-sm w-full bg-base-100 shadow-lg rounded-2xl pointer-events-auto border-l-4 p-4 ${
      type === "success" ? "border-success" : 
      type === "error" ? "border-error" : 
      type === "warning" ? "border-warning" : "border-info"
    }`}>
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 ${
          type === "success" ? "text-success" : 
          type === "error" ? "text-error" : 
          type === "warning" ? "text-warning" : "text-info"
        }`}>
          {icon}
        </div>
        <div className="text-sm font-medium">
          {children}
        </div>
      </div>
      <button 
        onClick={onClose}
        className="ml-4 text-base-content/50 hover:text-base-content transition-colors"
      >
        <X size={16} />
      </button>
    </div>
  );
};

export const notification = {
  success: (message: string) => {
    toast.custom((t) => (
      <ToastWrapper 
        type="success" 
        icon={<CheckCircle size={20} />} 
        onClose={() => toast.dismiss(t.id)}
      >
        {message}
      </ToastWrapper>
    ));
  },
  error: (message: string) => {
    toast.custom((t) => (
      <ToastWrapper 
        type="error" 
        icon={<AlertTriangle size={20} />} 
        onClose={() => toast.dismiss(t.id)}
      >
        {message}
      </ToastWrapper>
    ));
  },
  info: (message: string) => {
    toast.custom((t) => (
      <ToastWrapper 
        type="info" 
        icon={<Info size={20} />} 
        onClose={() => toast.dismiss(t.id)}
      >
        {message}
      </ToastWrapper>
    ));
  },
  loading: (message: string) => {
    return toast.loading(message);
  },
  remove: (id: string) => {
    toast.dismiss(id);
  }
};
