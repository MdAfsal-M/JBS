import React from "react";
import { CheckCircle, X } from "lucide-react";
import { Button } from "./button";

interface SuccessMessageProps {
  title: string;
  message: string;
  onClose?: () => void;
  showCloseButton?: boolean;
  className?: string;
}

export const SuccessMessage: React.FC<SuccessMessageProps> = ({
  title,
  message,
  onClose,
  showCloseButton = true,
  className = ""
}) => {
  return (
    <div className={`bg-green-50 border border-green-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <CheckCircle className="h-5 w-5 text-green-400" />
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-green-800">{title}</h3>
          <p className="mt-1 text-sm text-green-700">{message}</p>
        </div>
        {showCloseButton && onClose && (
          <div className="ml-auto pl-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-green-400 hover:text-green-600"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
